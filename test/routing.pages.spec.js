var expect = require('expect.js');
var request = require("supertest");
process.env['COOKIE_SECRET'] = "superSecret";
process.env['NODE_ENV'] = 'test';
var app = require('../server.js').app;

describe('Routing - Index', function(){
    before(function(done){
        done();
    });
    
    it("should have index page ", function(done) {
        request(app)
        .get("/")
        .expect(200)
        .end(function(err, res){
            expect(err).to.be(null);
            expect(res.text).to.contain('expsense');
            done();
        });
    });
});