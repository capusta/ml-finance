var Sequelize = require("sequelize");
var user = process.env.HGUSER || process.env.OPENSHIFT_MYSQL_DB_USERNAME;
var dbname = process.env.OPENSHIFT_APP_NAME || 'c9';
var password = process.env.OPENSHIFT_MYSQL_DB_PASSWORD || null;
var config = {
    dialect: 'mysql',
    host: process.env.IP || process.env.OPENSHIFT_MYSQL_DB_HOST
};

var sq = new Sequelize(dbname, user, password, config);
global.db = {
    sequelize: sq,
    User: sq.import(__dirname + '/user'),
    Category: sq.import(__dirname + '/category'),
    Dataitem: sq.import(__dirname + '/dataItem')
};

global.db.User.hasMany(global.db.Category, {as: "Categories", onDelete: 'cascade'});
global.db.Category.hasMany(global.db.Dataitem, {as: "Dataitems", onDelete: 'CASCADE'});
global.db.Category.belongsTo(global.db.User);
global.db.Dataitem.belongsTo(global.db.Category);

module.exports = global.db;
console.log("database services finished");