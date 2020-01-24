var admin = require('firebase-admin');

module.exports = function (io) {

    let activePlayers = 0;
    io.sockets.on('connection', (socket) => {
        let currentRoom;
        let userId;
        activePlayers++;
        
        socket.on('create-room', (inform) => {
            socket.join(inform.key);
            currentRoom = inform.key;
            userId = inform.id;
            admin.database().ref("roomsList").child(inform.key).transaction((actives) => {
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
        //when user click own location, send latlng and broadcast the room
        socket.on('update-location', (data) => {
            const loc = data.location;
            const user = data.id;

            io.sockets.in(data.room).emit('other-location-update', {location: loc, user: user});
        });

        socket.on('disconnect', () => {
            if (currentRoom) {
                io.sockets.in(currentRoom).emit('other-location-update', {location: null, user: userId});
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