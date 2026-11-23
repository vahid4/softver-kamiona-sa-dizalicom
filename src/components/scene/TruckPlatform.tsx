import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { T12_LIMITS } from '../../config/limits'
import { useSimulation } from '../../state/SimulationContext'
import type { StabilizerSide } from '../../types/machine'

const STEEL = '#3a4556'
const CAB = '#1e4d8c'
const ACCENT = '#c4a035'
const BASKET = '#d8dde6'
const HYD = '#2a3340'
const TIRE = '#1a1a1a'

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 16]} />
        <meshStandardMaterial color={TIRE} roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 12]} />
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function StabilizerLeg({
  side,
  basePos,
  outDir,
}: {
  side: StabilizerSide
  basePos: [number, number, number]
  outDir: [number, number, number]
}) {
  const { pose } = useSimulation()
  const st = pose.stabilizers[side]
  const extend = st.extension * 1.35
  const lower = st.lowered * 0.85

  return (
    <group position={basePos}>
      <mesh position={[outDir[0] * extend * 0.5, 0.08, outDir[2] * extend * 0.5]} castShadow>
        <boxGeometry args={[Math.abs(outDir[0]) > 0 ? extend || 0.15 : 0.14, 0.1, Math.abs(outDir[2]) > 0 ? extend || 0.15 : 0.14]} />
        <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh
        position={[outDir[0] * extend, 0.08 - lower * 0.5, outDir[2] * extend]}
        castShadow
      >
        <boxGeometry args={[0.12, 0.15 + lower, 0.12]} />
        <meshStandardMaterial color={HYD} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[outDir[0] * extend, 0.02 - lower, outDir[2] * extend]} castShadow>
        <boxGeometry args={[0.35, 0.06, 0.35]} />
        <meshStandardMaterial
          color={st.lowered > 0.9 ? '#22c55e' : '#555'}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}

function HydraulicCylinder({
  from,
  to,
  radius = 0.06,
}: {
  from: THREE.Vector3
  to: THREE.Vector3
  radius?: number
}) {
  const mid = useMemo(() => from.clone().add(to).multiplyScalar(0.5), [from, to])
  const dir = useMemo(() => to.clone().sub(from), [from, to])
  const len = dir.length()
  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return q
  }, [dir])

  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <cylinderGeometry args={[radius, radius, len * 0.55, 10]} />
        <meshStandardMaterial color={HYD} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, len * 0.28, 0]}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, len * 0.45, 10]} />
        <meshStandardMaterial color="#8a93a0" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  )
}

export function TruckPlatform() {
  const { pose } = useSimulation()
  const turretRef = useRef<THREE.Group>(null)
  const boomPivotRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (turretRef.current) {
      turretRef.current.rotation.y = THREE.MathUtils.degToRad(-pose.rotationDeg)
    }
    if (boomPivotRef.current) {
      boomPivotRef.current.rotation.z = THREE.MathUtils.degToRad(pose.boomAngleDeg)
    }
  })

  const boomBase = T12_LIMITS.boomBaseLengthM
  const tel = pose.telescopeM
  const seg1 = boomBase * 0.55
  const seg2 = boomBase * 0.45 + tel * 0.45
  const seg3 = tel * 0.55

  const cylFrom = useMemo(() => new THREE.Vector3(0.3, 0.15, 0), [])
  const cylTo = useMemo(
    () =>
      new THREE.Vector3(
        Math.cos(THREE.MathUtils.degToRad(pose.boomAngleDeg)) * 1.6,
        0.15 + Math.sin(THREE.MathUtils.degToRad(pose.boomAngleDeg)) * 1.6,
        0,
      ),
    [pose.boomAngleDeg],
  )

  return (
    <group position={[0, 0, 0]}>
      {/* Chassis */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 0.35, 2.1]} />
        <meshStandardMaterial color={STEEL} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[5.4, 0.25, 1.7]} />
        <meshStandardMaterial color="#2a3140" metalness={0.35} roughness={0.55} />
      </mesh>

      {/* Cabin */}
      <group position={[-2.15, 0.95, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.15, 2.0]} />
          <meshStandardMaterial color={CAB} metalness={0.25} roughness={0.45} />
        </mesh>
        <mesh position={[0.15, 0.25, 0]}>
          <boxGeometry args={[1.0, 0.55, 1.7]} />
          <meshStandardMaterial color="#7ec8e8" transparent opacity={0.45} metalness={0.2} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[1.55, 0.12, 2.05]} />
          <meshStandardMaterial color={ACCENT} metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* Bed / platform base */}
      <mesh position={[1.1, 0.85, 0]} castShadow>
        <boxGeometry args={[3.2, 0.18, 2.0]} />
        <meshStandardMaterial color="#4a5568" metalness={0.35} roughness={0.5} />
      </mesh>

      <Wheel position={[-1.9, 0.42, 1.05]} />
      <Wheel position={[-1.9, 0.42, -1.05]} />
      <Wheel position={[1.6, 0.42, 1.05]} />
      <Wheel position={[1.6, 0.42, -1.05]} />
      <Wheel position={[2.35, 0.42, 1.05]} />
      <Wheel position={[2.35, 0.42, -1.05]} />

      <StabilizerLeg side="fl" basePos={[-0.6, 0.45, 1.0]} outDir={[0, 0, 1]} />
      <StabilizerLeg side="fr" basePos={[-0.6, 0.45, -1.0]} outDir={[0, 0, -1]} />
      <StabilizerLeg side="rl" basePos={[2.3, 0.45, 1.0]} outDir={[0, 0, 1]} />
      <StabilizerLeg side="rr" basePos={[2.3, 0.45, -1.0]} outDir={[0, 0, -1]} />

      {/* Turret */}
      <group ref={turretRef} position={[0.9, 1.05, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.35, 20]} />
          <meshStandardMaterial color={CAB} metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.9, 0.35, 0.7]} />
          <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Boom pivot */}
        <group ref={boomPivotRef} position={[0.2, 0.35, 0]}>
          {/* Main boom segment */}
          <mesh position={[seg1 / 2, 0, 0]} castShadow>
            <boxGeometry args={[seg1, 0.28, 0.32]} />
            <meshStandardMaterial color="#c9a227" metalness={0.45} roughness={0.35} />
          </mesh>
          {/* Mid telescope */}
          <mesh position={[seg1 + seg2 / 2 - 0.05, 0, 0]} castShadow>
            <boxGeometry args={[seg2, 0.22, 0.26]} />
            <meshStandardMaterial color="#b8911f" metalness={0.5} roughness={0.32} />
          </mesh>
          {/* Outer telescope */}
          <mesh position={[seg1 + seg2 + seg3 / 2 - 0.08, 0, 0]} castShadow>
            <boxGeometry args={[Math.max(seg3, 0.05), 0.16, 0.2]} />
            <meshStandardMaterial color="#a67f18" metalness={0.55} roughness={0.3} />
          </mesh>

          {/* Lift cylinder (approximate) */}
          <HydraulicCylinder from={cylFrom} to={cylTo} />

          {/* Basket */}
          <group position={[seg1 + seg2 + seg3 + 0.35, -0.15, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.08, 1.1]} />
              <meshStandardMaterial color={BASKET} metalness={0.3} roughness={0.45} />
            </mesh>
            {/* Rails */}
            {[
              [0, 0.45, 0.52],
              [0, 0.45, -0.52],
              [0.42, 0.45, 0],
              [-0.42, 0.45, 0],
            ].map((p, i) => (
              <mesh key={i} position={p as [number, number, number]} castShadow>
                <boxGeometry
                  args={
                    Math.abs(p[2]) > 0.1 ? [0.85, 0.9, 0.05] : [0.05, 0.9, 1.05]
                  }
                />
                <meshStandardMaterial color="#e8ecf2" metalness={0.4} roughness={0.4} />
              </mesh>
            ))}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.2, 0.12, 0.2]} />
              <meshStandardMaterial color={ACCENT} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
