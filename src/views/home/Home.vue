<template>
  <div class="myThreePage flexBox">
    <div id="myThree"></div>
    <div id="dynamic" v-show="dynamicShow"></div>
    <div id="dynamic2" v-show="dynamicShow"></div>

    <div id="myToolBar" class="myToolBar">
      <el-button icon="el-icon-s-home"></el-button>
      <el-button
        icon="el-icon-add-location"
        @click="addCoordinatePointBtn"
      ></el-button>
      <el-button icon="el-icon-edit-outline"></el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "index",
  // components: {
  //   progressPage,
  //   hearder,
  //   leftPanel,
  // },
  data: function (params) {
    return {
      camera: null,
      nameNode: null,
      xStip: null,
      zStip: null,
      rotationY: null,
      rotationZ: null,
      scene: null,
      renderer: null,
      dynamicShow: true,
    };
  },
  mounted() {
    const that = this;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.z = 10;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.threeDom = document.getElementById("myThree");

    // that.camera.lookAt(new THREE.Vector3(0, 0, 0));
    var canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    document.getElementById("myThree").appendChild(canvas);
    // var controls = new THREE.OrbitControls(that.camera, canvas);
    // controls.update();
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    this.scene.add(new THREE.AmbientLight(0xffffff));
    OkayPoints.Global.workerPath = "./source";
    this.scene.add(new THREE.AxesHelper(10));
    this.loop();

    this.loadPointCloud("http://172.16.14.188:5500/data/by3/cloud.js"); // 增加模型
    // console.log("1212");

    document.body.onresize = function () {
      var width = that.threeDom.getBoundingClientRect().width;
      var height = that.threeDom.getBoundingClientRect().height;
      console.log(width, height);
      that.renderer.setSize(width, height);
      that.camera.aspect = width / height;
      that.camera.updateProjectionMatrix();
    };
    document.body.onresize();

    this.creadHandle(); // 创建手柄
  },
  methods: {
    creadHandle() {
      const that = this;
      var joystick = nipplejs.create({
        zone: document.getElementById("dynamic"),
        mode: 'static',
        position: { left: "50%", top: "50%" },
        color: "green",
        size: 200,
      });
      var joystick2 = nipplejs.create({
        zone: document.getElementById("dynamic2"),
        mode: 'static',
        position: { left: "50%", top: "50%" },
        color: "green",
        size: 200,
      });

      joystick
        .on("start end", function (evt, data) {
          if (evt.type === "end") {
            that.xStip = 0;
            that.zStip = 0;
            console.log("end", that.camera.position);
          }
        })
        .on("move", function (evt, data) {
          // console.log(data)
          if (!data.direction) {
            return;
          }
          let distance = data.distance;
          switch (data.direction.angle) {
            case "up":
              that.zStip =
                (0.2 * Math.cos(that.camera.rotation.y + Math.PI) * distance) /
                100;
              that.xStip =
                (0.2 * Math.sin(that.camera.rotation.y + Math.PI) * distance) /
                100;
              break;
            case "down":
              that.zStip =
                (0.2 * Math.cos(that.camera.rotation.y) * distance) / 100;
              that.xStip =
                (0.2 * Math.sin(that.camera.rotation.y) * distance) / 100;
              break;
            case "left":
              that.xStip =
                (0.2 * Math.cos(that.camera.rotation.y + Math.PI) * distance) /
                100;
              that.zStip =
                (0.2 * Math.sin(that.camera.rotation.y) * distance) / 100;
              break;
            case "right":
              that.xStip =
                (0.2 * Math.cos(that.camera.rotation.y) * distance) / 100;
              that.zStip =
                (0.2 * Math.sin(that.camera.rotation.y + Math.PI) * distance) /
                100;
              break;

            default:
              break;
          }
        })
        .on(
          "dir:up plain:up dir:left plain:left dir:down " +
            "plain:down dir:right plain:right",
          function (evt, data) {}
        )
        .on("pressure", function (evt, data) {
          // debug({ pressure: data });
          console.log("结束", data);
        });

      joystick2
        .on("start end", function (evt, data) {
          console.log("开始", evt.type);
          if (evt.type === "end") {
            that.rotationY = 0;
            that.rotationZ = 0;
            console.log("结束", that.camera.rotation);
          }
        })
        .on("move", function (evt, data) {
          // console.log(data);

          if (!data.direction) {
            return;
          }
          let distance = data.distance;
          switch (data.direction.angle) {
            case "up":
              that.rotationZ = (0.04 * distance) / 100;
              break;
            case "down":
              that.rotationZ = (-0.04 * distance) / 100;
              break;
            case "left":
              that.rotationY = (0.04 * distance) / 100;
              break;
            case "right":
              that.rotationY = (-0.04 * distance) / 100;
              break;

            default:
              break;
          }
        })
        .on(
          "dir:up plain:up dir:left plain:left dir:down " +
            "plain:down dir:right plain:right",
          function (evt, data) {
            // console.log(data.direction, that.camera.position)
          }
        )
        .on("pressure", function (evt, data) {
          // debug({ pressure: data });
        });
    },
    loadPointCloud(url, position) {
      const that = this;
      OkayPoints.loadPointCloud(url, "pointcloud", function (e) {
        var points = new OkayPoints.Group();
        points.material.opacity = 0.0;
        points.material.wireframe = true;
        that.scene.add(points);

        var pointcloud = e.pointcloud;

        if (position !== undefined) {
          pointcloud.position.copy(position);
        }

        var material = pointcloud.material;
        material.size = 2;
        material.pointColorType = OkayPoints.PointColorType.RGB; //RGB | DEPTH | HEIGHT | POINT_INDEX | LOD | CLASSIFICATION
        material.pointSizeType = OkayPoints.PointSizeType.ADAPTIVE; //ADAPTIVE | FIXED
        material.shape = OkayPoints.PointShape.CIRCLE; //CIRCLE | SQUARE

        points.add(pointcloud);
        that.nameNode = that.scene.getObjectByName("pointcloud");
      });
    },
    loop() {
      const that = this;
      that.camera.position.x += that.xStip;
      that.camera.position.z += that.zStip;
      that.camera.position.y += that.rotationZ;
      that.camera.rotation.y += that.rotationY;

      that.camera.updateProjectionMatrix();
      // controls.update();
      this.renderer.render(that.scene, that.camera);

      requestAnimationFrame(this.loop);
    },
    addCoordinatePointBtn() {
      // this.dynamicShow = false; // 隐藏手柄
      this.threeDom.removeEventListener(
        "click",
        this.addCoordinatePointThree,
        false
      );
      this.threeDom.addEventListener(
        "click",
        this.addCoordinatePointThree,
        false
      );
    },
    addCoordinatePointThree(event) {
      this.setIntersects(event, this.nameNode.children, (intersects) => {
        if (intersects.length > 0) {
          console.log(intersects);

          if (this.cylinder) {
            this.scene.remove(this.cylinder);
            this.cylinder = null;
          }
          var geometry = new THREE.CylinderGeometry(0.1, 0.12, 0.02, 32);
          var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
          this.cylinder = new THREE.Mesh(geometry, material);
          this.cylinder.position.copy(intersects[0].point);
          this.scene.add(this.cylinder); //网格模型添加到场景中
        }
      });
    },
    setIntersects(event, obj, callback) {
      const that = this;
      event.preventDefault();
      // console.log('offsetLeft', event)
      this.mouse.x =
        (event.offsetX / this.threeDom.getBoundingClientRect().width) * 2 - 1;
      this.mouse.y =
        -(event.offsetY / this.threeDom.getBoundingClientRect().height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      let intersects = this.raycaster.intersectObjects(obj);
      callback(intersects);
    },
  },
};
</script>
<style lang="scss">
.myThreePage {
  .myToolBar {
    .el-button {
      border: 1px dashed transparent;
      padding: 0px 20px;
      font-size: 20px;
      border-radius: 4px;
      border-right-color: #ccc;
    }
    .el-button:last-child {
      border-right: none;
    }
  }
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.myThreePage {
  width: 100%;
  height: 100%;
  // display: flex;
  // flex-direction: column;
  .myToolBar {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 10px 5px;
    background-color: #fff;
    border-radius: 5px;
  }
}
#dynamic {
  position: absolute;
  min-width: 300px;
  min-height: 300px;
  width: 30%;
  height: 50%;
  left: 20px;
  bottom: 20px;
  z-index: 2;
}

#dynamic2 {
  position: absolute;
  min-width: 300px;
  min-height: 300px;
  width: 30%;
  height: 50%;
  right: 20px;
  bottom: 20px;
  z-index: 2;
}

#myThree {
  width: 100%;
  height: 100%;
}
</style>
