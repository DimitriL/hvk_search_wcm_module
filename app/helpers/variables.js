var Q = require("q");

var VariableHelper = require("@wcm/module-helper").variables;

var packageInfo = null;
var variables = null;

module.exports = function getVariables() {
	return variables;
};

module.exports.reload = function reload(info) {
	packageInfo = info || packageInfo || null;

	if (packageInfo === null) {
		return Q.reject("No packageInfo available!");
	}

	return VariableHelper.getAll(packageInfo.name, packageInfo.version)
		.then(function onSuccess(response) {
			variables = response;

			return variables;
		})
		.catch(function onError(responseError) {
			console.error("Failed getting variables (acpaasearch module)");
			console.error(responseError);
		});
};

module.exports.set = function set(info) {
	packageInfo = info;
};

module.exports.get = function get() {
	return packageInfo;
};

