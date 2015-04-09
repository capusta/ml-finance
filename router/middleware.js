console.log("--loading middleware");
var async = require("async");

// checkuser middleware will always be called for exception of special cases URLs
// mostly dealing with setting up and tearing down sessions
// req.user will always be attached if user has authenticated

var checkuser = function(req, res, next){
    if(req.path === '/' || req.path.indexOf('pages') >= 0 || req.path.indexOf('user') >= 0){
        next();
        return;
    }
    if((typeof req.session.userid === 'undefined') || req.session.userid === null){
        return res.render('pages/user', {msg: "Unable to find your user ID"});
    }
    if (req.user && (req.user.id === req.session.userid)){
        next();
    } else {
        global.db.User.find({where: {id: req.session.userid}})
        .then(function(u){
            if (u){
                req.user = u;
                next();
            } else {
                return res.render('pages/user', {userid: null, msg: "Unable to find your user ID"});
            }
         });
     }
};

var getCategories = function(req, res, next){
    // make sure that checkuser is run before any other code
    if((typeof req.user === 'undefined') || req.user === null){
        return res.render('pages/user', {userid: null, msg: "Unable to find your user ID"});
    }
    req.user.getCategories().then(function(categories){
        if(categories === [] || categories === null){
            return res.render('pages/user', {userid: req.session.userid, msg: "Unable to find your categories"});
        } else {
            var ctgs = [];
            categories.forEach(function(c){
                ctgs.push([c.id, c.label]);
                req.categories = ctgs;
            });
                next();
            }
        });
    };

var findcategoryObjects = function(req, res, next){
    global.db.User.find({where: {id: req.session.userid}})
    .then(function(u){
        if (u){
            req.user = u;
        } else {
            res.render('pages/user', {userid: null, msg: "Unable to find your user ID"});
        }
        u.getCategories().complete(function(err, categories){
            if(err){
                res.render('pages/user', {userid: null, msg: "Unable to find your categories"});
            } else {
                req.categories = categories;
                next();
            }
        });
    });
};

var findEntries = function(req, res, next){
    var items = [];
    var getDataItems = function(category, callback){
        category.getDataitems().complete(function(err, dataitems){
            dataitems.forEach(function(i){
                i.category = category.label;
                
                items.push(i);
            });
            callback(null, dataitems.length);
        });
       };
       
   async.map(req.categories, getDataItems, function(err, results){
           if(err) {
               res.render('pages/user', {userid: null, msg: "OOPS, could not get all the items"});
           } else {
               req.items = items;
               next();
           }
       });
};

// module.exports.findEntries = findEntries;
module.exports.checkuser = checkuser;
// module.exports.getCategories = getCategories;
module.exports.findcategoryObjects = findcategoryObjects;