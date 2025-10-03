import React, { useState, useRef, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { SeaShaderMaterial } from './SeaShaderMaterial'

// Componente para cargar un modelo GLB y mejorar materiales para realismo
function GLBModel({ url, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url)
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      if (child.material) {
        child.material.roughness = 0.62
        child.material.metalness = 0.18
        child.material.envMapIntensity = 0.75
      }
    }
  })
  return <primitive object={scene} position={position} scale={scale} rotation={rotation} />
}

// --------- UTILIDAD PARA CARGAR TEXTURAS PBR ---------
function usePBRTextures(basePath, baseName) {
  const loader = useMemo(() => new THREE.TextureLoader(), [])
  return useMemo(
    () => ({
      map: loader.load(`${basePath}${baseName}_Color.png`),
      metalnessMap: loader.load(`${basePath}${baseName}_Metalness.png`),
      roughnessMap: loader.load(`${basePath}${baseName}_Roughness.png`),
      normalMap: loader.load(`${basePath}${baseName}_NormalGL.png`), // o NormalDX si tu normal es DirectX
      displacementMap: loader.load(`${basePath}${baseName}_Displacement.png`)
    }),
    [basePath, baseName, loader]
  )
}

// ----------- NUEVO: E2D Hawkeye con materiales PBR (Metal050A - imagen 3) -----------
function E2DHawkeye({ position = [170, 45, -10], scale = [2.5, 2.5, 2.5], rotation = [0, Math.PI / 1, 0] }) {
  const pbr = usePBRTextures('/textures/', 'Metal050A_1K-PNG')
  const { scene } = useGLTF('/glb_models/PBR_E2D.glb')
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: pbr.map,
        metalnessMap: pbr.metalnessMap,
        roughnessMap: pbr.roughnessMap,
        normalMap: pbr.normalMap,
        displacementMap: pbr.displacementMap,
        metalness: 1,
        roughness: 1,
        normalScale: new THREE.Vector2(1, 1),
        displacementScale: 0.12
      })
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  return <primitive object={scene} position={position} scale={scale} rotation={rotation} />
}

// ----------- NUEVO: Barco FGS Mölders con materiales PBR (Metal052C - imagen 1) -----------
function FGSShip({ position = [100, 0, -200], scale = [100, 100, 100], rotation = [0, Math.PI / 0.68, 0] }) {
  const pbr = usePBRTextures('/textures/', 'Metal052C_1K-PNG')
  const { scene } = useGLTF('/glb_models/PBR_Arleigh_Burke.glb')
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: pbr.map,
        metalnessMap: pbr.metalnessMap,
        roughnessMap: pbr.roughnessMap,
        normalMap: pbr.normalMap,
        displacementMap: pbr.displacementMap,
        metalness: 1,
        roughness: 1,
        normalScale: new THREE.Vector2(1, 1),
        displacementScale: 0.15
      })
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  return <primitive object={scene} position={position} scale={scale} rotation={rotation} />
}

// ----------- NUEVO: Shader procedural de columna de humo realista -----------
function SmokeColumnShaderMaterial() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.uniforms.uTime.value = clock.getElapsedTime() % 100.0
    }
  })

  return (
    <shaderMaterial
      ref={ref}
      attach="material"
      transparent
      side={THREE.DoubleSide}
      uniforms={{
        uTime: { value: 0 }
      }}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        uniform float uTime;

        float hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1,311.7)),
                   dot(p, vec2(269.5,183.3)));
          return -1.0 + 2.0*fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453123);
        }
        float noise(vec2 p){
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix( hash(i + vec2(0.0,0.0)), 
                          hash(i + vec2(1.0,0.0)), u.x),
                     mix( hash(i + vec2(0.0,1.0)), 
                          hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main() {
          vec2 uv = vUv;
          float x = uv.x - 0.5;
          float y = uv.y + uTime * 0.18;
          float n = 0.0;
          float f = 1.0;
          for(int i=0; i<5; i++) {
            n += (0.5 / f) * noise(vec2(x * 6.0 * f + y*0.2, y * 5.0 * f + float(i)*10.0 - uTime*0.08));
            f *= 2.0;
          }
          float column = exp(-4.0 * x * x) * smoothstep(0.05, 0.3, uv.y) * (1.0 - smoothstep(0.8, 1.02, uv.y));
          float smoke = column * n;
          float alpha = clamp(smoke * 3.0, 0.0, 1.0) * 0.9;
          float edge = smoothstep(0.0, 0.12, uv.x) * (1.0 - smoothstep(0.88, 1.0, uv.x));
          alpha *= edge;
          vec3 color = mix(vec3(0.15,0.15,0.15), vec3(0.8,0.8,0.8), n*0.8 + 0.2);
          gl_FragColor = vec4(color, alpha);
        }
      `}
    />
  )
}

function SmokeEffectColumn({ position = [100, 40, -200], scale = [12, 60, 10] }) {
  // Plano vertical, eje y = altura de la columna
  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <SmokeColumnShaderMaterial />
    </mesh>
  )
}

// ----------- NUEVO: Animación cámara automática -----------
function AutoRotatingPerspectiveCamera() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      const radius = 900
      const angle = t * 0.03
      ref.current.position.x = Math.cos(angle) * radius
      ref.current.position.z = Math.sin(angle) * radius - 176
      ref.current.position.y = 126 + Math.sin(angle * 0.6) * 16
      ref.current.lookAt(0, 80, 0)
    }
  })
  return <PerspectiveCamera ref={ref} makeDefault position={[851.86, 126.52, -176.02]} fov={50} near={0.1} far={2000} />
}

// ----------- NUEVO: Animación de luces (notoria) -----------
function AnimatedLights({ preset }) {
  const ambientRef = useRef()
  const keyRef = useRef()
  const fillRef = useRef()
  const rimRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Día: Sol hace un barrido grande y la intensidad varía mucho
    if (preset === 'dia') {
      if (keyRef.current) {
        keyRef.current.position.x = 65 + Math.sin(t * 0.25) * 180
        keyRef.current.position.y = 120 + Math.sin(t * 0.15) * 60
        keyRef.current.position.z = 90 + Math.cos(t * 0.21) * 100
        keyRef.current.intensity = 0.8 + Math.sin(t * 0.55) * 0.8
      }
      if (fillRef.current) {
        fillRef.current.intensity = 0.27 + Math.sin(t * 0.44) * 0.15
        fillRef.current.position.z = 60 + Math.cos(t * 0.26) * 50
        fillRef.current.position.x = -90 + Math.sin(t * 0.38) * 70
      }
      if (rimRef.current) {
        rimRef.current.intensity = 0.13 + Math.cos(t * 0.38) * 0.22
        rimRef.current.position.x = Math.sin(t * 0.41) * 80
        rimRef.current.position.z = -220 + Math.cos(t * 0.31) * 120
      }
      if (ambientRef.current) {
        ambientRef.current.intensity = 0.18 + Math.sin(t * 0.25) * 0.1
      }
    }
    // Atardecer: Sol baja, color y posición cambian dramáticamente
    else if (preset === 'atardecer') {
      if (keyRef.current) {
        keyRef.current.position.x = Math.sin(t * 0.22) * 180
        keyRef.current.position.y = 55 + Math.sin(t * 0.1) * 30
        keyRef.current.position.z = 180 + Math.cos(t * 0.17) * 100
        keyRef.current.intensity = 0.56 + Math.sin(t * 0.43) * 0.4
        keyRef.current.color = new THREE.Color(1.0, 0.6 + 0.4 * Math.abs(Math.sin(t * 0.22)), 0.2 + 0.6 * Math.abs(Math.cos(t * 0.17)))
      }
      if (fillRef.current) {
        fillRef.current.intensity = 0.15 + Math.sin(t * 0.29) * 0.12
        fillRef.current.position.z = -80 + Math.cos(t * 0.25) * 60
        fillRef.current.position.x = -50 + Math.sin(t * 0.33) * 45
      }
      if (rimRef.current) {
        rimRef.current.intensity = 0.18 + Math.cos(t * 0.2) * 0.17
        rimRef.current.position.x = 80 + Math.sin(t * 0.34) * 60
        rimRef.current.position.z = -130 + Math.cos(t * 0.28) * 70
      }
      if (ambientRef.current) {
        ambientRef.current.intensity = 0.11 + Math.sin(t * 0.37) * 0.1
      }
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={preset === 'dia' ? 0.18 : 0.11} />
      <directionalLight
        ref={keyRef}
        position={preset === 'dia' ? [65, 120, 90] : [0, 55, 180]}
        intensity={preset === 'dia' ? 0.9 : 0.56}
        color={preset === 'dia' ? '#ffffff' : '#ffd7a0'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight
        ref={fillRef}
        position={preset === 'dia' ? [-90, 40, 60] : [-50, 18, -80]}
        intensity={preset === 'dia' ? 0.27 : 0.15}
        color={preset === 'dia' ? '#bdd7ff' : '#a5b7ff'}
      />
      <directionalLight
        ref={rimRef}
        position={preset === 'dia' ? [0, 30, -220] : [80, 18, -130]}
        intensity={preset === 'dia' ? 0.13 : 0.18}
        color={preset === 'dia' ? '#b7d1ff' : '#fff1e6'}
      />
    </>
  )
}

const LIGHT_PRESETS = {
  dia: {
    ambient: 0.18,
    key: { color: '#ffffff', intensity: 0.9, position: [65, 120, 90] },
    fill: { color: '#bdd7ff', intensity: 0.27, position: [-90, 40, 60] },
    rim: { color: '#b7d1ff', intensity: 0.13, position: [0, 30, -220] },
    envPreset: 'city',
    sunDir: [-0.1, 0.8, 0.5],
    sunColor: [1.0, 0.98, 0.92]
  },
  atardecer: {
    ambient: 0.11,
    key: { color: '#ffd7a0', intensity: 0.56, position: [0, 55, 180] },
    fill: { color: '#a5b7ff', intensity: 0.15, position: [-50, 18, -80] },
    rim: { color: '#fff1e6', intensity: 0.18, position: [80, 18, -130] },
    envPreset: 'sunset',
    sunDir: [0.8, 0.2, 0.1],
    sunColor: [1.2, 0.6, 0.2]
  }
}

const CAMERA_PRESETS = {
  perspective: {
    type: 'perspective',
    position: [851.86, 126.52, -176.02],
    fov: 50,
    near: 0.1,
    far: 2000
  },
  orthographic: {
    type: 'orthographic',
    position: [0, 45, -600],
    zoom: 3,
    near: -2000,
    far: 2000,
    left: -1250,
    right: 1000,
    top: 1000,
    bottom: -1000
  }
}

// Componente para cambiar y renderizar la cámara activa
function CameraSwitcher({ cameraType, setCamera }) {
  const perspRef = useRef()
  const orthoRef = useRef()
  const { set } = useThree()

  React.useEffect(() => {
    if (cameraType === 'perspective' && perspRef.current) {
      set({ camera: perspRef.current })
    } else if (cameraType === 'orthographic' && orthoRef.current) {
      set({ camera: orthoRef.current })
    }
  }, [cameraType, set])

  return (
    <>
      <PerspectiveCamera
        ref={perspRef}
        makeDefault={cameraType === 'perspective'}
        position={CAMERA_PRESETS.perspective.position}
        fov={CAMERA_PRESETS.perspective.fov}
        near={CAMERA_PRESETS.perspective.near}
        far={CAMERA_PRESETS.perspective.far}
      />
      <OrthographicCamera
        ref={orthoRef}
        makeDefault={cameraType === 'orthographic'}
        position={CAMERA_PRESETS.orthographic.position}
        zoom={CAMERA_PRESETS.orthographic.zoom}
        near={CAMERA_PRESETS.orthographic.near}
        far={CAMERA_PRESETS.orthographic.far}
        left={CAMERA_PRESETS.orthographic.left}
        right={CAMERA_PRESETS.orthographic.right}
        top={CAMERA_PRESETS.orthographic.top}
        bottom={CAMERA_PRESETS.orthographic.bottom}
      />
    </>
  )
}

export default function App() {
  const [preset, setPreset] = useState('dia')
  const [cameraType, setCameraType] = useState('perspective')
  const [cameraMode, setCameraMode] = useState('user') // 'user', 'ortho', 'auto'

  const lights = LIGHT_PRESETS[preset]

  function CameraSelector() {
    if (cameraMode === 'ortho') {
      return <CameraSwitcher cameraType="orthographic" />
    } else if (cameraMode === 'auto') {
      return <AutoRotatingPerspectiveCamera />
    } else {
      return <CameraSwitcher cameraType="perspective" />
    }
  }

  return (
    <>
      {/* Selector de presets y cámaras */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 10,
          left: 10,
          gap: 10,
          display: 'flex',
          flexDirection: 'column'
        }}>
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setPreset('dia')}>Día</button>
          <button onClick={() => setPreset('atardecer')}>Atardecer</button>
        </div>
        <div>
          <button onClick={() => setCameraMode('user')}>Cámara Perspectiva (usuario)</button>
          <button onClick={() => setCameraMode('ortho')}>Cámara Ortográfica</button>
          <button onClick={() => setCameraMode('auto')}>Cámara Perspectiva Animada</button>
        </div>
      </div>

      <Canvas
        shadows
        camera={CAMERA_PRESETS.perspective}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        style={{ width: '100vw', height: '100vh', background: '#DBEBE8' }}>
        <CameraSelector />

        {/* Luces animadas (más notorias) */}
        <AnimatedLights preset={preset} />

        <Environment preset={lights.envPreset} background={false} />

        {/* Plano del mar procedural */}
        <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[15000, 15000, 1]}>
          <planeGeometry args={[1, 1, 1, 1]} />
          <SeaShaderMaterial sunDir={lights.sunDir} sunColor={lights.sunColor} />
        </mesh>

        {/* Modelos principales */}
        <GLBModel url="/glb_models/architectonic_Nimitz.glb" position={[-200, 0, 0]} scale={[0.05, 0.05, 0.05]} />
        <GLBModel
          url="/glb_models/utilitary_SuperHornet.glb"
          position={[0, 45, -36.5]}
          scale={[0.2, 0.2, 0.2]}
          rotation={[0, Math.PI / 17, 0]}
        />
        <GLBModel
          url="/glb_models/organic_US_Pilot.glb"
          position={[15, 40.3, -30]}
          scale={[300, 300, 300]}
          rotation={[0, Math.PI / 1.8, 0]}
        />

        {/* Nuevos modelos GLB con materiales PBR y texturas PNG */}
        <E2DHawkeye />
        <FGSShip />

        {/* Humo procedural en columna vertical */}
        <SmokeEffectColumn position={[100, 40, -200]} scale={[12, 60, 10]} />

        {/* Solo activa OrbitControls cuando la cámara es user o ortho */}
        {cameraMode !== 'auto' && (
          <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI * 0.495} minDistance={70} maxDistance={3000} />
        )}
      </Canvas>
    </>
  )
}
