var mongoose = require('mongoose');

var Room = mongoose.model('rooms', {
    token: String,
    room_id: String,
    admin: String,
    users: Array,
    prevNumbers: Array,
    numbersArray: Array,
    usedTickets: Array,
    selectedPrizes: Array,
    gameStatus: String,
    speechString: String,
});

module.exports.Room=Room;
