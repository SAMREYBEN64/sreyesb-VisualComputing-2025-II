import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 5, 30); // Vista lateral y arriba
camera.lookAt(0, 1, 0);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;

let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

let ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

let legModel = null;
let hipPivot = null;
let kneePivot = null;
let anklePivot = null;
let footPivot = null;

const loader = new GLTFLoader();
loader.load(
  "/leg_collection.glb",
  (gltf) => {
    legModel = gltf.scene;
    legModel.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    legModel.rotation.y = Math.PI;
    scene.add(legModel);

    // Construir cadena FK con tus objetos
    buildLegChain(legModel);
  },
  undefined,
  (err) => {
    console.error('Error cargando /leg_collection_of_thunthu.glb:', err);
  }
);

// Construye pivotes FK con tus huesos y pie
function buildLegChain(root) {
  // Huesos principales
  const femur = root.getObjectByName('Object_82');
  const tibia = root.getObjectByName('Object_85');
  const fibula = root.getObjectByName('Object_91');
  const patella = root.getObjectByName('Object_88');
  const talus = root.getObjectByName('Object_31');

  // Pie y dedos (agrupar todos los objetos del pie bajo talus)
  const footObjects = [];
  root.traverse((o) => {
    if (
      o.isMesh &&
      [
        // Todos los huesos del pie y dedos
        'Object_34', 'Object_37', 'Object_40', 'Object_43', 'Object_46', 'Object_49', 'Object_52',
        'Object_55', 'Object_58', 'Object_61', 'Object_64', 'Object_67', 'Object_70', 'Object_73',
        'Object_76', 'Object_79', 'Object_22', 'Object_25', 'Object_28', 'Object_13', 'Object_10',
        'Object_4', 'Object_7', 'Object_19', 'Object_16'
      ].includes(o.name)
    ) {
      footObjects.push(o);
    }
  });

  // 1. Crea pivotes
  hipPivot = new THREE.Group(); hipPivot.name = 'HipPivot';
  kneePivot = new THREE.Group(); kneePivot.name = 'KneePivot';
  anklePivot = new THREE.Group(); anklePivot.name = 'AnklePivot';
  footPivot = new THREE.Group(); footPivot.name = 'FootPivot';

  scene.add(hipPivot);

  // 2. Calcula posiciones de pivote (usa bounding box)
  const boxFemur = femur ? new THREE.Box3().setFromObject(femur) : null;
  const boxTibia = tibia ? new THREE.Box3().setFromObject(tibia) : null;
  const boxTalus = talus ? new THREE.Box3().setFromObject(talus) : null;

  const hipPos = boxFemur ? new THREE.Vector3((boxFemur.min.x + boxFemur.max.x) / 2, boxFemur.max.y, (boxFemur.min.z + boxFemur.max.z) / 2) : new THREE.Vector3(0,0,0);
  const kneePos = boxTibia ? new THREE.Vector3((boxTibia.min.x + boxTibia.max.x) / 2, boxTibia.max.y, (boxTibia.min.z + boxTibia.max.z) / 2) : new THREE.Vector3(0,0,0);
  const anklePos = boxTalus ? new THREE.Vector3((boxTalus.min.x + boxTalus.max.x) / 2, boxTalus.max.y, (boxTalus.min.z + boxTalus.max.z) / 2) : new THREE.Vector3(0,0,0);

  // 3. Coloca pivotes
  hipPivot.position.copy(hipPos);
  hipPivot.updateMatrixWorld(true);

  // 4. Agrupa huesos bajo pivotes
  if (femur) hipPivot.attach(femur);
  if (patella) hipPivot.attach(patella);
  hipPivot.attach(kneePivot);

  kneePivot.position.copy(kneePos.clone().applyMatrix4(new THREE.Matrix4().copy(hipPivot.matrixWorld).invert()));
  kneePivot.updateMatrixWorld(true);

  if (tibia) kneePivot.attach(tibia);
  if (fibula) kneePivot.attach(fibula);
  kneePivot.attach(anklePivot);

  anklePivot.position.copy(anklePos.clone().applyMatrix4(new THREE.Matrix4().copy(kneePivot.matrixWorld).invert()));
  anklePivot.updateMatrixWorld(true);

  if (talus) anklePivot.attach(talus);
  anklePivot.attach(footPivot);

  // Pie y dedos bajo footPivot
  footObjects.forEach(obj => footPivot.attach(obj));
}

function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  const cycle = (t * 1.2) % (2 * Math.PI);

  const hipAngle = Math.sin(cycle) * THREE.MathUtils.degToRad(30);
  const kneeAngle = Math.max(0, Math.sin(cycle)) * THREE.MathUtils.degToRad(45);
  const ankleAngle = -0.01 * kneeAngle + Math.sin(t * 1.0) * THREE.MathUtils.degToRad(10);

  if (hipPivot) hipPivot.rotation.z = hipAngle;
  if (kneePivot) kneePivot.rotation.z = kneeAngle;
  if (anklePivot) anklePivot.rotation.z = ankleAngle;

  if (footPivot) {
    const footFlex = Math.max(0, Math.sin(cycle + Math.PI * 1.2)) * THREE.MathUtils.degToRad(30);
    footPivot.rotation.z = footFlex;
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