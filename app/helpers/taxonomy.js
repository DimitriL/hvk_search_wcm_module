"use strict";

require("rootpath")();
var path = require("path");

var TaxonomyModel = require(path.join(process.cwd(), "app/models/taxonomy"));
var taxonomies = {};

function reload() {
	TaxonomyModel
		.find({})
		.lean()
		.exec()
		.then(function(taxs) {
			taxonomies = taxs;
		}, function(err) {
			throw err;
		});
}

function getTaxonomies() {
	return taxonomies;
}

module.exports.reload = reload;
module.exports.getTaxonomies = getTaxonomies;

