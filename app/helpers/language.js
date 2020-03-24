var config = require("../config/language");

module.exports.verifyMultilanguage = function(value) {
	return Object(value) === value && value.hasOwnProperty("multiLanguage") ? value[config.lang] : value;
};

module.exports.currentLanguage = function() {
	return config.lang;
};
