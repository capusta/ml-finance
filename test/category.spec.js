var expect = require("expect.js");
require('../models/index.js');
var id = 'notRandomID';

//the after / before hooks do not seem to work here ... more on that later

describe('categoryModel', function(){
    var userModel = global.db.User;
    var newCat;
    var newItem;
    
    it('should sync the database ', function(done){
        //TODO: move this to a separate test
        global.db.sequelize.sync().then(function(){
            done();
        });        
    });
    
    it('should create category', function(done){
        global.db.Category.create({label: "test"}).then(function(cat){
            newCat = cat;
            expect(cat).not.to.be(null);
            expect(cat).not.to.be.a('undefined');
            done();
        });
    });
    
    it('should add category to user', function(done){
        userModel.create({id: id}).then(function(u){
            u.addCategory(newCat).then(function(){
                u.getCategories().then(function(cats){
                   expect(cats.length).to.be.equal(1); 
                   done();
                });
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
    
    it('should update last entry with new field', function(done){
       global.db.Dataitem.build().save().then(function(i){
           newItem = i;
           newCat.addDataitem(i).then(function(){
               expect(newCat.updateCategory()).not.to.be(null);
               expect(newCat.lastEntry).not.to.be(null);
               expect(newCat.lastEntry).not.to.be.a('undefined');
               done();
           });
       }); 
    });
    
    //TODO: create category and dataitem to see if data item is destroyed when category is destroyed
    
    it('should destroy category and dataitem with user ', function(done){
        userModel.find({where: {id: id}}).then(function(u){
            u.destroy().then(function(){
                expect(newCat.reload).to.throwError();
                expect(newItem.reload).to.throwError();
                done(); 
            });
        });
    });
});
