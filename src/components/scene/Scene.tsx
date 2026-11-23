import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Grid, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useSimulation } from '../../state/SimulationContext'
import type { CameraPreset } from '../../types/machine'
import { TruckPlatform } from './TruckPlatform'

const PRESET_POS: Record<CameraPreset, [number, number, number]> = {
  front: [0, 4, 12],
  rear: [0, 4, -12],
  left: [-12, 4, 0],
  right: [12, 4, 0],
  top: [0, 18, 0.01],
  isometric: [9, 7, 9],
  reset: [9, 7, 9],
}

function CameraController() {
  const { cameraPreset, clearCameraPreset, settings } = useSimulation()
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()

  useEffect(() => {
    if (!cameraPreset || !controls.current) return
    const pos = PRESET_POS[cameraPreset]
    camera.position.set(...pos)
    controls.current.target.set(0.5, 2.5, 0)
    controls.current.update()
    const t = window.setTimeout(() => clearCameraPreset(), 100)
    return () => window.clearTimeout(t)
  }, [cameraPreset, camera, clearCameraPreset])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={settings.cameraInertia}
      dampingFactor={0.08}
      minDistance={4}
      maxDistance={40}
      maxPolarAngle={Math.PI * 0.49}
      target={[0.5, 2.5, 0]}
    />
  )
}

function Lights({ quality }: { quality: string }) {
  const shadow = quality !== 'low'
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.25}
        castShadow={shadow}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={['#8eb0d8', '#3a4038', 0.35]} />
    </>
  )
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#1a2332" roughness={0.95} metalness={0.05} />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        args={[80, 80]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#2a3a50"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3d5a80"
        fadeDistance={45}
        fadeStrength={1}
        infiniteGrid
      />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={30} blur={2.5} far={12} />
    </>
  )
}

export function Scene() {
  const { settings } = useSimulation()
  const dpr =
    settings.graphicsQuality === 'high' ? [1, 2] : settings.graphicsQuality === 'medium' ? [1, 1.5] : [1, 1]

  return (
    <Canvas
      shadows
      dpr={dpr as [number, number]}
      camera={{ position: [9, 7, 9], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: settings.graphicsQuality !== 'low', toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <color attach="background" args={['#0d1520']} />
      <fog attach="fog" args={['#0d1520', 25, 70]} />
      <Suspense fallback={null}>
        <Lights quality={settings.graphicsQuality} />
        <Ground />
        <TruckPlatform />
        {settings.graphicsQuality === 'high' && (
          <Environment preset="city" environmentIntensity={0.25} />
        )}
        <CameraController />
      </Suspense>
    </Canvas>
  )
}
