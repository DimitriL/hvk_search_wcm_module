"use strict";

var Q = require("q");
var path = require("path");
var _ = require("lodash");

var ContentModel = require(path.join(process.cwd(), "app/models/content"));
var contentTypes = require("./contentTypes");
var languageHelper = require("./language");
var apiHelper = require("./api");
var populateHelper = require(path.join(process.cwd(), "app/helpers/populate"));
var fieldHelper = require("./field");

var contentMongoQuery = function() {
	return {
		"meta.contentType": contentTypes().product_doc_version,
	};
};
var contentMongoFields = {
	_id: 0,
	uuid: 1,
	fields: 1,
	"meta.contentType": 1,
	"meta.published": true,
	"meta.deleted": false,
};

function fetchContent(query, fields) {
	return ContentModel
		.findOne(query, fields)
		.populate("meta.contentType")
		.lean()
		.exec();
}

function fetchVersion(uuid) {
	return fetchContent(
		_.assign(contentMongoQuery(), {
			uuid: uuid,
		}),
		contentMongoFields
	).then(function(response) {
		return apiHelper.fetchApiS(response.fields.apiS.map(function(api) {
			return api.value;
		}));
	});
}

function fetchVersions(uuid, product) {
	var settings = populateHelper.fields.getPopulatorConfig.view({
		lang: languageHelper.currentLanguage(),
		uuid: uuid,
		"view.product_versions.product": product,
	});

	settings.populateFields.viewsPopulate = "false";

	return populateHelper.fields.types.defaults["view-reference"]({
		uuid: uuid,
	}, null, settings, settings.populateFields)
		.then(function(viewResult) {
			var result = {
				versionItems: [],
				apiS: [],
				customItems: [],
			};

			if (viewResult.total === 0) {
				return result;
			}

			result.versionItems = _.flatten(viewResult.data.map(function(version) {
				return ["gettingStarted", "releaseNotes", "features", "architecture", "faq"].map(function(field) {
					return {
						version: getVersionLabel(version),
						slug: field,
						value: fieldHelper.striptags(languageHelper.verifyMultilanguage(version.fields[field])),
					};
				});
			}));

			var versionApiS = _.flattenDeep(viewResult.data.map(function(version) {
				return version.fields.apiS.map(function(api) {
					return {
						version: getVersionLabel(version),
						api: api.value,
					};
				});
			}));
			var uuids = versionApiS.map(function(version) {
				return version.api;
			});

			if (!uuids.length) {
				return result;
			}

			return apiHelper.fetchApiS(uuids)
				.then(function(response) {
					result.apiS = response.apiS.map(function(api) {
						var version = versionApiS.find(function(a) {
							return a.api === api.uuid;
						}) || {};

						return {
							uuid: api.uuid,
							version: version.version,
							api: languageHelper.verifyMultilanguage(api.meta.slug),
							slug: "about",
							value: fieldHelper.striptags(languageHelper.verifyMultilanguage(api.fields.about)),
							title: languageHelper.verifyMultilanguage(api.fields.title),
							visibleFor: api.fields.visibleFor,
						};
					});

					result.customItems = response.customItems.map(function(item) {
						var version = versionApiS.find(function(v) {
							return v.api === item.apiUuid;
						}) || {};

						item.version = version.version;

						return item;
					});

					return result;
				}, function(err) {
					throw err;
				});
		}, function(err) {
			throw err;
		});
}

function getVersionLabel(version) {
	var major = _.get(version, "fields.versionMajor", 0);
	var minor = _.get(version, "fields.versionMinor", 0);
	var patch = _.get(version, "fields.versionPatch", 0);

	return "v" + [major, minor, patch].join(".");
}

function transformVersion(version) {
	return {
		uuid: version.uuid,
		fields: {
			versionLabel: getVersionLabel(version),
			architecture: fieldHelper.striptags(languageHelper.verifyMultilanguage(version.fields.architecture)),
			faq: fieldHelper.striptags(languageHelper.verifyMultilanguage(version.fields.faq)),
			features: fieldHelper.striptags(languageHelper.verifyMultilanguage(version.fields.features)),
			gettingStarted: fieldHelper.striptags(languageHelper.verifyMultilanguage(version.fields.gettingStarted)),
			releaseNotes: fieldHelper.striptags(languageHelper.verifyMultilanguage(version.fields.releaseNotes)),
			apiS: languageHelper.verifyMultilanguage(version.fields.apiS),
		},
		meta: {
			contentType: contentTypes.verifyType(version.meta.contentType)._id,
		},
	};
}

function syncVersion(version, elasticsearch) {
	return elasticsearch.create({
		index: elasticsearch.index,
		type: "version",
		id: version.uuid,
		body: transformVersion(version),
	});
}

function updateVersion(version, elasticsearch) {
	return elasticsearch.update({
		index: elasticsearch.index,
		type: "version",
		id: version.uuid,
		body: transformVersion(version), // @todo: partial update
	});
}

function removeVersion(version, elasticsearch) {
	return elasticsearch.delete({
		index: elasticsearch.index,
		type: "version",
		id: version.uuid,
	});
}

function syncVersions(syncNonModified, versions, elasticsearch) {
	return Q.all(versions.map(function(version) {
		return syncVersion(version, elasticsearch);
	}));
}

module.exports = {
	fetchVersion: fetchVersion,
	fetchVersions: fetchVersions,
	syncVersion: syncVersion,
	syncVersions: syncVersions,
	updateVersion: updateVersion,
	removeVersion: removeVersion,
	getVersionLabel: getVersionLabel,
};
