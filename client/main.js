// IFFE
(function() {
  let element = function(id) {
    return document.getElementById(id);
  };

  // GET ELEMENTS BY ID
  let status = element('status');
  let messages = element('messages');
  let textarea = element('textarea');
  let username = element('username');
  let clear = element('clear');

  // SET DEFAULT STATUS
  // WANT TO BE ABLE TO GET STATUS'S FROM SERVER
  let statusDefault = status.textContent;

  let setStatus = function(s) {
    // SET STATUS
    status.textContent = s;

    // IF STATUS DOESNT MATCH THE DEFAULT CLEAR IT 4 SECONDS AFTER
    if (s !== statusDefault) {
      // CLEAR STATUS 4 SECONDS LATER
      let delay = setTimeout(function() {
        setStatus(statusDefault);
      }, 4000);
    }
  };

  // CONNECT TO SOCKET.IO
  let socket = io.connect('http://localhost:4000');

  // CHECK FOR CONNECTION
  if (socket !== undefined) {
    console.log('Connected to socket...');

    // HOOKS TO THE EMIT FROM THE SERVER THATS CALLED OUTPUT
    // DATA CONTAINS THE INFORMATION FROM THE SERVER

    // HANDLE OUTPUT
    socket.on('output', function(data) {
      // console.log(data);
      // TAKE RESPONSE FROM SERVER AND PUT IT INTO DOM
      if (data.length) {
        // BUILD OUT MESSAGE DIV
        data.forEach(element => {
          let message = document.createElement('div');
          message.setAttribute('class', 'chat-message');
          message.textContent = `${element.name}: ${element.message}`;
          messages.appendChild(message);
          messages.insertBefore(message, messages.firstChild);
        });
      }
    });

    // GET STATUS FROM SERVER
    socket.on('status', function(data) {
      // GET MESSAGE STATUS
      setStatus(typeof data === 'object' ? data.message : data);

      // IF STATUS IS CLEAR
      if (data.clear) {
        textarea.value = '';
      }
    });

    // HANDLE INPUT
    textarea.addEventListener('keydown', function(event) {
      // KEYCODE 13 IS THE ENTER KEY
      // IF THEY HIT ENTER AND NOT HOLDING SHIFT
      if (event.which === 13 && event.shiftKey === false) {
        if (textarea.value == 'Please Enter a Message') {
          textarea.value = 'Please Enter a Message';
        } else {
          // EMIT TO SERVER
          socket.emit('input', { name: username.value, message: textarea.value });

          // CLEAR TEXTAREA WHEN SUBMITTED
          textarea.value = '';
        }

        event.preventDefault();
      }
    });

    // HANDLE CLEARING CHAT
    clear.addEventListener('click', function() {
      // EMIT TO CLEAR EVENT ON SERVER
      socket.emit('clear');
    });

    // CLEAR MESSAGE
    socket.on('cleared', function() {
      messages.textContent = '';
    });
  }
})();
