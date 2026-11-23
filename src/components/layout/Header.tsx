import { useSimulation } from '../../state/SimulationContext'

export function Header() {
  const { system, derived } = useSimulation()

  const statusLabel = !system.powerOn
    ? 'Power Off'
    : system.emergencyStopActive
      ? 'E-Stop'
      : system.systemReady
        ? 'System Ready'
        : 'Not Ready'

  const statusClass = !system.powerOn
    ? 'off'
    : system.emergencyStopActive
      ? 'crit'
      : system.systemReady
        ? 'ok'
        : 'warn'

  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-name">SOCAGE APACHE T12</div>
        <div className="brand-sub">AERIAL PLATFORM CONTROL SYSTEM</div>
      </div>
      <div className="header-meta">
        <div className="mode-badge">Simulation Mode</div>
        <div className={`system-status ${statusClass}`}>
          <span className="led on" />
          {statusLabel}
        </div>
        <div className="header-motion muted">
          {derived.movementActive ? `Moving · ${derived.activeAxis}` : 'Motion idle'}
        </div>
      </div>
    </header>
  )
}
