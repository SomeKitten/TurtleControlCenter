import { Scene, PerspectiveCamera, Raycaster, Box3, NearestFilter, Mesh, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Input } from './input'
import { State } from './state'
import { Turtle } from './turtle'

export class Render {
  scene: Scene
  state: State
  images: { [key: string]: HTMLImageElement[] }
  cubes: any
  camera: PerspectiveCamera
  raycaster: Raycaster
  INTERSECTED: Mesh | undefined
  camRotX: number
  camRotY: number
  camDist: number
  bb: Box3
  positionGoals: any
  turtleListCxt: CanvasRenderingContext2D
  turtleListCanvas: HTMLCanvasElement
  inventoryCxt: CanvasRenderingContext2D
  controls: HTMLDivElement
  clearWaste: HTMLButtonElement
  returnHome: HTMLButtonElement
  autoMine: HTMLButtonElement
  autoMineForward: HTMLInputElement
  autoMineRight: HTMLInputElement
  materials: any

  constructor(scene: Scene, state: State) {
    this.scene = scene
    this.state = state

    this.images = {}

    this.cubes = []

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30)

    this.raycaster = new Raycaster()

    this.camRotX = 0
    this.camRotY = 0
    this.camDist = 2

    this.bb = new Box3()

    this.positionGoals = []

    this.turtleListCanvas = document.createElement('canvas')
    this.turtleListCxt = this.turtleListCanvas.getContext('2d')!
    this.turtleListCanvas.id = 'turtleList'
    this.turtleListCanvas.width = window.innerWidth
    this.turtleListCanvas.height = 64
    document.body.appendChild(this.turtleListCanvas)

    const inventoryCanvas = document.createElement('canvas')
    this.inventoryCxt = inventoryCanvas.getContext('2d')!
    inventoryCanvas.id = 'inventory'
    inventoryCanvas.width = 256
    inventoryCanvas.height = 256
    document.body.appendChild(inventoryCanvas)

    this.controls = document.createElement('div')
    this.controls.id = 'controls'
    document.body.appendChild(this.controls)

    this.clearWaste = document.createElement('button')
    this.clearWaste.id = 'auto-mine'
    this.clearWaste.innerHTML = 'Clear Waste'
    this.clearWaste.onclick = () => {
      state.turtles[state.selectedTurtle].clearWaste()
    }
    this.controls.appendChild(this.clearWaste)

    this.returnHome = document.createElement('button')
    this.returnHome.id = 'return-home'
    this.returnHome.innerHTML = 'Return Home'
    this.returnHome.onclick = () => {
      state.turtles[state.selectedTurtle].returnHome()
    }
    this.controls.appendChild(this.returnHome)

    this.autoMine = document.createElement('button')
    this.autoMine.id = 'auto-mine'
    this.autoMine.innerHTML = 'Auto Mine'
    this.autoMine.onclick = () => {
      state.turtles[state.selectedTurtle].autoMine()
    }
    this.controls.appendChild(this.autoMine)

    this.autoMineForward = document.createElement('input')
    this.autoMineForward.id = 'auto-mine-forward'
    this.autoMineForward.type = 'number'
    this.autoMineForward.value = '5'
    this.autoMineForward.min = '1'
    this.autoMineForward.max = '50'
    this.controls.appendChild(this.autoMineForward)

    this.autoMineRight = document.createElement('input')
    this.autoMineRight.id = 'auto-mine-right'
    this.autoMineRight.type = 'number'
    this.autoMineRight.value = '5'
    this.autoMineRight.min = '1'
    this.autoMineRight.max = '20'
    this.controls.appendChild(this.autoMineRight)

    this.materials = {}
  }

  loadTurtle(state: State, loader: GLTFLoader, turtleSocket: WebSocket, scene: Scene) {
    loader.load(
      'models/turtle/gltf/turtle.glb',
      function (gltf) {
        console.log('Loading model!')

        console.log(gltf.scene)

        state.turtleModels[state.turtleModels.length] = gltf.scene
        state.turtleModels[state.turtleModels.length - 1].children[0].material.map.minFilter = NearestFilter
        state.turtleModels[state.turtleModels.length - 1].children[0].material.map.magFilter = NearestFilter

        scene.add(gltf.scene)

        state.turtles[state.turtleModels.length - 1] = new Turtle(
          state.turtleNames[state.turtleModels.length - 1],
          gltf.scene,
          turtleSocket
        )
      },
      undefined,
      function (error) {
        console.error(error)
      }
    )
  }

  blockHighlight(block: Mesh) {
    // if (this.INTERSECTED)
    //   this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
    // this.INTERSECTED = block.object;
    // this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
    // this.INTERSECTED.material.color.setHex(0xff0000);
    // for (let j = 0; j < this.state.blocks.length; j++) {
    //   if (this.state.blocks[j][0] === this.INTERSECTED) {
    //     console.log(this.state.blocks[j][1]);
    //   }
    // }
  }

  updateTurtle(i: number) {
    const turtle = this.state.turtleNames[i]

    const pos = this.state.positions[turtle].pos
    this.state.turtleModels[i].position.set(parseInt(pos[0]), parseInt(pos[1]), -parseInt(pos[2]))

    this.state.turtles[i].rotation = this.state.positions[turtle].rot
    this.state.turtles[i].updateRotation()
  }

  removeBlock(scene: Scene, i: number) {
    for (let j = 0; j < this.cubes.length; j++) {
      if (scene.children[i] === this.cubes[j]) {
        for (let k = 0; k < this.state.blocks.length; k++) {
          if (this.state.blocks[k][0] === this.cubes[j]) {
            this.cubes.splice(j, 1)
            this.state.blocks.splice(k, 1)
          }
        }
      }
    }
    let clearChild = true

    for (let j = 0; j < this.state.turtleModels.length; j++) {
      if (scene.children[i] === this.state.turtleModels[j]) {
        clearChild = false
      }
    }

    if (clearChild) {
      scene.children.splice(i, 1)

      return true
    }
    return false
  }

  removeBlocks(scene: Scene, position: Vector3) {
    let loop = true
    while (loop) {
      loop = false
      for (let i = 0; i < scene.children.length; i++) {
        this.bb.setFromObject(scene.children[i])
        if (this.bb.containsPoint(position)) {
          loop = this.removeBlock(scene, i)
        }
      }
    }
  }

  updateCamera() {
    this.camera.position.set(
      this.state.turtleModels[this.state.selectedTurtle].position.x +
        Math.cos(this.camRotX) * Math.cos(this.camRotY) * this.camDist,
      this.state.turtleModels[this.state.selectedTurtle].position.y + Math.sin(this.camRotY) * this.camDist,
      this.state.turtleModels[this.state.selectedTurtle].position.z +
        Math.sin(this.camRotX) * Math.cos(this.camRotY) * this.camDist
    )

    // this.removeBlocks(this.scene, this.state.turtleModels[this.state.selectedTurtle].position)

    this.camera.lookAt(this.state.turtleModels[this.state.selectedTurtle].position)

    this.camera.updateMatrixWorld()
  }

  mainRender() {
    if (this.state.turtleModels.length > 0) {
      if (this.state.turtles.length !== 0 && this.state.positions !== []) {
        for (let i = 0; i < this.state.turtleModels.length; i++) {
          this.updateTurtle(i)
        }
      }

      this.updateCamera()
    }

    // this.raycaster.setFromCamera(input.pointer, this.camera)

    // const intersects = this.raycaster.intersectObjects(this.cubes)

    // if (intersects.length > 0) {
    //   if (intersects[0] != null && this.INTERSECTED != intersects[0].object) {
    //     this.blockHighlight(intersects[0])
    //   }
    // } else {
    //   if (this.INTERSECTED) this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex)

    //   this.INTERSECTED = null
    // }
  }

  renderTurtleList(input: Input) {
    this.turtleListCxt.fillStyle = '#666666'
    this.turtleListCxt.fillRect(0, 0, window.innerWidth, 64)

    if (input.mouse.y < 64) {
      this.turtleListCxt.fillStyle = '#555555'
      this.turtleListCxt.fillRect(Math.floor(input.mouse.x / 256) * 256, 0, 256, 64)
    }

    this.turtleListCxt.fillStyle = '#444444'
    this.turtleListCxt.fillRect(256 * this.state.selectedTurtle, 0, 256, 64)

    this.turtleListCxt.font = 'bold 16px Arial'
    this.turtleListCxt.textBaseline = 'middle'
    this.turtleListCxt.textAlign = 'center'
    this.turtleListCxt.fillStyle = 'black'

    for (let i = 0; i < this.state.turtleNames.length; i++) {
      this.turtleListCxt.fillText(this.state.turtleNames[i], i * 256 + 128, 32)
    }
  }

  renderInventoryImage(img: HTMLImageElement, count: number, x: number, y: number) {
    // TODO figure out ImageSmoothing stuff
    this.inventoryCxt.imageSmoothingEnabled = false
    // this.inventoryCxt.webkitImageSmoothingEnabled = false
    // this.inventoryCxt.mozImageSmoothingEnabled = false
    // this.inventoryCxt.msImageSmoothingEnabled = false
    this.inventoryCxt.drawImage(img, x * 64, y * 64, 64, 64)

    this.inventoryCxt.fillStyle = '#AAAAAA'
    this.inventoryCxt.beginPath()
    this.inventoryCxt.ellipse(x * 64 + 44, y * 64 + 44, 16, 16, 0, 0, Math.PI * 2)
    this.inventoryCxt.fill()
    this.inventoryCxt.fillStyle = 'black'
    this.inventoryCxt.fillText(count.toString(), x * 64 + 44, y * 64 + 44)
  }

  renderInventoryText(text: string, count: number, x: number, y: number) {
    if (this.state.inventory[this.state.turtleNames[this.state.selectedTurtle]][x + 4 * y].name != '') {
      const textCanvas = document.createElement('canvas')

      const textCxt = textCanvas.getContext('2d')!

      textCanvas.id = 'textrotate'
      textCanvas.width = 128
      textCanvas.height = 128

      textCxt.translate(64, 64)
      textCxt.rotate(-Math.PI / 6)
      textCxt.font = 'bold 10px Arial'
      textCxt.textBaseline = 'middle'
      textCxt.textAlign = 'center'
      textCxt.fillText(text, 0, 0)
      textCxt.rotate(Math.PI / 6)
      textCxt.translate(-64, -64)

      this.inventoryCxt.drawImage(textCanvas, x * 64 - 36, y * 64 - 36)

      this.inventoryCxt.fillStyle = '#AAAAAA'
      this.inventoryCxt.beginPath()
      this.inventoryCxt.ellipse(x * 64 + 44, y * 64 + 44, 16, 16, 0, 0, Math.PI * 2)
      this.inventoryCxt.fill()
      this.inventoryCxt.fillStyle = 'black'
      this.inventoryCxt.fillText(count.toString(), x * 64 + 44, y * 64 + 44)
    }
  }

  renderInventory() {
    this.inventoryCxt.fillStyle = 'gray'
    this.inventoryCxt.fillRect(0, 0, 256, 256)

    this.inventoryCxt.font = 'bold 16px Arial'
    this.inventoryCxt.textBaseline = 'middle'
    this.inventoryCxt.textAlign = 'center'

    if (this.images[this.state.turtleNames[this.state.selectedTurtle]] !== undefined) {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (this.images[this.state.turtleNames[this.state.selectedTurtle]][x + 4 * y].src.endsWith('png')) {
            this.renderInventoryImage(
              this.images[this.state.turtleNames[this.state.selectedTurtle]][x + 4 * y],
              this.state.inventory[this.state.turtleNames[this.state.selectedTurtle]][x + 4 * y].count,
              x,
              y
            )
          } else {
            this.renderInventoryText(
              this.state.inventory[this.state.turtleNames[this.state.selectedTurtle]][x + 4 * y].name.split(':')[1],
              this.state.inventory[this.state.turtleNames[this.state.selectedTurtle]][x + 4 * y].count,
              x,
              y
            )
          }
        }
      }
    }
  }

  inventorySelection(x: number, y: number) {
    if (this.state.turtles[this.state.selectedTurtle] != null) {
      this.inventoryCxt.strokeStyle = 'green'
      this.inventoryCxt.beginPath()
      this.inventoryCxt.rect(
        ((this.state.turtles[this.state.selectedTurtle].slot - 1) % 4) * 64,
        Math.floor((this.state.turtles[this.state.selectedTurtle].slot - 1) / 4) * 64,
        64,
        64
      )
      this.inventoryCxt.stroke()
    }

    if (x < 256 && y < 256 && y > 0) {
      this.inventoryCxt.strokeStyle = 'black'
      this.inventoryCxt.beginPath()
      this.inventoryCxt.rect(Math.floor(x / 64) * 64, Math.floor(y / 64) * 64, 64, 64)
      this.inventoryCxt.stroke()
    }
  }
}
