var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var server = require('http').createServer(app);

var commonRoute = require('./backend/routes/common');
var roomRoute = require('./backend/routes/room');

var db = mongoose.connection;
var dbconnected = false;
//connection to Database using mongoose.connect(url)
var dbConfig = require('./backend/database/mongoConnectURI');
mongoose.connect(dbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });
// local mongodb
//mongoose.connect('mongodb://localhost:27017/housie', { useNewUrlParser: true, useUnifiedTopology: true });

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
//    
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
// });

const port = process.env.PORT || 2698;
server.listen(port, () => {
    console.log(`listening at ${port} port!!!!`);
});
