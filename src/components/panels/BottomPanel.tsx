import { ToggleButton } from '../controls/HoldButton'
import { useSimulation } from '../../state/SimulationContext'

export function BottomPanel() {
  const {
    system,
    limitMessage,
    derived,
    stopMovement,
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
  } = useSimulation()

  return (
    <footer className="bottom-panel">
      <section className="control-section bottom-system">
        <div className="panel-title">System Control</div>
        <div className="btn-row wrap">
          <ToggleButton
            label={system.powerOn ? 'POWER ON' : 'SYSTEM POWER'}
            active={system.powerOn}
            variant="ok"
            onClick={togglePower}
          />
          <ToggleButton
            label="ENGINE"
            active={system.engineRunning}
            disabled={!system.powerOn}
            onClick={toggleEngine}
          />
          <ToggleButton
            label="HYDRAULIC"
            active={system.hydraulicOn}
            disabled={!system.powerOn || !system.engineRunning}
            onClick={toggleHydraulic}
          />
          <ToggleButton
            label="CONTROL STATION"
            active={system.controlStationActive}
            disabled={!system.powerOn}
            onClick={toggleControlStation}
          />
          <ToggleButton
            label={system.systemReady ? 'SYSTEM READY' : 'NOT READY'}
            active={system.systemReady}
            variant={system.systemReady ? 'ok' : 'default'}
            onClick={() => undefined}
            disabled
          />
          <button type="button" className="hold-btn" onClick={preparePlatform}>
            PREPARE PLATFORM
          </button>
          <button type="button" className="hold-btn" onClick={returnToTransport}>
            RETURN TO TRANSPORT
          </button>
          <button type="button" className="hold-btn" onClick={resetSimulation}>
            RESET SIMULATION
          </button>
          <button type="button" className="hold-btn" onClick={() => setShowSettings(true)}>
            SETTINGS
          </button>
          <button type="button" className="hold-btn hold-btn--accent" onClick={() => setShowLiveInfo(true)}>
            LIVE MACHINE CONTROL
          </button>
        </div>
      </section>

      <section className="bottom-status">
        <div className="status-line">
          <span className={`led ${system.powerOn ? 'on' : ''}`} /> Power
          <span className={`led ${system.systemReady ? 'on' : ''}`} /> Ready
          <span className={`led ${system.engineRunning ? 'on' : ''}`} /> Engine
          <span className={`led ${system.hydraulicOn ? 'on' : ''}`} /> Hydraulics
          <span className={`led ${derived.movementActive ? 'warn' : ''}`} /> Motion
          <span className={`led ${system.emergencyStopActive ? 'crit' : ''}`} /> E-Stop
        </div>
        {limitMessage && <div className="limit-toast">{limitMessage}</div>}
        <div className="disclaimer-inline">
          Simulation for demonstration/training only. Not a certified machine controller. Software stop
          is supplemental — it is not a physical emergency stop.
        </div>
      </section>

      <section className="bottom-estop">
        <button type="button" className="hold-btn hold-btn--danger full big" onClick={stopMovement}>
          STOP MOVEMENT
        </button>
        <ToggleButton
          label={
            system.softwareStop ? 'SOFTWARE STOP ACTIVE' : 'SOFTWARE STOP'
          }
          active={system.softwareStop}
          variant="danger"
          onClick={toggleSoftwareStop}
        />
        <ToggleButton
          label={
            system.emergencyStopActive
              ? 'E-STOP ACTIVE (SIM INDICATOR)'
              : 'E-STOP STATUS (SIM)'
          }
          active={system.emergencyStopActive}
          variant="danger"
          onClick={toggleEStop}
        />
        <p className="muted tiny">
          Software stop halts simulated motion only. No software bypass for emergency descent on a real
          machine.
        </p>
      </section>
    </footer>
  )
}
