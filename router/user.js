console.log("--loading user routes");

module.exports = function(app){
    app.get('/user/logout', function(req, res){
        req.session.destroy(function(err){
           if(err){
               res.render('pages/user', {userid: null, msg: "unable to log out lolz "});
           } else {
               res.render('pages/user', {userid: null, msg: "successfully logged out"});
           }
        });
    });
    
    app.post('/user/new', function(req, res){
        //maybe in the future we can use a captcha or something to make sure we do not have too many requests
        //for now, lets just create a user
        var nU = global.db.User;
        nU.generateID(function(err, new_id){
            if(err){
                console.log("unable to create user: " + err);
                res.json({msg: "Seems like there is an error: " + err});
            } else {
                nU.create({id: new_id})
                .then(function(u){
               console.log("new user created: " + u.id);
               res.json(({userid: u.id, msg: "New ID successfully created"}));
                });
            }
        });
    });
    app.get('/user', function(req, res){
        res.render('pages/index', {msg: "Unable to find your user ID"});
    });
    
    app.get('/user/:userid', function(req, res){
        global.db.User.find({where: {id: req.param('userid')}})
        .then(function(u){
            if (u){
                req.session.userid = u.id;
                req.user = u;
                res.render('pages/user', {userid: u.id});
            } else {
                res.render('pages/user', {userid: null, msg: "Unable to find your user ID"});
            }
        })
        .catch(function(err){
            res.render('pages/user', {userid: null, msg: "An error occured while looking for user ID"});
        });
    });
};