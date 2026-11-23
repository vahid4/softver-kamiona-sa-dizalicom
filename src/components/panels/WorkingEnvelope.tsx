import { T12_LIMITS } from '../../config/limits'
import { useSimulation } from '../../state/SimulationContext'

/** Simple SVG height vs outreach envelope for training visualization. */
export function WorkingEnvelope() {
  const { derived, pose } = useSimulation()

  const W = 220
  const H = 160
  const pad = 28
  const maxX = T12_LIMITS.maxOutreachM + 0.5
  const maxY = T12_LIMITS.maxWorkingHeightM + 0.5

  const sx = (x: number) => pad + (x / maxX) * (W - pad * 1.4)
  const sy = (y: number) => H - pad - (y / maxY) * (H - pad * 1.5)

  // Conservative envelope polygon (catalog-style approximation)
  const envelope = [
    [0.4, 1.2],
    [T12_LIMITS.maxOutreachM * 0.95, 2.2],
    [T12_LIMITS.maxOutreachM, 5.5],
    [4.2, T12_LIMITS.maxWorkingHeightM],
    [1.0, T12_LIMITS.maxWorkingHeightM],
    [0.3, 3.5],
  ]

  const poly = envelope.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')
  const tipX = derived.horizontalOutreachM
  const tipY = derived.workingHeightM
  const boomLen = T12_LIMITS.boomBaseLengthM + pose.telescopeM

  return (
    <div className="envelope">
      <div className="panel-title">Working Envelope</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="envelope-svg" aria-label="Working envelope diagram">
        <rect x="0" y="0" width={W} height={H} fill="transparent" />
        {/* axes */}
        <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} stroke="#4a6280" strokeWidth="1" />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke="#4a6280" strokeWidth="1" />
        <text x={W / 2} y={H - 6} fill="#8aa0b8" fontSize="9" textAnchor="middle">
          Outreach (m)
        </text>
        <text
          x={10}
          y={H / 2}
          fill="#8aa0b8"
          fontSize="9"
          textAnchor="middle"
          transform={`rotate(-90 10 ${H / 2})`}
        >
          Height (m)
        </text>
        <polygon points={poly} fill="rgba(61,139,253,0.12)" stroke="#3d8bfd" strokeWidth="1.2" />
        {/* boom line from turret */}
        <line
          x1={sx(0.2)}
          y1={sy(T12_LIMITS.turretHeightM)}
          x2={sx(tipX)}
          y2={sy(tipY)}
          stroke="#c4a035"
          strokeWidth="2"
        />
        <circle cx={sx(tipX)} cy={sy(tipY)} r="4" fill="#22c55e" />
        <text x={sx(tipX) + 6} y={sy(tipY) - 4} fill="#e8eef6" fontSize="8">
          {tipX.toFixed(1)}m / {tipY.toFixed(1)}m
        </text>
        <text x={pad + 4} y={18} fill="#8aa0b8" fontSize="8">
          Boom {boomLen.toFixed(1)} m · sim envelope only
        </text>
      </svg>
      <p className="muted tiny">
        Training envelope using conservative T12-class assumptions — not a certified OEM chart.
      </p>
    </div>
  )
}
