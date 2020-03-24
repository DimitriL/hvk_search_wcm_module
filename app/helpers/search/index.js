var productSearchHelper = require("./product");
var mappers = require("./mappers");

module.exports.getQuery = function getQuery(query, limit, type) {
	return {
		from: 0,
		size: 10000,
		// highlight: {
		// 	order: "score",
		// 	fields: Object.assign({}, productSearchHelper.getHighlightFields()),
		// },
		query: {
			"dis_max": {
				queries: [].concat(
					productSearchHelper.getQuery(query, type)
				),
			},
		},
		aggs: {
			byCategory: {
				terms: {
					field: "fields.productCategory",
					size: 10000,
				},
				aggs: {
					hits: {
						"top_hits": {
							size: limit || 10000,
						},
					},
				},
			},
		},
	};
};

module.exports.getSuggestQuery = function getSuggestQuery(query, limit, type) {
	return {
		from: 0,
		size: limit || 10000,
		query: {
			"dis_max": {
				queries: [].concat(
					productSearchHelper.getQuery(query, type)
				),
			},
		},
	};
};

module.exports.getCategoryQuery = function getCategoryQuery(query, category, skip, limit, type) {
	return {
		from: skip,
		size: limit || 10000,
		query: {
			"dis_max": {
				queries: [].concat(
					productSearchHelper.getQuery(query, type)
				),
			},
		},
		filter: {
			term: {
				"fields.productCategory": category,
			},
		},
	};
};

module.exports.resultMapper = function resultMapper(result) {
	return mappers.mapResults(result);
};

module.exports.suggestMapper = function suggestMapper(result) {
	return mappers.mapSuggestionResults(result);
};
