"use strict";

var _ = require("lodash");

var languageHelper = require("./language");

var typeMatchers = [{
	label: "product_doc_version",
	match: function(value) {
		return {
			"nested": {
				"path": "fields.versionItems",
				"query": {
					"match": {
						"fields.versionItems.version": value,
					},
				},
			},
		};
	},
	value: "fields.versionLabel",
}, {
	label: "api",
	match: function(value) {
		return {
			"nested": {
				"path": "fields.apiS",
				"query": {
				  "match": {
					"fields.apiS.uuid": value,
				  },
				},
			},
		};
	},
	value: "uuid",
}, {
	label: "basic_page",
	match: function(value) {
		return {
			"nested": {
				"path": "fields.customItems",
				"query": {
					"match": {
						"fields.customItems.uuid": value,
					},
				},
			},
		};
	},
	value: "uuid",
}, {
	label: "timeline_item",
	match: function(value) {
		return {
			"nested": {
				"path": "fields.roadmap",
				"query": {
					"match": {
						"fields.roadmap.uuid": value,
					},
				},
			},
		};
	},
	value: "uuid",
}];

module.exports.getMatcherForType = function(contentType, doc) {
	var typeMatcher = typeMatchers.find(function(tm) {
		return tm.label === contentType.type;
	});

	if (!typeMatcher) {
		return {};
	}

	return {
		"_source": "uuid",
		query: typeMatcher.match(languageHelper.verifyMultilanguage(_.get(doc, typeMatcher.value))),
	};
};
