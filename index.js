var app = require('express')();
var http = require ('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var moment = require('moment');

mongoose.connect('mongodb://localhost:27017/chat', function (err){
  if (err)
    throw err;
  else
    console.log('connected to localhost:27017/chat');
});

var msgSchema = mongoose.Schema({
  msg: String,
  sent: { type: Date, default: Date.now, index: true}
  }, { autoIndex: false, versionKey: false });

var Msg = mongoose.model('Message', msgSchema);

app.get('/', function (req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/messages', function (req, res) {
  console.log('got a request');
  var twoMinutesAgo = moment().subtract(2, 'minutes');
  Msg.find({ sent: { $gte: twoMinutesAgo } }, function (err, data) {
    if (err)
      throw err;
    else {
      return res.status(200).json(data);
    }
  });
});
var connectedUsers = {};

io.on('connection', function (socket){
  socket.broadcast.emit('new user', { msg: 'a new user joined' });
  socket.on('chat message', function (data){
    var newMsg = new Msg({ msg : data });
    newMsg.save(function (err) {
      if (err)
        throw err;
      else
        socket.broadcast.emit('chat message', newMsg);
    });
  });
  socket.on('disconnect', function (){
    socket.broadcast.emit('user disconnect', { msg: 'a user disconnected' });
  });
});

http.listen(3000, function (){
  console.log('listening on *:3000');
});
