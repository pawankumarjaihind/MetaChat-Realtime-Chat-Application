const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('../utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('../utils/users');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const db = require('../config/mongoose');
const Msg = require('../models/messages');


const publicStaticDirPath = path.join(__dirname,'../public');

// set static folder 
app.use(express.static(publicStaticDirPath));

const botName = 'MetaChat Bot';

// Run when client connects
io.on("connection", (socket)=>{
    socket.on('joinRoom', ({username,room})=>{

        const user = userJoin(socket.id,username,room);

        socket.join(user.room);

        Msg.find({room : user.room}).then(result => {

            socket.emit('output-messages',result);
        });

        // Welcome current user
        const messages = new Msg({name:botName, room : user.room , message : 'Welcome to MetaChat!'});
        messages.save().then(()=>{
            socket.emit('message',formatMessage(botName, 'Welcome to MetaChat!'));
        });

        // Broadcast when a user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room :user.room,
            user :user.username,
            users : getRoomUsers(user.room,user.username)
        });
    });

    // Listen for sendmessage
     socket.on('sendmessage',message =>{
        const user = getCurrentUser(socket.id);
        const messages = new Msg({name:user.username, room : user.room , message});

        messages.save().then(()=>{
            io.to(user.room).emit('message',formatMessage(user.username, message));
        });
    });

    // Runs when client disconnects 
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
            const messages = new Msg({name:botName, room : user.room , message : `${user.username} has left the chat`});
            messages.save().then(()=>{
                io.to(user.room).emit('message',formatMessage(user.username, `${user.username} has left the chat`));
            });

            // Send users and room info
            io.to(user.room).emit('roomUsers',{
                room :user.room,
                users : getRoomUsers(user.room)
            });
        }
    });

    socket.on('sendLocation',coords =>{
        const user = getCurrentUser(socket.id);
        if(coords=="Geolocation is not supported by this browser"){
            io.to(user.room).emit('locationMessage',formatMessage(user.username, coords));

        }
        else{
            const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
            const messages = new Msg({name:user.username, room : user.room , message : `<a href="${url}" target="_blank"> My current location </a>`});
            messages.save().then(()=>{
                io.to(user.room).emit('locationMessage',formatMessage(user.username, url));
            });

        }
    });
});

server.listen(port, () => {
    console.log("Server is up and running on port", port);
});
