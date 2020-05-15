var menuDiv = document.getElementById("menuDiv");
var player;
var mouseX;
var mouseY;
const FPS = 60;
var lilyPads = [];
var startTime;
var timeElapsed;

var gameCanvas = {
    canvas: document.getElementById("GC"),

    startGame: function () {
        menuDiv.style.display = "none";
        this.canvas.style.display = "block";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.context = this.canvas.getContext("2d");
        this.context.font = "30px Arial";

        player = new Player(this.canvas.width / 2, this.canvas.height / 2);

        lilyPads = [];
        for (i = 0; i < 1 + (this.canvas.width * this.canvas.height / 25000); i++) {
            lilyPads.push(new LilyPad());
        }

        lilyPads[0].x = this.canvas.width / 2;
        lilyPads[0].y = this.canvas.height / 2;
        player.hostIndex = 0;

        startTime = Date.now();

        this.interval = setInterval(mainLoop, 1000 / FPS);
    },

    endGame: function () {
        clearInterval(this.interval);
        player = null;

        document.getElementById("timeP").textContent = `Time elapsed was ${Math.trunc(timeElapsed / 60000).toString().padStart(2, "0")}:${Math.trunc((timeElapsed % 60000) / 1000).toString().padStart(2, "0")}`;

        this.canvas.style.display = "none";
        menuDiv.style.display = "block";
    },
};

class Player {
    x = 0;
    y = 0;

    width = 15;
    height = 10;
    sizeFactor = 1;
    mass = 1;

    vx = 0;
    vy = 0;

    landx = 0;
    landy = 0;

    hostIndex = -1;

    vjump = 5;
    maxJumpDistance = 300;
    jumpYOffset = 0;

    timeToCharge = 2000;
    startedChargingAt;
    jumpHaflWayTime;

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

        lilyPads[this.hostIndex].vx -= this.vx * (this.mass / lilyPads[this.hostIndex].mass);
        lilyPads[this.hostIndex].vy -= this.vy * (this.mass / lilyPads[this.hostIndex].mass);

        this.hostIndex = -1;

        this.jumpHaflWayTime = Date.now() + (500 * Math.sqrt(Math.pow(this.landx - this.x, 2) + Math.pow(this.landy - this.y, 2)) / (this.vjump * FPS));

        player.isAiming = false;
        player.isJumping = true;
    }

    land() {
        this.x = this.landx;
        this.y = this.landy;

        for (i = 0; i < lilyPads.length; i++) {
            if (Math.pow(lilyPads[i].x - this.x, 2) + Math.pow(lilyPads[i].y - this.y, 2) <= Math.pow(lilyPads[i].radius, 2)) {

                this.hostIndex = i;
                lilyPads[i].vx = (lilyPads[i].vx * lilyPads[i].mass + this.vx * this.mass) / (lilyPads[i].mass + this.mass);
                lilyPads[i].vy = (lilyPads[i].vy * lilyPads[i].mass + this.vy * this.mass) / (lilyPads[i].mass + this.mass);

                break;
            }
        }

        this.isJumping = false;
        this.isResting = true;

        this.sizeFactor = 1;
        this.jumpYOffset = 0;

        if (this.hostIndex === -1) {
            gameCanvas.endGame();
        }
    }

    update() {
        if (this.isResting || this.isAiming) {
            this.x = lilyPads[this.hostIndex].x;
            this.y = lilyPads[this.hostIndex].y;

            this.vx = lilyPads[this.hostIndex].vx;
            this.vy = lilyPads[this.hostIndex].vy;

        }
        if (this.isAiming) {
            this.aim();

        } else if (this.isJumping) {
            if ((Math.abs(this.landx - this.x) < 2 * Math.abs(this.vx)) && 
                (Math.abs(this.landx - this.x) < 2 * Math.abs(this.vx))) {
                this.land();
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if ((this.x < this.width / -2) || 
            (this.x > gameCanvas.canvas.width + this.width / 2) || 
            (this.y < this.height / -2) || 
            (this.y > gameCanvas.canvas.height + this.height / 2)) {

            gameCanvas.endGame();
        }

        this.draw();
    }

    draw() {
        if (this.isAiming || this.isJumping) {
            gameCanvas.context.beginPath();

            gameCanvas.context.moveTo(this.x, this.y);
            gameCanvas.context.lineTo(this.landx, this.landy);

            gameCanvas.context.strokeStyle = "#FF0000";
            gameCanvas.context.stroke();
        }

        
        if (this.isJumping) {
            let k = (Date.now() < this.jumpHaflWayTime) ? 1 : -1;

            this.sizeFactor += 2 * (k / FPS);
            this.jumpYOffset += -50 * (k / FPS);

            gameCanvas.context.fillStyle = "#130606";
            gameCanvas.context.fillRect(this.x - this.width * this.sizeFactor / 2, this.y - this.height * this.sizeFactor / 2,
                this.width * this.sizeFactor, this.height * this.sizeFactor);

            gameCanvas.context.fillStyle = "#FF0000";
            gameCanvas.context.fillRect(this.x - this.width * this.sizeFactor / 2, this.y - this.height * this.sizeFactor / 2 + this.jumpYOffset,
                                        this.width * this.sizeFactor, this.height * this.sizeFactor);
        } else {
            gameCanvas.context.fillStyle = "#FF0000";
            gameCanvas.context.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}

class LilyPad {
    x = 0;
    y = 0;

    vx = 0;
    vy = 0;
    // Has to be negative
    vmax = -1;

    radius = 30;
    mass = 10;

    maxXOffset = 400;
    maxYOffset = 400;

    constructor() {
        this.recycle();
    }

    recycle() {
        this.x = getRandomNum(-1 * this.maxXOffset, gameCanvas.canvas.width + 2 * this.maxXOffset);
        if ((this.x < -1 * this.radius) || (this.x > gameCanvas.canvas.width + this.radius)) {
            this.y = getRandomNum(-1 * this.maxYOffset, gameCanvas.canvas.height + 2 * this.maxYOffset);
        } else {
            this.y = (Math.random() < 0.5) ? getRandomNum(-1 * this.maxYOffset, this.radius) : getRandomNum(gameCanvas.canvas.height + this.radius, this.maxYOffset)
        }

        let theta = Math.atan2(this.y - Math.random() * gameCanvas.canvas.height, this.x - Math.random() * gameCanvas.canvas.width);
        let v = Math.random() * this.vmax;

        this.vx = v * Math.cos(theta);
        this.vy = v * Math.sin(theta);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (((this.vx < 0) && (this.x < -1 * this.radius)) ||
            ((this.vx > 0) && (this.x > gameCanvas.canvas.width + this.radius)) ||
            ((this.vy < 0) && (this.y < -1 * this.radius)) ||
            ((this.vy > 0) && (this.y > gameCanvas.canvas.height + this.radius))) {
            this.recycle();
        }

        this.draw();
    }

    draw() {
        gameCanvas.context.fillStyle = "#00b300";

        gameCanvas.context.beginPath();
        gameCanvas.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        gameCanvas.context.fill();
    }
}

function getRandomNum(min, range) {
    return min + Math.random() * range;
}

function bounceLilys() {
    let theta = 0;
    let vi = 0;
    let vj = 0;
    let alphaI = 0;
    let alphaJ = 0;
    let a = 0;
    for (i = 0; i < lilyPads.length - 1; i++) {
        for (j = i + 1; j < lilyPads.length; j++) {
            // All lilipads are the same size
            if (Math.pow(lilyPads[i].x - lilyPads[j].x, 2) + Math.pow(lilyPads[i].y - lilyPads[j].y, 2) <= Math.pow(2 * lilyPads[i].radius, 2)) {
                // All lilypads are the same mass, so mass cancels out of momentum equations

                // The angle from j to i
                theta = Math.atan2(lilyPads[i].y - lilyPads[j].y, lilyPads[i].x - lilyPads[j].x);

                // The speeds of the two lilypads
                vi = Math.sqrt(Math.pow(lilyPads[i].vx, 2) + Math.pow(lilyPads[i].vy, 2));
                vj = Math.sqrt(Math.pow(lilyPads[j].vx, 2) + Math.pow(lilyPads[j].vy, 2));

                // The angles between the relevant velocity and theta
                alphaI = Math.atan2(lilyPads[i].vy, lilyPads[i].vx) - theta;
                alphaJ = Math.atan2(lilyPads[j].vy, lilyPads[j].vx) - theta;

                // The magnitude of acceleration from j to i
                a = vj * Math.cos(alphaJ) - vi * Math.cos(alphaI);

                // Apply the acceleration
                lilyPads[i].vx += a * Math.cos(theta);
                lilyPads[i].vy += a * Math.sin(theta);

                lilyPads[j].vx -= a * Math.cos(theta);
                lilyPads[j].vy -= a * Math.sin(theta);

                // Move i outside of j (in case they spawned merged)
                lilyPads[i].x = lilyPads[j].x + 2 * lilyPads[i].radius * Math.cos(theta);
                lilyPads[i].y = lilyPads[j].y + 2 * lilyPads[i].radius * Math.sin(theta);
            }
        }
    }
}

function mainLoop() {
    timeElapsed = Date.now() - startTime;

    gameCanvas.context.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height)

    for (i = 0; i < lilyPads.length; i++) {
        lilyPads[i].update();
    }

    bounceLilys();

    player.update();

    gameCanvas.context.fillText(`${Math.trunc(timeElapsed / 60000).toString().padStart(2, "0")}:${Math.trunc((timeElapsed % 60000) / 1000).toString().padStart(2, "0")}`,
        10, 50);
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
        player.jump();
    }
});
document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});