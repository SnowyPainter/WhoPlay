var database = firebase.database();
var geocoder = new kakao.maps.services.Geocoder();
const maxParticipants = 15;
window.onload = window.onload.extend(() => {
    document.getElementById("create-btn").addEventListener("click", () => {
        const title = document.getElementById("new-room-title").value;
        const participants = document.getElementById("new-room-participants").value;
        const delkey = document.getElementById("new-room-delkey").value;

        const postcode = document.getElementById("postcode").value;
        const address = document.getElementById("address").value;
        const detailAddr = document.getElementById("detail-address").value;
        if (isEmptyOrUndefined(title, participants, postcode, address) || delkey.length < 4) {
            alert("비어있는 요소가 있습니다.\n정확하게 입력해주세요");
            return;
        } else if (participants > maxParticipants) {
            alert("인원수는 " + maxParticipants + 1 + "명 이상으로 설정이 불가능합니다.");
            return;
        }
        geocoder.addressSearch(address, (result, state) => {
            if (state == kakao.maps.services.Status.OK) {
                let roomsList = database.ref('roomsList');
                roomsList.push({
                    title: title, maxParticipants: participants, delkey: delkey, actives: 0,
                    postcode: postcode, address: address, detailAddr: detailAddr, coords:{X:result[0].x,Y:result[0].y}

                }).then((snapshot) => {
                    location.href = "/player/match/rooms/?key=" + snapshot.key;
                });
            } else {
                alert("주소 형식이 올바르지 않습니다.");
            }
        });
    });

    var postcodeLayer = document.getElementById('layer');

    document.getElementById('find-postcode').addEventListener("click", () => {
        new daum.Postcode({
            oncomplete: function (data) {
                let addr = '';
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    addr = data.roadAddress;
                } else { // 사용자가 지번 주소를 선택했을 경우 == J
                    addr = data.jibunAddress;
                }
                document.getElementById('postcode').value = data.zonecode;
                document.getElementById("address").value = addr;
                document.getElementById("detail-address").focus();
                postcodeLayer.style.display = 'none';
            },
            width: '100%',
            height: '100%',
            maxSuggestItems: 3
        }).embed(postcodeLayer);
        postcodeLayer.style.display = 'block';
        initLayerPosition();
    });
    document.getElementById('postcodeClose').addEventListener("click", () => {
        postcodeLayer.style.display = 'none';
    });
    function initLayerPosition() {
        var width = 500;
        var height = 600;
        var borderWidth = 2;

        postcodeLayer.style.width = width + 'px';
        postcodeLayer.style.height = height + 'px';
        postcodeLayer.style.border = borderWidth + 'px solid black';
        postcodeLayer.style.left = (((window.innerWidth || document.documentElement.clientWidth) - width) / 2 - borderWidth) + 'px';
        postcodeLayer.style.top = (((window.innerHeight || document.documentElement.clientHeight) - height) / 2 - borderWidth) + 'px';
    }
})

function isEmptyOrUndefined(...variables) {
    for (let i = 0; i < variables.length; i++) {
        const value = variables[i];
        if (value == "" || !value)
            return true;
    }
    return false;
}