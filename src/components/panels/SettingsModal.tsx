import { DEFAULT_KEY_BINDINGS } from '../../types/machine'
import type { GraphicsQuality, KeyBindings, ScenarioId, ThemeMode, UnitsSystem } from '../../types/machine'
import { useSimulation } from '../../state/SimulationContext'

export function SettingsModal() {
  const { showSettings, setShowSettings, settings, updateSettings } = useSimulation()
  if (!showSettings) return null

  const setBinding = (key: keyof KeyBindings, value: string) => {
    updateSettings({
      keyBindings: { ...settings.keyBindings, [key]: value.toLowerCase() || settings.keyBindings[key] },
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => setShowSettings(false)}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="chip" onClick={() => setShowSettings(false)}>
            Close
          </button>
        </header>

        <div className="modal-body">
          <label className="field">
            Theme
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}
            >
              <option value="dark">Dark industrial</option>
              <option value="light">Light industrial</option>
            </select>
          </label>

          <label className="field">
            Joystick sensitivity
            <input
              type="range"
              min={0.4}
              max={1.6}
              step={0.05}
              value={settings.joystickSensitivity}
              onChange={(e) => updateSettings({ joystickSensitivity: Number(e.target.value) })}
            />
            <span>{settings.joystickSensitivity.toFixed(2)}</span>
          </label>

          <label className="field">
            Simulation speed
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={settings.simSpeed}
              onChange={(e) => updateSettings({ simSpeed: Number(e.target.value) })}
            />
            <span>{settings.simSpeed.toFixed(1)}×</span>
          </label>

          <label className="field checkbox">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            />
            Sound (reserved — off by default)
          </label>

          <label className="field">
            Graphics quality
            <select
              value={settings.graphicsQuality}
              onChange={(e) =>
                updateSettings({ graphicsQuality: e.target.value as GraphicsQuality })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="field checkbox">
            <input
              type="checkbox"
              checked={settings.cameraInertia}
              onChange={(e) => updateSettings({ cameraInertia: e.target.checked })}
            />
            Camera inertia
          </label>

          <label className="field">
            Units
            <select
              value={settings.units}
              onChange={(e) => updateSettings({ units: e.target.value as UnitsSystem })}
            >
              <option value="metric">Metric (m, kg, bar)</option>
              <option value="imperial">Imperial labels (display preference)</option>
            </select>
          </label>

          <label className="field">
            Scenario
            <select
              value={settings.scenario}
              onChange={(e) => updateSettings({ scenario: e.target.value as ScenarioId })}
            >
              <option value="yard">Yard training</option>
              <option value="transport">Transport stow</option>
              <option value="elevated">Elevated work</option>
            </select>
          </label>

          <fieldset className="keymap">
            <legend>Keyboard (hold-to-move)</legend>
            {(
              [
                ['boomUp', 'Boom up'],
                ['boomDown', 'Boom down'],
                ['rotateLeft', 'Rotate left'],
                ['rotateRight', 'Rotate right'],
                ['telescopeExtend', 'Telescope extend'],
                ['telescopeRetract', 'Telescope retract'],
                ['stop', 'Stop movement'],
                ['reset', 'Reset simulation'],
              ] as [keyof KeyBindings, string][]
            ).map(([k, label]) => (
              <label key={k} className="field inline">
                {label}
                <input
                  maxLength={1}
                  value={settings.keyBindings[k] === ' ' ? 'Space' : settings.keyBindings[k]}
                  onChange={(e) => {
                    const v = e.target.value.toLowerCase()
                    setBinding(k, v === 'space' ? ' ' : v)
                  }}
                />
              </label>
            ))}
            <button
              type="button"
              className="chip"
              onClick={() => updateSettings({ keyBindings: { ...DEFAULT_KEY_BINDINGS } })}
            >
              Reset key bindings
            </button>
          </fieldset>

          <div className="tech-info">
            <div className="panel-title">Technical info</div>
            <p>SOCAGE APACHE T12 – Aerial Platform Control System</p>
            <p>Version 1.0.0 · Simulation Mode</p>
            <p>
              Real-machine safety parameters cannot be edited here. Live control requires OEM/authorized
              integrator approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
