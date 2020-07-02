const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

let bottomMargin = 70
let slatew = 75
let slateh = 20
let ballRadius = 10
let LIFE = 3
let LEVEL = 1
let MAX_LEVEL = 5
let SCORE = 0
let SCORE_UNIT = 10
let GAME_OVER = false

const brick_hit = new Audio()
const life_lost = new Audio()
const paddle_hit = new Audio()
const wall = new Audio()
const win = new Audio()

brick_hit.src = "audio/brick_hit.mp3"
life_lost.src = "audio/life_lost.mp3"
paddle_hit.src = "audio/paddle_hit.mp3"
wall.src = "audio/right.mp3"
win.src = "audio/win.mp3"

const slate = {
  x: canvas.width / 2 - slatew / 2,
  y: canvas.height - bottomMargin,
  w: slatew,
  h: slateh,
  dx: 0,
  dy: 0,
  speed: 5,
}

const ball = {
  x: canvas.width / 2,
  y: canvas.height - bottomMargin - ballRadius,
  dx: 3 * (Math.random() * 2 - 1),
  dy: -3,
  radius: ballRadius,
  speed: 5,
}

const brick = {
  row: 3,
  column: 6,
  width: 55,
  height: 20,
  offSetLeft: 20,
  offSetTop: 20,
  marginTop: 40,
  fillColor: "#2e3548",
  strokeColor: "#FFF",
}

let bricks = []

function createBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = []
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y:
          r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
      }
    }
  }
}

createBricks()

function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c]

      if (b.status) {
        ctx.fillStyle = brick.fillColor
        ctx.fillRect(b.x, b.y, brick.width, brick.height)

        ctx.strokeStyle = brick.strokeColor
        ctx.strokeRect(b.x, b.y, brick.width, brick.height)
      }
    }
  }
}

ctx.lineWidth = 3

document.addEventListener("keydown", keydown)
document.addEventListener("keyup", keyup)

function keydown(e) {
  if (e.key === "ArrowLeft") {
    slate.dx -= slate.speed
  } else if (e.key === "ArrowRight") {
    slate.dx += slate.speed
  }
}

function keyup(e) {
  if (e.key === "ArrowLeft") {
    slate.dx = 0
  } else if (e.key === "ArrowRight") {
    slate.dx = 0
  }
}

function scorcard() {
  ctx.font = "20px ariel"
  ctx.fillStyle = "red"
  ctx.fillText("Score", 20, 30)

  ctx.fillText(SCORE, 85, 30)

  ctx.fillText("Level -", (canvas.width - 25) / 2, 30)

  ctx.fillText(LEVEL, (canvas.width + 120) / 2, 30)

  ctx.fillText("Life", canvas.width - 75, 30)
  ctx.fillText(LIFE, canvas.width - 30, 30)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  scorcard()
  drawSlateAndBall()
  newPositionForSlateAndBall()
  checkBallHitsSlate()
  drawBricks()
  ballBrickCollision()
  levelup()
  gameover()

  if (!GAME_OVER) {
    requestAnimationFrame(draw)
  }
}

function drawSlateAndBall() {
  //draw slate
  ctx.fillStyle = "blue"
  ctx.fillRect(slate.x, slate.y, slate.w, slate.h)

  ctx.storeStyle = "yellow"
  ctx.strokeRect(slate.x, slate.y, slate.w, slate.h)

  //draw ball
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)

  ctx.fillStyle = "purple"
  ctx.fill()
}

function newPositionForSlateAndBall() {
  // new postion for slate
  slate.x += slate.dx

  if (slate.x < 0) {
    slate.x = 0
  } else if (slate.x + slate.w > canvas.width) {
    slate.x = canvas.width - slate.w
  }

  //move ball

  ball.x += ball.dx
  ball.y += ball.dy

  // new postion for ball

  if (ball.x + ball.radius > canvas.width - 0.5 || ball.x - ball.radius < 0.5) {
    ball.dx *= -1
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1
  }

  if (ball.y + ball.radius > canvas.height) {
    LIFE--
    console.log(LIFE)
    if (LIFE > 0 && LIFE < 3) {
      life_lost.play()
    }
    resetBall()
  }
}

function resetBall() {
  ball.x = canvas.width / 2
  ball.y = canvas.height - bottomMargin - ballRadius
  ball.dx = 3 * (Math.random() * 2 - 1)
  ball.dy = -3
}

function checkBallHitsSlate() {
  //console.log(ball.x, ball.y)
  if (
    ball.x < slate.x + slate.w && //  ball = 442 slate = 490
    ball.x > slate.x && //  ball= 442   slate = 415
    slate.y < slate.y + slate.h &&
    ball.y > slate.y
  ) {
    // CHECK WHERE THE BALL HIT THE PADDLE

    paddle_hit.play()
    let collidePoint = ball.x - (slate.x + slate.w / 2)

    // NORMALIZE THE VALUES
    collidePoint = collidePoint / (slate.w / 2)

    // CALCULATE THE ANGLE OF THE BALL
    let angle = (collidePoint * Math.PI) / 3

    ball.dx = ball.speed * Math.sin(angle)
    ball.dy = -ball.speed * Math.cos(angle)
    console.log("hit")
  }
}

function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c]

      if (b.status) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + brick.height
        ) {
          brick_hit.play()
          ball.dy = -ball.dy
          b.status = false
          SCORE += SCORE_UNIT
        }
      }
    }
  }
}

function gameover() {
  if (LIFE <= 0) {
    GAME_OVER = true
    let result = confirm("You lost, Game Over!! , Wanna play again?")
    if (result) {
      location.reload()
    }
  }
}

function levelup() {
  let isLevelDone = true

  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status
    }
  }

  if (isLevelDone) {
    if (LEVEL >= MAX_LEVEL) {
      win.play()
      let result = confirm("Congrat's you won the game!! , wanna play again")
      if (result) {
        location.reload()
      }
      return (GAME_OVER = true)
    }

    brick.row++
    createBricks()
    ball.speed += 1.8
    resetBall()
    LEVEL++
  }
}

draw()
