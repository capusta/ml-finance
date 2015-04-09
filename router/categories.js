console.log("--loading categories routes");
var validator = require("validator");

module.exports = function(app){

    app.get('/data/categories', function(req, res){
        if (req.xhr){
            req.user.getCategories().then(function(categories){
               var catJson = [];
               categories.forEach(function(c){
                   catJson.push({id: c.id, label: c.label});
               });
               return res.json(JSON.stringify(catJson)); 
            });
        }else {
            req.user.getCategories().then(function(categories){
            return res.render('pages/user', {userid: req.user.id, style: "categories", categories: categories});
            }); 
        }
    });
    
    app.post('/data/categories/new', function(req, res){
        if(!req.body.description){
            return res.json({success: false, msg:"Invalid category description found"});
        }
        //sanitizing the actual user input
        var desc = validator.toString(req.body.description);
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
                });
            }});
    });
    
    app.post('/data/categories/delete/:id', function(req, res){
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
