"use strict";

require("rootpath")();

var productHelper = require("./product");
var docHelper = require("./doc");
var indexableTypes = require("./contentTypes").indexableTypes;
var runQueue = require("./queue").runQueue;

function errHandler(err) {
	throw err;
}

module.exports = function() {
	var elasticsearch = require("./elastic");

	return productHelper
		.fetchProducts()
		.then(function(products) {
			var items = products;

			return runQueue(indexableTypes.map(function(type) {
				return function() {
					return docHelper.fetchDocs(type)
						.then(function(docs) {
							items = items.concat(docs);
						}, errHandler);
				};
			}))
			.then(function() {
				return items;
			}, errHandler);
		})
		.then(function(products) {
			return productHelper.syncProducts(products, elasticsearch);
		}, errHandler)
		.catch(errHandler);
};
