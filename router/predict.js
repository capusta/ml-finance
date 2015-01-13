console.log("--loading prediction routes");
var md = require('./middleware'), 
    fs = require("fs"),
    jf = require("jsonfile");
    
var datadir = process.env.DATA_DIR;


// var jf = require('jsonfile');
// var async = require('async');

module.exports = function(app){
    
    app.get('/predict', md.checkuser, md.findcategoryObjects, md.findEntries, function (req, res) {
        var path = datadir+"/"+req.user.id+".model";
        fs.exists(path, function(exists){
            if(exists){
                jf.readFile(path, function(err, obj){
                    if(err){
                        console.log("unable to read model file ... " + path);
                        return res.json({success: false, msg: "Unable to read model files"});
                    }
                    return res.render('pages/predict', {dataitems: JSON.stringify(req.items), 
                                                        categories: JSON.stringify(req.categories),
                                                        model: JSON.stringify(obj)});
                });
                
            } else {
                return res.render('pages/user', {userid: null, msg: "OOPS, you need to first train a model before you can use it"});
            }
        });
    });
    
};
