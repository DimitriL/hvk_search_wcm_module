"use strict";

angular
	.module("hvksearch_0.1.factories")
	.factory("hvksearchFactory", [
		"$http",
		"configuration",

		function(
			$http,
			configuration
		) {
			var api = configuration.serverPath + configuration.apiPrefix + configuration.apiLevel;
			var factory = {};

			factory.reindexSearch = function() {
				return $http.put(api + "hvksearch/reindex");
			};

			return factory;
		},
	]);
