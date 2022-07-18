import {
  Scene,
  Color,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  WebGLRenderer,
  OrthographicCamera,
  SphereGeometry,
  Vector3,
  BoxGeometry,
  MeshStandardMaterial,
  AmbientLight,
  Vector2,
  Intersection,
  Raycaster
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DragControls } from "./DragControls";
import Stats from "stats.js";
import { MouseManager } from "./mouse-manager";

class Main {
  /** The scene */
  public scene: Scene;

  /** The camera */
  public camera: PerspectiveCamera | OrthographicCamera;

  /** The renderer */
  public renderer: WebGLRenderer;

  /** The orbit controls */
  public orbitControls: OrbitControls;

  /** The drag controls */
  public dragControls: DragControls;

  /** The transform controls. */
  public transformControls: TransformControls;

  /** The stats */
  public stats: Stats;

  /** The mouse vector. */
  public mouse = new Vector2();

  /** The cube mesh */
  public cube: Mesh;

  /** The sphere mesh */
  public sphere: Mesh;

  public objectsToDrag: Mesh[] = [];

  /** The raycaster. */
  public raycaster = new Raycaster();

  public mouseManager: MouseManager;

  constructor() {
    this.initViewport();
  }

  /** Initialize the scene. */
  public initScene() {
    this.scene = new Scene();
    this.scene.background = new Color("#191919");
  }

  /** Initialize the camera. */
  public initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(50, aspect, 1, 10_000);
    this.camera.position.z = 700;
  }

  /** Initialize the renderer. */
  public initRenderer() {
    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(() => this.animate()); // uncomment if you want to use the animation loop
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", () => this.onResize());
  }

  /** Initialize the viewport stats. */
  public initStats() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  /** Initialize the orbit control. */
  public initOrbitControls() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.update();
    this.orbitControls.addEventListener("change", () => this.render());
    this.orbitControls.enabled = true;
  }

  /** Initialize the drag controls. */
  public initDragControls(objects: Mesh[]) {
    this.dragControls = new DragControls(
      objects,
      this.camera,
      this.renderer.domElement
    );

    const dragStartHandler = (e: any) => this.onDragStart(e);
    const dragEndHandler = (e: any) => this.onDragEnd(e);
    const dragHandler = (e: any) => this.onDrag(e);

    this.dragControls.addEventListener("dragstart", dragStartHandler);
    this.dragControls.addEventListener("dragend", dragEndHandler);
    this.dragControls.addEventListener("drag", dragHandler);
  }

  /** Initialize the transform controls */
  public initTransformControl(
    camera: PerspectiveCamera | OrthographicCamera,
    renderer: WebGLRenderer
  ) {
    // initialize transform controls.
    this.transformControls = new TransformControls(camera, renderer.domElement);

    // Render on change.
    this.transformControls.addEventListener("change", e => {
      this.render();
    });

    // Enable or disable on dragging-change event.
    this.transformControls.addEventListener("dragging-changed", event => {
      this.orbitControls.enabled = !event.value;
    });
  }

  /** Adds test meshes */
  public addMeshes() {
    // Add test mesh.
    this.cube = this.createCubeMesh();
    this.scene.add(this.cube);

    this.sphere = this.createSphreMesh();
    this.sphere.name = "sphere";
    this.sphere.position.set(-50, 0, 0);
    this.scene.add(this.sphere);
  }

  /** Initialize the viewport */
  public initViewport() {
    // Init scene.
    this.initScene();

    // Init camera.
    this.initCamera();

    // Init renderer.
    this.initRenderer();

    // Init stats.
    this.initStats();

    // Init orbit controls.
    this.initOrbitControls();

    this.initTransformControl(this.camera, this.renderer);

    this.initDragControls(this.objectsToDrag);

    this.mouseManager = new MouseManager(window);
    this.mouseManager.onMouseDown$.subscribe(e => {
      // console.log(e);
      this.selectIntersected(e, this.camera);
    });

    this.mouseManager.onMouseMove$.subscribe(e => {
      // console.log(e);
    });

    this.mouseManager.onMouseUp$.subscribe(e => {
      // console.log(e);
    });

    this.addMeshes();

    // this.objectsToDrag.push(this.cube);
    this.objectsToDrag.push(this.sphere);

    // Add lights
    var light = new AmbientLight(0xffffff, 1); // soft white light
    this.scene.add(light);

    this.render();

    // console.log(this);
  }

  public onDragStart(e: {
    type: "dragstart";
    object: Mesh;
    target: DragControls;
  }) {
    this.orbitControls.enabled = false;

    // console.log(e);

    if (
      e.object.name === "sphere" &&
      this.cube &&
      this.cube.morphTargetInfluences
    ) {
      // console.log("morph: ", this.cube.morphTargetInfluences);
    }

    this.render();
  }

  public onDrag(e: {
    type: "drag";
    object: Mesh;
    position: Vector3;
    target: DragControls;
  }) {
    // const x = e.object.position.x;
    const y = e.object.position.y;
    const z = e.object.position.z;

    const _x = e.position.x;

    if (_x > 0) {
      e.object.position.set(_x, y, z);

      if (
        e.object.name === "sphere" &&
        this.cube &&
        // this.cube.morphTargetInfluences
        this.cube.geometry instanceof BoxGeometry
      ) {
        // console.log(this.cube.geometry);
        // console.log("morph: ", this.cube.morphTargetInfluences);
        // this.cube.morphTargetInfluences[0] = _x / 20;
        // this.cube.morphTargetInfluences[1] = _x / 20;
        // this.cube.morphTargetInfluences[2] = _x / 20;
        // this.cube.morphTargetInfluences[3] = _x / 20;

        this.cube.geometry["vertices"][0].x = _x;
        this.cube.geometry["vertices"][1].x = _x;
        this.cube.geometry["vertices"][2].x = _x;
        this.cube.geometry["vertices"][3].x = _x;
        this.cube.geometry.verticesNeedUpdate = true;
        this.cube.geometry.computeBoundingSphere();
      }
    }
    this.render();
  }

  public onDragEnd(e: { type: "dragend"; object: Mesh; target: DragControls }) {
    this.orbitControls.enabled = true;
    // console.log(e);
    // console.log(e.object.position);
    this.render();
  }

  public selectIntersected(
    mouse: Vector2,
    camera: PerspectiveCamera | OrthographicCamera
  ) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.cube], true);

    if (intersects.length > 0) {
      this.transformControls.attach(intersects[0].object);
      this.scene.add(this.transformControls);
      this.render();
    }
  }

  /** Renders the scene */
  public render() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);

    // const x = this.cube.quaternion.x;
    // const y = this.cube.quaternion.y;
    // const z = this.cube.quaternion.z;
    // const w = this.cube.quaternion.w;

    // const cx = this.camera.quaternion.x;
    // const cy = this.camera.quaternion.y;
    // const cz = this.camera.quaternion.z;
    // const cw = this.camera.quaternion.w;

    // const quaternion = new Quaternion(cx, y, z, w)
    // this.cube.quaternion.copy( quaternion );
    this.stats.end();
  }

  /** Animates the scene */
  public animate() {
    this.stats.begin();

    // this.cube.rotation.x += 0.005;
    // this.cube.rotation.y += 0.001;

    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  /** On resize event */
  public onResize() {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  /** Creates a cube mesh */
  public createCubeMesh() {
    let geometry = new BoxGeometry(100, 100, 100) as any;

    // construct 8 blend shapes

    // for (var i = 0; i < 8; i++) {
    //   var vertices = [];

    //   for (var v = 0; v < geometry.vertices.length; v++) {
    //     vertices.push(geometry.vertices[v].clone());

    //     if (v === i) {
    //       vertices[vertices.length - 1].x *= 2;
    //       vertices[vertices.length - 1].y *= 2;
    //       vertices[vertices.length - 1].z *= 2;
    //     }
    //   }

    //   geometry.morphTargets.push({ name: "target" + i, vertices: vertices });
    // }

    const material = new MeshNormalMaterial({
      // morphTargets: true
    });

    // geometry = new BufferGeometry().fromGeometry(geometry);
    const mesh = new Mesh(geometry, material);
    return mesh;
  }

  /** Creates a cube mesh */
  public createSphreMesh() {
    const geometry = new SphereGeometry(10, 12, 12);
    const material = new MeshStandardMaterial({
      wireframe: false,
      color: 0xffff00,
      depthTest: false,
      opacity: 0.5,
      transparent: true
    });
    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = 100;
    return mesh;
  }
}

new Main();
