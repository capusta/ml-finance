console.log("--loading entries routes");
var validator = require("validator");

module.exports = function(app){
    app.get('/data/entries/view', function(req, res){
        //we need sequelize objects instead of a simple array
        req.user.getTrainingData(function(err, data){
            if(err){
                res.render('pages/user', {userid: req.user.id, msg: "sorry, unable to retrieve all entries"});
                return;
            }
            var categories = [];
            data.forEach(function(category){
                categories.push({id: category.id, label: category.label});
            });
            res.render('pages/user', {userid: req.user.id, style: 'dataitems', data: data, categories: categories});
        });
    });
    
    app.get('/data/entries', function(req, res) {
        var cats = [];
        req.user.getCategories().complete(function(err, categories){
            if(err){
                res.render('pages/user', {userid: req.user.id, msg: "unable to retrieve all categories"});
                return;
            }
            categories.forEach(function(c){
                cats.push({id: c.id, label: c.label});
            });
            res.render('pages/user', {userid: req.user.id, style: "dataitems", categories: cats});    
        });
    });
    
    app.post('/data/entries', function(req, res) {
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
                    return res.json({success: false, msg: "Error when adding the item "+ err});
                });
            });
        });
    });
};



