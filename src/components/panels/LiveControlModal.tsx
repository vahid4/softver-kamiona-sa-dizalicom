import { getLiveIntegrationStatus } from '../../live'
import { useSimulation } from '../../state/SimulationContext'

export function LiveControlModal() {
  const { showLiveInfo, setShowLiveInfo } = useSimulation()
  if (!showLiveInfo) return null

  const status = getLiveIntegrationStatus()

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => setShowLiveInfo(false)}>
      <div
        className="modal"
        role="dialog"
        aria-labelledby="live-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="live-title">Live Machine Control</h2>
          <button type="button" className="chip" onClick={() => setShowLiveInfo(false)}>
            Close
          </button>
        </header>
        <div className="modal-body">
          <div className="status-pill warn">LOCKED — Not available</div>
          <p>{status.reason}</p>
          <p className="muted">
            Connection status: <strong>Connection Lost / Data Unavailable</strong>
          </p>
          <p className="muted">
            Sensor fields: <strong>Not Available</strong> (no values invented)
          </p>
          <div className="panel-title">Integration gates</div>
          <ul className="warning-list">
            {status.gates.map((g) => (
              <li key={g.id} className="warn-item level-warn">
                <span className="warn-dot" />
                <span>
                  {g.description} — {g.satisfied ? 'Met' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
          <p className="disclaimer-inline">
            Live control requires OEM/authorized integrator approval and must not bypass factory safety
            systems.
          </p>
        </div>
      </div>
    </div>
  )
}
