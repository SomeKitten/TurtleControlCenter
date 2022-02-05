class State {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;

    this.turtleModels = [];
    this.turtleNames = [];
    this.reverseNames = [];
    this.selectedTurtle = 0;
    this.loadedTurtles = 0;
    this.turtles = [];
    this.inventory = [];
    this.positions = [];
    this.blocks = [];
    this.geometry = new THREE.BoxGeometry();

    window.turtles = this.turtles;
  }

  movement(keyCode) {
    if (keyCode === "KeyW") {
      this.turtles[this.selectedTurtle].forward();
    } else if (keyCode === "KeyS") {
      this.turtles[this.selectedTurtle].back();
    } else if (keyCode === "KeyA") {
      this.turtles[this.selectedTurtle].turnLeft();
    } else if (keyCode === "KeyD") {
      this.turtles[this.selectedTurtle].turnRight();
    } else if (keyCode === "Space") {
      this.turtles[this.selectedTurtle].up();
    } else if (keyCode === "KeyX") {
      this.turtles[this.selectedTurtle].down();
    }
  }

  addBlock(render, pos, type) {
    render.removeBlocks(
      this.scene,
      new this.THREE.Vector3(pos[0], pos[1], -pos[2])
    );

    if (type !== "minecraft:air") {
      let texture;
      if (render.materials[type] === undefined) {
        if (this.fileExists("textures/block/" + type.split(":")[1] + ".png")) {
          texture = new this.THREE.TextureLoader().load(
            "textures/block/" + type.split(":")[1] + ".png"
          );
        } else {
          texture = this.blockTextTexture(type.split(":")[1]);
        }

        texture.minFilter = this.THREE.NearestFilter;
        texture.magFilter = this.THREE.NearestFilter;

        render.materials[type] = new this.THREE.MeshBasicMaterial({
          map: texture,
        });
      }

      const cube = new this.THREE.Mesh(this.geometry, render.materials[type]);

      this.scene.add(cube);
      cube.position.set(pos[0], pos[1], -pos[2]);

      render.cubes.push(cube);
      this.blocks.push([cube, type]);
    }
  }

  addBlocks(render, new_blocks) {
    for (let i = 0; i < new_blocks.length; i++) {
      if (typeof new_blocks[i] !== "string") {
        this.addBlock(render, new_blocks[i][0], new_blocks[i][1]);
      } else {
        // console.log("Malformed parse!");
      }
    }
  }

  blockTextTexture(block) {
    const canvas = document.createElement("canvas");
    canvas.height = 256;
    canvas.width = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, 256, 256);

    ctx.font = "32px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(block, 128, 128);

    return new this.THREE.CanvasTexture(canvas);
  }

  setPos(pos) {
    this.positions = pos;
  }

  fileExists(url) {
    var http = new XMLHttpRequest();
    http.open("HEAD", url, false);
    http.send();
    return http.status != 404;
  }

  getImageFromItem(img, item) {
    if (this.fileExists("textures/item/" + item + ".png")) {
      img.src = "textures/item/" + item + ".png";
    } else if (this.fileExists("textures/block/" + item + ".png")) {
      img.src = "textures/block/" + item + ".png";
    } else {
      console.log("UNKNOWN: " + item);
      img.src = "";
    }
  }

  getImagesFromItems(imgs, items) {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        imgs[x + 4 * y] = document.createElement("img");
        this.getImageFromItem(
          imgs[x + 4 * y],
          items[x + 4 * y].name.split(":")[1]
        );
      }
    }
  }

  setInventory(render, inv) {
    this.inventory = inv;

    for (let i = 0; i < this.turtleNames.length; i++) {
      const name = this.turtleNames[i];
      if (this.inventory[name].length > 0) {
        render.images[name] = [];

        this.getImagesFromItems(render.images[name], this.inventory[name]);
      }
    }
  }
}

module.exports = State;
