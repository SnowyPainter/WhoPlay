var socket = io('http://localhost:80');
var database = firebase.database();
var kakaoMap;
const key = new URLSearchParams(window.location.search).get("key");
const myId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

let roomLocation;

const specialSrc = '/images/chat/s-user-marker.png',
    centerSrc = '/images/chat/center-map-marker.png';
const imageSrc = '/images/chat/user-marker.png',
    imageSize = new kakao.maps.Size(50, 50),
    imageOption = { offset: new kakao.maps.Point(27, 55) };
const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
    specialMarkerImage = new kakao.maps.MarkerImage(specialSrc, new kakao.maps.Size(60, 60), imageOption),
    centerMarkerImage = new kakao.maps.MarkerImage(centerSrc, new kakao.maps.Size(50, 50), imageOption);

let mylocationMarker;
let myPosition;
let mapMarkers = {};
let averageMarker = new kakao.maps.Marker({image:centerMarkerImage});
let markerPositions = [];

database.ref('roomsList').child(key).once('value').then(
    (snapshot) => {
        const snapshotVals = snapshot.val();
        roomLocation = snapshotVals.coords;
        if (snapshotVals.actives >= snapshotVals.maxParticipants) {
            alert("유저들로 꽉 찬 방임으로 접속하실수 없습니다.");
            location.href = "/player/match";
        } else {
            socket.emit('create-room', { key: key, id: myId });
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

socket.on('other-location-update', (data) => {
    if (!kakaoMap || data.user == myId)
        return;
    if (data.location == null && mapMarkers[data.user]) {
        mapMarkers[data.user].setMap(null);
        return;
    }
    if (!mapMarkers[data.user]) {
        let marker = new kakao.maps.Marker({
            image: markerImage
        });
        marker.setMap(kakaoMap);
        kakao.maps.event.addListener(marker, 'click', () => {
            generateInfowindow(data.user).open(kakaoMap, marker);
        });
        mapMarkers[data.user] = marker;
    }
    const pos = new kakao.maps.LatLng(data.location.Ha, data.location.Ga);
    markerPositions.push({user:data.user, position: pos});
    mapMarkers[data.user].setPosition(pos);
});

window.onload = window.onload.extend(() => {
    let leftSide = document.getElementById("leftSideMenu");
    let mapContainer = document.getElementById("kakaoMap");

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
    //user position average to make new point and draw line to the point with user positions in map
    document.getElementById('calculate-btn').addEventListener("click", () => {
        if(!kakaoMap || markerPositions.length <= 0) {
            alert("사람들이 없습니다.");
            return;
        }
        let averageLat = 0, averageLng = 0;
        let averCount = markerPositions.length;
        for(let i = 0;i < markerPositions.length;i++) {
            averageLat += markerPositions[i].position.getLat();
            averageLng += markerPositions[i].position.getLng();
        }
        if(mylocationMarker)
        {
            averageLat += myPosition.getLat();
            averageLng += myPosition.getLng();
            averCount++;
        }
        averageLat /= averCount;
        averageLng /= averCount;

        averageMarker.setMap(kakaoMap);
        averageMarker.setPosition(new kakao.maps.LatLng(averageLat,averageLng));
    });
    //load map and events
    leftSide.addEventListener("transitionend", () => {
        let mapOptions = {
            center: new kakao.maps.LatLng(roomLocation.Y, roomLocation.X),
            level: 5
        };

        generateMap(mapContainer, mapOptions).then((map) => {
            kakaoMap = map;
            mylocationMarker = new kakao.maps.Marker({
                image: specialMarkerImage
            });
            mylocationMarker.setMap(map);

            kakao.maps.event.addListener(mylocationMarker, 'click', () => {
                generateInfowindow("나").open(map, mylocationMarker);
            });
            kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
                myPosition = mouseEvent.latLng;
                locateMarker(mouseEvent.latLng, mylocationMarker);
            });
        });
    });
    function sendMessage(text) {
        if (!text || text.trim() == '')
            return;

        socket.emit('chat', {
            roomId: key,
            text: text,
            time: new Date().toLocaleTimeString(),
            userId: myId
        });

        updateChatScroll();
    }
    function updateChatScroll() {
        var element = document.getElementById("chat-container");
        element.scrollTop = element.scrollHeight;
    }
})

function generateMap(container, mapOptions) {
    return new Promise((resolve, reject) => {
        let map = new kakao.maps.Map(container, mapOptions);
        map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);

        resolve(map);
    });
}
function locateMarker(latlng, marker) {
    marker.setPosition(latlng);

    socket.emit('update-location', { location: latlng, id: myId, room: key });
}
function generateInfowindow(content) {
    var iwContent = '<div style="padding:10px;">' + content + '</div>';
    var infowindow = new kakao.maps.InfoWindow({
        content: iwContent,
        removable: true
    });

    return infowindow;
}