import { Mesh, Object3D } from 'three'

export class Turtle {
  name: string
  model: Object3D
  webSocket: WebSocket
  rotation: number
  slot: number
  constructor(name: string, model: Object3D, webSocket: WebSocket) {
    this.name = name
    this.model = model
    this.webSocket = webSocket
    this.rotation = 90
    this.slot = 1
  }

  command(c: string) {
    this.webSocket.send(this.name + ';' + c)
  }

  select(slot: number) {
    this.slot = slot
    this.webSocket.send(this.name + ';turtle.select(' + this.slot + ')')
  }

  placeUp() {
    this.webSocket.send(this.name + ';turtle.logistics.placeUp(turtle)')
  }

  place() {
    this.webSocket.send(this.name + ';turtle.logistics.place(turtle)')
  }

  placeDown() {
    this.webSocket.send(this.name + ';turtle.logistics.placeDown(turtle)')
  }

  forward() {
    this.webSocket.send(this.name + ';turtle.mobility.forward(turtle)')
  }

  back() {
    this.webSocket.send(this.name + ';turtle.mobility.back(turtle)')
  }

  up() {
    this.webSocket.send(this.name + ';turtle.mobility.up(turtle)')
  }

  down() {
    this.webSocket.send(this.name + ';turtle.mobility.down(turtle)')
  }

  turnLeft() {
    this.webSocket.send(this.name + ';turtle.mobility.turnLeft(turtle)')
    this.rotation += 90
    if (this.rotation == 360) {
      this.rotation = 0
    }
  }

  turnRight() {
    this.webSocket.send(this.name + ';turtle.mobility.turnRight(turtle)')
    this.rotation -= 90
    if (this.rotation == -90) {
      this.rotation = 270
    }
  }

  autoMine() {
    this.webSocket.send(
      this.name +
        `;turtle.mine.mine(${(document.getElementById('auto-mine-forward') as HTMLInputElement).value}, ${
          (document.getElementById('auto-mine-right') as HTMLInputElement).value
        })`
    )
  }

  clearWaste() {
    this.webSocket.send(this.name + `;turtle.logistics.clearWaste(turtle)`)
  }

  returnHome() {
    this.webSocket.send(this.name + `;turtle.mobility.home(turtle)`)
  }

  updateRotation() {
    this.model.rotation.y = ((this.rotation - 90) * Math.PI) / 180
  }
}
