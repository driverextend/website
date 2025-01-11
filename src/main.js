import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/Addons.js";

// Add device detection

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  isMobile ? 60 : 75,
  window.innerWidth / window.innerHeight,
  0.1,
  isMobile ? 500 : 1000
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

// Matrix Characters

const loader = new FontLoader();

const matrixCharacters = Array.from(
  "blaneherndonBLANEHERNDON1234567890-=[]\\;',./!@#$%^&*()_+{}|:<>?"
);

function randomMatrixChar() {
  return matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];
}

const CHAR_COUNT = isMobile ? 200 : 1000; // Fewer characters on mobile

// Optimize character creation
const characterPool = [];
const geometries = {};

function createGeometry(char, font) {
  if (!geometries[char]) {
    geometries[char] = new TextGeometry(char, {
      font: font,
      size: isMobile ? 0.5 : 1,
      height: 0.2,
      curveSegments: isMobile ? 6 : 12,
      bevelEnabled: false,
    });
  }
  return geometries[char];
}

function addMatrixCharacter() {
  loader.load("./fonts/helvetiker_regular.typeface.json", function (font) {
    const initialChar = randomMatrixChar();
    const geometry = createGeometry(initialChar, font);
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x00ff41 }), // front
      new THREE.MeshPhongMaterial({ color: 0x008f11 }), // side
    ];

    const matrixCharacter = new THREE.Mesh(geometry, materials);
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(isMobile ? 50 : 100));
    matrixCharacter.position.set(x, y, z);

    characterPool.push(matrixCharacter);
    scene.add(matrixCharacter);

    setInterval(() => {
      const newChar = randomMatrixChar();
      matrixCharacter.geometry = createGeometry(newChar, font);
    }, 250 + Math.random() * 2000); // Random interval between 0.25-2.25 seconds
  });
}

Array(CHAR_COUNT).fill().forEach(addMatrixCharacter);

// Avatar;

const blaneTexture = new THREE.TextureLoader().load("/img/blane.png");

const blane = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshStandardMaterial({
    map: blaneTexture,
    metalness: 0.0, // Lower values make it less shiny
    roughness: 0.8, // Higher values make it more diffuse
  })
);

// Position avatar in front of initial camera view
blane.position.z = -5;
blane.position.x = 0;
blane.position.y = 0;

scene.add(blane);

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  // Rotate avatar
  blane.rotation.y += 0.01;
  blane.rotation.z += 0.01;

  // Adjust scroll sensitivity based on device
  const scrollFactor = isMobile ? 0.005 : 0.01;
  const rotationFactor = isMobile ? 0.0001 : 0.0002;

  // Clamp camera position to reasonable bounds
  camera.position.z = Math.max(-100, Math.min(30, t * -scrollFactor));
  camera.position.x = Math.max(-20, Math.min(5, t * -rotationFactor));
  camera.rotation.y = Math.max(-1, Math.min(1, t * -rotationFactor));
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop
let lastTime = 0;
function animate(currentTime) {
  requestAnimationFrame(animate);

  // Limit updates to 60fps
  if (currentTime - lastTime < 16.67) return;
  lastTime = currentTime;

  // Use frustum culling for better performance
  const frustum = new THREE.Frustum();
  frustum.setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
  );

  // Only render visible objects
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.visible = frustum.containsPoint(object.position);
    }
  });

  renderer.render(scene, camera);
}

animate();

// Add resize event listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
