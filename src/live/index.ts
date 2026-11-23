/**
 * Live Machine Control — gated integration stub.
 *
 * This module is intentionally non-operational. Do not invent live sensor values.
 *
 * Integration gates before enabling:
 * 1. OEM / authorized integrator documentation for the Apache T12 control interface
 * 2. Formal risk assessment and functional safety review
 * 3. Approved hardware/software interface (protocol, auth, watchdog, E-stop wiring)
 * 4. Factory safety systems remain authoritative — no software bypass
 * 5. Commissioning, validation, and operator training sign-off
 *
 * Until these gates are met, UI entry must remain disabled.
 */

export type LiveIntegrationStatus = {
  enabled: boolean
  reason: string
  gates: { id: string; description: string; satisfied: boolean }[]
}

export function getLiveIntegrationStatus(): LiveIntegrationStatus {
  return {
    enabled: false,
    reason:
      'Live Machine Control is locked until an approved manufacturer/integrator interface is available.',
    gates: [
      {
        id: 'oem-docs',
        description: 'OEM / authorized integrator interface documentation received',
        satisfied: false,
      },
      {
        id: 'risk-assessment',
        description: 'Risk assessment and functional safety review completed',
        satisfied: false,
      },
      {
        id: 'approved-interface',
        description: 'Approved hardware interface with watchdog and E-stop integration',
        satisfied: false,
      },
      {
        id: 'no-bypass',
        description: 'Confirmation that factory safety systems cannot be bypassed',
        satisfied: false,
      },
      {
        id: 'commissioning',
        description: 'Commissioning, validation, and operator training sign-off',
        satisfied: false,
      },
    ],
  }
}

/** Placeholder — never returns fabricated telemetry. */
export function readLiveTelemetry(): null {
  return null
}
