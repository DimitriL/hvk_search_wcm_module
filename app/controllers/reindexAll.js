"use strict";

var syncAll = require("../helpers/syncAll");
var indicesHelper = require("../helpers/indices");
var mappings = require("../config/mappings");

module.exports.reindexAll = function(req, res) {
	var elasticsearch = require("../helpers/elastic");

	indicesHelper
		.remove(elasticsearch.client, elasticsearch.index)
		.then(indicesHelper.createOrUpdate.bind(null, elasticsearch.client, {
			index: elasticsearch.index,
			mappings: mappings,
		}))
		.then(syncAll);

	res.status(200).json({
		msg: "Reindex started...",
	});
};
