var _ = require("lodash");
var elasticClient = require("../helpers/elastic");
var variablesHelper = require("../helpers/variables");

var execSearch = function execSearch(body, type) {
	var variables = variablesHelper();

	return elasticClient.client.search({
		index: variables.acpaassearch.variables.index,
		type: type,
		body: body,
	});
};

var getQuery = function getQuery(req) {
	return req.query.q || req.query.query;
};

module.exports.search = function search(req, res) {
	var q = getQuery(req);

	if (!q) {
		return res.status(400).json({
			err: "No query parameter 'q' found in the request.",
		});
	}
	execSearch(q, "content")
		.then(
			function onSuccess(result) {
				res.status(200).json(result);
			},
			function onError(responseError) {
				res.status(500).json({
					err: responseError,
				});
			}
		);
};
