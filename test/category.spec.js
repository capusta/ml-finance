var expect = require("expect.js");
require('../models/index.js');
var id = 'notRandomID';

//the after / before hooks do not seem to work here ... more on that later

describe('categoryModel', function(){
    var userModel = global.db.User;
    var newCat;
    
    it('should create category', function(done){
        global.db.Category.create({label: "test"}).then(function(cat){
            newCat = cat;
            expect(cat).not.to.be(null);
            done();
        });
    });
    
    it('should add category to user', function(done){
        userModel.create({id: id}).then(function(u){
            u.addCategory(newCat).then(function(){
                done();
            });
        });
    });
    
    it('should have zero items initially', function(done){
        expect(newCat.numItems).to.be(0);
        done();
    });
    
    it('should have empty lastEntry field initially', function(done){
        expect(newCat.lastEntry).to.be.a('undefined');
        done();
    });
    
    it('should destroy category with user ', function(done){
        userModel.find({where: {id: id}}).then(function(u){
            u.destroy().then(function(){
                expect(newCat.reload).to.throwError();
                done(); 
            });
        });
    });
});
