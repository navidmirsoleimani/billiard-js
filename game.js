class Vector {
    constructor (x = 0 , y = 0) {
        this.x = x,
        this.y = y
    }
    copy () {
        return new Vector(this.x , this.y)
    }
    addTo (vector) {
        this.x += vector.x,
        this.y += vector.y
    }
    mult (value) {
        return new Vector(this.x * value , this.y * value)
    }
    length () {
        return Math.sqrt(Math.pow(this.x , 2) + Math.pow(this.y , 2))
    }
}
 
const DELTA = 1/100

let sprites = {}
let assetsStillLoading = 0
function loadSprite(fileName) {
    assetsStillLoading ++

    let spriteImage = new Image()
    spriteImage.src = `./assets/sprites/${fileName}`

    spriteImage.addEventListener('load' , e=> {
        assetsStillLoading --
    })

    return spriteImage
}

function loadAssets(callback) {
    sprites.background = loadSprite('background.png')
    sprites.whiteball = loadSprite('ball.png')
    sprites.stick = loadSprite('stick.png')

    assetsLoadingLoop(callback)

}

function assetsLoadingLoop (callback) {
    if (assetsStillLoading) {
        requestAnimationFrame(assetsLoadingLoop.bind(this,callback))
    } else {
        callback()
    }
}



class ButtonState {
    constructor() {
        this.down = false
        this.pressed = false
    }
}

class MouseHandler {
    constructor() {
        this.left = new ButtonState()
        this.middle = new ButtonState()
        this.right = new ButtonState()

        this.position = new Vector()

        document.addEventListener('mousemove' , handleMouseMove)
        document.addEventListener('mousedown' , handleMouseDown)
        document.addEventListener('mouseup' , handleMouseUp)
    }
    reset () {
        this.left.pressed = false
        this.middle.pressed = false
        this.right.pressed = false
    }
}

let Mouse = new MouseHandler()

function handleMouseMove (e) {
    Mouse.position.x = e.pageX
    Mouse.position.y = e.pageY
}
function handleMouseDown (e) {
    handleMouseMove(e)
    if (e.button == 0){
        Mouse.left.pressed = true
        Mouse.left.down = true
    } else if (e.button == 1) {
        Mouse.middle.pressed = true
        Mouse.middle.down = true
    } else if (e.button == 2) {
        Mouse.right.pressed = true
        Mouse.right.down = true
    }
}
function handleMouseUp (e) {
    handleMouseMove(e)
    if (e.which == 1){
        Mouse.left.pressed = true
        Mouse.left.down = false
    } else if (e.which == 2) {
        Mouse.middle.pressed = true
        Mouse.middle.down = false
    } else if (e.which == 3) {
        Mouse.right.pressed = true
        Mouse.right.down = false
    }
}



class Canvas2D {
    constructor() {
        this.canvas = document.querySelector('#screen')
        this.ctx = this.canvas.getContext('2d')
    }
    clear () {
        this.ctx.clearRect(0 , 0 , this.canvas.width , this.canvas.height)
    }
    drawImage (image , position = new Vector() , origin = new Vector() , rotation = 0) {
        this.ctx.save()
        this.ctx.translate(position.x , position.y)
        this.ctx.rotate(rotation)
        this.ctx.drawImage(image,-origin.x , -origin.y)
        this.ctx.restore()
    }
}

let Canvas = new Canvas2D();



const BALL_ORIGIN = new Vector(25 , 25)

class Ball {
    constructor (position) {
        this.position = position
        this.velocity = new Vector()
        this.moving = false
    }
    draw () {
        Canvas.drawImage(sprites.whiteball , this.position , BALL_ORIGIN)
    }
    update (delta) {
        this.position.addTo(this.velocity.mult(delta))
        this.velocity = this.velocity.mult(.98)
        if (this.velocity.length() < 15) {
            this.velocity = new Vector()
            this.moving = false
        }
    }
    shoot (power , rotation) {
        this.velocity = new Vector( Math.cos(rotation) * power , Math.sin(rotation) * power )
        this.moving = true
    }
}

const STICK_ORIGIN = new Vector(970 , 11)
const SHOOT_ORIGIN = new Vector(950 , 11)

class Stick {
    constructor (position , onShoot) {
        this.position = position
        this.rotation = 0
        this.origin = STICK_ORIGIN.copy()
        this.power = 0
        this.onShoot = onShoot
        this.shot = false
    }
    draw () {
        Canvas.drawImage(sprites.stick , this.position , this.origin , this.rotation)
    }
    update () {
        this.updateRotation()
        if (Mouse.left.down) {
            this.increasePower()
        } else if (this.power > 0) {
            this.shoot()
        }
    }
    shoot () {
        this.onShoot(this.power , this.rotation)
        this.power = 0
        this.origin = SHOOT_ORIGIN.copy()
        this.shot = true

    }
    updateRotation () {
        let opposite = Mouse.position.y - this.position.y
        let adjacent = Mouse.position.x - this.position.x

        this.rotation = Math.atan2(opposite , adjacent)
    }
    increasePower () {
        this.power += 100
        this.origin.x += 5
    }
    reposition (position) {
        this.position = position.copy()
        this.origin = STICK_ORIGIN.copy()
    }
}





class GameWorld {
    constructor () {
        this.whiteball = new Ball(new Vector(413 , 413))
        this.stick = new Stick (new Vector(413 , 413) , this.whiteball.shoot.bind(this.whiteball) )
    }
    update () {
        this.stick.update()
        this.whiteball.update(DELTA)
        if (!this.whiteball.moving && this.stick.shot) {
            this.stick.reposition(this.whiteball.position)
        }
    }
    draw () {
        Canvas.drawImage(sprites.background)
        this.whiteball.draw()
        this.stick.draw()
    }
}

let gameworld = new GameWorld()

function animate() {
    Canvas.clear()
    gameworld.update()
    gameworld.draw()
    requestAnimationFrame(animate)
}

loadAssets(animate)