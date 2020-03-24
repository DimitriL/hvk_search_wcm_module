"use strict";

angular.module("hvksearch_0.1.directives", []);
angular.module("hvksearch_0.1.factories", []);
angular.module("hvksearch_0.1.services", ["hvksearch_0.1.factories"]);
angular.module("hvksearch_0.1.controllers", ["hvksearch_0.1.services"]);

angular
	.module("hvksearch_0.1", [
		"pelorus.services",

		"hvksearch_0.1.directives",
		"hvksearch_0.1.factories",
		"hvksearch_0.1.services",
		"hvksearch_0.1.controllers",
	])
	.run([function() {
		console.log("Members module is available!"); // eslint-disable-line no-console
	}]);
