import * as THREE from 'three';

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

    // 모델생성하는 메서드 호출
    this.setupCamera();
    this.setupLight();
    this.setupModels();
    this.setupEvents();
  }
  private setupCamera() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;

    this.camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 100)
    this.camera.position.z = 2;
  }
  private setupLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);

    this.scene.add(light);
  }
  private setupModels() {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // 가로, 세로, 깊이
    const meterial = new THREE.MeshPhongMaterial({color: 0x44aa88}); // 색깔
    this.cube = new THREE.Mesh(geometry, meterial);

    // scene 에 Mesh 추가
    this.scene.add(this.cube);
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

    const cube = this.cube;
    if(cube) {
      cube.rotation.x = time % 360;
      cube.rotation.y = time % 360;
    }
  }

  // time 에는 렌더링 시작후 경과 시간을 밀리세컨드 단위로 들어감
  private render(time: number) {
    this.update(time);
    this.renderer.render(this.scene, this.camera!)
  }
}

new App();