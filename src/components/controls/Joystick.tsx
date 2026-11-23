import { useCallback, useEffect, useRef, useState } from 'react'
import { useSimulation } from '../../state/SimulationContext'

type Mode = 'boom-rotate' | 'telescope'

/**
 * Dual-mode virtual joystick:
 * - Mode A: Y = boom, X = rotate
 * - Mode B: Y = telescope
 */
export function Joystick() {
  const { setJoystickAxes, stopMovement, settings } = useSimulation()
  const padRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const [mode, setMode] = useState<Mode>('boom-rotate')
  const dragging = useRef(false)

  const apply = useCallback(
    (nx: number, ny: number) => {
      const sens = settings.joystickSensitivity
      const x = Math.max(-1, Math.min(1, nx * sens))
      const y = Math.max(-1, Math.min(1, ny * sens))
      setKnob({ x, y })
      if (mode === 'boom-rotate') {
        setJoystickAxes(y, 0, x)
      } else {
        setJoystickAxes(0, y, 0)
      }
    },
    [mode, setJoystickAxes, settings.joystickSensitivity],
  )

  const release = useCallback(() => {
    dragging.current = false
    setKnob({ x: 0, y: 0 })
    stopMovement()
  }, [stopMovement])

  const onPointer = useCallback(
    (e: React.PointerEvent) => {
      if (!padRef.current || !dragging.current) return
      const rect = padRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / (rect.width / 2)
      const ny = -(e.clientY - cy) / (rect.height / 2)
      apply(nx, ny)
    },
    [apply],
  )

  // Optional Gamepad API
  useEffect(() => {
    let raf = 0
    const poll = () => {
      const pads = navigator.getGamepads?.()
      const gp = pads?.[0]
      if (gp && !dragging.current) {
        const x = Math.abs(gp.axes[0]) > 0.12 ? gp.axes[0] : 0
        const y = Math.abs(gp.axes[1]) > 0.12 ? -gp.axes[1] : 0
        if (x || y) apply(x, y)
        else if (knob.x || knob.y) release()
      }
      raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(raf)
  }, [apply, release, knob.x, knob.y])

  return (
    <div className="joystick-block">
      <div className="panel-title">Virtual Joystick</div>
      <div className="joystick-modes">
        <button
          type="button"
          className={mode === 'boom-rotate' ? 'chip is-active' : 'chip'}
          onClick={() => {
            release()
            setMode('boom-rotate')
          }}
        >
          Boom / Rotate
        </button>
        <button
          type="button"
          className={mode === 'telescope' ? 'chip is-active' : 'chip'}
          onClick={() => {
            release()
            setMode('telescope')
          }}
        >
          Telescope
        </button>
      </div>
      <div
        ref={padRef}
        className="joystick-pad"
        onPointerDown={(e) => {
          dragging.current = true
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
          onPointer(e)
        }}
        onPointerMove={onPointer}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="joystick-crosshair" />
        <div
          className="joystick-knob"
          style={{
            transform: `translate(calc(-50% + ${knob.x * 48}px), calc(-50% + ${-knob.y * 48}px))`,
          }}
        />
      </div>
      <div className="muted tiny">
        {mode === 'boom-rotate' ? 'Y: Boom · X: Rotate' : 'Y: Telescope'} · Release to stop
      </div>
    </div>
  )
}
