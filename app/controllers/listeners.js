var Emitter = require("@wcm/module-helper").emitter;

var contentTypes = require("../helpers/contentTypes");
var docHelper = require("../helpers/doc");

var actions = {
	
};

function verifyAction(action, contentType) {
	if (actions.hasOwnProperty(contentType.type) && actions[contentType.type].hasOwnProperty(action)) {
		return actions[contentType.type][action];
	}

	return null;
}

function handleUpdate(contentItem, action) {
	var contentType = contentTypes.verifyType(contentItem.meta.contentType);

	if (!contentType) {
		return console.log("CONTENTTYPE NOT ALLOWED", contentType);
	}

	var elasticsearch = require("../helpers/elastic");
	var syncAction = verifyAction(action, contentType);
	var fetchAction = verifyAction("fetch", contentType);

	if (!syncAction) {
		return productHelper.fetchProductsForDoc(docHelper.parseDoc(contentType, contentItem), elasticsearch)
			.then(function(products) {
				return productHelper.syncProducts(products, elasticsearch);
			});
	}

	if (fetchAction) {
		return fetchAction(contentItem, contentType.type)
			.then(function(populatedContent) {
				syncAction(populatedContent, elasticsearch);
			}, function(err) {
				throw err;
			});
	}

	syncAction(contentItem, elasticsearch);
}

function onContentCreated(contentItem) {
	try {
		handleUpdate(contentItem, "sync");
	} catch (err) {
		console.log(err);
	}
}

function onContentUpdated(contentItem) {
	try {
		handleUpdate(contentItem, "sync");
	} catch (err) {
		console.log(err);
	}
}

function onContentRemoved(contentItem) {
	try {
		handleUpdate(contentItem, "remove");
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
	Emitter.removeListener("content.created", onContentCreated);
	Emitter.removeListener("content.updated", onContentUpdated);
	Emitter.removeListener("content.removed", onContentRemoved);
};
