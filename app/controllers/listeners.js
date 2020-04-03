var Emitter = require("@wcm/module-helper").emitter;

var contentTypes = require("../helpers/contentTypes");
var docHelper = require("../helpers/doc");


function onContentCreated(contentItem) {
	console.log('Content created');
	console.log(contentItem);
	var contentType = contentTypes.verifyType(contentItem.meta.contentType);
	if (!contentType) {
		return console.log("CONTENTTYPE NOT ALLOWED", contentType);
	}
	var elasticsearch = require("../helpers/elastic");
	try {
		docHelper.syncDoc(contentItem, elasticsearch);
	} catch (err) {
		console.log(err);
	}
}

function onContentUpdated(contentItem) {
	console.log('Content updated');
	console.log(contentItem);
	var contentType = contentTypes.verifyType(contentItem.meta.contentType);

	if (!contentType) {
		return console.log("CONTENTTYPE NOT ALLOWED", contentType);
	}

	var elasticsearch = require("../helpers/elastic");
	console.log(elasticsearch);
	try {
		docHelper.syncDoc(contentItem, elasticsearch);
	} catch (err) {
		console.log(err);
	}
}

function onContentRemoved(contentItem) {
	var contentType = contentTypes.verifyType(contentItem.meta.contentType);

	if (!contentType) {
		return console.log("CONTENTTYPE NOT ALLOWED", contentType);
	}
	var elasticsearch = require("../helpers/elastic");
	try {
		docHelper.removeDoc(contentItem, elasticsearch);
	} catch (err) {
		console.log(err);
	}
}

module.exports.start = function start() {
	console.log('start listeners');
	Emitter.on("content.created", onContentCreated);
	Emitter.on("content.updated", onContentUpdated);
	Emitter.on("content.removed", onContentRemoved);
};

module.exports.stop = function stop() {
	Emitter.removeListener("content.created", onContentCreated);
	Emitter.removeListener("content.updated", onContentUpdated);
	Emitter.removeListener("content.removed", onContentRemoved);
};
