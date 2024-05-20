const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const open = require('open'); // Add this line
const usernames = [];

server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port 3000');
  open('http://localhost:3000'); // Add this line to open the browser automatically
});

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){ // Update this line
  socket.on('new user', function(data, callback){
    if(usernames.indexOf(data) !== -1){
      callback(false);
    }
    else{
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  function updateUsernames(){
    io.emit('usernames', usernames); // Update this line
  }

  socket.on('send message', function(data){
    io.emit('new message', {msg: data, user: socket.username}); // Update this line
  });

  socket.on('disconnect', function(data){
    if(!socket.username) return;
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
