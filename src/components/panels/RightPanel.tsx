import { overallStabilizerStatus } from '../../state/kinematics'
import { useSimulation } from '../../state/SimulationContext'
import { WorkingEnvelope } from './WorkingEnvelope'
import type { CameraPreset } from '../../types/machine'

const CAMERAS: { id: CameraPreset; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'rear', label: 'Rear' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'top', label: 'Top' },
  { id: 'isometric', label: 'Isometric' },
  { id: 'reset', label: 'Reset' },
]

export function RightPanel() {
  const { pose, system, derived, warnings, setCameraPreset, setBasketLoad } = useSimulation()

  return (
    <aside className="side-panel right-panel">
      <section className="control-section">
        <div className="panel-title">Live Machine Data</div>
        <div className="sim-tag">Simulated</div>
        <dl className="metric-list data-grid">
          <div><dt>Boom Angle</dt><dd>{pose.boomAngleDeg.toFixed(1)} °</dd></div>
          <div><dt>Boom Extension</dt><dd>{pose.telescopeM.toFixed(2)} m</dd></div>
          <div><dt>Working Height</dt><dd>{derived.workingHeightM.toFixed(2)} m</dd></div>
          <div><dt>Horizontal Outreach</dt><dd>{derived.horizontalOutreachM.toFixed(2)} m</dd></div>
          <div><dt>Turret Rotation</dt><dd>{pose.rotationDeg.toFixed(1)} °</dd></div>
          <div>
            <dt>Basket Level</dt>
            <dd>{derived.basketLevelOk ? 'Level' : `${pose.basketTiltDeg.toFixed(1)}°`}</dd>
          </div>
          <div><dt>Basket Load</dt><dd>{pose.basketLoadKg.toFixed(0)} kg</dd></div>
          <div><dt>Stabilizer Status</dt><dd>{overallStabilizerStatus(pose)}</dd></div>
          <div><dt>Hydraulic Pressure</dt><dd>{derived.hydraulicPressureBar.toFixed(0)} bar</dd></div>
          <div><dt>Engine Status</dt><dd>{system.engineRunning ? 'Running' : 'Stopped'}</dd></div>
          <div><dt>Machine Status</dt><dd>{derived.machineStatus}</dd></div>
          <div><dt>System Connection</dt><dd>Simulation Link</dd></div>
        </dl>
        <label className="slider-label">
          Sim basket load
          <input
            type="range"
            min={0}
            max={280}
            step={5}
            value={pose.basketLoadKg}
            onChange={(e) => setBasketLoad(Number(e.target.value))}
          />
          <span>{pose.basketLoadKg} kg</span>
        </label>
      </section>

      <WorkingEnvelope />

      <section className="control-section">
        <div className="panel-title">Safety Monitoring</div>
        <ul className="warning-list">
          {warnings.map((w) => (
            <li key={w.id} className={`warn-item level-${w.active ? w.level : 'ok'}`}>
              <span className="warn-dot" />
              <span>{w.message}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="control-section">
        <div className="panel-title">3D Camera</div>
        <div className="chip-grid">
          {CAMERAS.map((c) => (
            <button key={c.id} type="button" className="chip" onClick={() => setCameraPreset(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="muted tiny">Orbit / zoom with mouse or touch. Presets snap the view.</p>
      </section>
    </aside>
  )
}
