var mongoose = require('mongoose');

var Room = mongoose.model('rooms', {
    token: String,
    room_id: String,
    admin: String,
    users: Array, // => name, ticket, token
    prevNumbers: Array, 
    // numbersArray: Array,
    usedTickets: Array, // => name, ticket, token
    selectedPrizes: Array, // => prize, winners
    gameStatus: String,
    speechString: String,
});

module.exports.Room=Room;
