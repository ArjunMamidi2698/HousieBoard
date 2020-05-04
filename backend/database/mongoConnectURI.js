require('dotenv').config()

var username = process.env.DBUSERNAME;
var password = process.env.PASSWORD;
var host = process.env.HOST;
var databaseName = process.env.DATABASENAME;

var uri = `mongodb+srv://${username}:${password}@${host}/${databaseName}?retryWrites=true&w=majority`;

module.exports.uri=uri;