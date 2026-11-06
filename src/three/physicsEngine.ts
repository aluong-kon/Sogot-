import * as THREE from 'three';

/**
 * 3D Physics and Ballistics Engine for SOGOT
 * Real-time aerodynamics, tumbling rotation, ground bounce, and throwback mechanics
 */

export interface StickPhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  angularVelocity: THREE.Vector3;
  isGrounded: boolean;
  bounces: number;
  flightTime: number;
  maxHeight: number;
}

export interface LaunchParams {
  powerPercent: number; // 0 to 100
  angleAzimuthDeg: number; // -30 to +30 deg (left to right)
  elevationDeg: number; // 15 to 45 deg (loft)
  timingAccuracy: number; // 0 to 1.0 (sweet spot alignment)
}

export class SogotPhysics {
  public state: StickPhysicsState;
  private readonly gravity = -9.81;
  private readonly airDrag = 0.018; // Aerodynamic drag
  private readonly groundRestitution = 0.42; // Bounciness on red earth
  private readonly groundFriction = 0.72; // Rolling resistance on dirt

  constructor() {
    this.state = this.createDefaultState();
  }

  public resetToHole() {
    this.state = this.createDefaultState();
  }

  private createDefaultState(): StickPhysicsState {
    return {
      position: new THREE.Vector3(0, 0.02, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, Math.PI / 2), // Resting horizontally across hole
      angularVelocity: new THREE.Vector3(0, 0, 0),
      isGrounded: true,
      bounces: 0,
      flightTime: 0,
      maxHeight: 0.02,
    };
  }

  /**
   * Stage A: Flick / Lift the short stick out of the hole
   */
  public liftFromHole(flickPower = 0.8) {
    const power = Math.max(0.4, Math.min(1.2, flickPower));
    this.state.isGrounded = false;
    this.state.bounces = 0;
    this.state.flightTime = 0;
    this.state.maxHeight = 0;

    // Upward launch with slight forward tilt and axial tumble
    this.state.velocity.set(
      (Math.random() - 0.5) * 0.3,
      4.2 * power, // Pop up ~1.5m - 2.2m
      0.4 * power,
    );

    this.state.angularVelocity.set(
      8.0 * power,
      (Math.random() - 0.5) * 4.0,
      12.0 * power,
    );
  }

  /**
   * Stage B: Strike the airborne stick with the long stick
   */
  public strikeAirborne(params: LaunchParams) {
    this.state.isGrounded = false;
    this.state.bounces = 0;
    this.state.flightTime = 0;

    // Sweet spot bonus: timing accuracy scales speed
    const timingBonus = 0.6 + params.timingAccuracy * 0.55;
    // Base speed can reach up to 45 m/s (~100 mph) for monumental hits
    const launchSpeed = (12 + (params.powerPercent / 100) * 32) * timingBonus;

    // Convert angles to radians
    const azimuthRad = (params.angleAzimuthDeg * Math.PI) / 180;
    const elevationRad = (params.elevationDeg * Math.PI) / 180;

    // Compute 3D velocity vector
    const vx = launchSpeed * Math.cos(elevationRad) * Math.sin(azimuthRad);
    const vy = launchSpeed * Math.sin(elevationRad);
    const vz = launchSpeed * Math.cos(elevationRad) * Math.cos(azimuthRad);

    this.state.velocity.set(vx, vy, vz);

    // Fast dynamic tumbling spin in flight
    this.state.angularVelocity.set(
      15 + Math.random() * 20,
      (Math.random() - 0.5) * 12,
      25 + Math.random() * 25,
    );
  }

  /**
   * Stage C: Throwback by opponent towards hole (0, 0, 0)
   */
  public throwBackTowardsHole(origin: THREE.Vector3, accuracyPercent = 75) {
    this.state.position.copy(origin);
    this.state.position.y = 1.2; // Thrown from fielder's hand height
    this.state.isGrounded = false;
    this.state.bounces = 0;
    this.state.flightTime = 0;

    const toHole = new THREE.Vector3(0, 0, 0).sub(origin);
    const distance = Math.hypot(origin.x, origin.z);

    // Calculate arc to reach hole
    const targetElevation = Math.PI / 4.5;
    const speed = Math.sqrt((distance * 9.81) / Math.sin(2 * targetElevation));

    // Scatter based on fielder accuracy
    const scatterAngle = ((100 - accuracyPercent) / 100) * 0.25 * (Math.random() - 0.5);
    const dir = new THREE.Vector2(toHole.x, toHole.z).normalize().rotateAround(new THREE.Vector2(0, 0), scatterAngle);

    this.state.velocity.set(
      dir.x * speed * Math.cos(targetElevation),
      speed * Math.sin(targetElevation),
      dir.y * speed * Math.cos(targetElevation),
    );

    this.state.angularVelocity.set(6, 4, 10);
  }

  /**
   * Physics Step
   */
  public update(delta: number): boolean {
    if (this.state.isGrounded) {
      return false;
    }

    const dt = Math.min(delta, 0.05);
    this.state.flightTime += dt;

    // Apply drag
    const speed = this.state.velocity.length();
    if (speed > 0.01) {
      const dragMag = this.airDrag * speed * speed * dt;
      const dragVec = this.state.velocity.clone().normalize().multiplyScalar(-dragMag);
      this.state.velocity.add(dragVec);
    }

    // Apply gravity
    this.state.velocity.y += this.gravity * dt;

    // Integrate position
    this.state.position.x += this.state.velocity.x * dt;
    this.state.position.y += this.state.velocity.y * dt;
    this.state.position.z += this.state.velocity.z * dt;

    if (this.state.position.y > this.state.maxHeight) {
      this.state.maxHeight = this.state.position.y;
    }

    // Integrate rotation
    this.state.rotation.x += this.state.angularVelocity.x * dt;
    this.state.rotation.y += this.state.angularVelocity.y * dt;
    this.state.rotation.z += this.state.angularVelocity.z * dt;

    // Ground Collision (y <= 0.02)
    if (this.state.position.y <= 0.02) {
      this.state.position.y = 0.02;
      this.state.bounces++;

      // Velocity reflection on bounce
      this.state.velocity.y = -this.state.velocity.y * this.groundRestitution;
      this.state.velocity.x *= this.groundFriction;
      this.state.velocity.z *= this.groundFriction;

      // Dampen tumble on contact
      this.state.angularVelocity.multiplyScalar(0.5);

      // Check for resting condition
      const horizontalSpeed = Math.hypot(this.state.velocity.x, this.state.velocity.z);
      if (Math.abs(this.state.velocity.y) < 0.35 && horizontalSpeed < 0.25) {
        this.state.isGrounded = true;
        this.state.velocity.set(0, 0, 0);
        this.state.angularVelocity.set(0, 0, 0);
        this.state.rotation.x = 0;
        this.state.rotation.z = Math.PI / 2; // Lies flat
        return true; // Just settled
      }
    }

    return false;
  }

  /**
   * Distance from launcher hole (0,0) to current resting spot
   */
  public getDistanceMeters(): number {
    return Math.hypot(this.state.position.x, this.state.position.z);
  }
}
