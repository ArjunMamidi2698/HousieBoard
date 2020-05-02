var mongoose = require('mongoose');

var Room = mongoose.model('rooms', {
    token: String,
    room_id: {
        type: String,
        trim: true,
    },
    admin: {
        type: String,
        trim: true,
    },
    users: Array,
    prevNumbers: Array,
    numbersArray: Array,
    usedTickets: Array,
    selectedPrizes: Array,
    gameStatus: String,
    speechString: String,
});

module.exports.Room=Room;
