module.exports = function(sequelize, DataTypes){
    return sequelize.define("Category", {
        id: {type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true, defaltValue: 0},
        label: {type: DataTypes.STRING, allowNull: false, defaltValue: "",
            validate: {
                isAlphanumeric: true,
                len:[1,140]
            }
        },
        hash: {type: DataTypes.INTEGER, allowNull: true, defaltValue: 0}
    });
};