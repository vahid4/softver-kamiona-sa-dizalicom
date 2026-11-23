import { T12_LIMITS } from '../config/limits'
import type {
  DerivedMetrics,
  MachinePose,
  MovementCommand,
  MovementAxis,
  StabilizerSide,
  StabilizerStatusLabel,
  SystemState,
  Warning,
} from '../types/machine'

const SIDES: StabilizerSide[] = ['fl', 'fr', 'rl', 'rr']

export function computeKinematics(pose: MachinePose): {
  workingHeightM: number
  horizontalOutreachM: number
} {
  const boomLen = T12_LIMITS.boomBaseLengthM + pose.telescopeM
  const rad = (pose.boomAngleDeg * Math.PI) / 180
  const tipHeight =
    T12_LIMITS.turretHeightM + Math.sin(rad) * boomLen + T12_LIMITS.basketFloorOffsetM * 0.15
  const outreach = Math.cos(rad) * boomLen
  return {
    workingHeightM: Math.max(0, tipHeight),
    horizontalOutreachM: Math.max(0, outreach),
  }
}

export function stabilizersReady(pose: MachinePose): boolean {
  return SIDES.every((s) => pose.stabilizers[s].extension >= 0.95 && pose.stabilizers[s].lowered >= 0.95)
}

export function stabilizerLabel(
  side: StabilizerSide,
  pose: MachinePose,
  fault = false,
): StabilizerStatusLabel {
  if (fault) return 'Fault'
  const st = pose.stabilizers[side]
  if (st.lowered >= 0.95 && st.extension >= 0.95) return 'Ground Contact'
  if (st.lowered > 0.05) return 'Lowering'
  if (st.extension >= 0.95) return 'Extended'
  if (st.extension > 0.05) return 'Extending'
  if (st.extension <= 0.05) return 'Retracted'
  return 'Not Ready'
}

export function overallStabilizerStatus(pose: MachinePose): StabilizerStatusLabel {
  if (stabilizersReady(pose)) return 'Ground Contact'
  const anyExtended = SIDES.some((s) => pose.stabilizers[s].extension > 0.05)
  if (!anyExtended) return 'Retracted'
  return 'Not Ready'
}

export function buildWarnings(
  pose: MachinePose,
  system: SystemState,
  metrics: { workingHeightM: number; horizontalOutreachM: number },
): Warning[] {
  const ready = stabilizersReady(pose)
  const levelOk = Math.abs(pose.basketTiltDeg) < 2.5
  const nearMaxReach = metrics.horizontalOutreachM >= T12_LIMITS.maxOutreachM - 0.25
  const nearMaxHeight = metrics.workingHeightM >= T12_LIMITS.maxWorkingHeightM - 0.25
  const overload = pose.basketLoadKg > T12_LIMITS.overloadThresholdKg
  const movementBlocked =
    !system.powerOn ||
    !system.systemReady ||
    system.softwareStop ||
    system.emergencyStopActive ||
    !system.hydraulicOn

  return [
    {
      id: 'overload',
      level: overload ? 'critical' : 'ok',
      message: overload ? 'Basket overload — reduce load' : 'Basket load within limit',
      active: overload,
    },
    {
      id: 'maxReach',
      level: nearMaxReach ? 'warn' : 'ok',
      message: nearMaxReach ? 'Approaching max horizontal outreach' : 'Outreach within envelope',
      active: nearMaxReach,
    },
    {
      id: 'maxHeight',
      level: nearMaxHeight ? 'warn' : 'ok',
      message: nearMaxHeight ? 'Approaching max working height' : 'Height within envelope',
      active: nearMaxHeight,
    },
    {
      id: 'stabilizersNotReady',
      level: ready ? 'ok' : 'warn',
      message: ready ? 'Stabilizers ready' : 'Stabilizers not ready — elevated work blocked',
      active: !ready,
    },
    {
      id: 'basketLevel',
      level: levelOk ? 'ok' : 'warn',
      message: levelOk ? 'Basket level OK' : 'Basket level deviation',
      active: !levelOk,
    },
    {
      id: 'hydraulicFault',
      level: system.hydraulicOn ? 'ok' : 'critical',
      message: system.hydraulicOn ? 'Hydraulic system OK' : 'Hydraulic system offline',
      active: !system.hydraulicOn && system.powerOn,
    },
    {
      id: 'eStopActive',
      level: system.emergencyStopActive ? 'critical' : 'ok',
      message: system.emergencyStopActive
        ? 'Emergency stop active (simulated indicator)'
        : 'E-Stop clear',
      active: system.emergencyStopActive,
    },
    {
      id: 'controlFault',
      level: 'ok',
      message: 'Control system OK',
      active: false,
    },
    {
      id: 'communicationLost',
      level: 'ok',
      message: 'Simulation link OK (not a real machine)',
      active: false,
    },
    {
      id: 'movementNotPermitted',
      level: movementBlocked ? 'warn' : 'ok',
      message: movementBlocked ? 'Movement not permitted' : 'Movement permitted',
      active: movementBlocked,
    },
  ]
}

export function directionLabel(v: number, pos: string, neg: string): string {
  if (Math.abs(v) < 0.01) return 'Idle'
  return v > 0 ? pos : neg
}

export function activeAxis(cmd: MovementCommand): MovementAxis {
  if (Math.abs(cmd.boom) > 0.01) return 'boom'
  if (Math.abs(cmd.telescope) > 0.01) return 'telescope'
  if (Math.abs(cmd.rotate) > 0.01) return 'rotate'
  if (Math.abs(cmd.stabilizerExtend) > 0.01 || Math.abs(cmd.stabilizerLower) > 0.01)
    return 'stabilizer'
  return 'none'
}

export function deriveMetrics(
  pose: MachinePose,
  system: SystemState,
  cmd: MovementCommand,
): DerivedMetrics {
  const kin = computeKinematics(pose)
  const ready = stabilizersReady(pose)
  const axis = activeAxis(cmd)
  const moving = axis !== 'none'
  let machineStatus = 'Idle'
  if (!system.powerOn) machineStatus = 'Power Off'
  else if (system.emergencyStopActive) machineStatus = 'E-Stop'
  else if (system.softwareStop) machineStatus = 'Software Stop'
  else if (!system.systemReady) machineStatus = 'Not Ready'
  else if (system.preparing) machineStatus = 'Preparing'
  else if (moving) machineStatus = 'Moving'
  else if (ready) machineStatus = 'Ready'

  return {
    ...kin,
    telescopePercent: (pose.telescopeM / T12_LIMITS.maxTelescopeM) * 100,
    basketLevelOk: Math.abs(pose.basketTiltDeg) < 2.5,
    stabilizersReady: ready,
    hydraulicPressureBar: system.hydraulicOn
      ? T12_LIMITS.hydraulicNominalBar + (moving ? 12 : 0)
      : 0,
    machineStatus,
    boomDirection: directionLabel(cmd.boom, 'Raising', 'Lowering'),
    rotateDirection: directionLabel(cmd.rotate, 'Right', 'Left'),
    telescopeDirection: directionLabel(cmd.telescope, 'Extending', 'Retracting'),
    movementActive: moving,
    activeAxis: axis,
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
