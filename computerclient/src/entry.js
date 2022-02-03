import css from "./main.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Input from "./input";
import Connection from "./connection";

const Turtle = require("./turtle");
const Render = require("./render");
const State = require("./state");

const loader = new GLTFLoader();

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = "main";
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

const input = new Input(THREE);
const state = new State(THREE, scene); // turtleModels turtleNames reverseNames selectedTurtle loadedTurtles
const render = new Render(THREE, scene, state); // images cubes camera raycaster INTERSECTED pointer camRotX camRotY camDist bb
const connection = new Connection(
  state,
  render,
  "ws://server.cutekitten.space:63617"
);

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.code;

  input.key(state, keyCode);
}

window.addEventListener("resize", onWindowResize);
function onWindowResize() {
  render.camera.aspect = window.innerWidth / window.innerHeight;
  render.camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  turtleList.width = window.innerWidth;
}

document.onmousedown = function () {
  input.mouseDown(state);
};

document.onmouseup = function () {
  input.isMouseDown = false;
};
document.addEventListener("mousemove", onPointerMove);
function onPointerMove(event) {
  input.mouseMove(
    render,
    event.clientX,
    event.clientY,
    event.movementX,
    event.movementY
  );
}

window.addEventListener("wheel", onScroll);
function onScroll(event) {
  input.scroll(render, event.deltaY);
}

const animate = function () {
  requestAnimationFrame(animate);

  for (let i = state.loadedTurtles; i < state.turtleNames.length; i++) {
    render.loadTurtle(
      THREE,
      Turtle,
      state,
      loader,
      connection.turtleSocket,
      scene
    );

    state.loadedTurtles++;
  }

  render.mainRender(input);

  renderer.render(scene, render.camera);

  render.renderTurtleList(input);

  render.renderInventory();

  render.inventorySelection(input.mouse.x, input.mouse.y - 64);

  if (
    connection.turtleSocket.readyState != WebSocket.CONNECTING &&
    connection.turtleSocket.readyState != WebSocket.CLOSED
  ) {
    connection.turtleSocket.send("Gimme!");
  }
};

animate();
