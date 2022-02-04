class Render {
  constructor(THREE, scene, state) {
    this.scene = scene;
    this.state = state;

    this.images = {};

    this.cubes = [];

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.raycaster = new THREE.Raycaster();
    this.INTERSECTED;

    this.camRotX = 0;
    this.camRotY = 0;
    this.camDist = 2;

    this.bb = new THREE.Box3();

    this.positionGoals = [];

    const turtleListCanvas = document.createElement("canvas");
    this.turtleListCxt = turtleListCanvas.getContext("2d");
    turtleListCanvas.id = "turtleList";
    turtleListCanvas.width = window.innerWidth;
    turtleListCanvas.height = 64;
    document.body.appendChild(turtleListCanvas);

    const inventoryCanvas = document.createElement("canvas");
    this.inventoryCxt = inventoryCanvas.getContext("2d");
    inventoryCanvas.id = "inventory";
    inventoryCanvas.width = 256;
    inventoryCanvas.height = 256;
    document.body.appendChild(inventoryCanvas);

    this.controls = document.createElement("div");
    this.controls.id = "controls";
    document.body.appendChild(this.controls);

    clearWaste = document.createElement("button");
    clearWaste.id = "auto-mine";
    clearWaste.innerHTML = "Clear Waste";
    clearWaste.onclick = () => {
      state.turtles[state.selectedTurtle].clearWaste();
    };
    this.controls.appendChild(clearWaste);

    autoMine = document.createElement("button");
    autoMine.id = "auto-mine";
    autoMine.innerHTML = "Auto Mine";
    autoMine.onclick = () => {
      state.turtles[state.selectedTurtle].autoMine();
    };
    this.controls.appendChild(autoMine);

    autoMineForward = document.createElement("input");
    autoMineForward.id = "auto-mine-forward";
    autoMineForward.type = "number";
    autoMineForward.value = 5;
    autoMineForward.min = 1;
    autoMineForward.max = 50;
    this.controls.appendChild(autoMineForward);

    autoMineRight = document.createElement("input");
    autoMineRight.id = "auto-mine-right";
    autoMineRight.type = "number";
    autoMineRight.value = 5;
    autoMineRight.min = 1;
    autoMineRight.max = 20;
    this.controls.appendChild(autoMineRight);
  }

  loadTurtle(THREE, Turtle, state, loader, turtleSocket, scene) {
    loader.load(
      "models/turtle/gltf/turtle.glb",
      function (gltf) {
        console.log("Loading model!");

        console.log(gltf.scene);

        state.turtleModels[state.turtleModels.length] = gltf.scene;
        state.turtleModels[
          state.turtleModels.length - 1
        ].children[0].material.map.minFilter = THREE.NearestFilter;
        state.turtleModels[
          state.turtleModels.length - 1
        ].children[0].material.map.magFilter = THREE.NearestFilter;

        scene.add(gltf.scene);

        state.turtles[state.turtleModels.length - 1] = new Turtle(
          state.turtleNames[state.turtleModels.length - 1],
          gltf.scene,
          turtleSocket
        );
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

  blockHighlight(block) {
    if (this.INTERSECTED)
      this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);

    this.INTERSECTED = block.object;

    this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
    this.INTERSECTED.material.color.setHex(0xff0000);

    for (let j = 0; j < this.state.blocks.length; j++) {
      if (this.state.blocks[j][0] === this.INTERSECTED) {
        console.log(this.state.blocks[j][1]);
      }
    }
  }

  updateTurtle(i) {
    const turtle = this.state.turtleNames[i];

    const betweenPos = this.state.positions[turtle];
    const pos = betweenPos.split(";")[1].split(",");
    this.state.turtleModels[i].position.set(
      parseInt(pos[0]),
      parseInt(pos[1]),
      -parseInt(pos[2])
    );

    this.state.turtles[i].rotation = parseInt(betweenPos.split(";")[0]);
    this.state.turtles[i].updateRotation();
  }

  removeBlock(scene, i) {
    for (let j = 0; j < this.cubes.length; j++) {
      if (scene.children[i] === this.cubes[j]) {
        for (let k = 0; k < this.state.blocks.length; k++) {
          if (this.state.blocks[k][0] === this.cubes[j]) {
            this.cubes.splice(j, 1);
            this.state.blocks.splice(k, 1);
          }
        }
      }
    }
    let clearChild = true;

    for (let j = 0; j < this.state.turtleModels.length; j++) {
      if (scene.children[i] === this.state.turtleModels[j]) {
        clearChild = false;
      }
    }

    if (clearChild) {
      scene.children.splice(i, 1);

      return true;
    }
    return false;
  }

  removeBlocks(scene, position) {
    let loop = true;
    while (loop) {
      loop = false;
      for (let i = 0; i < scene.children.length; i++) {
        this.bb.setFromObject(scene.children[i]);
        if (this.bb.containsPoint(position)) {
          loop = this.removeBlock(scene, i);
        }
      }
    }
  }

  updateCamera() {
    this.camera.position.set(
      this.state.turtleModels[this.state.selectedTurtle].position.x +
        Math.cos(this.camRotX) * Math.cos(this.camRotY) * this.camDist,
      this.state.turtleModels[this.state.selectedTurtle].position.y +
        Math.sin(this.camRotY) * this.camDist,
      this.state.turtleModels[this.state.selectedTurtle].position.z +
        Math.sin(this.camRotX) * Math.cos(this.camRotY) * this.camDist
    );

    this.removeBlocks(
      this.scene,
      this.state.turtleModels[this.state.selectedTurtle].position
    );

    this.camera.lookAt(
      this.state.turtleModels[this.state.selectedTurtle].position
    );

    this.camera.updateMatrixWorld();
  }

  mainRender(input) {
    if (this.state.turtleModels.length > 0) {
      if (this.state.turtles.length !== 0 && this.state.positions !== []) {
        for (let i = 0; i < this.state.turtleModels.length; i++) {
          this.updateTurtle(i);
        }
      }

      this.updateCamera();
    }

    this.raycaster.setFromCamera(input.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(this.cubes);

    if (intersects.length > 0) {
      if (intersects[0] != null && this.INTERSECTED != intersects[0].object) {
        this.blockHighlight(intersects[0]);
      }
    } else {
      if (this.INTERSECTED)
        this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);

      this.INTERSECTED = null;
    }
  }

  renderTurtleList(input) {
    this.turtleListCxt.fillStyle = "#666666";
    this.turtleListCxt.fillRect(0, 0, window.innerWidth, 64);

    if (input.mouse.y < 64) {
      this.turtleListCxt.fillStyle = "#555555";
      this.turtleListCxt.fillRect(
        Math.floor(input.mouse.x / 256) * 256,
        0,
        256,
        64
      );
    }

    this.turtleListCxt.fillStyle = "#444444";
    this.turtleListCxt.fillRect(256 * this.state.selectedTurtle, 0, 256, 64);

    this.turtleListCxt.font = "bold 16px Arial";
    this.turtleListCxt.textBaseline = "middle";
    this.turtleListCxt.textAlign = "center";
    this.turtleListCxt.fillStyle = "black";

    for (let i = 0; i < this.state.turtleNames.length; i++) {
      this.turtleListCxt.fillText(this.state.turtleNames[i], i * 256 + 128, 32);
    }
  }

  renderInventoryImage(img, count, x, y) {
    this.inventoryCxt.imageSmoothingEnabled = false;
    this.inventoryCxt.webkitImageSmoothingEnabled = false;
    this.inventoryCxt.mozImageSmoothingEnabled = false;
    this.inventoryCxt.msImageSmoothingEnabled = false;
    this.inventoryCxt.drawImage(img, x * 64, y * 64, 64, 64);

    this.inventoryCxt.fillStyle = "#AAAAAA";
    this.inventoryCxt.beginPath();
    this.inventoryCxt.ellipse(
      x * 64 + 44,
      y * 64 + 44,
      16,
      16,
      0,
      0,
      Math.PI * 2
    );
    this.inventoryCxt.fill();
    this.inventoryCxt.fillStyle = "black";
    this.inventoryCxt.fillText(count, x * 64 + 44, y * 64 + 44);
  }

  renderInventoryText(text, count, x, y) {
    if (
      !this.state.inventory[this.state.turtleNames[this.state.selectedTurtle]][
        x + 4 * y
      ][0].endsWith("air")
    ) {
      const textCanvas = document.createElement("canvas");

      const textCxt = textCanvas.getContext("2d");

      textCanvas.id = "textrotate";
      textCanvas.width = 128;
      textCanvas.height = 128;

      textCxt.translate(64, 64);
      textCxt.rotate(-Math.PI / 6);
      textCxt.font = "bold 10px Arial";
      textCxt.textBaseline = "middle";
      textCxt.textAlign = "center";
      textCxt.fillText(text, 0, 0);
      textCxt.rotate(Math.PI / 6);
      textCxt.translate(-64, -64);

      this.inventoryCxt.drawImage(textCanvas, x * 64 - 36, y * 64 - 36);

      this.inventoryCxt.fillStyle = "#AAAAAA";
      this.inventoryCxt.beginPath();
      this.inventoryCxt.ellipse(
        x * 64 + 44,
        y * 64 + 44,
        16,
        16,
        0,
        0,
        Math.PI * 2
      );
      this.inventoryCxt.fill();
      this.inventoryCxt.fillStyle = "black";
      this.inventoryCxt.fillText(count, x * 64 + 44, y * 64 + 44);
    }
  }

  renderInventory() {
    this.inventoryCxt.fillStyle = "gray";
    this.inventoryCxt.fillRect(0, 0, 256, 256);

    this.inventoryCxt.font = "bold 16px Arial";
    this.inventoryCxt.textBaseline = "middle";
    this.inventoryCxt.textAlign = "center";

    if (Object.keys(this.state.inventory).length !== 0) {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (
            this.images[this.state.turtleNames[this.state.selectedTurtle]][
              x + 4 * y
            ].src.endsWith("png")
          ) {
            this.renderInventoryImage(
              this.images[this.state.turtleNames[this.state.selectedTurtle]][
                x + 4 * y
              ],
              this.state.inventory[
                this.state.turtleNames[this.state.selectedTurtle]
              ][x + 4 * y][1],
              x,
              y
            );
          } else {
            this.renderInventoryText(
              this.state.inventory[
                this.state.turtleNames[this.state.selectedTurtle]
              ][x + 4 * y][0].split(":")[1],
              this.state.inventory[
                this.state.turtleNames[this.state.selectedTurtle]
              ][x + 4 * y][1],
              x,
              y
            );
          }
        }
      }
    }
  }

  inventorySelection(x, y) {
    if (this.state.turtles[this.state.selectedTurtle] != null) {
      this.inventoryCxt.strokeStyle = "green";
      this.inventoryCxt.beginPath();
      this.inventoryCxt.rect(
        ((this.state.turtles[this.state.selectedTurtle].slot - 1) % 4) * 64,
        Math.floor(
          (this.state.turtles[this.state.selectedTurtle].slot - 1) / 4
        ) * 64,
        64,
        64
      );
      this.inventoryCxt.stroke();
    }

    if (x < 256 && y < 256 && y > 0) {
      this.inventoryCxt.strokeStyle = "black";
      this.inventoryCxt.beginPath();
      this.inventoryCxt.rect(
        Math.floor(x / 64) * 64,
        Math.floor(y / 64) * 64,
        64,
        64
      );
      this.inventoryCxt.stroke();
    }
  }
}

module.exports = Render;
