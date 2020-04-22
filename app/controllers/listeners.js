var Emitter = require("@wcm/module-helper").emitter;

var contentTypes = require("../helpers/contentTypes");
var docHelper = require("../helpers/doc");


function onContentCreated(contentItem) {
	var contentType = contentTypes.verifyType(contentItem.meta.contentType);
	if (!contentType) {
		return console.log("CONTENTTYPE NOT ALLOWED", contentType);
	}
	var elasticsearch = require("../helpers/elastic");
	try {
		docHelper.fetchDoc(contentItem, contentType).then(function(pDoc) {
			docHelper.syncDoc(pDoc, elasticsearch);
		});
	} catch (err) {
		console.log(err);
	}
}

function onContentUpdated(contentItem) {
	var contentType = contentTypes.verifyType(contentItem.meta.contentType);

	if (!contentType) {
		return console.log("CONTENTTYPE NOT ALLOWED", contentType);
	}

	var elasticsearch = require("../helpers/elastic");
	try {
		docHelper.fetchDoc(contentItem, contentType).then(function(pDoc) {
			docHelper.syncDoc(pDoc, elasticsearch);
		});
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
	Emitter.on("content.created", onContentCreated);
	Emitter.on("content.updated", onContentUpdated);
	Emitter.on("content.removed", onContentRemoved);
};

module.exports.stop = function stop() {
	console.log('stop listeners');
	Emitter.removeListener("content.created", onContentCreated);
	Emitter.removeListener("content.updated", onContentUpdated);
	Emitter.removeListener("content.removed", onContentRemoved);
};
