import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/client', express.static(__dirname + '/client'));

app.get('/', (req, res) => res.render('home'));

// 같은 서버에 http, webSocket 둘 다 작동시키는 방법
const httpServer = http.createServer(app); // http server
const wsServer = SocketIO(httpServer);

wsServer.on('connection', (socket) => {
  socket.nickname = 'user';

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on('enterRoom', (roomName, done) => {
    socket.join(roomName);
    done();

    socket
      .to(roomName)
      .emit('welcome', socket.nickname, getRoomCount(roomName));
    wsServer.sockets.emit('roomChange', getPublicRooms());
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, getRoomCount(room) - 1)
    );
  });

  socket.on('disconnect', () => {
    wsServer.sockets.emit('roomChange', getPublicRooms());
  });

  socket.on('newMessage', (msg, room, done) => {
    socket.to(room).emit('newMessage', `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on('nickname', (nickname) => (socket.nickname = nickname));
});

function getPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

function getRoomCount(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
