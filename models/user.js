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
                console.log("generating new id:" + new_id);
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
                        global.db.User.generateID();
                    }
                      
                });
            }
        },
        instanceMethods: {
            dataDirectory: function(){
                return process.env.DATA_DIR || 'data';
            }
        }
    });
};

function pickRandom () {
    // var result = [];

    // var strLength = 20;
    // var charSet =  'abcdefghijklmnopqrstuvwxyz0123456789';

    // while (strLength--) {
    //     result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    // }
    // return result.join('');
    return crypto.randomBytes(20).toString('hex');
}

//TODO: INSTANCE METHOD THAT GETS ALL THE CATEGORIES