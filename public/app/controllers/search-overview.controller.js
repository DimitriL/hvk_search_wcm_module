"use strict";

angular
	.module("hvksearch_0.1.0.controllers")
	.controller("hvksearchOverviewController", [
		"$scope",
		"$timeout",
		"hvksearchFactory",
		"LabelService",
		"NotificationService",

		function(
			$scope,
			$timeout,
			hvksearchFactory,
			LabelService,
			NotificationService
		) {
			$scope.reindexing = false;

			$scope.reindexSearch = function() {
				$scope.reindexing = true;
				hvksearchFactory
					.reindexSearch()
					.then(function() {
						NotificationService.showNotification(
							LabelService.getString("The search is reindexing..."),
							"top",
							"success",
							7000
						);

						$timeout(function() {
							$scope.reindexing = false;
						}, 10000);
					}, function(err) {
						NotificationService.showNotification(
							LabelService.getString(err),
							"top",
							"error",
							7000
						);

						$scope.reindexing = false;
					});
			};
		},
	]);
