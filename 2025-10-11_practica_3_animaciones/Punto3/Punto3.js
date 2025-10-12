import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222244);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 13);
camera.lookAt(0, 1.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;

// LIGHTS
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// Key spotlight for Staging
const spotLight = new THREE.SpotLight(0xffffaa, 2, 30, Math.PI / 5, 0.2, 0.8);
spotLight.position.set(0, 10, 4);
spotLight.target.position.set(0, 1, 0);
scene.add(spotLight);
scene.add(spotLight.target);

// FLOOR & STAGING CIRCLE
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// Puesta en escena: círculo luminoso
const circleGeo = new THREE.CircleGeometry(2.5, 64);
const circleMat = new THREE.MeshBasicMaterial({
  color: 0xffff88,
  opacity: 0.38,
  transparent: true
});
const stagingCircle = new THREE.Mesh(circleGeo, circleMat);
stagingCircle.position.set(0, 0.02, 0);
stagingCircle.rotation.x = -Math.PI / 2;
scene.add(stagingCircle);

// CUBE
const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const cubeMat = new THREE.MeshPhongMaterial({ color: 0x2ad5d3 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.castShadow = true;
cube.position.set(0, 0.5, 0);
scene.add(cube);

// SHADOW (fake)
const shadowGeo = new THREE.CircleGeometry(0.5, 32);
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true });
const shadow = new THREE.Mesh(shadowGeo, shadowMat);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.01;
scene.add(shadow);

// ANIMATION PARAMETERS
let startTime = null;
const animationDuration = 30; // seconds

// For horizontal movement
const pathRadius = 2.2;
let pathAngle = 0;
let pathSpeed = 0.6;

// Color palette for jumps
const colorList = [
  0x2ad5d3, 0xffaa00, 0x68e800, 0xff3c71, 0x9a4cff, 0x2471ff, 0xffffff, 0xff5b00
];
let lastJump = -1;

// Easing function (same as first code)
function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

// MAIN ANIMATION LOOP
function animate(now) {
  if (!startTime) startTime = now;
  const elapsed = (now - startTime) / 1000;

  if (elapsed > animationDuration) return;

  // --- STAGING: Pause and focus before first jump ---
  let stagingDuration = 1.5;
  if (elapsed < stagingDuration) {
    cube.position.set(0, 0.5, 0);
    cube.scale.set(1, 1, 1);
    cube.material.color.set(0xffaa00); // Destacar el cubo antes de saltar
    stagingCircle.material.opacity = 0.48;
    shadow.material.opacity = 0.10;
    controls.target.set(0, 1.5, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    return;
  } else {
    stagingCircle.material.opacity = 0.38;
    shadow.material.opacity = 0.25;
  }

  // --- CONSTANT SPEED & COLOR CHANGE ON EACH JUMP ---
  let jumpDuration = 1.0; // siempre igual
  let jumpHeight = 3.2;   // altura fija

  // jumpT: 0..1 in each jump
  let jumpT = ((elapsed - stagingDuration) % jumpDuration) / jumpDuration;
  let jumpNumber = Math.floor((elapsed - stagingDuration) / jumpDuration);

  // Cambia color en cada salto
  if (jumpNumber !== lastJump) {
    let colorIdx = jumpNumber % colorList.length;
    cube.material.color.set(colorList[colorIdx]);
    lastJump = jumpNumber;
  }

  let upDown = jumpT;
  let squash = THREE.MathUtils.lerp(1, 0.6, Math.pow(1 - upDown, 2.5));
  let stretch = THREE.MathUtils.lerp(1, 1.5, upDown);

  let eased = easeInOutQuad(upDown);
  let jumpY = Math.sin(eased * Math.PI) * jumpHeight;

  // Cube transform
  cube.position.y = 0.5 + jumpY;
  cube.scale.y = stretch * squash;
  cube.scale.x = cube.scale.z = 1 / Math.sqrt(stretch * squash);

  // Squash & Stretch at contact with ground
  if (cube.position.y < 0.7) {
    cube.scale.y = 0.7;
    cube.scale.x = cube.scale.z = 1.2;
  }

  // Move in circular path for dynamic entertainment
  pathAngle += pathSpeed * 0.01;
  cube.position.x = Math.cos(pathAngle) * pathRadius;
  cube.position.z = Math.sin(pathAngle) * pathRadius;

  shadow.position.x = cube.position.x;
  shadow.position.z = cube.position.z;
  shadow.scale.set(cube.scale.x * 1.2, cube.scale.z * 1.2, 1);
  shadow.material.opacity = 0.18 + 0.23 * (1 - upDown);

  // Staging circle follows cube
  stagingCircle.position.x = cube.position.x;
  stagingCircle.position.z = cube.position.z;

  // Spotlight follows cube for focus
  spotLight.position.x = cube.position.x * 0.8;
  spotLight.target.position.x = cube.position.x;
  spotLight.target.updateMatrixWorld();

  // Camera remains fixed (no longer follows cube)
  controls.target.set(0, 1.5, 0);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate(performance.now());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});