"use strict";

require("rootpath")();
var path = require("path");

var ContentTypeModel = require(path.join(process.cwd(), "app/models/contentType"));

var safeLabels = [
	"activiteit",
	"artikel",
	"pagina",
	"partner",
	"landingspagina",
	"locatie",
	"startpagina",
];
var contentTypes = {};

var toList = function(types) {
	return Object.keys(types).reduce(function(acc, curr) {
		acc.push({
			type: curr,
			_id: types[curr],
		});

		return acc;
	}, []);
};

function reload() {
	ContentTypeModel
		.find({
			"meta.deleted": false,
			"meta.safeLabel": {
				$in: safeLabels,
			},
		})
		.lean()
		.exec()
		.then(function(types) {
			contentTypes = types.reduce(function(acc, type) {
				acc[type.meta.safeLabel] = type._id.toString();
				return acc;
			}, {});
		}, function(err) {
			throw err;
		});
}

function verifyType(type) {
	type = typeof type === "string" ? type : type._id;

	return toList(contentTypes).find(function(t) {
		return t._id === type.toString();
	});
}

module.exports = function getContentTypes() {
	return contentTypes;
};

module.exports.reload = reload;
module.exports.verifyType = verifyType;
module.exports.indexableTypes = safeLabels;

