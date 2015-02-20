console.log("--loading prediction routes");
var md = require('./middleware'), 
    fs = require("fs"),
    jf = require("jsonfile");

module.exports = function(app){
    
    app.get('/predict', md.checkuser, function (req, res) {
        var path = req.user.dataDirectory()+"/"+req.user.id+".model";
        fs.exists(path, function(exists){
            if(exists){
                jf.readFile(path, function(err, m){
                    if(err){
                        return res.json({success: false, msg: "Unable to read model files ... <br>" +
                        " perhaps train model one more time ?"});
                    }
                    return res.render('pages/predict', {userid: req.session.userid, model: JSON.stringify(m)});
                });
                
            } else {
                return res.render('pages/user', {userid: req.session.userid, msg: "OOPS, you need to first train a model before you can use it"});
            }
        });
    });
    
};

//test