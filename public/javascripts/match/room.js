var socket = io('http://localhost:80');
var database = firebase.database();

const key = new URLSearchParams(window.location.search).get("key");
const myId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

database.ref('roomsList').child(key).once('value').then(
    (snapshot) => {
        const snapshotVals = snapshot.val();
        if (snapshotVals.actives >= snapshotVals.maxParticipants) {
            alert("유저들로 꽉 찬 방임으로 접속하실수 없습니다.");
            location.href = "/player/match";
        } else {
            socket.emit('create-room', key);
        }
    }
);

socket.on('receive-msg', (data) => {
    const isMe = data.userId == myId;
    var msgBox = document.createElement('div');
    msgBox.className = 'chat-message' + (isMe ? ' ichat' : '');
    msgBox.innerHTML = `
        <img src="/images/chat/`+ (isMe ? 'i-' : '') + `user-icon.png" alt="Avatar">
        <p>`+ data.text + `</p>
        <span class="time-left">`+ data.time + `</span>
    `;

    document.getElementById("chat-container").appendChild(msgBox);
});

window.onload = window.onload.extend(() => {
    document.getElementById("send-msg").addEventListener('keyup', (event) => {
        if (event.keyCode != 13)
            return;
        let msg = document.getElementById("send-msg");
        sendMessage(msg.value);
        msg.value = '';
    });
    document.getElementById("send-btn").addEventListener("click", () => {
        let msg = document.getElementById("send-msg");
        sendMessage(msg.value)
        msg.value = '';
    });

    function sendMessage(text) {
        if(!text || text.trim() == '')
            return;

        socket.emit('chat', {
            roomId: key,
            text: text,
            time: new Date().toLocaleTimeString(),
            userId: myId
        });

        updateChatScroll();
    }

    function updateChatScroll(){
        var element = document.getElementById("chat-container");
        element.scrollTop = element.scrollHeight;
    }
})