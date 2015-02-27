var expect = require("expect.js"),
    async = require("async");
    
require('../models/index.js');


describe('dataItem Model', function(){
    var newCat;
    var newDataitem;
    var di;
    
    var itemDetails = {
        description: "test label",
        amount: 1000
    };
    
    var categoryDetails = {
        label: "testCategoryLabel"
    };
    
    before(function(done){
        di = global.db.Dataitem;
        done();
    });
    
    it('should create en empty data item correctly', function(done){
        di.create().then(function(d){
            d.destroy().then(function(){
                done();
            });
        });
    });
    
    it('should be created correctly ', function(done){
        async.series([
            function(callback){
                di.create(itemDetails).then(function(i){
                    expect(i.description).to.equal("test label");
                    expect(i.amount).to.equal(1000);
                    newDataitem = i;
                    callback(null, 1);
                });
            },
            function(callback){
                global.db.Category.create(categoryDetails).then(function(c){
                    newCat = c;
                    expect(newCat.label).to.equal("testCategoryLabel");
                    callback(null, 1);
                });
            }
            ],
            function(err, results){
                done();
            });
    });
    
    it('should be added to category', function(done) {
       newCat.addDataitem(newDataitem).then(function(){
           newCat.getDataitems().then(function(items){
               expect(items.length).to.equal(1);
               done();
           });
       });
    });
    
    it('should delete the data item if category is deleted', function(done) {
        newCat.destroy().then(function(){
            expect(newCat.reload).to.throwError();
            expect(newDataitem.reload).to.throwError();
            done(); 
        });        
    });
});