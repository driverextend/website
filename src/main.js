import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/Addons.js";

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1000);
pointLight.position.set(
  camera.position.x,
  camera.position.y,
  camera.position.z
);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

const loader = new FontLoader();

const matrixCharacters = Array.from(
  "blaneherndonBLANEHERNDON1234567890-=[]\\;',./!@#$%^&*()_+{}|:<>?"
);

function addMatrixCharacter() {
  loader.load("src/fonts/helvetiker_regular.typeface.json", function (font) {
    const geometry = new TextGeometry(
      matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)],
      {
        font: font,
        size: 3,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5,
      }
    );

    // Create materials inside the loader callback
    const materials = [
      new THREE.MeshPhongMaterial({
        color: 0x00ff41,
        flatShading: true,
      }), // front
      new THREE.MeshPhongMaterial({
        color: 0x008f11,
      }), // side
    ];

    const matrixCharacter = new THREE.Mesh(geometry, materials);
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(100));

    matrixCharacter.position.set(x, y, z);

    scene.add(matrixCharacter);
  });
}

Array(100).fill().forEach(addMatrixCharacter);

// Avatar;

const blaneTexture = new THREE.TextureLoader().load("src/img/blane.png");

const blane = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshStandardMaterial({
    map: blaneTexture,
    metalness: 0.0, // Lower values make it less shiny
    roughness: 0.8, // Higher values make it more diffuse
  })
);
scene.add(blane);

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  blane.rotation.y += 0.01;
  blane.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  // controls.update();

  renderer.render(scene, camera);
}

animate();
