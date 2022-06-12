const messageForm = document.querySelector("#SendMessage");
const chatMessages = document.querySelector('.chat__messages');
const roomName = document.querySelector('#room-name');
const userList = document.querySelector('#users');

// Get username and room from URL 
const { username , room } = Qs.parse(location.search, {
  ignoreQueryPrefix : true
});

const socket = io();


// join Chatroom 
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message =>{
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
messageForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  // Get message text 
  const message = e.target.elements.message.value;

  // Emit message to server
  socket.emit('sendmessage',message);

  // Clear input
  e.target.elements.message.value ="";
  e.target.elements.message.focus();
});

// Output message to DOM 
function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('messages');
  div.innerHTML = `<p class='message__name'> ${message.username} <span class="message__meta"> ${message.time} </span></p> 
  <p class="text">
    ${message.text}
  </p> `;
  document.querySelector('.chat__messages').appendChild(div);

}

// Add room name to DOM 
function outputRoomName(room){
  roomName.innerText = "Room Name : " + room;
}

// Add users to DOM 
function outputUsers(users){
  userList.innerHTML = `
  ${users.map(user=>`<li class="list-title">${user.username}</li>`).join('')}
  `;
  // users.scrollTop = users.scrollHeight;
}