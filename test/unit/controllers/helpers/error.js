require("rootpath")();
var expect = require("chai").expect;
var mockery = require("mockery");

describe("Error helper", function() {
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

    it("Save error with known error from Solr", function(done) {
        mockery.registerMock("app/models/errorLog", module.exports = {
            create: function(data) {
                var Q = require("q");
                var prom = Q.defer();

                prom.resolve(data);

                return prom.promise;
            }
        });
        var ErrorHelper = require("app/controllers/helpers/error");
        var body = {
            success: false,
            msgs: [{
                persistance: "page",
                location: "bar",
                message: "Subscriber \"antwerpenmorgen\" not allowed.",
                type: "E"
            }]
        };
        var code = 500;
        var options = {
            url: "url"
        };

        ErrorHelper(body, code, options)
            .then(function onSuccess(response) {
                expect(response).to.be.an("object");
                expect(response).to.have.property("title");
                expect(response.title).to.be.equal("Indexing item in Solr");
                expect(response).to.have.property("code");
                expect(response.code).to.be.equal(500);
                expect(response).to.have.property("identifier");
                expect(response).to.have.property("error");
                expect(response.error).to.be.an("object");
                expect(response.error).to.have.property("persistance");
                expect(response.error).to.have.property("location");
                expect(response.error).to.have.property("message");
                expect(response.error).to.have.property("type");
                expect(response).to.have.property("requestData");
                expect(response.requestData).to.be.an("object");
                expect(response.requestData).to.have.property("url");
                expect(response.requestData.url).to.be.equal("url");
                expect(response).to.have.property("type");
                expect(response.type).to.be.equal("module-solr");
                done();
            }, function onError(responseError) {
                expect(responseError).to.be.undefined;
                done();
            });
    });

    it("Save error with unknown error from Solr", function(done) {
        mockery.registerMock("app/models/errorLog", module.exports = {
            create: function(data) {
                var Q = require("q");
                var prom = Q.defer();

                prom.resolve(data);

                return prom.promise;
            }
        });
        var ErrorHelper = require("app/controllers/helpers/error");
        var body = {
            success: false,
            error: "Something went wrong"
        };
        var code = 500;
        var options = {
            url: "url"
        };

        ErrorHelper(body, code, options)
            .then(function onSuccess(response) {
                expect(response).to.be.an("object");
                expect(response).to.have.property("title");
                expect(response.title).to.be.equal("Indexing item in Solr");
                expect(response).to.have.property("code");
                expect(response.code).to.be.equal(500);
                expect(response).to.have.property("identifier");
                expect(response).to.have.property("error");
                expect(response.error).to.be.an("object");
                expect(response.error).to.have.property("success");
                expect(response.error).to.have.property("error");
                expect(response).to.have.property("requestData");
                expect(response.requestData).to.be.an("object");
                expect(response.requestData).to.have.property("url");
                expect(response.requestData.url).to.be.equal("url");
                expect(response).to.have.property("type");
                expect(response.type).to.be.equal("module-solr");
                done();
            }, function onError(responseError) {
                expect(responseError).to.be.undefined;
                done();
            });
    });
});
