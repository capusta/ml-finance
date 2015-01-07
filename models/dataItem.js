var Sequelize = require("sequelize");
module.exports = function(sequelize, DataTypes){
    return sequelize.define("Dataitem", {
        id: {type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true, defaltValue: 0},
        lat: {type: DataTypes.DECIMAL(10, 6), allowNull: false, defaltValue: 0.0000},
        lon: {type: DataTypes.DECIMAL(10, 6), allowNull: false, defaltValue: 0.0000},
        temp: {type: DataTypes.FLOAT, allowNull: true, defaltValue: 0},
        date: {type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW},
        
        amount: {type: DataTypes.FLOAT, allowNull: false, defaltValue: 0},
        description: {type: DataTypes.STRING, allowNull: true, defaltValue: ""}
    });
};