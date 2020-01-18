var database = firebase.database();
const maxParticipants = 15;
window.onload = window.onload.extend(() => {
    document.getElementById("create-btn").addEventListener("click", () => {
        const title = document.getElementById("new-room-title").value;
        const region = document.getElementById("new-room-region").value;
        const participants = document.getElementById("new-room-participants").value;
        const delkey = document.getElementById("new-room-delkey").value;

        if (isEmptyOrUndefined(title, region, participants) || delkey.length < 4) {
            alert("비어있는 요소가 있습니다.\n정확하게 입력해주세요");
        } else if (participants > maxParticipants) {
            alert("인원수는 " + maxParticipants + 1 + "명 이상으로 설정이 불가능합니다.");
        } else {
            let roomsList = database.ref('roomsList');
            roomsList.push({
                title: title, region: region, maxParticipants: participants, delkey: delkey, actives:0
            }).then((snapshot) => {
                location.href = "/player/match/rooms/?key=" + snapshot.key;
            });
        }
    });
})

function isEmptyOrUndefined(...variables) {
    for (let i = 0; i < variables.length; i++) {
        const value = variables[i];
        if (value == "" || !value)
            return true;
    }
    return false;
}