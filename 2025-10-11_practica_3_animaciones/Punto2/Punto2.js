import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// CONFIGURABLE SCALE
let scaleCrane = 0.05// Ajusta el tamaño de la grúa aquí

// SCENE SETUP
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(30, 25, 60);
camera.lookAt(0, 10, 0);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
scene.add(new THREE.DirectionalLight(0xffffff, 1));

// CRANE SETUP
let craneModel = null;
let piedNode = null;
let upperPivot = null; // Agrupa toda la parte superior (excepto 'pied')
let hookNode = null;   // Gancho
let cableNode = null;  // Cable principal
let tipNode = null;    // Punta de la grúa (para IK)

const loader = new GLTFLoader();
loader.load(
  '/crane.glb',
  (gltf) => {
    craneModel = gltf.scene;
    craneModel.scale.setScalar(scaleCrane);
    scene.add(craneModel);

    // Encuentra el nodo raíz y "pied"
    const root = craneModel.getObjectByName('RootNode') || craneModel;
    piedNode = root.getObjectByName('pied');

    // ----- Agrupación de la parte superior -----
    upperPivot = new THREE.Group();
    upperPivot.name = 'upperPivot';

    // Mueve todos los hijos de RootNode, menos "pied", al pivote
    root.children.forEach(child => {
      if (child.name !== "pied") {
        upperPivot.add(child);
      }
    });
    upperPivot.position.copy(root.position);
    root.add(upperPivot);

    // Incluye las piezas que se hayan quedado fuera por jerarquía (si alguna queda fuera, se añade aquí)
    [
      'beton-haut', 'grue-barriere-support', 'barrieres', 'corps-haut-1', 'corps-haut-2', 'corps-haut-3',
      'haut-jaune', 'haut-gris', 'corps-top', 'cabine', 'plateforme', 'plateforme-haut',
      'cables-haut', 'poulie', 'accroche'
    ].forEach(name => {
      const n = root.getObjectByName(name);
      if (n && !upperPivot.children.includes(n)) upperPivot.add(n);
    });

    // Gancho y cable para IK
    hookNode = root.getObjectByName('Cylinder213_grue-accroche_0'); // Gancho
    cableNode = root.getObjectByName('cables-haut_cable-haut_0');   // Cable principal
    tipNode = root.getObjectByName('corps-haut-3_corps-haut-3_0') || root.getObjectByName('corps-haut-3');

    if (!hookNode) console.error("No se encontró el gancho 'Cylinder213_grue-accroche_0'");
    if (!cableNode) console.warn("No se encontró el cable 'cables-haut_cable-haut_0'");
    if (!tipNode) console.warn("No se encontró la punta 'corps-haut-3_corps-haut-3_0'");

    // Aseguramos que todas las barandillas, contrapesos, etc. estén en upperPivot
    root.traverse(obj => {
      if (obj !== piedNode && obj.parent === root && !upperPivot.children.includes(obj)) {
        upperPivot.add(obj);
      }
    });
  },
  undefined,
  (err) => {
    console.error("Error loading crane.glb:", err);
  }
);

// ANIMATION WITH INVERSE KINEMATICS
function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;

  // ----- CINEMÁTICA INVERSA: ROTACIÓN SUPERIOR -----
  // El pivote de la parte superior rota acorde a la animación IK (objetivo: dirección objetivo)
  let rotationTarget = Math.sin(t * 0.4) * Math.PI/2; // Oscila +/- 90°
  if (upperPivot) {
    upperPivot.rotation.y = rotationTarget;
  }
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Cambia la escala desde consola
window.setCraneScale = function(newScale) {
  scaleCrane = newScale;
  if (craneModel) {
    craneModel.scale.setScalar(scaleCrane);
  }
};