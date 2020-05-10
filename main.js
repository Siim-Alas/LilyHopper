var menuDiv = document.getElementById("menuDiv");
var player;
var mouseX;
var mouseY;
const FPS = 60;

var gameCanvas = {
    canvas: document.getElementById("GC"),

    startGame: function () {
        menuDiv.style.display = "none";
        this.canvas.style.display = "block";

        this.context = this.canvas.getContext("2d");

        player = new Player(this.canvas.width / 2, this.canvas.height / 2);

        this.interval = setInterval(mainLoop, 1000 / FPS);
    },

    endGame: function () {
        clearInterval(this.interval);
        gameDiv.innerHTML = "";
    },
};

class Player {
    x = 0;
    y = 0;

    vx = 0;
    vy = 0;

    landx = 0;
    landy = 0;

    mass = 10;
    vjump = 5;
    maxJumpDistance = 300;
    timeToCharge = 2000;
    startedChargingAt;
    landTime;

    isResting = false;
    isAiming = false;
    isJumping = false;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isResting = true;
    }

    aim() {
        let theta = Math.atan2(mouseY - this.y, mouseX - this.x);
        let charge = (Date.now() - this.startedChargingAt < this.timeToCharge) ? (Date.now() - this.startedChargingAt) / this.timeToCharge : 1;

        this.landx = this.x + charge * this.maxJumpDistance * Math.cos(theta);
        this.landy = this.y + charge * this.maxJumpDistance * Math.sin(theta);
    }

    jump() {
        this.aim();
        let theta = Math.atan2(this.landy - this.y, this.landx - this.x);

        this.vx = this.vjump * Math.cos(theta);
        this.vy = this.vjump * Math.sin(theta);

        this.landTime = Date.now() + (1000 * Math.sqrt(Math.pow(this.landx - this.x, 2) + Math.pow(this.landy - this.y, 2)) / (this.vjump * FPS))
    }

    update() {
        if (this.isResting) {

        } else if (this.isAiming) {
            this.aim();

        } else if (this.isJumping) {
            if (Date.now() >= this.landTime) {
                this.vx = 0;
                this.vy = 0;

                this.isJumping = false;
                this.isResting = true;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        this.draw();
    }

    draw() {
        gameCanvas.context.fillRect(this.x, this.y, 50, 20);

        if (this.isAiming) {
            gameCanvas.context.beginPath();

            gameCanvas.context.moveTo(this.x, this.y);
            gameCanvas.context.lineTo(this.landx, this.landy);

            gameCanvas.context.stroke();
        }
    }
}

function mainLoop() {
    gameCanvas.context.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height)

    player.update();
}

document.addEventListener("mousedown", () => {
    if ((player != undefined) && (player.isResting)) {
        player.isResting = false;
        player.isAiming = true;

        player.startedChargingAt = Date.now();
    }
});
document.addEventListener("mouseup", () => {
    if ((player != undefined) && (player.isAiming)) {
        player.isAiming = false;
        player.isJumping = true;

        player.jump();
    }
});
document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});