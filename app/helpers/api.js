"use strict";

var _ = require("lodash");
var path = require("path");

var ContentModel = require(path.join(process.cwd(), "app/models/content"));
var contentTypes = require("./contentTypes");
var customItemsHelper = require("./customItems");
var languageHelper = require("./language");

var contentMongoQuery = function() {
	return {
		"meta.contentType": contentTypes().api,
		"meta.published": true,
		"meta.deleted": false,
	};
};
var contentMongoFields = {
	_id: 0,
	uuid: 1,
	fields: 1,
	"meta.contentType": 1,
	"meta.slug": 1,
};

function parseCustomItems(items, api) {
	return items.map(function(item) {
		return {
			api: languageHelper.verifyMultilanguage(api.meta.slug),
			apiUuid: api.uuid,
			uuid: item.value,
			visibleFor: api.fields.visibleFor,
		};
	});
}

function fetchApiS(uuids) {
	return ContentModel.find(_.assign(contentMongoQuery(), {
		uuid: {
			$in: uuids,
		},
	}), contentMongoFields)
	.lean()
	.exec()
	.then(function(apiS) {
		var result = {
			apiS: apiS,
			customItems: [],
		};

		var apiCustomItems = _.flattenDeep(apiS.map(function(api) {
			var customItems = _.get(api, "fields.customItems", []);
			var hiddenItems = _.get(api, "fields.hiddenItems", []);

			return parseCustomItems(customItems.concat(hiddenItems), api);
		}));
		var apiSToFetch = apiCustomItems.map(function(item) {
			return item.uuid;
		});

		if (!apiSToFetch.length) {
			return result;
		}

		return customItemsHelper.fetchCustomItems(apiSToFetch)
			.then(function(customItems) {
				result.customItems = customItems.map(function(item) {
					var api = (apiCustomItems.find(function(i) {
						return i.uuid === item.uuid;
					}) || {});

					item.api = api.api;
					item.apiUuid = api.apiUuid;
					item.fields.visibleFor = checkVisibility([item.fields.visibleFor, api.visibleFor]);

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

function checkVisibility(fields) {
	var values = ["allProfiles", "aProfiles", "mProfiles"];

	var value = fields.reduce(function(acc, field) {
		var fieldIndex = values.indexOf(field);

		return fieldIndex > acc ? fieldIndex : acc;
	}, -1);

	return value >= 0 ? values[value] : "invisible";
}

function getVersionLabel(api) {
	return "v" + _.get(api, "fields.version", 0);
}

module.exports = {
	fetchApiS: fetchApiS,
	getVersionLabel: getVersionLabel,
};
