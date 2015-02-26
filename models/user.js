var crypto = require("crypto");

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
            getDataItems: function(){
                //TODO: write this function
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