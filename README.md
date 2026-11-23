# SOCAGE APACHE T12 – Aerial Platform Control System

Browser-based **Simulation Mode** control panel for a Socage Apache T12-class telescopic aerial platform on a truck. Built with Vite, React, TypeScript, and React Three Fiber.

**This software is a simulation for demonstration and training only. It is not a certified machine controller.** Live Machine Control is locked until an approved OEM/authorized integrator interface exists and must never bypass factory safety systems.

## Run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Modes

| Mode | Status |
|------|--------|
| **Simulation Mode** | Fully interactive virtual machine |
| **Live Machine Control** | Locked stub (`src/live/`) — no fabricated sensor data |

The banner **SIMULATION MODE – NOT CONNECTED TO REAL MACHINE** is always visible in simulation.

## Quick demo (Simulation)

1. Click **SYSTEM POWER** → **ENGINE** → **HYDRAULIC** → ensure **CONTROL STATION** is on (System Ready).
2. Or click **PREPARE PLATFORM** to extend/lower stabilizers and raise the boom slightly.
3. Hold **BOOM UP / DOWN**, **EXTEND / RETRACT**, **ROTATE LEFT / RIGHT**, or use the virtual joystick.
4. Keyboard (hold-to-move): `W`/`S` boom, `A`/`D` rotate, `E`/`Q` telescope, `Space` stop, `R` reset.
5. Change **SLOW / NORMAL / FAST** speed; use camera presets on the right.
6. Watch Safety Monitoring and the working-envelope diagram as you approach limits.

Release any hold control (or the joystick) to stop motion immediately. **STOP MOVEMENT** / software stop halt simulated motion only — they are not a physical E-stop.

## T12-class limit assumptions (simulation only)

Conservative catalog-style values used for clamping. **Not a certified OEM load chart.**

| Parameter | Assumed value |
|-----------|----------------|
| Max working height | ~12.0 m |
| Max horizontal outreach | ~6.5 m |
| Boom angle | −5° … 78° |
| Max telescope extension | 4.8 m |
| Turret rotation | ±180° |
| Rated basket load (sim) | 200 kg |
| Stabilizers | Required before boom raise past ~8° |

The on-screen working envelope is a training visualization using these assumptions.

## Features

- Procedural 3D truck + telescopic boom (cabin, chassis, wheels, turret, boom segments, basket, cylinders, stabilizers)
- Hold-to-move boom / telescope / rotate / stabilizers
- Basket auto-level indicator (T12-plausible functions only)
- Virtual joystick (+ optional Gamepad API)
- Live Machine Data panel (labeled **Simulated**)
- Safety warnings with enforced sim limits
- Settings: theme, sensitivity, sim speed, graphics, units, scenario, remappable keys
- Industrial dark-blue control-panel UI (English only)

## Safety disclaimer

Software simulation for demonstration/training. Not a certified machine controller. Live control requires OEM/authorized integrator approval and must not bypass factory safety. Software stop is supplemental and is not a physical emergency stop. There is no software bypass for emergency descent on a real machine.

## Project layout

- `src/components/` — UI panels, 3D scene, controls
- `src/state/` — simulation physics and React context
- `src/config/limits.ts` — T12-class sim limits
- `src/live/` — gated Live Machine Control stub
