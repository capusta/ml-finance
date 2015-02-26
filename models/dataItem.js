var Sequelize = require("sequelize"),
    oneDay = 24*60*60*1000; //hour - min - sec - ms
    
module.exports = function(sequelize, DataTypes){
    return sequelize.define("Dataitem", {
        id: {type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true},
        lat: {type: DataTypes.DECIMAL(10, 6), allowNull: false, defaultValue: 0.00},
        lon: {type: DataTypes.DECIMAL(10, 6), allowNull: false, defaultValue: 0.00},
        temp: {type: DataTypes.FLOAT, allowNull: true, defaultValue: 32},
        date: {type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW},
        
        amount: {type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
        description: {type: DataTypes.STRING, allowNull: true, defaultValue: ""},
        daysSinceLast: {type: DataTypes.INTEGER, allowNull: true, defaultValue: 0}
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
                if(diffDays > 365) {diffDays = 0}
                this.updateAttributes({daysSinceLast: diffDays}, {fields: ['daysSinceLast']});
            }
        }
    });
};