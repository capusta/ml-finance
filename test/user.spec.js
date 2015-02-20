var expect = require("expect.js");
require('../models/index.js');
var id = 'notRandomID';

//the after / before hooks do not seem to work here ... more on that later

describe('userModel', function(){
    var userModel = global.db.User;
    
  
    it('should be available', function(done){
        expect(userModel).not.to.be(null);
        expect(userModel).not.to.be('undefined');
        done();
    });
    
    it('should create a new user', function(done){
        var newUser = global.db.User.create({id: id}).then(function(u){
            expect(u).not.to.be(null);
            done();
        });
    });
    
    it('should delete the user', function(done){
        global.db.User.find({where: {id: id}}).then(function(u){
            u.destroy().then(function(){
                done();
            });
        });
    });
});