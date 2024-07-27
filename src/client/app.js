const socket = io();

const $welcome = document.getElementById('welcome');
const $form = $welcome.querySelector('form');
const $room = document.getElementById('room');

$room.hidden = true;

let roomName;

// 방 입장
function handleRoomSubmit(e) {
  e.preventDefault();

  const $input = $form.querySelector('input');

  socket.emit('enterRoom', $input.value, showRoom);

  roomName = $input.value;

  $input.value = '';
}

// 방 노출
function showRoom() {
  $welcome.hidden = true;
  $room.hidden = false;

  const $h3 = $room.querySelector('h3');
  $h3.innerText = `Room ${roomName}`;

  const $msgForm = $room.querySelector('#msg');
  $msgForm.addEventListener('submit', handleMessageSubmit);

  const $nicknameForm = $room.querySelector('#nickname');
  $nicknameForm.addEventListener('submit', handleNicknameSubmit);
}

// 메세지 노출
function addMessage(message) {
  const $ul = $room.querySelector('ul');
  const $li = document.createElement('li');
  $li.innerText = message;
  $ul.appendChild($li);
}

// 메세지 submit
function handleMessageSubmit(e) {
  e.preventDefault();

  const $input = $room.querySelector('#msg input');
  const value = $input.value;

  socket.emit('newMessage', $input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });

  $input.value = '';
}

// 닉네임 submit
function handleNicknameSubmit(e) {
  e.preventDefault();

  const $input = $room.querySelector('#nickname input');
  const value = $input.value;

  socket.emit('nickname', $input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });

  $input.value = '';
}

$form.addEventListener('submit', handleRoomSubmit);

// 방 개수 노출
function showRoomCount(rooms) {
  const $roomList = $welcome.querySelector('#room_list ul');

  $roomList.innerHTML = '';

  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const $li = document.createElement('li');
    $li.innerText = room;
    $roomList.append($li);
  });
}

// 방 입장
socket.on('welcome', (user, roomCount) => {
  const $h3 = $room.querySelector('h3');
  $h3.innerText = `Room ${roomName} (${roomCount})`;

  addMessage(`${user} entered!`);
});

// 방 이탈
socket.on('bye', (user, roomCount) => {
  const $h3 = $room.querySelector('h3');
  $h3.innerText = `Room ${roomName} (${roomCount})`;

  addMessage(`${user} left!`);
});

// 방 개수
socket.on('roomChange', showRoomCount);

// 메세지
socket.on('newMessage', addMessage);
