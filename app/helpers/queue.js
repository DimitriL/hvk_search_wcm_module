"use strict";

var Q = require("q");

module.exports.runQueue = function runQueue(queue) {
	var result = Q.resolve();

	queue.forEach(function(update, i) {
		result = result.then(function() {
			return update(i);
		});
	});

	return result;
};
