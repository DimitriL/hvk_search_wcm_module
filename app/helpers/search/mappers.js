var _ = require("lodash");

var getAPISlug = function getAPISlug(productSlug, topHitSource) {
	return productSlug + "/" +
		topHitSource.version + "/" +
		topHitSource.api + "/" +
		topHitSource.slug;
};

var getVersionItemSlug = function getVersionItemSlug(productSlug, topHitSource) {
	return productSlug + "/" +
		topHitSource.version + "/" +
		topHitSource.slug;
};

var getCustomItemSlug = function getCustomItemSlug(productSlug, topHitSource) {
	return productSlug + "/" +
		topHitSource.slug;
};

var getDefaultItemSlug = function getDefaultItemSlug(productSlug, topHit) {
	var emptyKeys = ["title", "intro"];

	return productSlug +
		(emptyKeys.indexOf(topHit._key) >= 0 ? "" : ("/" + topHit._key));
};

var generateTopHitSlug = function generateTopHitSlug(topHit, productSlug) {
	var topHitSource = _.get(topHit, "_source", {});

	switch (topHit._key) {
		case "apiS":
			return getAPISlug(productSlug, topHitSource);
		case "versionItems":
			return getVersionItemSlug(productSlug, topHitSource);
		case "customItems":
			if (topHitSource.api) {
				return getAPISlug(productSlug, topHitSource);
			}

			return getCustomItemSlug(productSlug, topHitSource);
		default:
			return getDefaultItemSlug(productSlug, topHit);
	}
};

var getProductTopInnerHit = function getProductTopInnerHit(product) {
	var allHits = _.reduce(_.get(product, "inner_hits", {}), function(acc, item, key) {
		var hits = _.map(_.get(item, "hits.hits", []), function(hit) {
			return Object.assign({},
				hit, {
					_key: key,
				}
			);
		});

		return acc.concat(hits);
	}, []);

	return _.maxBy(allHits, "_score");
};

var mapProducts = function mapProducts(products) {
	return _.map(products, function(product) {
		var topHit = getProductTopInnerHit(product);
		var productSlug = "";

		if (["main_documentation", "news"].indexOf(_.get(product, "_source.fields.productCategory"))) {
			var productSlug = "/" + _.get(product, "_source.meta.slug", "");
		}

		var slug = generateTopHitSlug(topHit, productSlug);

		return {
			_type: product._type,
			_score: product._score,
			category: _.get(product, "_source.fields.productCategory"),
			slug: slug,
			title: _.get(product, "_source.fields.title.value"),
			description: _.get(product, "_source.fields.intro.value"),
		};
	});
};

var mapCategories = function mapCategories(categories) {
	return _.map(categories, function(category) {
		return {
			category: category.key,
			count: category.doc_count,
			products: mapProducts(_.get(category, "hits.hits.hits", [])),
		};
	});
};

module.exports.mapResults = function mapResults(result) {
	return mapCategories(_.get(result, "aggregations.byCategory.buckets", []));
};

module.exports.mapSuggestionResults = function mapSuggestionResults(result) {
	return mapProducts(_.get(result, "hits.hits", []));
};
