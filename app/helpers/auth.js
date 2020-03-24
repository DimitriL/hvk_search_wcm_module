var getModule = require("@wcm/module-helper").getModule;

module.exports.prepareMember = function prepareMember(req, res, next) {
	return getModule("@wcm/members").then(function(mod) {
		if (!mod || !mod.memberAccessMiddleware || typeof mod.memberAccessMiddleware.hard !== "function") {
			return next();
		}

		return mod.memberAccessMiddleware.soft(req, res, next);
	}, function() {
		return next();
	});
};
