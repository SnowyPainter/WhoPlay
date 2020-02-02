var socket = io('/');

window.onload = window.onload.extend(() => {
    socket.on('connect', () => {
        let greetingBox = document.getElementById("greeting");
        greetingBox.style.display = "Block";
        greetingBox.style.opacity = "1";

        socket.on('active-count', (active) => document.getElementById("activePlayers").innerText = active-1)
    });
})