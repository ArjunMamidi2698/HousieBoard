var authentication = require('./config.json');

var username = authentication.username;
var password = authentication.password;
var host = authentication.host;
var databaseName = authentication.databaseName;

var uri = 'mongodb+srv://'+username+':'+password+'@'+host+'/'+databaseName+'?retryWrites=true&w=majority';


module.exports.uri=uri;