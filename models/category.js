var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Category", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "na",
            validate: {
                isAlphanumeric: true,
                len: [1, 140]
            }
        },
        numItems: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastEntry: {
            type: DataTypes.DATE,
            allowNull: true
        },
        hash: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    }, {
        instanceMethods: {
            updateCategory: function() {
                this.updateAttributes({lastEntry: new Date()}, {fields: ['lastEntry']});
            }
        }
    }, {
     hooks: {
        beforeDestroy: function(cat, options, callback) {
        cat.getDataItems().then(function(items){
            items.forEach(function(i){
               i.destroy(); 
            });
            callback(null, cat);
        });
        }
     }
    });
};