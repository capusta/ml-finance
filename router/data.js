console.log("--loading data routes");
var md = require('./middleware');
var async = require("async");
var validator = require("validator")

var errorOut = function(res, msg){
    res.json({success: false, msg: msg});
    return null;
};

module.exports = function(app){
    app.get('/data', md.checkuser, function (req, res) {
        res.render('pages/user', {userid: req.session.userid, style: 'data'});
    });
    
    app.get('/data/entries/view', md.checkuser, md.findcategoryObjects, md.findEntries, function(req, res){
        //we need sequelize objects instead of a simple array
       res.render('pages/user', {userid: req.user.id, style: 'dataitems', dataitems: req.items, categories: req.categories});
    });
    
    app.get('/data/categories', md.checkuser, function(req, res){
        req.user.getCategories().then(function(d){
            res.render('pages/user', {userid: req.user.id, style: "categories", categories: d});
        });        
    });
    
    app.get('/data/entries', md.checkuser, md.getCategories, function(req, res) {
        res.render('pages/user', {userid: req.user.id, style: "dataitems", categories: req.categories});    
    });
    
    app.post('/data/entries', md.checkuser, function(req, res) {
        if((typeof req.body.category == 'undefined' || req.body.category === null)){
            return res.json({success: false, msg: "Sorry, please specify category "});
        }
        if (!validator.isInt(req.body.category)){
            return res.json({success: false, msg: "Invalid cateogry"});
        }
        req.user.getCategories({where: 'id = ' + req.body.category})
        .then(function(cat){
            
            // This was interesting.  Apparently, sequelize JS will 'find' a record in the database which does not 
            // exist, and return an empty array instad of follwoing 'function(err, record)' format.
            // The sure way to find an 'error' is to check that the first element of array does not exist
            
            if(cat === [] || cat === null || typeof(cat[0]) === 'undefined'){
                return res.json({success: false, msg: "Unable to process request "});
            }
            console.log("Cateogries " + JSON.stringify(cat[0]));
            global.db.Dataitem.create({
                lat: req.body.latitude, 
                lon: req.body.longitude, 
                temp: req.body.temp, 
                amount: req.body.amount, 
                description: req.body.description
                })
            .complete(function(err, d){
                if(err){
                    console.log(err);
                    return res.json({success: false, msg: "Unable to create the item - please make sure all field are filled in "});
                }
                
                d.setDaysSinceLast(cat[0].lastEntry);
                cat[0].updateCategory();
                cat[0].addDataitem(d)
                .then(function(){
                    return res.json({success: true, msg: "Item added"});
                })
                .catch(function(err){
                    console.log("Unable to add data item for some reason ");
                    return res.json({success: false, msg: "Error when adding the item "});
                });
            });
        });
    });
    
    app.post('/data/categories', md.checkuser, function(req, res){
       var desc = req.body.description;
       global.db.Category.create({label: desc})
       .complete(function(err, c){
          if(err){
              res.json({success: false, msg: "Sorry, category must be letter+number combination, and less than 140 characters"});
          } else {
              req.user.addCategory(c).complete(function(err, next){
              if (err){
                  res.json({success: false, msg: "Sorry, there has been a database error of some sort"});
              } else {
                  res.json({success: true, msg: "Category added", label: c.label});
              }
          });}
    });
    });
    
    app.post('/data/categories/delete/:id', md.checkuser, function(req, res){
        var cat_id = req.params['id'];
        if(!validator.isInt(cat_id)){
            return res.json({success: false, msg: "Sorry, invalid category"});
        }
        req.user.getCategories({where: 'id = ' + cat_id}).success(function(c){
            if(c && c != [] && c[0]){
                c[0].destroy().success(function(){
                  res.json({success: true, msg: "Category " + c[0].label + " removed "});  
                });
            } else {
                res.json({success: false, msg: "Error occured when removing category"});
            }
        });
        
    });
};



