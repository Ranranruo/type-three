import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface IGeometryHelper {
  createGeometry: () => THREE.BufferGeometry;
  createGUI: (update: () => void) => void;
}

// class ConeGeometryHelper implements IGeometryHelper {
//   private args = {
//     radius
//   }
// }

class CircleGeometryHelper implements IGeometryHelper {
  private args = {
    radius: 1, // 원의 반지름
    segments: 32, // 세그먼트
    thetaStart: 0, // 시작 각도
    thetLength: 360 // 시작 각도부터 추가될 각도
  }
  createGeometry() {
    return new THREE.CircleGeometry(
      this.args.radius,
      this.args.segments,
      THREE.MathUtils.degToRad(this.args.thetaStart), // 라디안 값으로 전환
      THREE.MathUtils.degToRad(this.args.thetLength) // 라디안 값으로 전환
    )
  }
  createGUI(update: () => void) {
    const gui = new GUI();
    gui.add(this.args, "radius", .1, 1, .01).onChange(update);
    gui.add(this.args, "segments", 1, 64, 1).onChange(update);
    gui.add(this.args, "thetaStart", 0, 360, .1).onChange(update);
    gui.add(this.args, "thetLength", 0, 360, .1).onChange(update);
  }
}

class BoxGeometryHelper implements IGeometryHelper {
  private args = {
    width: 1, // 넓이 (X)
    height: 1, // 높이 (Y)
    depth: 1, // 깊이 (Z)
    widthSegments: 1, // 넓이 세그먼트 (X)
    heightSegments: 1, // 높이 세그먼트 (Y)
    depthSegments: 1 // 깊이 세그먼트 (Z)
  }
  createGeometry() {
    return new THREE.BoxGeometry(
      this.args.width,
      this.args.height,
      this.args.depth,
      this.args.widthSegments,
      this.args.heightSegments,
      this.args.depthSegments
    );
  };
  createGUI(update: () => void){
        const gui = new GUI();
        gui.add(this.args, "width", 0.1, 10, 0.01).onChange(update);
        gui.add(this.args, "height", 0.1, 10, 0.01).onChange(update);
        gui.add(this.args, "depth", 0.1, 10, 0.01).onChange(update);
        gui.add(this.args, "widthSegments", 0.1, 10, 0.01).onChange(update);
        gui.add(this.args, "heightSegments", 0.1, 10, 0.01).onChange(update);
        gui.add(this.args, "depthSegments", 0.1, 10, 0.01).onChange(update);
  }
}

class App {
  private renderer: THREE.WebGLRenderer;
  private domApp: Element;
  private scene: THREE.Scene;
  private camera?: THREE.PerspectiveCamera; // ? 는 undeifned를 가질 수 있음
  private cube?: THREE.Mesh;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({antialias: true}) // 안티 앨리어싱 사용

    // 픽셀 비율 맞추기 2보다 크면 체감도 잘안되고 렌더링에 영향을 미칠 수 있어 최대 2까지로 설정
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)) 

    // renderer객체 안에 DOM이 있다.
    this.domApp = document.querySelector("#app")!; // ! 는 querySelector() 반환값이 절대 null일 수 없을때 사용
    
    // domApp 요소에 renderer의 DOM을 자식으로 추가해야함
    this.domApp.appendChild(this.renderer.domElement); // canvas 태그의 dom 객체임

    // Scene 생성
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x00000000, 1, 3.5);

    // 모델생성하는 메서드 호출
    this.setupCamera();
    this.setupLight();
    this.setHelpers();
    this.setupModels();
    this.setupControls();
    this.setupEvents();
  }
  private setupCamera() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;

    this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 100)
    this.camera.position.z = 2;
  }
  private setupLight() {
    // const color = 0xffffff;
    // const intensity = 1;
    // const light = new THREE.DirectionalLight(color, intensity);
    // light.position.set(-1, 2, 4);

    // this.scene.add(light);

    const lights: THREE.DirectionalLight[] = [];
    for (let i = 0; i < 3; i++) {
      lights[i] = new THREE.DirectionalLight(0xffffff, 3);
      this.scene.add(lights[i]);

    }
      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(-100, -200, -100);

  }

  private setHelpers() {
    const axes = new THREE.AxesHelper(10);
    this.scene.add(axes);

    const grid = new THREE.GridHelper(5, 20, 0xffffff, 0x444444);
    this.scene.add(grid);
  }

  private setupModels() {
    // Mesh 제질 만들기
    const meshMaterial = new THREE.MeshPhongMaterial({
      color: 0x156289,
      flatShading: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: .75
    })

    // 외각선 제질
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: .8
    })

    // const geometryHelper = new BoxGeometryHelper();
    const geometryHelper = new CircleGeometryHelper();

    const createModel = () => {
      // 지오메트리 생성
      const geometry = geometryHelper.createGeometry();

      const lineGeometry = new THREE.WireframeGeometry(geometry);
  
      // mesh 생성
      const mesh = new THREE.Mesh(geometry, meshMaterial);
  
      // 외각선 생성
      const line = new THREE.LineSegments(lineGeometry, lineMaterial);
  
      // 그룹 생성
      const group: THREE.Group = new THREE.Group()
  
      // 그룹 이름 정의
      group.name = "myModel"
  
      // 그룹에 mesh 와 line 추가
      group.add(mesh, line);
  
      const oldGroup = this.scene.getObjectByName("myModel")
      if(oldGroup) {
        (oldGroup.children[0] as THREE.Mesh).geometry.dispose(); // 사용하지 않는 gpu 메모리 회수
        (oldGroup.children[1] as THREE.LineSegments).geometry.dispose();
        this.scene.remove(oldGroup);
      }

      // scene 에 그룹 추가
      this.scene.add(group);
    }

    createModel();
    geometryHelper.createGUI(createModel);
  }

  private setupControls() {
    new OrbitControls(this.camera!, this.domApp! as HTMLElement); // 카메라와 이벤트를 받을 html
  }

  private setupEvents() {
    window.onresize = this.resize.bind(this);
    this.resize();
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  private resize() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;

    const camera = this.camera;
    if(camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    this.renderer.setSize(width, height);
  }

  private update (time: number) {
    time *= 0.001 // 밀리세컨드를 그냥 세컨드 단위로 변환

    // 자동 회전
    // const cube = this.scene.getObjectByName("myModel");
    // if(cube) {
    //   cube.rotation.x = time % 360;
    //   cube.rotation.y = time % 360;
    // }
  }

  // time 에는 렌더링 시작후 경과 시간을 밀리세컨드 단위로 들어감
  private render(time: number) {
    this.update(time);
    this.renderer.render(this.scene, this.camera!)
  }
}

new App();