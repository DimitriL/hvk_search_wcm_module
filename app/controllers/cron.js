var cron = require("node-cron");
var syncAll = require("../helpers/syncAll");

function ElasticCron() {
	this.cronJob = cron.schedule("0 0 1 * *", function() {
		syncAll();
	}, false);
}

ElasticCron.prototype.start = function() {
	this.cronJob.start();
};

ElasticCron.prototype.stop = function() {
	this.cronJob.stop();
};

module.exports = new ElasticCron();
