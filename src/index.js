const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('../utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('../utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicStaticDirPath = path.join(__dirname,'../public');

// set static folder 
app.use(express.static(publicStaticDirPath));

const botName = 'MetaChat Bot';

// Run when client connects
io.on("connection", (socket)=>{
    socket.on('joinRoom', ({username,room})=>{

        const user = userJoin(socket.id,username,room);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName,'Welcome to MetaChat!'));

        // Broadcast when a user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room :user.room,
            users : getRoomUsers(user.room)
        });
    });

    // Listen for sendmessage
     socket.on('sendmessage',message =>{
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username, message));
    });

    // Runs when client disconnects 
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit('roomUsers',{
                room :user.room,
                users : getRoomUsers(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log("Server is up and running on port", port);
});

