var variablesHelper = require("../helpers/variables");
var contentTypesHelper = require("../helpers/contentTypes");
var elastic = require("../helpers/elastic");
var listeners = require("../controllers/listeners");

var onConfigurationChanged = function onConfigurationChanged() {
	// Reload config
	console.log("config reloaded");
	variablesHelper.reload()
		.then(function() {
			elastic.reload();
			contentTypesHelper.reload();
		});

};

var beforeRemove = function beforeRemove() {
	// Stop listeners
	listeners.stop();
};

var beforeDisable = function beforeDisable() {
	// Stop listeners
	listeners.stop();
};

var onEnabled = function onEnabled() {
	// Reenable listeners
	listeners.start();
};

var onLoadComplete = function onLoadComplete() {
	console.log('loaded');
	// Setup listeners
	listeners.start();
	onConfigurationChanged();
};

module.exports = function handleHooks(hooks) {
	var myHooks = {
		onConfigurationChanged: onConfigurationChanged,
		beforeRemove: beforeRemove,
		onLoadComplete: onLoadComplete,
		beforeDisable: beforeDisable,
		onEnabled: onEnabled,
	};

	Object.assign(hooks, myHooks);
};
