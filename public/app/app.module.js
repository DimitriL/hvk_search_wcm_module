"use strict";

angular.module("hvksearch_0.1.0.directives", []);
angular.module("hvksearch_0.1.0.factories", []);
angular.module("hvksearch_0.1.0.services", ["hvksearch_0.1.0.factories"]);
angular.module("hvksearch_0.1.0.controllers", ["hvksearch_0.1.0.services"]);

angular
	.module("hvksearch_0.1.0", [
		"pelorus.services",
		"hvksearch_0.1.0.directives",
		"hvksearch_0.1.0.factories",
		"hvksearch_0.1.0.services",
		"hvksearch_0.1.0.controllers",
	])
	.run([function() {
		console.log("HVK Search module is available!"); // eslint-disable-line no-console
	}]);
