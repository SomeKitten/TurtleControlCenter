import './main.css'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Input } from './input'
import { Connection } from './connection'

import { Render } from './render'
import { State } from './state'
import { AmbientLight, Scene, WebGLRenderer } from 'three'

const loader = new GLTFLoader()

const scene = new Scene()

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.id = 'main'
document.body.appendChild(renderer.domElement)

const light = new AmbientLight(0xffffff) // soft white light
scene.add(light)

const input = new Input()
const state = new State(scene) // turtleModels turtleNames reverseNames selectedTurtle loadedTurtles
const render = new Render(scene, state) // images cubes camera raycaster INTERSECTED pointer camRotX camRotY camDist bb
const connection = new Connection(state, render, 'ws://server.cutekitten.space:63617')

document.addEventListener('keydown', onDocumentKeyDown, false)
function onDocumentKeyDown(event: KeyboardEvent) {
  var keyCode = event.code

  input.key(state, keyCode)
}

window.addEventListener('resize', onWindowResize)
function onWindowResize() {
  render.camera.aspect = window.innerWidth / window.innerHeight
  render.camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  render.turtleListCanvas.width = window.innerWidth
}

document.onmousedown = function () {
  input.mouseDown(state)
}

document.onmouseup = function () {
  input.isMouseDown = false
}
document.addEventListener('mousemove', onPointerMove)
function onPointerMove(event: MouseEvent) {
  input.mouseMove(render, event.clientX, event.clientY, event.movementX, event.movementY)
}

window.addEventListener('wheel', onScroll)
function onScroll(event: WheelEvent) {
  input.scroll(render, event.deltaY)
}

const animate = function () {
  requestAnimationFrame(animate)

  for (let i = state.loadedTurtles; i < state.turtleNames.length; i++) {
    render.loadTurtle(state, loader, connection.turtleSocket, scene)

    state.loadedTurtles++
  }

  render.mainRender()

  renderer.render(scene, render.camera)

  render.renderTurtleList(input)

  render.renderInventory()

  render.inventorySelection(input.mouse.x, input.mouse.y - 64)

  if (
    connection.turtleSocket.readyState != WebSocket.CONNECTING &&
    connection.turtleSocket.readyState != WebSocket.CLOSED
  ) {
    connection.turtleSocket.send('Gimme!')
  }
}

animate()
