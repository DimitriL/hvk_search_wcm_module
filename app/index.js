var cron = require("./controllers/cron");
var contentTypes = require("./helpers/contentTypes");
var searchRoutes = require("./routes/search");
var variablesHelper = require("./helpers/variables");

module.exports = function(app, hooks, info) {
	
	variablesHelper.reload(info)
		.finally(function() {
			// Initiate elastic
			require("./helpers/elastic").reload();

			// Setup hooks
			console.log('HOOKS')
			require("./controllers/hooks")(hooks);

			// start cronjobs
			cron.start();

			// Update contentTypes
			contentTypes.reload();
		});



	// Setup routes
	searchRoutes(app);
};
