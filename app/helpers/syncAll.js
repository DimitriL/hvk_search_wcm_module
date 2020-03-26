"use strict";

require("rootpath")();

var docHelper = require("./doc");
var indexableTypes = require("./contentTypes").indexableTypes;
var runQueue = require("./queue").runQueue;

function errHandler(err) {
	throw err;
}

module.exports = function() {
	var elasticsearch = require("./elastic");
	var items = [];
	return runQueue(indexableTypes.map(function(type) {
		return function() {
			return docHelper.fetchDocs(type)
				.then(function(docs) {
					items = items.concat(docs);
				}, errHandler);
		};
	}))
	.then(function() {
		//sync items
		return docHelper.syncDocs(items, elasticsearch);
	}, errHandler);
		
};
