# Live Machine Control (locked)

This folder is the integration boundary for a future **Live Machine Control** path.

## Status

**Disabled.** No live sensors, actuators, or fabricated telemetry.

## Required gates

1. OEM / authorized integrator documentation for Socage Apache T12 control interface  
2. Formal risk assessment and functional safety review  
3. Approved hardware/software interface (protocol, authentication, watchdog, E-stop)  
4. Factory safety systems remain authoritative — software must not bypass them  
5. Commissioning, validation, and operator training sign-off  

## Rules

- Do not invent live sensor values.
- When disconnected, UI must show `Connection Lost / Data Unavailable` or `Not Available`.
- Software stop is supplemental only and is not a physical emergency stop.
