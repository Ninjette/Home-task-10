// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var fs = require('fs');
var path = require('path');
var async = require('async');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chat

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });

    const filepath = path.join(__dirname, '/public/logger.json');
    async.waterfall([
    	(callback) => {
		    fs.stat(filepath, (err, stat) => {
		    	callback(null, stat);
		    });
    	},
    	(stat, callback) => {
    		if (!stat) {
    			var startContent = {messages: []};
    			return callback(null, JSON.stringify(startContent));
    		}
    		fs.readFile(filepath, 'utf8', callback);
    	}
    ], (err, fileContent) => {
    	if (err) return console.log('error: ', err);

    	var newContent = JSON.parse(fileContent);
    	newContent.messages.push({
    		name: socket.username,
    		text: data
    	});
    	newContent = JSON.stringify(newContent);
	    fs.writeFile(filepath, newContent, function(err) {
		    if (err) return console.log('error: ', err);
		    console.log("The file was saved!");
		}); 
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
