import { useEffect } from 'react'
import { useSimulation } from '../state/SimulationContext'

export function useKeyboardControls() {
  const { settings, setAxis, stopMovement, resetSimulation, showSettings } = useSimulation()

  useEffect(() => {
    if (showSettings) return

    const down = new Set<string>()
    const bindings = settings.keyBindings

    const keyOf = (e: KeyboardEvent) => (e.key === ' ' ? ' ' : e.key.toLowerCase())

    const sync = () => {
      let boom = 0
      let telescope = 0
      let rotate = 0
      if (down.has(bindings.boomUp)) boom += 1
      if (down.has(bindings.boomDown)) boom -= 1
      if (down.has(bindings.telescopeExtend)) telescope += 1
      if (down.has(bindings.telescopeRetract)) telescope -= 1
      if (down.has(bindings.rotateRight)) rotate += 1
      if (down.has(bindings.rotateLeft)) rotate -= 1
      setAxis('boom', boom)
      setAxis('telescope', telescope)
      setAxis('rotate', rotate)
    }

    const onDown = (e: KeyboardEvent) => {
      const k = keyOf(e)
      const vals = Object.values(bindings)
      if (!vals.includes(k) && k !== bindings.stop && k !== bindings.reset) return

      // Don't capture typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return

      if (k === bindings.stop) {
        e.preventDefault()
        stopMovement()
        return
      }
      if (k === bindings.reset) {
        e.preventDefault()
        resetSimulation()
        return
      }
      if (vals.includes(k)) {
        e.preventDefault()
        down.add(k)
        sync()
      }
    }

    const onUp = (e: KeyboardEvent) => {
      const k = keyOf(e)
      if (down.has(k)) {
        down.delete(k)
        sync()
      }
    }

    const onBlur = () => {
      down.clear()
      stopMovement()
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [settings.keyBindings, setAxis, stopMovement, resetSimulation, showSettings])
}
