console.log("--loading data routes");
var md = require('./middleware');
var async = require("async");

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
    
    app.get('/data/entries', md.checkuser, md.finduserAndCategories, function(req, res) {
        res.render('pages/user', {userid: req.user.id, style: "dataitems", categories: req.categories});    
    });
    
    app.post('/data/entries', md.checkuser, function(req, res) {
        if((typeof req.body.category == 'undefined' || req.body.category === null)){
            return res.json({success: false, msg: "Sorry, please specify category "});
        }
        req.user.getCategories({where: 'id = ' + req.body.category})
        .complete(function(err, cat){
            if(err || cat === []){
                return res.json({success: false, msg: "Unable to process request "});
            }
            global.db.Dataitem.create({
                lat: req.body.latitude, 
                lon: req.body.longitude, 
                temp: req.body.temp, 
                date: req.body.date,
                amount: req.body.amount, 
                description: req.body.description
                //TODO: add calculation for days since last entry
                })
            .complete(function(err, d){
                if(err){
                    console.log(err);
                    return res.json({success: false, msg: "Unable to create the item - please make sure all field are filled in "});
                }
                cat[0].addDataitem(d)
                .then(function(){
                    return res.json({success: true, msg: "Item added"});
                })
                .catch(function(err){
                    console.log("Unable to add data item for some reason ");
                    return res.json({success: false, msg: "Error when adding the item "})
                });
            });
        });
    });
    
    app.post('/data/categories', md.checkuser, function(req, res){
       var desc = req.body.description;
       //TODO: sanitize some string data coming from the body of the request
       console.log("length of description : " + desc.length);
       global.db.Category.create({label: desc})
       .complete(function(err, c){
          if(err){
              res.json({success: false, msg: "Sorry, unable to add.  140 char max, Alphanumeric"});
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
        //TODO: sanitize for an integer
        req.user.getCategories({where: 'id = ' + cat_id}).success(function(c){
            if(c && c != [] && c[0]){
                c[0].destroy().success(function(){
                  res.json({success: true, msg: "Category " + c[0].label + " removed "});  
                })
            } else {
                res.json({success: false, msg: "Error occured when removing category " + c.label})        ;
            }
        });
        
    });
};



