var express = require('express');
var router = express.Router();
var utils = require('../helpers/utils');
var roomService = require('../services/room.service');

var activeTokens = utils.activeTokens;
var disconnectedTokens = utils.disconnectedTokens;

// POST, check token 
router.post('/checkToken', async (req,res) => {
  let tokenObj = req.body;
  console.log('------------------checkToken logs start------------------');
  console.log('checking token,'+tokenObj.token);
  if(tokenObj.token){
    console.log('token existed, so new token is not created');
    let activeTokenObj = activeTokens.find( (atknObj) => atknObj.token == tokenObj.token);
    // check status and database and push
    if(tokenObj.status == null || tokenObj.status == 'null') {
      if(!activeTokenObj){
        console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
        activeTokens.push(tokenObj);
        console.log(activeTokens, 'activeTokens');
      }
      console.log('------------------checkToken logs ends------------------');
      tokenObj['showSnackbar'] = false;
      res.send(tokenObj);
    } else {
      let roomData = [];
      await roomService.findInDatabase({room_id: tokenObj.status.split(': ')[1]}, res).then((data) => {
        roomData = data;
      });
      if(tokenObj.status.startsWith('Room Created')){
        // check room in database
        console.log('token status is '+tokenObj.status+', checking room availability in database');
        if(roomData){
          // exists
          console.log('room exists in database');
          if(!activeTokenObj){
            console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
            activeTokens.push(tokenObj);
          }
          console.log(activeTokens, 'activeTokens');
          console.log('------------------checkToken logs ends------------------');
          tokenObj['showSnackbar'] = false;
          res.send(tokenObj);
        } else {
          // not exists in database => so remove user status by raising error
          tokenObj.status = null;
          console.log('room not existed in database, so removing user status from "Room Created"');
          if(!activeTokenObj){
            console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
            activeTokens.push(tokenObj);
          } else {
            activeTokenObj.status = null;
          }
          console.log(activeTokens, 'activeTokens');
          // raise error
          const resObj = {
            showSnackbar: true,
            snackbarType: 'notFound',
            snackbarMessage: 'Room was deleted, create again!!'
          };
          console.log('------------------checkToken logs ends------------------');
          res.send(resObj);
        }
      } else if(tokenObj.status.startsWith('Room Joined')){
        // check room and users
        console.log('token status is '+tokenObj.status+', checking room availability in database');
        if(roomData){
          console.log('room exists in database');
          // check for user token
          console.log('checking for user token in room...');
          let user = roomData.users.find((userObj) => userObj.token == tokenObj.token);
          if(user){
            // user exists in room
            console.log('user exists in room');
            if(!activeTokenObj){
              console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
              activeTokens.push(tokenObj);
              console.log(activeTokens, 'activeTokens');
            }
            console.log('------------------checkToken logs ends------------------');
            tokenObj['showSnackbar'] = false;
            res.send(tokenObj);
          } else {
            // user deleted in database
            tokenObj.status = null;
            console.log('user deleted from the room, so removing user status from "Room Joined"');
            if(!activeTokenObj){
              console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
              activeTokens.push(tokenObj);
            } else {
              activeTokenObj.status = null;
            }
            console.log(activeTokens, 'activeTokens');
            // raise error
            const resObj = {
              showSnackbar: true,
              snackbarType: 'notFound',
              snackbarMessage: 'Not Joined in the room properly, Join again!!'
            };
            console.log('------------------checkToken logs ends------------------');
            res.send(resObj);
          }
        } else {
          // room not exists in database => so remove user status by raising error
          tokenObj.status = null;
          console.log('Room not exists in database, so removing user status from "Room Joined"');
          if(!activeTokenObj){
            console.log('not in active tokens, so '+tokenObj.token+' pushed to active tokens');
            activeTokens.push(tokenObj);
          } else {
            activeTokenObj.status = null;
          }
          console.log(activeTokens, 'activeTokens');
          // raise error
          const resObj = {
            showSnackbar: true,
            snackbarType: 'notFound',
            snackbarMessage: 'Room was deleted by admin'
          };
          console.log('------------------checkToken logs ends------------------');
          res.send(resObj);
        }
      }
    } 
  } else {
    console.log('token not existed, so new token is created');
    let token = utils.createRandomToken(activeTokens);
    const tokenObj = {
        token: token,
        status: null,
        showSnackbar: false,
    }
    activeTokens.push(tokenObj);
    console.log(activeTokens, 'activeTokens');
    console.log('------------------checkToken logs ends------------------');
    res.send(tokenObj);
  }
}, (error) => {
  const resObj = {
    showSnackbar: true,
    snackbarType: 'notFound',
    snackbarMessage: error
  };
  console.log(error, 'erroooooooooooooooor');
  console.log('------------------checkToken logs ends------------------');
  res.send(resObj);
});

router.post('/clientDisconnected', async (req, res) => {
  let tokenObj = req.body;
  console.log('token disconnected/reloaded: '+tokenObj.token);
  let token = tokenObj.token;
  let room_id = null;
  if(tokenObj.status != null && (tokenObj.status.startsWith('Room Created') || tokenObj.status.startsWith('Room Joined'))){
    room_id = tokenObj.status.split(': ')[1];
  }
  disconnectedTokens.push(token);
  setTimeout(async () => {
    if(disconnectedTokens.indexOf(token) > -1){
      // remove from active tokens
      let activeTokenObjIndex = activeTokens.findIndex((tokenObj) => tokenObj.token == token);
      let activeTokenObj = activeTokens[activeTokenObjIndex];
      if(activeTokenObjIndex > -1){
        if(activeTokenObj.status != null && activeTokenObj.status.startsWith('Room Created')){
          // delete room from database
          await roomService.deleteFromDatabase({ token: token }, res).then((data) => {
            console.log(data, 'deleted room');
          });
          activeTokenObj.status = null;
        } else if(activeTokenObj.status != null && activeTokenObj.status.startsWith('Room Joined')){
          // delete user from room in database
          let roomData = [];
          await roomService.findInDatabase({room_id: room_id}, res).then((data) => {
            roomData = data;
          });
          console.log('Checking for room existence in database');
          if(roomData){
            console.log('Room available, Deleting user data');
            let users = roomData.users;
            let userIndex = users.findIndex((user) => user.token == token);
            users.splice(userIndex, 1);
            let usedTickets = roomData.usedTickets;
            let usedTicketIndex = usedTickets.findIndex((usedTicketsObj) => usedTicketsObj.token === token);
            usedTickets.splice(usedTicketIndex, 1);
            await roomService.updateInDatabase({ room_id:room_id}, {
              $set: {
                  users: users,
                  usedTickets: usedTickets
              }
            }, res).then((data) => {
              console.log(data, 'user deleted in databse');
            });
            activeTokenObj.status = null;
          } else {
            activeTokenObj.status = null;
          }
        }
        activeTokens.splice(activeTokenObjIndex, 1);
      }
      console.log(activeTokens, 'activeTokens');
    }
  }, 12000);
  res.send({message: 'will check and delete room data from database'});
}, (error) => {
  const resObj = {
    showSnackbar: true,
    snackbarType: 'notFound',
    snackbarMessage: error
  };
  console.log(error, 'erroooooooooooooooor');
  res.send(resObj);
});

router.post('/clientReloaded', async (req, res) => {
  let token = req.body.token;
  console.log('client reloaded: '+token);
  let disconnectedTokenIndex = disconnectedTokens.indexOf(token);
  if(disconnectedTokenIndex > -1){
    disconnectedTokens.splice(disconnectedTokenIndex, 1);
  }
  res.send({message: 'client reloaded'});
}, (error) => {
  const resObj = {
    showSnackbar: true,
    snackbarType: 'notFound',
    snackbarMessage: error
  };
  console.log(error, 'erroooooooooooooooor');
  res.send(resObj);
});

module.exports = router;

