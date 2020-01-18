var admin = require('firebase-admin');

module.exports = function (io) {

    let activePlayers = 0;
    io.sockets.on('connection', (socket) => {
        let currentRoom;
        activePlayers++;
        
        socket.on('create-room', (key) => {
            socket.join(key);
            currentRoom = key;
            admin.database().ref("roomsList").child(key).transaction((actives) => {
                if (actives) {
                    actives.actives = actives.actives + 1;
                }
                return actives;
            });
        });
        socket.on('chat', (data) => {
            io.sockets.in(data.roomId).emit('receive-msg', {
                text: data.text,
                time: data.time,
                userId: data.userId
            })
        });
        socket.on('disconnect', () => {
            if (currentRoom) {
                admin.database().ref("roomsList").child(currentRoom).transaction((actives) => {
                    if (actives) {
                        actives.actives = actives.actives - 1;
                    }
                    return actives;
                });
            }

            activePlayers--;
        });
    });

    setInterval(() => {
        io.sockets.emit('active-count', activePlayers);
    }, 10000);
}