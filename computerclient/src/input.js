class Input {
  constructor(THREE) {
    this.pointer = new THREE.Vector2();
    this.mouse = new THREE.Vector2();

    this.isMouseDown = false;
  }

  key(state, keyCode) {
    state.movement(keyCode);
    if (keyCode === "KeyQ") {
      state.turtles[state.selectedTurtle].placeUp();
    } else if (keyCode === "KeyE") {
      state.turtles[state.selectedTurtle].place();
    } else if (keyCode === "KeyZ") {
      state.turtles[state.selectedTurtle].placeDown();
    }
    if (keyCode === "ArrowLeft") {
      state.selectedTurtle = Math.max(state.selectedTurtle - 1, 0);
    }
    if (keyCode === "ArrowRight") {
      state.selectedTurtle = Math.min(
        state.selectedTurtle + 1,
        turtles.length - 1
      );
    }
    if (keyCode == "KeyR") {
      clipAction.play();
    }
  }

  mouseDown(state) {
    const x = this.mouse.x;
    const y = this.mouse.y - 64;
    if (x < 256 && y < 256 && y > 0) {
      state.turtles[state.selectedTurtle].select(
        Math.floor(x / 64) + Math.floor(y / 64) * 4 + 1
      );
    } else if (y < 0) {
      state.selectedTurtle = Math.min(
        Math.floor(x / 256),
        state.turtles.length - 1
      );
    } else {
      this.isMouseDown = true;
    }
  }

  mouseMove(render, clientX, clientY, movementX, movementY) {
    this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    this.mouse.x = clientX;
    this.mouse.y = clientY;

    if (this.isMouseDown) {
      render.camRotX += movementX * 0.01;
      render.camRotY += movementY * 0.01;

      if (render.camRotY > Math.PI / 2) {
        render.camRotY = Math.PI / 2;
      }
      if (render.camRotY < -Math.PI / 2) {
        render.camRotY = -Math.PI / 2;
      }
    }
  }

  scroll(render, deltaY) {
    render.camDist += deltaY / 200;
    if (render.camDist < 1) {
      render.camDist = 1;
    }
  }
}

module.exports = Input;
