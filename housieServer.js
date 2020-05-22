var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var server = require('http').createServer(app);
// var io = require("socket.io")(server);

var commonRoute = require('./backend/routes/common');
var roomRoute = require('./backend/routes/room');

var db = mongoose.connection;
var dbconnected = false;
//connection to Database using mongoose.connect(url)
var dbConfig = require('./backend/database/mongoConnectURI');
mongoose.connect(dbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });
// local mongodb
// mongoose.connect('mongodb://localhost:27017/housie', { useNewUrlParser: true, useUnifiedTopology: true });

db.on('error', function(){
    dbconnected = false;
    console.log("Error connecting to Database");
});

db.on('open',function(){	
    dbconnected = true;
    console.log("Database Connected");	
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/housie.html'));
app.use(express.static(__dirname + '/node_modules'));

app.use('/', commonRoute);
app.use('/', roomRoute);

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/housie.html');
});


// io.on('connection', (socket) => {
//     console.log('------------------connection starts------------------');
//     console.log('connected to client');
//     socket.on('checkToken', (tokenObj) => {
//         console.log('------------------checkToken logs start------------------');
//         console.log('checking token,'+tokenObj.token);
//         if(tokenObj.token){
//             console.log('token existed, so new token is not created');
//             let activeTokenObj = activeTokens.find( (atknObj) => atknObj.token == tokenObj.token);
//             // check status and database and push
//             if(tokenObj.status == null || tokenObj.status == 'null') {
//                 if(!activeTokenObj){
//                     console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
//                     activeTokens.push(tokenObj);
//                     console.log(activeTokens);
//                 }
//                 console.log('------------------checkToken logs ends------------------');
//             } else {
//                 if(tokenObj.status.startsWith('Room Created')){
//                     // check room in database
//                     console.log('token status is '+tokenObj.status+', checking room availability in database');
//                     if(dbconnected){
//                         console.log('database connection exists');
//                         Room.findOne({token:tokenObj.token}, (err, roomData) => {
//                             if(err){
//                                 // raise error
//                                 const snackbarObject = {
//                                     type: 'error',
//                                     message: err
//                                 };
//                                 socket.emit('showSnackbar', snackbarObject);
//                                 console.log('database error');
//                                 console.log('------------------checkToken logs ends------------------');
//                                 throw err;
//                             }
//                             if(roomData){
//                                 // exists
//                                 console.log('room exists in database');
//                                 if(!activeTokenObj){
//                                     console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
//                                     activeTokens.push(tokenObj);
//                                 }
//                                 console.log(activeTokens);
//                                 console.log('------------------checkToken logs ends------------------');
//                             } else {
//                                 // not exists in database => so remove user status by raising error
//                                 tokenObj.status = null;
//                                 console.log('room not existed in database, so removing user status from "Room Created"');
//                                 if(!activeTokenObj){
//                                     console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
//                                     activeTokens.push(tokenObj);
//                                 } else {
//                                     activeTokenObj.status = null;
//                                 }
//                                 console.log(activeTokens);
//                                 // raise error
//                                 const resObj = {
//                                     type: 'notFound',
//                                     message: 'Room was deleted, create again!!'
//                                 };
//                                 socket.emit('roomExitSuccess', resObj);
//                                 console.log('sent exit room request to UI');
//                                 console.log('------------------checkToken logs ends------------------');
//                             }
//                         });
//                     } else {
//                         console.log('database connection not exists');
//                         // raise error - db failed
//                         const snackbarObject = {
//                             type: 'dbFailed',
//                             message: 'Something went wrong, please try again later'
//                         };
//                         socket.emit('showSnackbar', snackbarObject);
//                         console.log('------------------checkToken logs ends------------------');
//                     }
//                 } else if(tokenObj.status.startsWith('Room Joined')){
//                     // check room and users
//                     console.log('token status is '+tokenObj.status+', checking room availability in database');
//                     if(dbconnected){
//                         console.log('database connection exists');
//                         Room.findOne({room_id: tokenObj.status.split(': ')[1]}, (err, roomData) => {
//                             if(err){
//                                 // raise error
//                                 const snackbarObject = {
//                                     type: 'error',
//                                     message: err
//                                 };
//                                 socket.emit('showSnackbar', snackbarObject);
//                                 console.log('database error');
//                                 console.log('------------------checkToken logs ends------------------');
//                                 throw err;
//                             }
//                             if(roomData){
//                                 // room exists
//                                 console.log('room exists in database');
//                                 // check for user token
//                                 console.log('checking for user token in room...');
//                                 let user = roomData.users.find((userObj) => userObj.token == tokenObj.token);
//                                 if(user){
//                                     // user exists in room
//                                     console.log('user exists in room');
//                                     if(!activeTokenObj){
//                                         console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
//                                         activeTokens.push(tokenObj);
//                                         console.log(activeTokens);
//                                     }
//                                     console.log('------------------checkToken logs ends------------------');
//                                 } else {
//                                     // user deleted in database
//                                     tokenObj.status = null;
//                                     console.log('user deleted from the room, so removing user status from "Room Joined"');
//                                     if(!activeTokenObj){
//                                         console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
//                                         activeTokens.push(tokenObj);
//                                     } else {
//                                         activeTokenObj.status = null;
//                                     }
//                                     console.log(activeTokens);
//                                     // raise error
//                                     const resObj = {
//                                         type: 'notFound',
//                                         message: 'Not Joined in the room properly, Join again!!'
//                                     };
//                                     socket.emit('roomExitSuccess', resObj);
//                                     console.log('sent exit room request to UI');
//                                     console.log('------------------checkToken logs ends------------------');
//                                 }
//                             } else {
//                                 // room not exists in database => so remove user status by raising error
//                                 tokenObj.status = null;
//                                 console.log('Room not exists in database, so removing user status from "Room Joined"');
//                                 if(!activeTokenObj){
//                                     console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
//                                     activeTokens.push(tokenObj);
//                                 } else {
//                                     activeTokenObj.status = null;
//                                 }
//                                 console.log(activeTokens);
//                                 // raise error
//                                 const resObj = {
//                                     type: 'notFound',
//                                     message: 'Room was deleted by admin'
//                                 };
//                                 socket.emit('roomExitSuccess', resObj);
//                                 console.log('sent exit room request to UI');
//                                 console.log('------------------checkToken logs ends------------------');
//                             }
//                         });
//                     } else {
//                         // raise error - db failed
//                         console.log('database connection not exists');
//                         const snackbarObject = {
//                             type: 'dbFailed',
//                             message: 'Something went wrong, please try again later'
//                         };
//                         socket.emit('showSnackbar', snackbarObject);
//                         console.log('------------------checkToken logs ends------------------');
//                     }
//                 }
//             }
//         } else {
//             console.log('token not existed, so new token is created');
//             let token = createRandomToken();
//             const tokenObj = {
//                 token: token,
//                 status: null
//             }
//             socket.emit('token', tokenObj);
//             activeTokens.push(tokenObj);
//             console.log(activeTokens);
//             console.log('------------------checkToken logs ends------------------');
//         }
//     });
//     socket.on('disconnect', (data) => {
//         console.log('user disconnected', data);
//         console.log('------------------disconnected------------------');
//     });
//     socket.on('disconnectToken', (tokenObj) => {
//         console.log('token disconnected/reloaded: '+tokenObj.token);
//         let room_id = null;
//         if(tokenObj.status != null && (tokenObj.status.startsWith('Room Created') || tokenObj.status.startsWith('Room Joined'))){
//             room_id = tokenObj.status.split(': ')[1];
//         }
//         disconnectToken(tokenObj.token, room_id);
//     });
//     socket.on('clientReloaded', (token) => {
//         console.log('client reloaded: '+token);
//         let disconnectedTokenIndex = disconnectedTokens.indexOf(token);
//         if(disconnectedTokenIndex > -1){
//             disconnectedTokens.splice(disconnectedTokenIndex, 1);
//         }
//     });
//     // create room
//     socket.on('createRoom', (roomObj) => {
//         console.log('------------------create room logs start -----------------------');
//         console.log('Create Room Requested by'+roomObj.token);
//         let activeTokenObj = activeTokens.find((tokenObj) => tokenObj.token == roomObj.token);
//         if(!activeTokenObj){
//             const snackbarObject = {
//                 type: 'notFound',
//                 message: 'Action can\'t be performed now, Please refresh your browser!!'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
//             console.log('------------- create room logs end ----------------------');
//         } else {
//             // add into database
//             if(dbconnected){
//                 console.log('Database Connection exists');
//                 Room.find({ $or:[ {room_id: roomObj.room_id}, {admin: roomObj.admin} ] }, (err,data) => {
//                     if (err){
//                         const resObj = {
//                             type: 'dbFailed',
//                             message: err
//                         };
//                         socket.emit('roomCreateError', resObj);
//                         console.log('database error');  
//                         console.log('------------- create room logs end ----------------------');
//                         throw err;  
//                     }
//                     console.log('Checking with Room Availability: '+roomObj.room_id);
//                     if(data.length){
//                         const resObj = {
//                             type: 'error',
//                             message: 'Roomid or Username used already existed'
//                         };
//                         socket.emit('roomCreateError', resObj);
//                         console.log('Room create error requested to UI -> Roomid or Username used already existed');
//                         console.log('------------- create room logs end ----------------------');
//                     } else {
//                         var room = new Room();
//                         room.room_id = roomObj.room_id;
//                         room.admin = roomObj.admin;
//                         room.token = roomObj.token;
//                         const selectedPrizesObjects = [];
//                         roomObj.selectedPrizes.forEach((prize) => {
//                             const prizeObj = {
//                                 prize: prize,
//                                 winners: []
//                             }
//                             selectedPrizesObjects.push(prizeObj);
//                         });
//                         room.selectedPrizes = selectedPrizesObjects;
//                         room.roomMessages = [];
//                         room.gameStatus = 'Game Not Yet Started';
//                         const ticketObj = {
//                             ticket: roomObj.ticket,
//                             name: roomObj.admin,
//                             token: roomObj.token
//                         }
//                         room.usedTickets.push(ticketObj);
//                         // Insert the Data 
//                         console.log('Adding roomid: '+roomObj.room_id+' into database');
//                         room.save((err,data) => {
//                             if (err){
//                                 const resObj = {
//                                     type: 'dbFailed',
//                                     message: err
//                                 };
//                                 socket.emit('roomCreateError', resObj);
//                                 console.log('Database error'); 
//                                 console.log('------------- create room logs end ----------------------'); 
//                                 throw err;  
//                             }
//                             activeTokenObj.status = 'Room Created';
//                             console.log('Successfully saved, updating active token status to "Room Created"');
//                             console.log(activeTokens);
//                             const resObj = {
//                                 type: 'success',
//                                 selectedPrizes: selectedPrizesObjects,
//                                 message: 'Room created successfully, ask your friends to join with this id: '+roomObj.room_id
//                             };
//                             socket.emit('roomCreateSuccess',resObj);
//                             console.log('Sent roomCreate Success to UI');
//                             console.log('------------- create room logs end ----------------------');
//                         });
//                     }
//                 });
//             } else {
//                 const resObj = {
//                     type: 'dbFailed',
//                     message: 'Something went wrong, please try again later'
//                 };
//                 socket.emit('roomCreateError', resObj);
//                 console.log('Database connection not exists, roomCreate error requested to UI');
//                 console.log('------------- create room logs end ----------------------');
//             }
//         }
//     });
//     //join room
//     socket.on('joinRoom', (roomObj) => {
//         console.log('------------- join room logs start ----------------------');
//         console.log('Join Room Requested by'+roomObj.token);
//         let activeTokenObj = activeTokens.find((atknObj) => atknObj.token == roomObj.token);
//         if(!activeTokenObj){
//             const snackbarObject = {
//                 type: 'notFound',
//                 message: 'Action can\'t be performed now, Please refresh your browser!!'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
//             console.log('------------- join room logs ends ----------------------');
//         } else {
//             console.log('Joining into Room...');
//             if(dbconnected){
//                 console.log('Database Connection exists');
//                 Room.findOne({room_id:roomObj.room_id}, (err, roomData) => {
//                     if(err){
//                         const resObj = {
//                             type: 'dbFailed',
//                             message: err
//                         }
//                         socket.emit('roomJoinError', resObj);
//                         console.log('database error');
//                         console.log('------------- join room logs ends ----------------------');
//                         throw err;
//                     }
//                     console.log('checking for room existence: '+roomObj.room_id);
//                     if(roomData){
//                         console.log('Room exists');
//                         if(roomData.gameStatus == 'Game Running'){
//                             let resMessage = null;
//                             if(roomData.prevNumbers.length > 12){
//                                 resMessage = 'Can\'t join, Game already started'
//                             } else{
//                                 resMessage = 'Can\'t join, Game already started, please ask your admin to pause!'
//                             }
//                             const resObj = {
//                                 type: 'error',
//                                 message: resMessage
//                             }
//                             socket.emit('roomJoinError', resObj);
//                             console.log('Room join error requested to UI -> game already started in the room');
//                             console.log('------------- join room logs ends ----------------------');
//                         } else {
//                             console.log('checking for username availability: '+roomObj.player);
//                             if(roomData.users.find((userObj) => userObj.user == roomObj.player)){
//                                 // username used
//                                 const resObj = {
//                                     type: 'error',
//                                     message: 'username already registered'
//                                 }
//                                 socket.emit('roomJoinError', resObj);
//                                 console.log('Room join error requested to UI -> username already taken');
//                                 console.log('------------- join room logs ends ----------------------');
//                             } else {
//                                 console.log('Adding user details to room');
//                                 const userObj = {
//                                     user: roomObj.player,
//                                     token: roomObj.token,
//                                     ticket: roomObj.ticket
//                                 }
//                                 const ticketObj = {
//                                     ticket: roomObj.ticket,
//                                     name: roomObj.player,
//                                     token: roomObj.token
//                                 }
//                                 roomData.users.push(userObj);
//                                 roomData.usedTickets.push(ticketObj);
//                                 Room.updateOne({ room_id:roomObj.room_id}, { 
//                                     $set: {
//                                         users: roomData.users,
//                                         usedTickets: roomData.usedTickets,
//                                     }
//                                 },function(err, data) {
//                                     if (err){
//                                         const resObj = {
//                                             type: 'dbFailed',
//                                             message: err
//                                         }
//                                         socket.emit('roomJoinError', resObj);
//                                         console.log('Database Error');
//                                         console.log('------------- join room logs ends ----------------------');
//                                         throw err;  
//                                     }  else {
//                                         activeTokenObj.status = 'Room Joined';
//                                         console.log('Successfully joined, updating active token status to "Room Joined"');
//                                         console.log(activeTokens);
//                                         const resObj = {
//                                             type: 'success',
//                                             selectedPrizes: roomData.selectedPrizes,
//                                             roomMessages: roomData.roomMessages,
//                                             message: 'Joined Room Successfully'
//                                         }
//                                         socket.emit('roomJoinSuccess', resObj);
//                                         console.log('Room Join Success requested to UI');
//                                         console.log('------------- join room logs ends ----------------------');
//                                     } 
//                                 });
//                             }
//                         }
//                     } else {
//                         const resObj = {
//                             type: 'error',
//                             message: 'Can\'t find room with Room ID:'+roomObj.room_id
//                         }
//                         socket.emit('roomJoinError', resObj);
//                         console.log('Room Join error requested to UI -> can\'t find room');
//                         console.log('------------- join room logs ends ----------------------');
//                     }
//                 })
//             } else {
//                 const resObj = {
//                     type: 'dbFailed',
//                     message: 'something went wrong, please try again later'
//                 }
//                 socket.emit('roomJoinError', resObj);
//                 console.log('Database connection not exists, roomJoin error requested to UI');
//                 console.log('------------- join room logs ends ----------------------');
//             }
//         }
//     });

//     //exit room
//     socket.on('exitRoom', (roomObj) => {
//         console.log('------------- exit room logs start ----------------------');
//         console.log('Exit Room requested by '+roomObj.token);
//         // if status is room Created -> delete room document
//         // if status is room Joined -> remove userToken from room document
//         let activeTokenObj = activeTokens.find((atknObj) => atknObj.token == roomObj.token);
//         if(!activeTokenObj){
//             const snackbarObject = {
//                 type: 'notFound',
//                 message: 'Action can\'t be performed now, Please refresh your browser!!'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
//             console.log('------------- exit room logs ends ----------------------');
//         } else{
//             console.log('checking for user status either room created or room joined');
//             if(activeTokenObj.status != null && (activeTokenObj.status).startsWith('Room Created')){
//                 console.log('User Status is Room Created');
//                 console.log('Deleting Room from Database');
//                 if(dbconnected){
//                     console.log('Database connection exists');
//                     Room.deleteOne({ token: roomObj.token }, function(err, data) {
//                         if (err) {
//                             const resObj = {
//                                 type: 'dbFailed',
//                                 message: err
//                             }
//                             socket.emit('roomExitError', resObj);
//                             console.log('Database Error');  
//                             console.log('------------- exit room logs ends ----------------------');
//                             throw err;  
//                         }
//                         activeTokenObj.status = null;
//                         console.log('Successfully deleted, removing active token status from "Room Created"');
//                         console.log(activeTokens);
//                         const resObj = {
//                             type: 'success',
//                             message: 'Room deleted Successfully'
//                         }
//                         socket.emit('roomExitSuccess', resObj);
//                         console.log('Room exit success requested to UI');
//                         console.log('------------- exit room logs ends ----------------------');
//                     });
//                 } else {
//                     const resObj = {
//                         type: 'dbFailed',
//                         message: 'something went wrong, please try again later'
//                     }
//                     socket.emit('roomExitError', resObj);
//                     console.log('Database connection not exists, roomExit error requested to UI');
//                     console.log('------------- exit room logs ends ----------------------');
//                 }
//             } else if(activeTokenObj.status != null && activeTokenObj.status.startsWith('Room Joined')){
//                 console.log('User Status is Room Joined');
//                 console.log('Deleting User from Room');
//                 if(dbconnected){
//                     console.log('Database Connection Exists');
//                     Room.findOne({room_id:roomObj.room_id}, (err, roomData) => {
//                         if(err){
//                             const resObj = {
//                                 type: 'dbFailed',
//                                 message: err
//                             }
//                             socket.emit('roomExitError', resObj);
//                             console.log('Database Error');
//                             console.log('------------- exit room logs ends ----------------------');
//                             throw err;
//                         }
//                         console.log('Checking for room existence in database');
//                         if(roomData){
//                             console.log('Room available, Deleting user data');
//                             let users = roomData.users;
//                             let userIndex = users.findIndex((user) => user.token == roomObj.token);
//                             users.splice(userIndex, 1);
//                             let usedTickets = roomData.usedTickets;
//                             let usedTicketIndex = usedTickets.findIndex((usedTicketsObj) => usedTicketsObj.token === roomObj.token);
//                             usedTickets.splice(usedTicketIndex, 1);
//                             Room.updateOne({ room_id:roomObj.room_id}, {
//                                 $set: {
//                                     users: users,
//                                     usedTickets: usedTickets
//                                 }
//                             },function(err, data) {
//                                 if (err){
//                                     const resObj = {
//                                         type: 'dbFailed',
//                                         message: err
//                                     }
//                                     socket.emit('roomExitError', resObj);
//                                     console.log('Database Error');
//                                     console.log('------------- exit room logs ends ----------------------');
//                                     throw err;  
//                                 }  else {
//                                     activeTokenObj.status = null;
//                                     console.log('Successfully deleted, removing active token status from "Room Joined"');
//                                     console.log(activeTokens);
//                                     const resObj = {
//                                         type: 'success',
//                                         message: 'Exited Room Successfully'
//                                     }
//                                     socket.emit('roomExitSuccess', resObj);
//                                     console.log('Room Exit Success requested to UI');
//                                     console.log('------------- exit room logs ends ----------------------');
//                                 } 
//                             });
//                         } else {
//                             activeTokenObj.status = null;
//                             const resObj = {
//                                 type: 'success',
//                                 message: 'Exited Room Successfully'
//                             }
//                             socket.emit('roomExitSuccess', resObj);
//                             console.log('Room exit success requested to UI -> Room deleted from Database');
//                             console.log('------------- exit room logs ends ----------------------');
//                         }
//                     });
//                 } else{
//                     const resObj = {
//                         type: 'dbFailed',
//                         message: 'something went wrong, please try again later'
//                     }
//                     socket.emit('roomExitError', resObj);
//                     console.log('Database connection not exists, roomExit error requested to UI');
//                     console.log('------------- exit room logs ends ----------------------');
//                 }
//             }
//         }
//     });

//     // Polling for update tickets
//     socket.on('startPollingForGetTickets', (roomObj) => {
//         console.log('------------- polling for getTickets logs start ----------------------');
//         console.log('Polling for getting tickets requested by', roomObj.token);
//         console.log('-------------------------- Tickets Polling started --------------------------');
//         let prevUsersLength = roomObj.usedTicketsLength;
//         let prevRoomMessagesLength = roomObj.roomMessagesLength;
//         let interval = setInterval(() => {
//             console.log('Polling status: Running -> '+roomObj.token);
//             Room.findOne({room_id:roomObj.room_id, token: roomObj.token}, (err, roomData) => {
//                 if(err){
//                     const snackbarObject = {
//                         type: 'dbFailed',
//                         message: err
//                     }
//                     socket.emit('showSnackbar', snackbarObject);
//                     console.log('Database Error');
//                     console.log('------------- polling for getTickets logs end ----------------------');
//                     throw err;
//                 }
//                 console.log('checking for room: '+roomObj.room_id+' existence');
//                 if(roomData){
//                     console.log('room exists in database');
//                     console.log('checking for game status of the room');
//                     if(roomData.gameStatus != 'Game Completed'){
//                         console.log('game status of the room is: '+roomData.gameStatus);
//                         if(roomData.gameStatus != '' && roomData.gameStatus.startsWith('Someone')){
//                             console.log('Requested UI to pause game');
//                             socket.emit('pauseGameRequested', 'Pause Game Requested');
//                         }
//                         console.log('checking for messages in room');
//                         if(roomData.roomMessages.length > prevRoomMessagesLength){
//                             prevRoomMessagesLength = roomData.roomMessages.length;
//                             console.log('new messages found');
//                             const messageObj = {
//                                 roomMessages: roomData.roomMessages
//                             }
//                             socket.emit('updateRoomMessages', messageObj);
//                         }
//                         console.log('checking for user joined or user left room');
//                         console.log('**************');
//                         console.log(roomData.usedTickets);
//                         console.log(prevUsersLength);
//                         console.log('*****************');
//                         if(roomData.usedTickets.length > prevUsersLength){
//                             console.log('user joined the room');
//                             prevUsersLength = roomData.usedTickets.length;
//                             const usedTicketsObj = {
//                                 type: 'info',
//                                 usedTickets: roomData.usedTickets,
//                                 message: roomData.usedTickets[roomData.usedTickets.length-1].name+' Joined'
//                             }
//                             socket.emit('updateUsedTicketsInUI', usedTicketsObj);
//                             console.log('Requested update usedTickets information to UI');
//                         } else if(roomData.usedTickets.length < prevUsersLength){
//                             console.log('somone left the room');
//                             prevUsersLength = roomData.usedTickets.length;
//                             const usedTicketsObj = {
//                                 type: 'info',
//                                 usedTickets: roomData.usedTickets,
//                                 message: 'Someone Exited Room'
//                             }
//                             socket.emit('updateUsedTicketsInUI', usedTicketsObj);
//                             console.log('Requested update usedTickets information to UI');
//                         }
//                     } else {
//                         console.log('Polling Status: Ended -> '+roomObj.token);
//                         clearInterval(interval);
//                         socket.emit('endTicketsPolling', 'end tickets polling');
//                         console.log('Requested end tickets polling to UI');
//                         console.log('-------------------------- Tickets polling ends --------------------------');
//                         console.log('------------- polling for getTickets logs end ----------------------');
//                     }
//                 } else {
//                     console.log('Room Not exists in database');
//                     console.log('Polling Status: Ended -> '+roomObj.token);
//                     clearInterval(interval);
//                     socket.emit('endTicketsPolling');
//                     console.log('Requested end tickets polling to UI');
//                     const resObj = {
//                         type: 'notFound',
//                         message: 'Room was deleted, create again!!'
//                     };
//                     socket.emit('roomExitSuccess', resObj);
//                     console.log('Requested roomexit succes to UI -> room not exist in database');
//                     console.log('-------------------------- Ticket polling ends --------------------------');
//                     console.log('------------- polling for getTickets logs end ----------------------');
//                 }
//             });
//         }, 4000);
//     });

//     // upate game status
//     socket.on('changeGameStatus', (gameStatusObj) => {
//         console.log('------------- update game status logs start ----------------------');
//         console.log('changeGameStatus requested by: '+gameStatusObj.token);
//         console.log('should update game status');
//         if(dbconnected){
//             console.log('database connection exists');
//             Room.findOne({token: gameStatusObj.token}, (err, roomData) => {
//                 if(err){
//                     const snackbarObject = {
//                         type: 'dbFailed',
//                         message: err
//                     }
//                     socket.emit('showSnackbar', snackbarObject);
//                     console.log('database error');
//                     console.log('------------- update game status logs end ----------------------');
//                     throw err;
//                 }
//                 console.log('checking for room existence');
//                 if(roomData){
//                     console.log('Room available in database');
//                     console.log('Updating game status for the room: '+roomData.room_id);
//                     Room.updateOne({ token:gameStatusObj.token}, {
//                         $set: {
//                             gameStatus: gameStatusObj.status
//                         }
//                     },function(err, data) {
//                         if (err){
//                             const snackbarObject = {
//                                 type: 'dbFailed',
//                                 message: err
//                             }
//                             socket.emit('showSnackbar', snackbarObject);
//                             console.log('Database error');
//                             console.log('------------- update game status logs end ----------------------');
//                             throw err;  
//                         }  else {
//                             console.log('Gamestatus Updated in database -> '+gameStatusObj.status);
//                             console.log('------------- update game status logs end ----------------------');
//                         } 
//                     });
//                 } else {
//                     const resObj = {
//                         type: 'notFound',
//                         message: 'Room was deleted, create again!!'
//                     };
//                     socket.emit('roomExitSuccess', resObj);
//                     console.log('room exitsuccess requested to UI -> Room not found in database');
//                     console.log('------------- update game status logs end ----------------------');
//                 }
//             });
//         } else {
//             const snackbarObject = {
//                 type: 'dbFailed',
//                 message: 'something went wrong, please try again later'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log('Database connection not exists');
//             console.log('------------- update game status logs end ----------------------');
//         }
//     });
//     // Polling for picked numbers
//     socket.on('startPollingForGetNumbers', (roomObj) => {
//         console.log('------------- Polling for getting numbers start -------------');
//         console.log('Polling for getting numbers requested by: '+roomObj.token);
//         console.log('-------------------------- Numbers polling starts --------------------------');
//         let pickedNumbersLength = 0;
//         let prevRoomMessagesLength = roomObj.roomMessagesLength;
//         var numbersInterval = setInterval(() => {
//             console.log('Polling status: Running -> '+roomObj.token);
//             Room.findOne({room_id:roomObj.room_id}, (err, roomData) => {
//                 if(err){
//                     const snackbarObject = {
//                         type: 'dbFailed',
//                         message: err
//                     }
//                     socket.emit('showSnackbar', snackbarObject);
//                     console.log('Database Error');
//                     console.log('------------- Polling for getting numbers end -------------');
//                     throw err;
//                 }
//                 console.log('checking for room: '+roomObj.room_id+' existence');
//                 if(roomData){
//                     console.log('room exists in database');
//                     console.log('checking for user existence in the room');
//                     let user = roomData.users.find((user) => user.token == roomObj.token);
//                     if(user){
//                         console.log('User existed in the room');
//                         console.log('Checking game status...., completed or not');
//                         if(roomData.gameStatus != 'Game Completed'){
//                             console.log('Game status is '+roomData.gameStatus);
//                             console.log('checking for speech string in room...');
//                             if(roomData.speechString){
//                                 const pickedNumbersObj = {
//                                     speechString: roomData.speechString,
//                                     voice: 'US English Female',
//                                     prevNumbers: roomData.prevNumbers,
//                                     selectedPrizes: roomData.selectedPrizes
//                                 }
//                                 socket.emit('updatePrevNumbersInUI', pickedNumbersObj);
//                             }
//                             console.log('checking for messages in room');
//                             if(roomData.roomMessages.length > prevRoomMessagesLength){
//                                 prevRoomMessagesLength = roomData.roomMessages.length;
//                                 console.log('new messages found');
//                                 const messageObj = {
//                                     roomMessages: roomData.roomMessages
//                                 }
//                                 socket.emit('updateRoomMessages', messageObj);
//                             }
//                             console.log('checking for Picked numbers updated or not');
//                             if(roomData.prevNumbers.length > pickedNumbersLength){
//                                 console.log('picked a number');
//                                 const pickedNumber = roomData.prevNumbers[roomData.prevNumbers.length-1];
//                                 var speechString = '';
//                                 if(pickedNumber > 9){
//                                     speechString = pickedNumber.toString().substring(0,1)+' '+pickedNumber.toString().substring(1)+' . '+pickedNumber;
//                                 } else{
//                                     speechString = 'Single number'+pickedNumber;
//                                 }
//                                 const pickedNumbersObj = {
//                                     speechString: speechString,
//                                     voice: 'US English Female',
//                                     prevNumbers: roomData.prevNumbers,
//                                     selectedPrizes: roomData.selectedPrizes
//                                 }
//                                 pickedNumbersLength = roomData.prevNumbers.length;
//                                 socket.emit('updatePrevNumbersInUI', pickedNumbersObj);
//                                 console.log('Requested picked numbers information to UI');
//                             }
//                         } else {
//                             const pickedNumbersObj = {
//                                 speechString: 'Last number is '+roomData.prevNumbers[roomData.prevNumbers.length-1]+' game completed',
//                                 voice: 'US English Female',
//                                 prevNumbers: roomData.prevNumbers,
//                                 selectedPrizes: roomData.selectedPrizes
//                             }
//                             socket.emit('updatePrevNumbersInUI', pickedNumbersObj);
//                             console.log('updated last number');
//                             console.log('Game Completed');
//                             console.log('Polling Status: Ended -> '+roomObj.token);
//                             clearInterval(numbersInterval);
//                             socket.emit('endNumbersPolling');
//                             console.log('Requested end numbers polling to UI');
//                             console.log('-------------------------- Numbers polling ends --------------------------');
//                             console.log('------------- Polling for getting numbers end -------------');
//                         }
//                     } else {
//                         console.log('User not belongs to room');
//                         console.log('Polling Status: Ended -> '+roomObj.token);
//                         clearInterval(numbersInterval);
//                         socket.emit('endNumbersPolling');
//                         console.log('Requested end numbers polling to UI');
//                         console.log('-------------------------- Numbers polling ends --------------------------');
//                         console.log('------------- Polling for getting numbers end -------------');
//                     }
//                 } else {
//                     console.log('Room Not exists in database');
//                     console.log('Polling Status: Ended -> '+roomObj.token);
//                     clearInterval(numbersInterval);
//                     socket.emit('endNumbersPolling');
//                     console.log('Requested end numbers polling to UI');
//                     const resObj = {
//                         type: 'notFound',
//                         message: 'Room was deleted, ask your admin!!'
//                     };
//                     socket.emit('roomExitSuccess', resObj);
//                     console.log('Requested roomexit succes to UI -> room not exist in database');
//                     console.log('-------------------------- Number polling ends --------------------------');
//                     console.log('------------- Polling for getting numbers end -------------');
//                 }
//             });
//         }, 4000);
//     });
//     // updatePrevNumbersInRoom
//     socket.on('updatePrevNumbersInRoom', (roomObj) => {
//         console.log('------------- Update picked numbers logs start -------------');
//         console.log('update prev numbers in room is requested by: '+roomObj.token);
//         if(dbconnected){
//             console.log('Database connection exists');
//             Room.findOneAndUpdate({token: roomObj.token}, { $set: {prevNumbers : roomObj.prevNumbers, speechString: roomObj.speechString} }, (err,data) => {
//                 if(err){
//                     const snackbarObject = {
//                         type: 'dbFailed',
//                         message: err
//                     }
//                     socket.emit('showSnackbar', snackbarObject);
//                     console.log('Database Error');
//                     console.log('------------- Update picked numbers logs end -------------');
//                     throw err;
//                 }
//                 console.log('updated prev numbers successfully');
//                 console.log('------------- Update picked numbers logs end -------------');
//             });
//         } else {
//             const snackbarObject = {
//                 type: 'dbFailed',
//                 message: 'something went wrong, please try again later'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log('Database connection not exists');
//             console.log('------------- Update picked numbers logs end -------------');
//         }
//     });

//     // raise Prize
//     socket.on('raisePrize', (prizeObj) => {
//         console.log('------------- raise prize logs start -------------');
//         console.log('raise prize requested by '+prizeObj.token);
//         let activeTokenObj = activeTokens.find((atknObj) => atknObj.token == prizeObj.token);
//         if(!activeTokenObj){
//             const snackbarObject = {
//                 type: 'notFound',
//                 message: 'Action can\'t be performed now, Please refresh your browser!!'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
//             console.log('------------- raise prize logs ends ----------------------');
//         } else{
//             if(dbconnected){
//                 console.log('Database Connection exists');
//                 Room.findOne({room_id: prizeObj.room_id}, (err,roomData) => {
//                     if(err){
//                         const snackbarObject = {
//                             type: 'dbFailed',
//                             message: err
//                         }
//                         socket.emit('showSnackbar', snackbarObject);
//                         console.log('Database Error');
//                         console.log('------------- raise prize logs end -------------');
//                         throw err;
//                     }
//                     console.log('Checking for room '+prizeObj.room_id+' existence....');
//                     if(roomData){
//                         console.log('Room existed');
//                         console.log('checking user details...');
//                         let user = roomData.users.find( (userObj) => userObj.token == prizeObj.token);
//                         if(user){
//                             console.log('user existed');
//                             Room.updateOne({ room_id: prizeObj.room_id}, { $set: {
//                                 gameStatus: 'Game Paused, someone('+prizeObj.token+') may won prize: '+prizeObj.prize,
//                                 speechString: 'Game Paused, Someone may won '+prizeObj.prize,
//                             }}, (err, data) => {
//                                 if(err){
//                                     const snackbarObject = {
//                                         type: 'dbFailed',
//                                         message: err
//                                     }
//                                     socket.emit('showSnackbar', snackbarObject);
//                                     console.log('Database Error');
//                                     console.log('------------- raise prize logs end -------------');
//                                     throw err;
//                                 }
//                                 console.log('Updated prizes');
//                             });
//                         } else{
//                             console.log('user deleted in database');
//                             const resObj = {
//                                 type: 'notFound',
//                                 message: 'user deleted from room!!'
//                             };
//                             socket.emit('roomExitSuccess', resObj);
//                             console.log('sent exit room request to UI');
//                             console.log('------------- raise prize logs end -------------');
//                         }
//                     } else{
//                         const resObj = {
//                             type: 'notFound',
//                             message: 'Room was deleted by admin'
//                         };
//                         socket.emit('roomExitSuccess', resObj);
//                         console.log('sent exit room request to UI');
//                         console.log('------------- raise prize logs end -------------');
//                     }
//                 });
//             } else {
//                 const snackbarObject = {
//                     type: 'dbFailed',
//                     message: 'something went wrong, please try again later'
//                 }
//                 socket.emit('showSnackbar', snackbarObject);
//                 console.log('Database connection not exists')
//                 console.log('------------- raise prize logs end -------------');;
//             }
//         }
//     });

//     socket.on('addRoomMessages', (messageObj) => {
//         let activeTokenObj = activeTokens.find((atknObj) => atknObj.token == messageObj.token);
//         if(!activeTokenObj){
//             const snackbarObject = {
//                 type: 'notFound',
//                 message: 'Action can\'t be performed now, Please refresh your browser!!'
//             }
//             socket.emit('showSnackbar', snackbarObject);
//             console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
//         } else{
//             Room.findOneAndUpdate({room_id: messageObj.room_id}, { $set: { roomMessages: messageObj.roomMessages }}, (err, data) => {
//                 if(err){
//                     const snackbarObject = {
//                         type: 'dbFailed',
//                         message: err
//                     }
//                     socket.emit('showSnackbar', snackbarObject);
//                     console.log('Database Error');
//                     throw err;
//                 }
//                 console.log('updated messages');
//             });
//         }
//     });
// });

const port = process.env.PORT || 2698;
server.listen(port, () => {
    console.log(`listening at ${port} port!!!!`);
});
