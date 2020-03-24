require("rootpath")();
var expect = require("chai").expect;
var mockery = require("mockery");

describe("Request helper", function() {
    before(function() {
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
    });

    afterEach(function() {
        mockery.deregisterAll();
        mockery.resetCache();
    });

    it("Index item in Solr with success response", function(done) {
        mockery.registerMock("request", module.exports = function(options, callback) {
            var err = null;
            var data = {
                statusCode: 200
            };
            var body = {
                success: true
            };

            callback(err, data, body);
        });
        mockery.registerMock("./error", module.exports = function() { });
        var RequestHelper = require("app/controllers/helpers/request");
        var data = {
            variables: {
                searchApiDomain: "APIdomain",
                currentDomain: "domain/",
                consumerKey: "key",
                consumerSecret: "secret"
            }
        };

        RequestHelper(data)
            .then(function onSuccess(response) {
                expect(response).to.have.property("request");
                expect(response.request).to.be.true;
                done();
            }, function onError(responseError) {
                expect(responseError).to.be.undefined;
                done();
            });
    });

    it("Index item in Solr with error response", function(done) {
        mockery.registerMock("request", module.exports = function(options, callback) {
            var err = null;
            var data = {
                statusCode: 200
            };
            var body = {
                success: false
            };

            callback(err, data, body);
        });
        mockery.registerMock("./error", module.exports = function() { });
        var RequestHelper = require("app/controllers/helpers/request");
        var data = {
            variables: {
                searchApiDomain: "APIdomain",
                currentDomain: "domain/",
                consumerKey: "key",
                consumerSecret: "secret"
            }
        };

        RequestHelper(data)
            .then(function onSuccess(response) {
                expect(response).to.have.property("request");
                expect(response.request).to.be.false;
                done();
            }, function onError(responseError) {
                expect(responseError).to.be.undefined;
                done();
            });
    });
});
