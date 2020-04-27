var cron = require("./controllers/cron");
var contentTypes = require("./helpers/contentTypes");
var taxonomies = require("./helpers/taxonomy");
var searchRoutes = require("./routes/search");
var variablesHelper = require("./helpers/variables");
var listeners = require("./controllers/listeners");

module.exports = function(app, hooks, info) {
	
	variablesHelper.reload(info)
		.finally(function() {
			// Initiate elastic
			require("./helpers/elastic").reload();

			// Setup hooks
			require("./controllers/hooks")(hooks);

			// start cronjobs
			cron.start();

			// Update contentTypes
			contentTypes.reload();

			// Update contentTypes
			taxonomies.reload();

			// Start listeners
			listeners.start();
		});



	// Setup routes
	searchRoutes(app);
};
