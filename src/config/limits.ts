/**
 * Conservative Apache T12-class simulation limits.
 * Catalog-style approximations for training only — NOT a certified OEM load chart.
 */
export const T12_LIMITS = {
  /** Approximate max working height from ground (m) */
  maxWorkingHeightM: 12.0,
  /** Approximate max horizontal outreach from rotation center (m) */
  maxOutreachM: 6.5,
  /** Basket floor height above ground when boom stowed (m) */
  basketFloorOffsetM: 1.1,
  /** Turret pivot height above ground (m) */
  turretHeightM: 1.35,
  /** Main boom length when fully retracted (m) */
  boomBaseLengthM: 4.2,
  /** Max telescope extension beyond base boom (m) */
  maxTelescopeM: 4.8,
  /** Boom elevation angle limits (degrees) */
  boomAngleMinDeg: -5,
  boomAngleMaxDeg: 78,
  /** Soft-stop margin before hard limit (degrees / meters) */
  softStopAngleDeg: 2,
  softStopTelescopeM: 0.15,
  /** Max boom raise allowed before stabilizers ready (degrees) */
  boomAngleWithoutStabilizersDeg: 8,
  /** Turret rotation range relative to truck forward (degrees) */
  rotationMinDeg: -180,
  rotationMaxDeg: 180,
  /** Simulated rated basket load (kg) */
  ratedBasketLoadKg: 200,
  /** Simulated overload threshold (kg) */
  overloadThresholdKg: 200,
  /** Hydraulic pressure nominal / max (bar) */
  hydraulicNominalBar: 180,
  hydraulicMaxBar: 210,
  /** Motion rates at Normal speed (units per second) */
  rates: {
    boomDegPerSec: 8,
    telescopeMPerSec: 0.45,
    rotateDegPerSec: 18,
    stabilizerPerSec: 0.35,
  },
  /** Speed multipliers */
  speedMultipliers: {
    slow: 0.4,
    normal: 1,
    fast: 1.75,
  },
} as const

export type SpeedPreset = keyof typeof T12_LIMITS.speedMultipliers
