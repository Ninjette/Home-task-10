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

app.use(express.static(__dirname + '/public'));



var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  socket.on('new message', function (data) {
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

  socket.on('add user', function (username) {
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
