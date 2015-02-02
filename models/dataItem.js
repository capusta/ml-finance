var Sequelize = require("sequelize"),
    oneDay = 24*60*60*1000; //hour - min - sec - ms
    
module.exports = function(sequelize, DataTypes){
    return sequelize.define("Dataitem", {
        id: {type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true, defaltValue: 0},
        lat: {type: DataTypes.DECIMAL(10, 6), allowNull: false, defaltValue: 0.0000},
        lon: {type: DataTypes.DECIMAL(10, 6), allowNull: false, defaltValue: 0.0000},
        temp: {type: DataTypes.FLOAT, allowNull: true, defaltValue: 0},
        date: {type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW},
        
        amount: {type: DataTypes.FLOAT, allowNull: false, defaltValue: 0},
        description: {type: DataTypes.STRING, allowNull: true, defaltValue: ""},
        daysSinceLast: {type: DataTypes.INTEGER, allowNull: true, defaltValue: 0}
    }, {
        instanceMethods: {
            setDaysSinceLast: function(lastUpdate){
                var diffDays = 0;
                try{
                    var d1 = new Date(lastUpdate);
                    var d2 = new Date();
                } catch (err){
                    console.log("\nUnable to parse the date for item " + this.id);
                    return err;
                }
                diffDays = Math.round(Math.abs((d1.getTime() - d2.getTime()))/oneDay);
                this.updateAttributes({daysSinceLast: diffDays}, {fields: ['daysSinceLast']});
            }
        }
    });
};