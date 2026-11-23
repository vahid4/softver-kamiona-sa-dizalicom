import type { SpeedPreset } from '../config/limits'

export type MachineMode = 'simulation' | 'live'

export type StabilizerSide = 'fl' | 'fr' | 'rl' | 'rr'

export type StabilizerState = {
  extension: number // 0 retracted … 1 fully extended
  lowered: number // 0 raised … 1 ground contact
}

export type StabilizerStatusLabel =
  | 'Retracted'
  | 'Extending'
  | 'Extended'
  | 'Lowering'
  | 'Ground Contact'
  | 'Not Ready'
  | 'Fault'

export type MovementAxis = 'boom' | 'telescope' | 'rotate' | 'stabilizer' | 'none'

export type MovementCommand = {
  boom: number // -1 … 1
  telescope: number
  rotate: number
  stabilizerExtend: number
  stabilizerLower: number
}

export type WarningId =
  | 'overload'
  | 'maxReach'
  | 'maxHeight'
  | 'stabilizersNotReady'
  | 'basketLevel'
  | 'hydraulicFault'
  | 'eStopActive'
  | 'controlFault'
  | 'communicationLost'
  | 'movementNotPermitted'

export type Warning = {
  id: WarningId
  level: 'ok' | 'warn' | 'critical'
  message: string
  active: boolean
}

export type CameraPreset =
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'top'
  | 'isometric'
  | 'reset'

export type ThemeMode = 'dark' | 'light'

export type UnitsSystem = 'metric' | 'imperial'

export type GraphicsQuality = 'low' | 'medium' | 'high'

export type ScenarioId = 'yard' | 'transport' | 'elevated'

export type KeyBindings = {
  boomUp: string
  boomDown: string
  rotateLeft: string
  rotateRight: string
  telescopeExtend: string
  telescopeRetract: string
  stop: string
  reset: string
}

export type Settings = {
  theme: ThemeMode
  joystickSensitivity: number
  simSpeed: number
  soundEnabled: boolean
  graphicsQuality: GraphicsQuality
  cameraInertia: boolean
  units: UnitsSystem
  scenario: ScenarioId
  keyBindings: KeyBindings
}

export type SystemState = {
  powerOn: boolean
  systemReady: boolean
  engineRunning: boolean
  hydraulicOn: boolean
  controlStationActive: boolean
  softwareStop: boolean
  emergencyStopActive: boolean
  preparing: boolean
}

export type MachinePose = {
  boomAngleDeg: number
  telescopeM: number
  rotationDeg: number
  basketTiltDeg: number
  basketLoadKg: number
  stabilizers: Record<StabilizerSide, StabilizerState>
}

export type DerivedMetrics = {
  workingHeightM: number
  horizontalOutreachM: number
  telescopePercent: number
  basketLevelOk: boolean
  stabilizersReady: boolean
  hydraulicPressureBar: number
  machineStatus: string
  boomDirection: string
  rotateDirection: string
  telescopeDirection: string
  movementActive: boolean
  activeAxis: MovementAxis
}

export type SimulationState = {
  mode: MachineMode
  pose: MachinePose
  system: SystemState
  command: MovementCommand
  speedPreset: SpeedPreset
  speedSlider: number
  settings: Settings
  warnings: Warning[]
  limitMessage: string | null
  cameraPreset: CameraPreset | null
  showSettings: boolean
  showLiveInfo: boolean
  derived: DerivedMetrics
}

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  boomUp: 'w',
  boomDown: 's',
  rotateLeft: 'a',
  rotateRight: 'd',
  telescopeExtend: 'e',
  telescopeRetract: 'q',
  stop: ' ',
  reset: 'r',
}
