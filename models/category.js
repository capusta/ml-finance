var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Category", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            defaltValue: 0
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            defaltValue: "",
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
            defaltValue: 0
        }
    }, {
        instanceMethods: {
            updateCategory: function() {
                this.updateAttributes({lastEntry: Sequelize.fn("NOW")}, {fields: ['lastEntry']});
            }
        }
    });
};