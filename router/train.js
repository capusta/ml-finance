console.log("--loading training routes");
var md = require('./middleware');
var datadir = process.env.DATA_DIR;
var jf = require('jsonfile');
var async = require('async');

module.exports = function(app){
    
    app.get('/train', md.checkuser, md.findcategoryObjects, function (req, res) {
        var ctgHash = {};
        req.categories.forEach(function(c){
            ctgHash[c.id] = c.label;
        });
        var dataitems = [];
        var getDataItems = function(category, callback){
               category.getDataitems().complete(function(err, di){
                   di.forEach(function(i){
                       dataitems.push(i);
                   });
                   callback(null, di.length);
               });
           };
        async.map(req.categories, getDataItems, function(err, results){
            if(err) {
               res.render('pages/user', {userid: null, msg: "OOPS, could not get all the items"});
               }
               res.render('pages/train', {  userid: req.session.userid, 
                                            dataitems: JSON.stringify(dataitems),
                                            categories:  JSON.stringify(ctgHash)});
           });
    });
    
      app.post('/train', md.checkuser, function(req, res){
       console.log('training model for ' + req.session.userid);
       var file = datadir+"/"+req.session.userid+'.model';
       jf.writeFile(file, req.body, function(err){
           if(err) {
               console.log(err);
           }
           return res.json({success: true, msg: "Model saved on server"});
       });
    });
    
};

