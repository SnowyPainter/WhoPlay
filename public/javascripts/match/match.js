var database = firebase.database();

window.onload = window.onload.extend(() => {
    let roomsList = database.ref('roomsList');
    roomsList.once('value').then((snapshot) => {
        let snapshotIndex = 0;
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const key = Object.keys(snapshot.val())[snapshotIndex];
            let room = document.createElement('div');
            room.className = "input-table-row room";
            room.innerHTML = `
            <input type="hidden" class="room-key-id" value='`+ key + `'>
            <div class="table-body-cell room-title">`+ data.title + `</div>
            <div class="table-body-cell room-region">`+ data.region + `</div>
            <div class="table-body-cell room-participants">`+data.actives+` / `+ data.maxParticipants + `명</div>
            <div class="table-body-cell room-delete"><button>X</button></div>
            `;
            document.getElementById("rooms-list").appendChild(room);

            room.getElementsByClassName("room-title")[0].addEventListener("click", () => {
                location.href = "/player/match/rooms/?key="+key;
            });
            snapshotIndex++;
        });

        const delBtns = document.getElementsByClassName("room-delete");

        for (let i = 0; i < delBtns.length; i++) {
            (() => delBtns[i].addEventListener("click", () => {
                const keyId = delBtns[i].parentElement.getElementsByClassName("room-key-id")[0].value;
                let roomRef = database.ref('roomsList').child(keyId).once('value').then(
                    (snapshot) => {
                        if (snapshot.val().delkey === prompt('삭제 비밀번호를 입력하여 주세요', '')) {
                            roomsList.child(keyId).remove();
                            delBtns[i].parentElement.remove();
                        } else {
                            alert("삭제가 취소되었습니다.");
                        }

                        location.href = "/player/match";
                    }
                )
            }))();
        }
    });
})