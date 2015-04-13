console.log("--loading training routes");
var md = require('./middleware');
var jf = require('jsonfile');
var async = require('async');

module.exports = function(app){
    
    app.get('/train', function (req, res) {
        
        req.user.getTrainingData(function(err, data){
            if(err) return res.render('pages/user', {userid: req.user.id, msg: "OOPS, could not get all the data items"});
            return res.render('pages/train', {userid: req.user.id, trainingData: JSON.stringify(data)});
        });
    });
    
    app.post('/train/categories', function(req, res){
       console.log('posting model for ' + req.session.userid);
       var file = req.user.dataDirectory()+"/"+req.session.userid+'.catmodel';
       jf.writeFile(file, req.body, function(err){
           if(err) {
               console.log(err);
               return res.json({success: false, msg: "Error occured when saving model on server"});
           }
           return res.json({success: true, msg: "Model saved on server"});
       });
    });
    
};

