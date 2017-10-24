const mongo = require('mongodb');

// RUN SOCKET IO ON THIS PORT
const client = require('socket.io').listen(4000).sockets;

// CONNECT TO MONGO
mongo.connect('mongodb://localhost:27017/mongochat', function(err, db) {
  if (err) {
    throw err;
  }

  console.log('Connected to MongoDB');

  // CONNECT TO SOCKET.IO
  client.on('connection', function(socket) {
    // CREATE MONGO COLLECTION
    let chat = db.collection('chats');

    // CREATE A FUNCTION TO SEND STATUS FROM CLIENT TO SERVER
    sendStatus = function(status) {
      socket.emit('status', status);
    };

    // GET CHATS FROM MONGO COLLECTION
    chat
      .find()
      .limit(100)
      .sort({ _id: 1 })
      .toArray(function(err, result) {
        if (err) {
          throw err;
        }

        // EMIT THE MESSAGES
        socket.emit('output', result);

        // HANDLE INPUT EVENTS
        // DATA HOLDS THE INFORMATION SENT FROM THE CLIENT
        socket.on('input', function(data) {
          const { name, message } = data;

          // CHECK FOR NAME AND MESSAGE
          if (name === '' || message === '') {
            // SEND ERROR STATUS
            sendStatus('Please enter a name and message');
          } else {
            // INSERT INTO DATABASE
            chat.insert(
              {
                name,
                message
              },
              function() {
                client.emit('output', [data]);

                // SEND STATUS OBJECT
                sendStatus({
                  message: 'Message sent',
                  clear: true
                });
              }
            );
          }
        });
      });

    // HANDLE CLEAR
    // DATA FROM CLIENT
    socket.on('clear', function(data) {
      // REMOVE ALL CHATS FROM COLLECTION
      // BLANK OBJECT WILL CLEAR EVERYTHING
      chat.remove({}, function() {
        // EMIT CLEARED MESSAGE
        socket.emit('cleared');
      });
    });
  });
});
