Function.prototype.extend = function (fn) {
    var self = this;
    return function () {
        self.apply(this, arguments);
        fn.apply(this, arguments);
    };
};
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

const leftSideMenuWidth = "18%"
window.onload = () => {
    var popupOverlay = document.getElementById("popOverlay");
    var leftSide = document.getElementById("leftSideMenu");
    var main = document.getElementById("main");

    popupOverlay.style.width = "0%";

    popupOverlay.addEventListener("transitionend", () => {
        leftSide.style.width = leftSideMenuWidth;
        main.style.marginLeft = leftSideMenuWidth;
        main.style.display = "block";
    });

    leftSide.addEventListener("transitionend", () => {
        leftSide.getElementsByClassName("side-content")[0].style.display = "block";
    });

    window.addEventListener("resize", (e) => {
        if(e.target.outerWidth <= 920) {
            main.style.marginLeft = "0%";
        }
        else {
            main.style.marginLeft = leftSideMenuWidth;
        }
    });
}