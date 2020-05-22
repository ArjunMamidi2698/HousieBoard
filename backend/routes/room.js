var express = require('express');
var router = express.Router();
var utils = require('../helpers/utils');
var roomService = require('../services/room.service');

var Room = require('../models/room.model').Room; 

var activeTokens = utils.activeTokens;


// POST, create Room 
router.post('/createRoom', async (req,res) => {
  let roomObj = req.body;
  console.log('------------------create room logs start -----------------------');
  console.log('Create Room Requested by'+roomObj.token);
  let activeTokenObj = activeTokens.find((tokenObj) => tokenObj.token == roomObj.token);
  if(!activeTokenObj){
    const resObj = {
      showSnackbar: true,
      snackbarType: 'notFound',
      snackbarMessage: 'Action can\'t be performed now, Please refresh your browser!!'
    };
    console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
    console.log('------------- create room logs end ----------------------');
    res.send(resObj);
  } else {
    // add into database
    let roomData = [];
    await roomService.findInDatabase({ $or:[ {room_id: roomObj.room_id}, {admin: roomObj.admin} ] }, res).then((data) => {
      roomData = data;
    });
    console.log('Checking with Room Availability: '+roomObj.room_id);
    if(roomData){
      const resObj = {
        showSnackbar: true,
        snackbarType: 'error',
        snackbarMessage: 'Roomid or Username used already existed'
      };
      console.log('------------- create room logs end ----------------------');
      res.send(resObj);
    } else {
      var room = new Room();
      room.room_id = roomObj.room_id;
      room.admin = roomObj.admin;
      room.token = roomObj.token;
      const selectedPrizesObjects = [];
      roomObj.selectedPrizes.forEach((prize) => {
        const prizeObj = {
          prize: prize,
          winners: []
        }
        selectedPrizesObjects.push(prizeObj);
      });
      room.selectedPrizes = selectedPrizesObjects;
      room.roomMessages = [];
      room.gameStatus = 'Game Not Yet Started';
      const ticketObj = {
        ticket: roomObj.ticket,
        name: roomObj.admin,
        token: roomObj.token
      }
      room.usedTickets.push(ticketObj);
      // Insert the Data 
      console.log('Adding roomid: '+roomObj.room_id+' into database');
      await roomService.addToDatabase(room, res).then((data) => {
        console.log(data, 'saved room data successfully');
      });
      activeTokenObj.status = 'Room Created: '+roomObj.room_id;
      console.log('Successfully saved, updating active token status to "Room Created"');
      console.log(activeTokens, 'activeTokens');
      const resObj = {
        selectedPrizes: selectedPrizesObjects,
        showSnackbar: true,
        snackbarType: 'success',
        snackbarMessage: 'Room created successfully, ask your friends to join with this id: '+roomObj.room_id
      };
      console.log('------------- create room logs end ----------------------');
      res.send(resObj);
    }
  }
}, (error) => { 
  const resObj = {
    showSnackbar: true,
    snackbarType: 'notFound',
    snackbarMessage: error
  };
  console.log(error, 'erroooooooooooooooor');
  console.log('------------------Create Room logs ends------------------');
  res.send(resObj);
});

// join room
router.post('/joinRoom', async (req,res) => {
  let roomObj = req.body;
  console.log('------------- join room logs start ----------------------');
  console.log('Join Room Requested by'+roomObj.token);
  let activeTokenObj = activeTokens.find((atknObj) => atknObj.token == roomObj.token);
  if(!activeTokenObj){
    const resObj = {
      showSnackbar: true,
      snackbarType: 'notFound',
      snackbarMessage: 'Action can\'t be performed now, Please refresh your browser!!'
    };
    console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
    console.log('------------- join room logs ends ----------------------');
    res.send(resObj);
  } else {
    console.log('Joining into Room...');
    let roomData = [];
    await roomService.findInDatabase({room_id:roomObj.room_id}, res).then((data) => {
      roomData = data;
    });
    console.log('checking for room existence: '+roomObj.room_id);
    if(roomData){
      console.log('Room exists');
      if(roomData.gameStatus == 'Game Running'){
        let resMessage = null;
        if(roomData.prevNumbers.length > 12){
            resMessage = 'Can\'t join, Game already started'
        } else{
            resMessage = 'Can\'t join, Game already started, please ask your admin to pause!'
        }
        const resObj = {
          showSnackbar: true,
          snackbarType: 'error',
          snackbarMessage: resMessage
        }
        console.log('Room join error requested to UI -> game already started in the room');
        console.log('------------- join room logs ends ----------------------');
        res.send(resObj);
      } else {
        console.log('checking for username availability: '+roomObj.player);
        let user = roomData.users.find((userObj) => userObj.user == roomObj.player);
        if(roomData.admin == roomObj.player || user){
          // username used
          const resObj = {
            showSnackbar: true,
            snackbarType: 'error',
            snackbarMessage: 'Username already taken'
          }
          console.log('Room join error requested to UI -> username already taken');
          console.log('------------- join room logs ends ----------------------');
          res.send(resObj);
        } else {
          console.log('Adding user details to room');
          const userObj = {
              user: roomObj.player,
              token: roomObj.token,
              ticket: roomObj.ticket
          }
          const ticketObj = {
              ticket: roomObj.ticket,
              name: roomObj.player,
              token: roomObj.token
          }
          roomData.users.push(userObj);
          roomData.usedTickets.push(ticketObj);
          await roomService.updateInDatabase({ room_id:roomObj.room_id},{
            $set: {
                users: roomData.users,
                usedTickets: roomData.usedTickets,
            }
          }, res).then( (data) => {
            console.log(data, 'Updated User data Successfully');
          });
          activeTokenObj.status = 'Room Joined';
          console.log('Successfully joined, updating active token status to "Room Joined"');
          console.log(activeTokens, 'activeTokens');
          const resObj = {
            showSnackbar: true,
            snackbarType: 'success',
            snackbarMessage: 'Joined Room Successfully',
            selectedPrizes: roomData.selectedPrizes,
            roomMessages: roomData.roomMessages
          }
          console.log('Room Join Success requested to UI');
          console.log('------------- join room logs ends ----------------------');
          res.send(resObj);
        } 
      }
    } else {
      const resObj = {
        showSnackbar: true,
        snackbarType: 'error',
        snackbarMessage: 'Can\'t find room with Room ID:'+roomObj.room_id
      }
      console.log('Room Join error requested to UI -> can\'t find room');
      console.log('------------- join room logs ends ----------------------');
      res.send(resObj);
    }
  }
}, (error) => {
  const resObj = {
    showSnackbar: true,
    snackbarType: 'notFound',
    snackbarMessage: error
  };
  console.log(error, 'erroooooooooooooooor');
  console.log('------------------Join Room logs ends------------------');
  res.send(resObj);
});


// exit room
router.post('/exitRoom', async (req,res) => {
  let roomObj = req.body;
  console.log('------------- exit room logs start ----------------------');
  console.log('Exit Room requested by '+roomObj.token);
  // if status is room Created -> delete room document
  // if status is room Joined -> remove userToken from room document
  let activeTokenObj = activeTokens.find((atknObj) => atknObj.token == roomObj.token);
  if(!activeTokenObj){
    const resObj = {
      showSnackbar: true,
      snackbarType: 'notFound',
      snackbarMessage: 'Action can\'t be performed now, Please refresh your browser!!'
    };
    console.log(roomObj.token+' not in active tokens, so requested UI to refresh');
    console.log('------------- exit room logs ends ----------------------');
    res.send(resObj);
  } else{
    console.log('checking for user status either room created or room joined');
    if(activeTokenObj.status != null && (activeTokenObj.status).startsWith('Room Created')){
      console.log('User Status is Room Created');
      console.log('Deleting Room from Database');
      await roomService.deleteFromDatabase({ token: roomObj.token }, res).then((data) => {
        console.log(data, 'Deleted Room Successfully');
      });
      activeTokenObj.status = null;
      console.log('Successfully deleted, removing active token status from "Room Created"');
      console.log(activeTokens, 'activeTokens');
      const resObj = {
        showSnackbar: true,
        snackbarType: 'success',
        snackbarMessage: 'Room deleted Successfully'
      }
      console.log('Room exit success requested to UI');
      console.log('------------- exit room logs ends ----------------------');
      res.send(resObj);
    } else if(activeTokenObj.status != null && activeTokenObj.status.startsWith('Room Joined')){
      console.log('User Status is Room Joined');
      console.log('Deleting User from Room');
      let roomData = [];
      await roomService.findInDatabase({room_id:roomObj.room_id}, res).then((data) => {
        roomData = data;
      });
      console.log('Checking for room existence in database');
      if(roomData){
        console.log('Room available, Deleting user data');
        let users = roomData.users;
        let userIndex = users.findIndex((user) => user.token == roomObj.token);
        users.splice(userIndex, 1);
        let usedTickets = roomData.usedTickets;
        let usedTicketIndex = usedTickets.findIndex((usedTicketsObj) => usedTicketsObj.token === roomObj.token);
        usedTickets.splice(usedTicketIndex, 1);
        await roomService.updateInDatabase({ room_id:roomObj.room_id}, {
          $set: {
              users: users,
              usedTickets: usedTickets
          }
        }, res).then((data) => {
          console.log(data, 'Successfully updated databse');
        })
        activeTokenObj.status = null;
        console.log('Successfully deleted, removing active token status from "Room Joined"');
        console.log(activeTokens, 'activeTokens');
        const resObj = {
          showSnackbar: true,
          snackbarType: 'success',
          snackbarMessage: 'Exited Room Successfully'
        }
        console.log('Room Exit Success requested to UI');
        console.log('------------- exit room logs ends ----------------------');
        res.send(resObj);
      } else {
        activeTokenObj.status = null;
        const resObj = {
          showSnackbar: true,
          snackbarType: 'success',
          snackbarMessage: 'Exited Room Successfully'
        }
        console.log('Room exit success requested to UI -> Room deleted from Database');
        console.log('------------- exit room logs ends ----------------------');
        res.send(resObj);
      }
    }
  }
}, (error) => {
  const resObj = {
    showSnackbar: true,
    snackbarType: 'notFound',
    snackbarMessage: error
  };
  console.log(error, 'erroooooooooooooooor');
  console.log('------------------Exit Room logs ends------------------');
  res.send(resObj);
});


// polling for admin
// polling for user

module.exports = router;