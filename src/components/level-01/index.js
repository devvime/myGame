import Raven from '../../raven/index.js'
import loadingComponent from '../gameComponents/loading/index.js'
import scoreComponent from '../gameComponents/score/index.js'
import pauseComponent from '../gameComponents/pause/index.js'
import mobileControls from '../gameComponents/mobileControls/index.js'

const component = () => {

    return (
        /*html*/
        `
        <div class="game-components">
            <div id="loading-target"></div>
            <div id="score-target"></div>
            <div id="pause-target"></div>
            <div id="mobile-controls"></div>
        </div>
        
        `
    )

}

var gameWidht = 800
var gameHeight = 600

if (window.innerWidth > 1920) {
    gameWidht = 1920
} else {
    gameWidht = window.innerWidth
}

if (window.innerHeight > 1080) {
    gameHeight = 1080
} else {
    gameHeight = window.innerHeight
}

if (window.innerWidth <= 991) {
    gameWidht = 400
    gameHeight = 600
}

var config = {
    type: Phaser.AUTO,
    width: gameWidht,
    height: gameHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var platforms
var wall
var coins
var setPlayer = localStorage.getItem("player") === null ? "player-victor" : localStorage.getItem("player")
var player
var score = 0
var scoreText
var bombs
var gameOver = false
var cursors
var audioMusic
var audioCash
var audioEnemy
var audioDeath
var background
var runLeft = false
var runRight = false
var runUp = false

function index() {

    Raven.loadStyle("game/level-01/css/game.css")

    Raven.render(component)

    $(document).ready(function() {
        Raven.include('#loading-target', loadingComponent)
        Raven.include('#score-target', scoreComponent)
        Raven.include('#pause-target', pauseComponent)
        Raven.include('#mobile-controls', mobileControls)
    })

    var game = new Phaser.Game(config)

}

function preload() {
    this.load.image('background', '/game/level-01/game-assets/background.png')
    this.load.image('platform', '/game/level-01/game-assets/platform.png')
    this.load.image('wall', '/game/level-01/game-assets/wall.png')
    this.load.image('star', '/game/level-01/game-assets/star.png')
    this.load.image('bomb', '/game/level-01/game-assets/bomb.png')
    this.load.spritesheet('player', '/game/level-01/game-assets/' + setPlayer + '.png', { frameWidth: 32, frameHeight: 48 })
    this.load.audio('audioMusic', '/game/level-01/game-assets/audio/music.mp3')
    this.load.audio('audioCash', '/game/level-01/game-assets/audio/cash.mp3')
    this.load.audio('audioEnemy', '/game/level-01/game-assets/audio/enemy.mp3')
    this.load.audio('audioDeath', '/game/level-01/game-assets/audio/death.mp3')
}

function create() {
    this.cameras.main.zoom = 1.5

    //sounds
    audioMusic = this.sound.add('audioMusic')
    audioMusic.play()
    audioMusic.loop = true
    audioCash = this.sound.add('audioCash')
    audioEnemy = this.sound.add('audioEnemy')
    audioDeath = this.sound.add('audioDeath')

    //fim sounds
    background = this.add.image(0, 0, 'background')
    background.setOrigin(0, 0);
    platforms = this.physics.add.staticGroup()
    platforms.create(200, 570, 'platform')
    platforms.create(599, 570, 'platform')
    platforms.create(995, 570, 'platform')
    platforms.create(1199, 570, 'platform')
    platforms.create(600, 400, 'platform')
    platforms.create(50, 250, 'platform')
    platforms.create(750, 220, 'platform')

    wall = this.physics.add.staticGroup()
    wall.create(-20, 355, 'wall')
    wall.create(-20, 0, 'wall')
    wall.create(1300, 355, 'wall')
    wall.create(1300, 0, 'wall')

    player = this.physics.add.sprite(100, 450, 'player')
    player.setBounce(0.2);
    player.setCollideWorldBounds(false)
    player.setScale(1.4)

    //animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    })
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    //fim animations

    //physics
    this.physics.add.collider(player, platforms)
    coins = this.physics.add.group({
        key: 'star',
        repeat: 18,
        setXY: { x: 12, y: 0, stepX: 70 }
    })
    coins.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    })
    this.physics.add.collider(coins, platforms)
    this.physics.add.overlap(player, coins, collectStar, null, this)
    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)
    this.physics.add.collider(player, wall)
    this.physics.add.collider(bombs, wall)

    //fim physics

    this.cameras.main.setBounds(0, 0, 1280, 600);
    this.cameras.main.startFollow(player)

    mobileControl()

    $(document).ready(function() {
        $(".loading").fadeOut()
        setObjective()
    })

    pause(this)
}

function update() {
    cursors = this.input.keyboard.createCursorKeys()
    if (cursors.left.isDown || runLeft) {
        player.setVelocityX(-160)
        player.anims.play('left', true)
    } else if (cursors.right.isDown || runRight) {
        player.setVelocityX(160)
        player.anims.play('right', true)
    } else {
        player.setVelocityX(0)
        player.anims.play('turn')
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330)
    }
    if (runUp && player.body.touching.down) {
        player.setVelocityY(-330)
    }
}

function collectStar(player, star) {
    star.disableBody(true, true)
    score += 10
    $(".score").html("Score: " + score)
    audioCash.play()
    if (coins.countActive(true) === 0) {
        coins.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true)
            audioEnemy.play()
        })
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
        var bomb = bombs.create(x, 32, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
    if (score >= 500) {
        this.scene.pause()
        swal("Booa!", "Você venceu o Jailson!").then(() => {
            location.href = "/game/fase-02/index.html"
        })
    }
}

function hitBomb(player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)
    player.anims.play('turn')
    gameOver = true
    audioMusic.stop()
    audioDeath.play()
    setTimeout(() => {
        document.location.reload(true);
    }, 4000)
}

function mobileControl() {
    var btnLeft = $(".btn-left")
    var btnRight = $(".btn-right")
    var btnUp = $(".btn-up")

    btnLeft.on("click", function() {
        runLeft ? runLeft = false : runLeft = true, runRight = false
    })
    btnRight.on("click", function() {
        runRight ? runRight = false : runRight = true, runLeft = false
    })
    btnUp.on("click", function() {
        runUp ? runUp = false : runUp = true && setTimeout(() => { runUp = false }, 200)
    })
}

function pause(thisGame) {
    $(".btn-pause").on("click", function() {
        $(".pause").addClass("active")
        thisGame.scene.pause()
    })
    $("#backToGame").on("click", function() {
        $(".pause").removeClass("active")
        thisGame.scene.resume()
    })
    $("#mainMenu").on("click", function() {
        location.href = "/"
    })
}

function setObjective() {
    swal("Objetivo!", "Capture 360 pontos em moedas!")
}

export default index