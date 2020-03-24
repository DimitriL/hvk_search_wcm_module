require("rootpath")();
var request = require("request");
var _ = require("lodash");
var Q = require("q");
var ErrorHandler = require("./error");

module.exports = function(data) {
	var prom = Q.defer();

	request(data.options, function(err, resp, body) {
		if (!(resp.hasOwnProperty("statusCode") && resp.statusCode === 200 && _.isObject(body) && body.hasOwnProperty("success") && body.success)) {
			// This is not good, save error
			ErrorHandler(body, resp.statusCode, data.options);
		}
		data.request = body.success;
		prom.resolve(data);
	});

	return prom.promise;
};
