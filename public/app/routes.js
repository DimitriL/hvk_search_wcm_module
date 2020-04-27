"use strict";

angular
	.module("hvksearch_0.1.0")
	.config([
		"$stateProvider",
		"hvksearchConfigProvider",

		function(
			$stateProvider,
			hvksearchConfigProvider
		) {

			var moduleFolder = hvksearchConfigProvider.API.modulePath;

			$stateProvider
			.state("pelorus.hvksearch.index", {
				url: "",
				access: {
					requiresLogin: true,
				},
				ncyBreadcrumb: {
					label: "{{breadcrumb}}",
				},
				templateUrl: moduleFolder + "views/overview.html",
				controller: "hvksearchOverviewController",
			});
		},
	]
);
