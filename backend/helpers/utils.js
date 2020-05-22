var activeTokens = [];

var disconnectedTokens = [];


var createRandomToken =  function(activeTokens){
    let randomNumber = Math.floor(Math.random() * 999);
    if(activeTokens.findIndex( (tokenObj) => tokenObj.token == ('token-'+randomNumber)) < 0){
        return 'token-'+randomNumber;
    } else{
        while(activeTokens.findIndex( (tokenObj) => tokenObj.token == ('token-'+randomNumber)) > -1){
            randomNumber = Math.floor(Math.random() * 999);
        }
        return 'token-'+randomNumber;
    }
}

module.exports.activeTokens = activeTokens;
module.exports.disconnectedTokens = disconnectedTokens;
module.exports.createRandomToken = createRandomToken;