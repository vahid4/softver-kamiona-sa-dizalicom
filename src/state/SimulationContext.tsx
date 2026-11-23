import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { T12_LIMITS, type SpeedPreset } from '../config/limits'
import {
  DEFAULT_KEY_BINDINGS,
  type CameraPreset,
  type MachinePose,
  type MovementCommand,
  type Settings,
  type StabilizerSide,
  type SystemState,
} from '../types/machine'
import { buildWarnings, clamp, computeKinematics, deriveMetrics, stabilizersReady } from './kinematics'

const SIDES: StabilizerSide[] = ['fl', 'fr', 'rl', 'rr']

function initialStabilizers(): MachinePose['stabilizers'] {
  return {
    fl: { extension: 0, lowered: 0 },
    fr: { extension: 0, lowered: 0 },
    rl: { extension: 0, lowered: 0 },
    rr: { extension: 0, lowered: 0 },
  }
}

function transportPose(): MachinePose {
  return {
    boomAngleDeg: -2,
    telescopeM: 0,
    rotationDeg: 0,
    basketTiltDeg: 0,
    basketLoadKg: 80,
    stabilizers: initialStabilizers(),
  }
}

const zeroCommand = (): MovementCommand => ({
  boom: 0,
  telescope: 0,
  rotate: 0,
  stabilizerExtend: 0,
  stabilizerLower: 0,
})

const defaultSettings = (): Settings => ({
  theme: 'dark',
  joystickSensitivity: 1,
  simSpeed: 1,
  soundEnabled: false,
  graphicsQuality: 'high',
  cameraInertia: true,
  units: 'metric',
  scenario: 'yard',
  keyBindings: { ...DEFAULT_KEY_BINDINGS },
})

const defaultSystem = (): SystemState => ({
  powerOn: false,
  systemReady: false,
  engineRunning: false,
  hydraulicOn: false,
  controlStationActive: false,
  softwareStop: false,
  emergencyStopActive: false,
  preparing: false,
})

type SimContextValue = {
  pose: MachinePose
  system: SystemState
  command: MovementCommand
  speedPreset: SpeedPreset
  speedSlider: number
  settings: Settings
  limitMessage: string | null
  cameraPreset: CameraPreset | null
  showSettings: boolean
  showLiveInfo: boolean
  derived: ReturnType<typeof deriveMetrics>
  warnings: ReturnType<typeof buildWarnings>
  setAxis: (axis: keyof MovementCommand, value: number) => void
  stopMovement: () => void
  setSpeedPreset: (p: SpeedPreset) => void
  setSpeedSlider: (v: number) => void
  setCameraPreset: (p: CameraPreset) => void
  clearCameraPreset: () => void
  togglePower: () => void
  toggleEngine: () => void
  toggleHydraulic: () => void
  toggleControlStation: () => void
  toggleSoftwareStop: () => void
  toggleEStop: () => void
  preparePlatform: () => void
  returnToTransport: () => void
  resetSimulation: () => void
  setShowSettings: (v: boolean) => void
  setShowLiveInfo: (v: boolean) => void
  updateSettings: (partial: Partial<Settings>) => void
  setBasketLoad: (kg: number) => void
  setJoystickAxes: (boom: number, telescope: number, rotate: number) => void
}

const SimulationContext = createContext<SimContextValue | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [pose, setPose] = useState<MachinePose>(transportPose)
  const [system, setSystem] = useState<SystemState>(defaultSystem)
  const [command, setCommand] = useState<MovementCommand>(zeroCommand)
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('normal')
  const [speedSlider, setSpeedSlider] = useState(1)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [limitMessage, setLimitMessage] = useState<string | null>(null)
  const [cameraPreset, setCameraPresetState] = useState<CameraPreset | null>('isometric')
  const [showSettings, setShowSettings] = useState(false)
  const [showLiveInfo, setShowLiveInfo] = useState(false)

  const commandRef = useRef(command)
  const poseRef = useRef(pose)
  const systemRef = useRef(system)
  const speedRef = useRef({ preset: speedPreset, slider: speedSlider, sim: settings.simSpeed })
  const limitTimer = useRef<number | null>(null)

  useEffect(() => {
    commandRef.current = command
  }, [command])
  useEffect(() => {
    poseRef.current = pose
  }, [pose])
  useEffect(() => {
    systemRef.current = system
  }, [system])
  useEffect(() => {
    speedRef.current = { preset: speedPreset, slider: speedSlider, sim: settings.simSpeed }
  }, [speedPreset, speedSlider, settings.simSpeed])

  const showLimit = useCallback((msg: string) => {
    setLimitMessage(msg)
    if (limitTimer.current) window.clearTimeout(limitTimer.current)
    limitTimer.current = window.setTimeout(() => setLimitMessage(null), 2200)
  }, [])

  const canMove = useCallback(() => {
    const s = systemRef.current
    return (
      s.powerOn &&
      s.systemReady &&
      s.hydraulicOn &&
      s.controlStationActive &&
      !s.softwareStop &&
      !s.emergencyStopActive &&
      !s.preparing
    )
  }, [])

  // Animation / physics loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const cmd = commandRef.current
      const speedMult =
        T12_LIMITS.speedMultipliers[speedRef.current.preset] *
        speedRef.current.slider *
        speedRef.current.sim

      if (!canMove()) {
        if (
          Math.abs(cmd.boom) +
            Math.abs(cmd.telescope) +
            Math.abs(cmd.rotate) +
            Math.abs(cmd.stabilizerExtend) +
            Math.abs(cmd.stabilizerLower) >
          0
        ) {
          setCommand(zeroCommand())
        }
        raf = requestAnimationFrame(tick)
        return
      }

      setPose((prev) => {
        let next = { ...prev, stabilizers: { ...prev.stabilizers } }
        let changed = false
        const ready = stabilizersReady(prev)

        // Stabilizers first
        if (Math.abs(cmd.stabilizerExtend) > 0.01 || Math.abs(cmd.stabilizerLower) > 0.01) {
          const rate = T12_LIMITS.rates.stabilizerPerSec * speedMult * dt
          for (const side of SIDES) {
            const st = { ...next.stabilizers[side] }
            if (cmd.stabilizerExtend !== 0) {
              st.extension = clamp(st.extension + cmd.stabilizerExtend * rate, 0, 1)
              if (cmd.stabilizerExtend < 0 && st.extension < 0.98) {
                st.lowered = clamp(st.lowered - rate * 1.2, 0, 1)
              }
            }
            if (cmd.stabilizerLower !== 0) {
              if (cmd.stabilizerLower > 0 && st.extension < 0.95) {
                showLimit('Extend stabilizers before lowering')
              } else {
                st.lowered = clamp(st.lowered + cmd.stabilizerLower * rate, 0, 1)
              }
            }
            next.stabilizers[side] = st
          }
          changed = true
        }

        // Boom
        if (Math.abs(cmd.boom) > 0.01) {
          const delta = cmd.boom * T12_LIMITS.rates.boomDegPerSec * speedMult * dt
          let target = next.boomAngleDeg + delta
          if (cmd.boom > 0 && !ready && target > T12_LIMITS.boomAngleWithoutStabilizersDeg) {
            target = T12_LIMITS.boomAngleWithoutStabilizersDeg
            showLimit('Stabilizers not ready — boom raise limited')
          }
          if (target > T12_LIMITS.boomAngleMaxDeg) {
            target = T12_LIMITS.boomAngleMaxDeg
            showLimit('Boom angle upper limit reached')
          }
          if (target < T12_LIMITS.boomAngleMinDeg) {
            target = T12_LIMITS.boomAngleMinDeg
            showLimit('Boom angle lower limit reached')
          }
          // Envelope clamp via kinematics
          const testPose = { ...next, boomAngleDeg: target }
          const kin = computeKinematics(testPose)
          if (kin.workingHeightM > T12_LIMITS.maxWorkingHeightM) {
            showLimit('Max working height limit')
          } else if (kin.horizontalOutreachM > T12_LIMITS.maxOutreachM) {
            showLimit('Max outreach limit')
          } else {
            next = { ...next, boomAngleDeg: target }
            changed = true
          }
        }

        // Telescope
        if (Math.abs(cmd.telescope) > 0.01) {
          const delta = cmd.telescope * T12_LIMITS.rates.telescopeMPerSec * speedMult * dt
          let target = next.telescopeM + delta
          if (target > T12_LIMITS.maxTelescopeM) {
            target = T12_LIMITS.maxTelescopeM
            showLimit('Telescope fully extended')
          }
          if (target < 0) {
            target = 0
            showLimit('Telescope fully retracted')
          }
          const testPose = { ...next, telescopeM: target }
          const kin = computeKinematics(testPose)
          if (kin.workingHeightM > T12_LIMITS.maxWorkingHeightM) {
            showLimit('Max working height — telescope blocked')
          } else if (kin.horizontalOutreachM > T12_LIMITS.maxOutreachM) {
            showLimit('Max outreach — telescope blocked')
          } else {
            next = { ...next, telescopeM: target }
            changed = true
          }
        }

        // Rotation
        if (Math.abs(cmd.rotate) > 0.01) {
          const delta = cmd.rotate * T12_LIMITS.rates.rotateDegPerSec * speedMult * dt
          let target = next.rotationDeg + delta
          if (target > T12_LIMITS.rotationMaxDeg) {
            target = T12_LIMITS.rotationMaxDeg
            showLimit('Rotation limit (right)')
          }
          if (target < T12_LIMITS.rotationMinDeg) {
            target = T12_LIMITS.rotationMinDeg
            showLimit('Rotation limit (left)')
          }
          next = { ...next, rotationDeg: target }
          changed = true
        }

        // Auto-level basket (tilt stays near 0)
        if (Math.abs(next.basketTiltDeg) > 0.05) {
          next = {
            ...next,
            basketTiltDeg: next.basketTiltDeg * Math.exp(-3 * dt),
          }
          changed = true
        }

        return changed ? next : prev
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [canMove, showLimit])

  const setAxis = useCallback((axis: keyof MovementCommand, value: number) => {
    setCommand((c) => ({ ...c, [axis]: clamp(value, -1, 1) }))
  }, [])

  const setJoystickAxes = useCallback((boom: number, telescope: number, rotate: number) => {
    const sens = settings.joystickSensitivity
    setCommand((c) => ({
      ...c,
      boom: clamp(boom * sens, -1, 1),
      telescope: clamp(telescope * sens, -1, 1),
      rotate: clamp(rotate * sens, -1, 1),
    }))
  }, [settings.joystickSensitivity])

  const stopMovement = useCallback(() => {
    setCommand(zeroCommand())
  }, [])

  const togglePower = useCallback(() => {
    setSystem((s) => {
      if (s.powerOn) {
        setCommand(zeroCommand())
        return defaultSystem()
      }
      return {
        ...s,
        powerOn: true,
        controlStationActive: true,
      }
    })
  }, [])

  const toggleEngine = useCallback(() => {
    setSystem((s) => {
      if (!s.powerOn) return s
      const engineRunning = !s.engineRunning
      return {
        ...s,
        engineRunning,
        hydraulicOn: engineRunning ? s.hydraulicOn : false,
        systemReady: engineRunning && s.hydraulicOn && s.controlStationActive && !s.emergencyStopActive,
      }
    })
  }, [])

  const toggleHydraulic = useCallback(() => {
    setSystem((s) => {
      if (!s.powerOn || !s.engineRunning) return s
      const hydraulicOn = !s.hydraulicOn
      return {
        ...s,
        hydraulicOn,
        systemReady: hydraulicOn && s.engineRunning && s.controlStationActive && !s.emergencyStopActive,
      }
    })
  }, [])

  const toggleControlStation = useCallback(() => {
    setSystem((s) => {
      if (!s.powerOn) return s
      const controlStationActive = !s.controlStationActive
      return {
        ...s,
        controlStationActive,
        systemReady:
          controlStationActive && s.engineRunning && s.hydraulicOn && !s.emergencyStopActive,
      }
    })
  }, [])

  const toggleSoftwareStop = useCallback(() => {
    setSystem((s) => {
      const softwareStop = !s.softwareStop
      if (softwareStop) setCommand(zeroCommand())
      return { ...s, softwareStop }
    })
  }, [])

  const toggleEStop = useCallback(() => {
    setSystem((s) => {
      const emergencyStopActive = !s.emergencyStopActive
      if (emergencyStopActive) setCommand(zeroCommand())
      return {
        ...s,
        emergencyStopActive,
        systemReady: false,
        softwareStop: emergencyStopActive ? true : s.softwareStop,
      }
    })
  }, [])

  const preparePlatform = useCallback(() => {
    const s = systemRef.current
    if (!s.powerOn || !s.engineRunning || !s.hydraulicOn || s.emergencyStopActive) {
      showLimit('Power, engine, and hydraulics required to prepare')
      return
    }
    setSystem((sys) => ({ ...sys, preparing: true, softwareStop: false }))
    // Animate: extend + lower stabilizers, slight boom raise
    let t = 0
    const id = window.setInterval(() => {
      t += 1
      setPose((prev) => {
        const next = { ...prev, stabilizers: { ...prev.stabilizers } }
        for (const side of SIDES) {
          next.stabilizers[side] = {
            extension: clamp(prev.stabilizers[side].extension + 0.08, 0, 1),
            lowered: clamp(
              prev.stabilizers[side].extension > 0.9
                ? prev.stabilizers[side].lowered + 0.08
                : prev.stabilizers[side].lowered,
              0,
              1,
            ),
          }
        }
        if (stabilizersReady(next) && next.boomAngleDeg < 12) {
          next.boomAngleDeg = clamp(next.boomAngleDeg + 1.2, -5, 15)
        }
        return next
      })
      if (t >= 25) {
        window.clearInterval(id)
        setSystem((sys) => ({
          ...sys,
          preparing: false,
          systemReady: true,
          controlStationActive: true,
        }))
      }
    }, 80)
  }, [showLimit])

  const returnToTransport = useCallback(() => {
    setCommand(zeroCommand())
    setSystem((s) => ({ ...s, preparing: true, softwareStop: false }))
    let t = 0
    const id = window.setInterval(() => {
      t += 1
      setPose((prev) => {
        const next = { ...prev, stabilizers: { ...prev.stabilizers } }
        next.boomAngleDeg = clamp(prev.boomAngleDeg - 2.5, -2, 90)
        next.telescopeM = clamp(prev.telescopeM - 0.35, 0, 10)
        next.rotationDeg = prev.rotationDeg * 0.85
        if (Math.abs(next.boomAngleDeg + 2) < 3 && next.telescopeM < 0.2) {
          for (const side of SIDES) {
            next.stabilizers[side] = {
              lowered: clamp(prev.stabilizers[side].lowered - 0.1, 0, 1),
              extension:
                prev.stabilizers[side].lowered < 0.1
                  ? clamp(prev.stabilizers[side].extension - 0.1, 0, 1)
                  : prev.stabilizers[side].extension,
            }
          }
          if (Math.abs(next.rotationDeg) < 2) next.rotationDeg = 0
        }
        return next
      })
      if (t >= 40) {
        window.clearInterval(id)
        setPose(transportPose())
        setSystem((s) => ({ ...s, preparing: false }))
      }
    }, 80)
  }, [])

  const resetSimulation = useCallback(() => {
    setCommand(zeroCommand())
    setPose(transportPose())
    setSystem(defaultSystem())
    setSpeedPreset('normal')
    setSpeedSlider(1)
    setLimitMessage(null)
    setCameraPresetState('isometric')
  }, [])

  const setCameraPreset = useCallback((p: CameraPreset) => {
    setCameraPresetState(p)
  }, [])

  const clearCameraPreset = useCallback(() => {
    setCameraPresetState(null)
  }, [])

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...partial }))
  }, [])

  const setBasketLoad = useCallback((kg: number) => {
    setPose((p) => ({ ...p, basketLoadKg: clamp(kg, 0, 350) }))
  }, [])

  // Theme on document
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  const derived = useMemo(() => deriveMetrics(pose, system, command), [pose, system, command])
  const warnings = useMemo(() => buildWarnings(pose, system, derived), [pose, system, derived])

  const value: SimContextValue = {
    pose,
    system,
    command,
    speedPreset,
    speedSlider,
    settings,
    limitMessage,
    cameraPreset,
    showSettings,
    showLiveInfo,
    derived,
    warnings,
    setAxis,
    stopMovement,
    setSpeedPreset,
    setSpeedSlider,
    setCameraPreset,
    clearCameraPreset,
    togglePower,
    toggleEngine,
    toggleHydraulic,
    toggleControlStation,
    toggleSoftwareStop,
    toggleEStop,
    preparePlatform,
    returnToTransport,
    resetSimulation,
    setShowSettings,
    setShowLiveInfo,
    updateSettings,
    setBasketLoad,
    setJoystickAxes,
  }

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
