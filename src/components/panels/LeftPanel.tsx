import { HoldButton, ToggleButton } from '../controls/HoldButton'
import { Joystick } from '../controls/Joystick'
import { useSimulation } from '../../state/SimulationContext'
import { T12_LIMITS } from '../../config/limits'
import type { SpeedPreset } from '../../config/limits'

export function LeftPanel() {
  const {
    setAxis,
    stopMovement,
    pose,
    derived,
    speedPreset,
    setSpeedPreset,
    speedSlider,
    setSpeedSlider,
    system,
  } = useSimulation()

  const disabled = !system.powerOn || !system.systemReady || system.softwareStop || system.emergencyStopActive

  return (
    <aside className="side-panel left-panel">
      <section className="control-section">
        <div className="panel-title">Boom</div>
        <div className="btn-row">
          <HoldButton
            label="BOOM UP"
            disabled={disabled}
            onHoldStart={() => setAxis('boom', 1)}
            onHoldEnd={() => setAxis('boom', 0)}
          />
          <HoldButton
            label="BOOM DOWN"
            disabled={disabled}
            onHoldStart={() => setAxis('boom', -1)}
            onHoldEnd={() => setAxis('boom', 0)}
          />
        </div>
        <dl className="metric-list">
          <div><dt>Angle</dt><dd>{pose.boomAngleDeg.toFixed(1)}°</dd></div>
          <div><dt>Height</dt><dd>{derived.workingHeightM.toFixed(2)} m</dd></div>
          <div><dt>Direction</dt><dd>{derived.boomDirection}</dd></div>
          <div><dt>Status</dt><dd>{derived.activeAxis === 'boom' ? 'Moving' : 'Stopped'}</dd></div>
          <div><dt>Limits</dt><dd>{T12_LIMITS.boomAngleMinDeg}° … {T12_LIMITS.boomAngleMaxDeg}°</dd></div>
        </dl>
      </section>

      <section className="control-section">
        <div className="panel-title">Telescope</div>
        <div className="btn-row">
          <HoldButton
            label="EXTEND"
            disabled={disabled}
            onHoldStart={() => setAxis('telescope', 1)}
            onHoldEnd={() => setAxis('telescope', 0)}
          />
          <HoldButton
            label="RETRACT"
            disabled={disabled}
            onHoldStart={() => setAxis('telescope', -1)}
            onHoldEnd={() => setAxis('telescope', 0)}
          />
        </div>
        <dl className="metric-list">
          <div><dt>Length</dt><dd>{pose.telescopeM.toFixed(2)} m</dd></div>
          <div><dt>Extension</dt><dd>{derived.telescopePercent.toFixed(0)}%</dd></div>
          <div><dt>Outreach</dt><dd>{derived.horizontalOutreachM.toFixed(2)} m</dd></div>
          <div><dt>Direction</dt><dd>{derived.telescopeDirection}</dd></div>
          <div><dt>Max</dt><dd>{T12_LIMITS.maxTelescopeM.toFixed(1)} m</dd></div>
        </dl>
      </section>

      <section className="control-section">
        <div className="panel-title">Rotation</div>
        <div className="btn-row">
          <HoldButton
            label="ROTATE LEFT"
            disabled={disabled}
            onHoldStart={() => setAxis('rotate', -1)}
            onHoldEnd={() => setAxis('rotate', 0)}
          />
          <HoldButton
            label="ROTATE RIGHT"
            disabled={disabled}
            onHoldStart={() => setAxis('rotate', 1)}
            onHoldEnd={() => setAxis('rotate', 0)}
          />
        </div>
        <button type="button" className="hold-btn hold-btn--danger full" onClick={stopMovement}>
          STOP ROTATION / MOVEMENT
        </button>
        <dl className="metric-list">
          <div><dt>Angle</dt><dd>{pose.rotationDeg.toFixed(1)}°</dd></div>
          <div><dt>vs Truck</dt><dd>{pose.rotationDeg.toFixed(1)}° relative</dd></div>
          <div><dt>Direction</dt><dd>{derived.rotateDirection}</dd></div>
          <div><dt>Range</dt><dd>{T12_LIMITS.rotationMinDeg}° … {T12_LIMITS.rotationMaxDeg}°</dd></div>
        </dl>
      </section>

      <section className="control-section">
        <div className="panel-title">Basket</div>
        <div className="status-pill ok">Auto-level active (T12-class)</div>
        <dl className="metric-list">
          <div><dt>Tilt</dt><dd>{pose.basketTiltDeg.toFixed(1)}°</dd></div>
          <div>
            <dt>Level</dt>
            <dd className={derived.basketLevelOk ? 'ok-text' : 'warn-text'}>
              {derived.basketLevelOk ? 'Level OK' : 'Deviation'}
            </dd>
          </div>
          <div><dt>Load</dt><dd>{pose.basketLoadKg.toFixed(0)} kg / {T12_LIMITS.ratedBasketLoadKg} kg</dd></div>
        </dl>
        <p className="muted tiny">Unsupported basket axes are not offered for this platform class.</p>
      </section>

      <section className="control-section">
        <div className="panel-title">Stabilizers</div>
        <div className="btn-row">
          <HoldButton
            label="EXTEND"
            disabled={disabled}
            onHoldStart={() => setAxis('stabilizerExtend', 1)}
            onHoldEnd={() => setAxis('stabilizerExtend', 0)}
          />
          <HoldButton
            label="RETRACT"
            disabled={disabled}
            onHoldStart={() => setAxis('stabilizerExtend', -1)}
            onHoldEnd={() => setAxis('stabilizerExtend', 0)}
          />
        </div>
        <div className="btn-row">
          <HoldButton
            label="LOWER"
            disabled={disabled}
            onHoldStart={() => setAxis('stabilizerLower', 1)}
            onHoldEnd={() => setAxis('stabilizerLower', 0)}
          />
          <HoldButton
            label="RAISE"
            disabled={disabled}
            onHoldStart={() => setAxis('stabilizerLower', -1)}
            onHoldEnd={() => setAxis('stabilizerLower', 0)}
          />
        </div>
        <div className={`status-pill ${derived.stabilizersReady ? 'ok' : 'warn'}`}>
          {derived.stabilizersReady ? 'Ground Contact — Ready' : 'Not Ready'}
        </div>
      </section>

      <Joystick />

      <section className="control-section">
        <div className="panel-title">Movement Speed</div>
        <div className="btn-row">
          {(['slow', 'normal', 'fast'] as SpeedPreset[]).map((p) => (
            <ToggleButton
              key={p}
              label={p.toUpperCase()}
              active={speedPreset === p}
              onClick={() => setSpeedPreset(p)}
            />
          ))}
        </div>
        <label className="slider-label">
          Fine adjust
          <input
            type="range"
            min={0.25}
            max={1.5}
            step={0.05}
            value={speedSlider}
            onChange={(e) => setSpeedSlider(Number(e.target.value))}
          />
          <span>{speedSlider.toFixed(2)}×</span>
        </label>
      </section>
    </aside>
  )
}
