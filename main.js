var menuDiv = document.getElementById("menuDiv");

var gameCanvas = {
    canvas: document.getElementById("GC"),

    startGame: function () {
        menuDiv.style.display = "none";
        this.canvas.style.display = "block";

        this.context = this.canvas.getContext("2d");

        this.interval = setInterval(this.update, 20);
    },

    endGame: function () {
        clearInterval(this.interval);
        gameDiv.innerHTML = "";
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },

    update: function () {

    }
};

class player {
    x;
    y;
    vx;
    vy;
    state;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = "resting";
    }

    update() {

    }
}