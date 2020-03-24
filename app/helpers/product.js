"use strict";

require("rootpath")();
var _ = require("lodash");
var path = require("path");
var runQueue = require("./queue").runQueue;

var ContentModel = require(path.join(process.cwd(), "app/models/content"));
var PopulateHelper = require(path.join(process.cwd(), "app/helpers/populate"));
var languageHelper = require("./language");
var contentTypesHelper = require("./contentTypes");
var versionHelper = require("./version");
var matcher = require("./matcher");
var fieldHelper = require("./field");

var contentMongoQuery = function() {
	return {
		"meta.contentType": contentTypesHelper().product,
		"meta.published": true,
		"meta.deleted": false,
	};
};
var contentMongoFields = {
	_id: 0,
	uuid: 1,
	fields: 1,
	"meta.activeLanguages": 1,
	"meta.contentType": "1",
	"meta.created": "1",
	"meta.lastModified": "1",
	"meta.publishDate": 1,
	"meta.slug": 1,
	"meta.taxonomy": 1,
};

function errHandler(err) {
	throw err;
}

function verifyUuid(product) {
	return typeof product === "string" ? product : product.uuid;
}

function fetchOne(query, fields) {
	return ContentModel
		.findOne(query, fields)
		.populate("meta.contentType")
		.lean()
		.exec();
}

function fetchContent(query, fields) {
	return ContentModel
		.find(query, fields)
		.populate("meta.contentType")
		.lean()
		.exec();
}

function fetchProducts(uuids) {
	var populatedProducts = [];
	var query = contentMongoQuery();

	if (uuids) {
		query.uuid = { $in: uuids };
	}

	return fetchContent(query, contentMongoFields)
		.then(function(products) {
			return runQueue(products.map(function(product) {
				return function() {
					return populateProduct(product)
						.then(function(populated) {
							populatedProducts.push(populated);
						});
				};
			}));
		}, errHandler)
		.then(function() {
			return populatedProducts;
		}, errHandler);
}

function fetchProduct(product) {
	return fetchOne(
		_.assign(contentMongoQuery(), {
			uuid: verifyUuid(product),
		}),
		contentMongoFields
	)
	.then(populateProduct);
}

function populateProduct(product) {
	return PopulateHelper.fields.one(product, {
		populate: "customItems,hiddenItems,roadmap",
		lang: languageHelper.currentLanguage(), // @todo: get language from request
	}).then(function(pItem) {
		var customItems = _.get(pItem, "fields.customItems", []);
		var hiddenItems = _.get(pItem, "fields.hiddenItems", []);

		pItem.customItems = customItems.concat(hiddenItems).map(function(i) {
			return i.value;
		});
		delete pItem.fields.customItems;
		delete pItem.fields.hiddenItems;

		pItem.fields.roadmap = pItem.fields.roadmap.map(function(i) {
			return i.value;
		});

		return pItem;
	}, errHandler)
	.then(function(item) {
		if (!_.get(item, "fields.versionsOverview.uuid")) {
			return item;
		}

		return versionHelper.fetchVersions(item.fields.versionsOverview.uuid, item.uuid)
			.then(function(response) {
				item.versionItems = response.versionItems;
				item.apiS = response.apiS;
				item.customItems = item.customItems.concat(response.customItems).filter(function(i) {
					return !!_.get(i, "fields.body");
				});

				return item;
			}, errHandler);
	}, errHandler);
}

function transformField(field) {
	return {
		value: languageHelper.verifyMultilanguage(field),
	};
}

function transformProduct(product) {
	var meta = {
		activeLanguages: product.meta.activeLanguages,
		contentType: typeof product.meta.contentType === "string" ? product.meta.contentType : contentTypesHelper.verifyType(product.meta.contentType)._id,
		created: product.meta.created,
		lastModified: product.meta.lastModified,
		publishDate: product.meta.publishDate,
		slug: languageHelper.verifyMultilanguage(product.meta.slug), // @todo: return slug for active language
		taxonomy: {
			tags: product.meta.taxonomy.tags,
		},
	};
	var roadmap = _.get(product, "fields.roadmap", []).map(function(item) {
		return {
			uuid: item.uuid,
			title: languageHelper.verifyMultilanguage(item.fields.title),
			notes: fieldHelper.striptags(languageHelper.verifyMultilanguage(item.fields.notes)),
			version: languageHelper.verifyMultilanguage(item.fields.version),
		};
	});
	var customItems = _.get(product, "customItems", []).map(function(item) {
		return {
			body: fieldHelper.striptags(languageHelper.verifyMultilanguage(item.fields.body)),
			title: languageHelper.verifyMultilanguage(item.fields.title),
			uuid: item.uuid,
			slug: languageHelper.verifyMultilanguage(item.meta.slug),
			visibleFor: item.fields.visibleFor,
			version: item.version,
			api: item.api,
		};
	});
	var fields = {
		productCategory: product.fields.productCategory,
		title: transformField(product.fields.title),
		intro: transformField(fieldHelper.striptags(product.fields.intro)),
		about: transformField(fieldHelper.striptags(product.fields.about)),
		gettingStarted: transformField(fieldHelper.striptags(product.fields.gettingStarted)),
		body: transformField(fieldHelper.striptags(product.fields.body)),
		roadmap: roadmap,
		customItems: customItems,
		versionItems: product.versionItems,
		apiS: product.apiS,
	};

	return {
		uuid: product.uuid,
		fields: fields,
		meta: meta,
	};
}

function productExists(uuid, elasticsearch) {
	return elasticsearch.client.exists({
		index: elasticsearch.index,
		type: "product",
		id: uuid,
	});
}

function syncProduct(product, elasticsearch) {
	return productExists(verifyUuid(product), elasticsearch, "product")
		.then(function(exists) {
			return exists ? updateProduct(product, elasticsearch) : createProduct(product, elasticsearch);
		}, errHandler);
}

function createProduct(product, elasticsearch) {
	return elasticsearch.client.create({
		index: elasticsearch.index,
		type: "product",
		id: product.uuid,
		body: transformProduct(product),
	});
}

function updateProduct(product, elasticsearch) {
	return elasticsearch.client.update({
		index: elasticsearch.index,
		type: "product",
		id: product.uuid,
		body: {
			doc: transformProduct(product), // @todo: partial update
		},
	});
}

function removeProduct(product, elasticsearch) {
	return elasticsearch.client.delete({
		index: elasticsearch.index,
		type: "product",
		id: product.uuid,
	});
}

function syncProducts(products, elasticsearch) {
	return runQueue(products.map(function(product) {
		return function() {
			return syncProduct(product, elasticsearch);
		};
	}));
}

function fetchProductsForDoc(doc, elasticsearch) {
	var query = matcher.getMatcherForType(contentTypesHelper.verifyType(doc.meta.contentType), doc);

	return elasticsearch.client.search({
		index: elasticsearch.index,
		type: "product",
		body: query,
	}).then(function(result) {
		var products = _.get(result, "hits.hits", []).map(function(hit) {
			return _.get(hit, "_source.uuid", "");
		});

		return fetchProducts(products);
	}, function(err) {
		throw err;
	});
}

module.exports = {
	fetchProduct: fetchProduct,
	fetchProducts: fetchProducts,
	syncProduct: syncProduct,
	syncProducts: syncProducts,
	updateProduct: updateProduct,
	removeProduct: removeProduct,
	fetchProductsForDoc: fetchProductsForDoc,
};
