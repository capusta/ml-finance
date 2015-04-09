var crypto = require("crypto");
var async = require("async");

module.exports = function(sequelize, DataTypes){
    return sequelize.define("User", {
        id: {type: DataTypes.STRING, allowNull: false, unique: true},
        email: {type: DataTypes.STRING, defaultValue: "user@mailinator.com"},
        catID: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
    },
    {
        classMethods: {
            generateID: function(next){
                var new_id = pickRandom();
                global.db.User.find({where: {id: new_id}})
                .catch(function(err){
                    console.log('error in generating new user ID in the model ' + err);
                    next(err, null);
                })
                .then(function(u){
                    if (u === null){
                        console.log("looks like user " + new_id + " is ok ");
                        next(null, new_id);
                    } else {
                        global.db.User.generateID(next);
                    }
                      
                });
            }
        },
        instanceMethods: {
            dataDirectory: function(){
                return process.env.DATA_DIR || 'data';
            },
            getTrainingData: function(callback){
                
                var getItems = function(category, cb){
                    category.getDataitems().complete(function(err, items){
                        if(err){
                            cb(err, null); 
                            return;
                        }
                        var x = {};
                        x.label = category.label;
                        x.id = category.id;
                        x.entries = [];
                        items.forEach(function(i){
                            x.entries.push({lat: i.lat, lon: i.lon, temp: i.temp, date: i.date,
                                amount: i.amount, description: i.description, daysSinceLast: i.daysSinceLast
                            });
                        });
                        cb(null, x);
                    });
                };
                
                this.getCategories().complete(function(err, categories){
                    if(err || categories.length === 0){
                        callback({msg: "No categorires entered"}, null);
                        return;
                    } else {
                        async.map(categories, getItems, function(err, result){
                            callback(err, result);
                        });
                    }
                });
            }
        },
     hooks: {
        beforeDestroy: function(usr, options, callback) {
        usr.getCategories().then(function(cs){
            cs.forEach(function(i){
                i.destroy();
            });
            callback(null, usr);
        });
        }
     }
    });
};

function pickRandom () {
    return crypto.randomBytes(20).toString('hex');
}

//TODO: INSTANCE METHOD THAT GETS ALL THE ENTRIES