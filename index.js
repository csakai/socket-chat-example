var app = require('express')();
var http = require ('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chat', function (err){
  if (err)
    throw err;
  else
    console.log('connected to localhost:27017/chat');
});

var msgSchema = mongoose.Schema({
  msg: String,
  sent: { type: Date, default: Date.now }
});

var Msg = mongoose.model('Message', msgSchema);

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
});
var connectedUsers = {};

io.on('connection', function (socket){
  socket.broadcast.emit('new user', 'a new user joined');
  socket.on('chat message', function (msg){
    var newMsg = new Msg({ msg : msg });
    newMsg.save(function (err) {
      if (err)
        throw err;
      else
        io.emit('chat message', newMsg);
    });
  });
  socket.on('disconnect', function (){
    socket.broadcast.emit('user disconnect', 'a user disconnected');
  });
});

http.listen(3000, function (){
  console.log('listening on *:3000');
});
