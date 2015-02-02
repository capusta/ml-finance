console.log("--loading training routes");
var md = require('./middleware');
var jf = require('jsonfile');
var async = require('async');

module.exports = function(app){
    
    app.get('/train', md.checkuser, md.findcategoryObjects, function (req, res) {
        var trainingData = [];
        var index = 0;
        
        var getDataItems = function(category, callback){
            var localIndex = index;
            index++;
            trainingData[localIndex] = {};
            trainingData[localIndex].categoryID = category.id;
            trainingData[localIndex].categoryLabel = category.label;
            
            var dataitems = [];
            category.getDataitems().complete(function(err, di){
                if(err){ 
                    return res.render('pages/user', {userid: req.session.userid, msg: "unable to process request "}); 
                }
                   di.forEach(function(i){
                       dataitems.push({lat: i.lat, lon: i.lon, temp: i.temp, date: i.date, daysSinceLast: i.daysSinceLast});
                   });
                   trainingData[localIndex].data = dataitems;
                   callback(null, di.length);
               });
           };
        async.map(req.categories, getDataItems, function(err, results){
            if(err) {
                return res.render('pages/user', {userid: null, msg: "OOPS, could not get all the data items"});
            }
                return res.render('pages/train', {  userid: req.session.userid, trainingData:  JSON.stringify(trainingData)});
           });
    });
    
      app.post('/train', md.checkuser, function(req, res){
       console.log('posting model for ' + req.session.userid);
       var file = req.user.dataDirectory()+"/"+req.session.userid+'.model';
       jf.writeFile(file, req.body, function(err){
           if(err) {
               console.log(err);
           }
           return res.json({success: true, msg: "Model saved on server"});
       });
    });
    
};

