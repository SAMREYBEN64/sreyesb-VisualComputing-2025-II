import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './styles.css';

// Estado de la perspectiva
let currentPerspective = 1;

// Actualizar UI de perspectiva
function updatePerspectiveUI(perspective) {
  currentPerspective = perspective;
  const perspectiveText = document.getElementById('perspective-text');
  if (perspectiveText) {
    perspectiveText.textContent = perspective === 1 ? 'Diagonal' : 'Superior';
  }
}

// Inicializar la escena
function init() {
  // Configuración de la escena
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Configuración de la cámara de perspectiva
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(8, 6, 8);

  // Configuración del renderizador WebGL
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById('app').appendChild(renderer.domElement);

  // Aplicación de iluminación - Dos luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Cargar texturas desde la carpeta textures/
  const textureLoader = new THREE.TextureLoader();
  
  // Textura 1 - para el plano del piso (patrón de cuadrícula)
  const floorTexture = textureLoader.load('/textures/grid-texture.png');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 4);

  // Textura 2 - para las figuras (patrón de puntos)
  const dotTexture = textureLoader.load('/textures/dot-texture.png');

  // Formas geométricas: Cubo, Esfera y Pirámide con texturas

  // 1. Cubo con textura
  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial = new THREE.MeshStandardMaterial({ 
    map: dotTexture,
    metalness: 0.3,
    roughness: 0.4
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(-4, 1, 0);
  cube.castShadow = true;
  scene.add(cube);

  // 2. Esfera con textura
  const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({ 
    map: dotTexture,
    metalness: 0.3,
    roughness: 0.4
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 1.5, 0);
  sphere.castShadow = true;
  scene.add(sphere);

  // 3. Pirámide (cono con 4 lados) con textura
  const pyramidGeometry = new THREE.ConeGeometry(1.5, 3, 4);
  const pyramidMaterial = new THREE.MeshStandardMaterial({ 
    map: dotTexture,
    metalness: 0.3,
    roughness: 0.4
  });
  const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
  pyramid.position.set(4, 1.5, 0);
  pyramid.castShadow = true;
  scene.add(pyramid);

  // 6. Plano del piso con textura
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // Controles de cámara - OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 30;

  // Crear UI de controles
  createControlsUI();

  // Función de animación continua
  function animate() {
    requestAnimationFrame(animate);

    // Animación de rotación del cubo
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Animación de rotación de la esfera
    sphere.rotation.y += 0.015;

    // Animación de rotación de la pirámide
    pyramid.rotation.y += 0.02;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Manejo de redimensionamiento de ventana
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Cambio de perspectiva de cámara
  window.addEventListener('keypress', (event) => {
    if (event.key === '1') {
      camera.position.set(8, 6, 8);
      controls.update();
      updatePerspectiveUI(1);
    } else if (event.key === '2') {
      camera.position.set(0, 15, 0.1);
      controls.update();
      updatePerspectiveUI(2);
    }
  });
}

// Crear UI de controles
function createControlsUI() {
  const controlsDiv = document.createElement('div');
  controlsDiv.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-family: Arial, sans-serif;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border-radius: 8px;
    font-size: 14px;
  `;

  controlsDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0">Controles:</h3>
    <p style="margin: 5px 0">🖱️ Click + Arrastrar: Rotar cámara</p>
    <p style="margin: 5px 0">🖱️ Scroll: Zoom</p>
    <p style="margin: 5px 0">⌨️ Tecla 1: Perspectiva diagonal</p>
    <p style="margin: 5px 0">⌨️ Tecla 2: Vista superior</p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #4ecdc4">
      Perspectiva actual: <span id="perspective-text">Diagonal</span>
    </p>
  `;

  document.body.appendChild(controlsDiv);
}

// Iniciar la aplicación cuando el DOM esté listo
init();
