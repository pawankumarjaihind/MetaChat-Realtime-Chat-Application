const messageForm = document.querySelector("#SendMessage");
const chatMessages = document.querySelector('.chat__messages');
const roomName = document.querySelector('#room-name');
const userName = document.querySelector('#user-name');
const userList = document.querySelector('#users');
const sendLocationButton = document.querySelector('#sendLoc');

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
  // console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Location from server
socket.on('locationMessage',data=>{
  // console.log(data);
  outputMessage3(data);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// fetch messages from MongoDB:
socket.on('output-messages', data =>{
  // console.log(data);
  if(data.length){
    data.forEach(message => {
      outputMessage2(message);
    });
     
  }

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

// send location by browser
sendLocationButton.addEventListener('click',()=>{
  if (!navigator.geolocation){
      socket.emit("sendLocation","Geolocation is not supported by this browser");
  }
  else{

    navigator.geolocation.getCurrentPosition((position)=>{
      socket.emit("sendLocation", {
        latitude : position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("location shared");
      }
      );
    });
  }
  
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

// Output MOngoDB's messages to DOM  
function outputMessage2(message){
  const div = document.createElement('div');
  div.classList.add('messages');
  console.log(message);

  let full = String(message.createdAt);
  let date = full.slice(0,10);
  let time = full.slice(11,16);
  let hr = parseInt(time.slice(0,2))+5;
  let min = parseInt(time.slice(3,5))+30;
  if(min>=60){
    min = min-60;
    hr = hr+1;
  }
  let zero="";
  if(min<10){
    zero="0";
  }
  else{
    zero="";
  }
  if(hr>=24){
    hr=hr-24;
  }

  div.innerHTML = `<p class='message__name'> ${message.name} <span class="message__meta"> ${date} ${hr}:${zero}${min}  </span></p> 
  <p class="text">
    ${message.message}
  </p> `;
  document.querySelector('.chat__messages').appendChild(div);
}


// Output Location message to DOM  
function outputMessage3(message){
  // console.log(message)
  const div = document.createElement('div');
  div.classList.add('messages');
  div.innerHTML = `<p class='message__name'> ${message.username} <span class="message__meta"> ${message.time} </span></p> 
  <p class="text">
  <a href=${message.text} target="_blank">
    My Current Location
  </a>
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
}