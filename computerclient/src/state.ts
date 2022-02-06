import {
  BoxGeometry,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  Scene,
  TextureLoader,
  Vector3,
} from 'three'
import { Render } from './render'

export class State {
  scene: Scene
  turtleModels: any
  turtleNames: any
  reverseNames: any
  selectedTurtle: number
  loadedTurtles: number
  turtles: any
  inventory: any
  positions: any
  blocks: any
  geometry: BoxGeometry

  constructor(scene: Scene) {
    this.scene = scene

    this.turtleModels = []
    this.turtleNames = []
    this.reverseNames = []
    this.selectedTurtle = 0
    this.loadedTurtles = 0
    this.turtles = []
    this.inventory = []
    this.positions = []
    this.blocks = []
    this.geometry = new BoxGeometry()
  }

  movement(keyCode: string) {
    if (keyCode === 'KeyW') {
      this.turtles[this.selectedTurtle].forward()
    } else if (keyCode === 'KeyS') {
      this.turtles[this.selectedTurtle].back()
    } else if (keyCode === 'KeyA') {
      this.turtles[this.selectedTurtle].turnLeft()
    } else if (keyCode === 'KeyD') {
      this.turtles[this.selectedTurtle].turnRight()
    } else if (keyCode === 'Space') {
      this.turtles[this.selectedTurtle].up()
    } else if (keyCode === 'KeyX') {
      this.turtles[this.selectedTurtle].down()
    }
  }

  addBlock(render: Render, pos: number[], type: string) {
    // render.removeBlocks(this.scene, new Vector3(pos[0], pos[1], -pos[2]))

    if (type !== 'minecraft:air') {
      let texture
      if (render.materials[type] === undefined) {
        if (this.fileExists('textures/block/' + type.split(':')[1] + '.png')) {
          texture = new TextureLoader().load('textures/block/' + type.split(':')[1] + '.png')
        } else {
          texture = this.blockTextTexture(type.split(':')[1])
        }

        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter

        render.materials[type] = new MeshBasicMaterial({
          map: texture,
        })
      }

      const cube = new Mesh(this.geometry, render.materials[type])

      this.scene.add(cube)
      cube.position.set(pos[0], pos[1], -pos[2])

      render.cubes.push(cube)
      this.blocks.push([cube, type])
    } else {
      render.removeBlocks(this.scene, new Vector3(pos[0], pos[1], -pos[2]))
    }
  }

  addBlocks(render: Render, new_blocks: [number[], string][]) {
    for (let i = 0; i < new_blocks.length; i++) {
      if (i % 1000 === 999) {
        console.log(`${(i / new_blocks.length) * 100}%`)
      }
      this.addBlock(render, new_blocks[i][0], new_blocks[i][1])
    }
  }

  blockTextTexture(block: string) {
    const canvas = document.createElement('canvas')
    canvas.height = 256
    canvas.width = 256
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = 'gray'
    ctx.fillRect(0, 0, 256, 256)

    ctx.font = '32px Arial'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(block, 128, 128)

    return new CanvasTexture(canvas)
  }

  setPos(pos: number[]) {
    this.positions = pos
  }

  fileExists(url: string) {
    var http = new XMLHttpRequest()
    http.open('HEAD', url, false)
    http.send()
    return http.status != 404
  }

  getImageFromItem(img: HTMLImageElement, item: string) {
    if (this.fileExists('textures/item/' + item + '.png')) {
      img.src = 'textures/item/' + item + '.png'
    } else if (this.fileExists('textures/block/' + item + '.png')) {
      img.src = 'textures/block/' + item + '.png'
    } else {
      console.log('UNKNOWN: ' + item)
      img.src = ''
    }
  }

  // TODO make type for "items"
  getImagesFromItems(render: Render, imgs: HTMLImageElement[], items: { name: string; count: number }[]) {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (render.imageCache[items[y * 4 + x].name] === undefined) {
          imgs[x + 4 * y] = document.createElement('img')
          this.getImageFromItem(imgs[x + 4 * y], items[x + 4 * y].name.split(':')[1])
          render.imageCache[items[y * 4 + x].name] = imgs[x + 4 * y]
        } else {
          imgs[x + 4 * y] = render.imageCache[items[y * 4 + x].name]
        }
      }
    }
  }

  setInventory(render: Render, inv: { name: string; count: number }[]) {
    this.inventory = inv

    for (let i = 0; i < this.turtleNames.length; i++) {
      const name = this.turtleNames[i]
      if (this.inventory[name].length > 0) {
        render.images[name] = []

        this.getImagesFromItems(render, render.images[name], this.inventory[name])
      }
    }
  }
}
