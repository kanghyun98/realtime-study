const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
  console.log('connected to the server ✅');
});

socket.addEventListener('close', () => {
  console.log('disconnected from the server ❌');
});

socket.addEventListener('message', (message) => {
  console.log('server message: ', message.data);
});

setTimeout(() => {
  socket.send('nice to meet you, server!');
}, 10000);
