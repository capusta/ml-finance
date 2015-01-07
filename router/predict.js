console.log("--loading prediction routes");
var md = require('./middleware'), 
    fs = require("fs");
    
var datadir = process.env.DATA_DIR;


// var jf = require('jsonfile');
// var async = require('async');

module.exports = function(app){
    
    app.get('/predict', md.checkuser, md.findcategoryObjects, md.findEntries, function (req, res) {
        fs.exists(datadir+"/"+req.user.id+".model", function(exists){
            if(exists){
                res.render('pages/predict', {dataitems: req.items});
            } else {
                res.render('pages/user', {userid: null, msg: "OOPS, you need to first train a model before you can use it"});
            }
        });
    });
    
};

