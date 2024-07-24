import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/client', express.static(__dirname + '/client'));

app.get('/', (req, res) => res.render('home'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// 같은 서버에 http, webSocket 둘 다 작동시키는 방법
const server = http.createServer(app); // http server
const wss = new WebSocket.Server({ server }); // webSocket server

const sockets = [];

wss.on('connection', (socket) => {
  console.log('connected to the client ✅');

  sockets.push(socket);

  socket.on('close', () => console.log('disconnected from the client ❌'));

  socket.on('message', (msg) => {
    const message = JSON.parse(msg);
    console.log(message);

    switch (message.type) {
      case 'newMessage':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case 'nickname':
        socket['nickname'] = message.payload;
    }
  });
});

server.listen(3000, handleListen);
