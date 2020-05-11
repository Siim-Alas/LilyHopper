var menuDiv = document.getElementById("menuDiv");
var player;
var mouseX;
var mouseY;
const FPS = 60;
var lilyPads = [];

var gameCanvas = {
    canvas: document.getElementById("GC"),

    startGame: function () {
        menuDiv.style.display = "none";
        this.canvas.style.display = "block";

        this.context = this.canvas.getContext("2d");

        player = new Player(this.canvas.width / 2, this.canvas.height / 2);

        for (i = 0; i < 5; i++) {
            lilyPads.push(new LilyPad());
        }

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

    width = 15;
    height = 10;

    mass = 10;
    vjump = 5;
    maxJumpDistance = 300;
    timeToCharge = 2000;
    startedChargingAt;

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
    }

    land() {
        this.x = this.landx;
        this.y = this.landy;

        this.vx = 0;
        this.vy = 0;

        this.isJumping = false;
        this.isResting = true;
    }

    update() {
        if (this.isResting) {

        } else if (this.isAiming) {
            this.aim();

        } else if (this.isJumping) {
            if ((Math.abs(this.landx - this.x) < 2 * Math.abs(this.vx)) && 
                (Math.abs(this.landx - this.x) < 2 * Math.abs(this.vx))) {
                this.land();
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > gameCanvas.canvas.width - this.width) {
            this.x = gameCanvas.canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y > gameCanvas.canvas.height - this.height) {
            this.y = gameCanvas.canvas.height - this.height;
        }

        this.draw();
    }

    draw() {
        gameCanvas.context.fillRect(this.x, this.y, this.width, this.height);

        if (this.isAiming) {
            gameCanvas.context.beginPath();

            gameCanvas.context.moveTo(this.x, this.y);
            gameCanvas.context.lineTo(this.landx, this.landy);

            gameCanvas.context.stroke();
        }
    }
}

class LilyPad {
    x = 0;
    y = 0;

    vx = 0;
    vy = 0;

    // Has to be negative
    vmax = -2;

    width = 20;
    height = 20;

    maxXOffset = 100;
    maxYOffset = 100;

    mass = 10;

    constructor() {
        this.recycle();
    }

    recycle() {
        this.x = (Math.random() < 0.5) ? -1 * getRandomNum(this.width, this.maxXOffset) : gameCanvas.canvas.width + getRandomNum(0, this.maxXOffset);
        this.y = (Math.random() < 0.5) ? -1 * getRandomNum(this.height, this.maxYOffset) : gameCanvas.canvas.height + getRandomNum(0, this.maxYOffset);

        let theta = Math.atan2(this.y - Math.random() * gameCanvas.canvas.height, this.x - Math.random() * gameCanvas.canvas.width);
        let v = Math.random() * this.vmax;

        this.vx = v * Math.cos(theta);
        this.vy = v * Math.sin(theta);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (((this.vx < 0) && (this.x < 0)) ||
            ((this.vx > 0) && (this.x > gameCanvas.canvas.width - this.width)) ||
            ((this.vy < 0) && (this.y < 0)) ||
            ((this.vy > 0) && (this.y > gameCanvas.canvas.height - this.height))) {
            this.recycle();
        }

        this.draw();
    }

    draw() {
        gameCanvas.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

function getRandomNum(min, range) {
    return min + Math.random() * range;
}

function mainLoop() {
    gameCanvas.context.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height)

    player.update();

    for (i = 0; i < lilyPads.length; i++) {
        lilyPads[i].update();
    }
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