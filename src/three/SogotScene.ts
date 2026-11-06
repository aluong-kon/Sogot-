import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createLongStick, createShortStick } from './stickModels';
import { buildEnvironment, EnvironmentResult } from './environment';
import { SogotPhysics, LaunchParams } from './physicsEngine';

export type CameraPreset = 'batter_pov' | 'dynamic' | 'top_down' | 'free_orbit';

export interface SceneCallbacks {
  onGroundBounce: (strength: number, pos: THREE.Vector3) => void;
  onLanded: (distanceMeters: number, pos: THREE.Vector3) => void;
}

export class SogotScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public physics: SogotPhysics;

  private container: HTMLDivElement;
  private animFrameId: number = 0;
  private isDisposed: boolean = false;
  private isSoftwareGl: boolean = false;

  private longStick: THREE.Group;
  private shortStick: THREE.Group;
  private env: EnvironmentResult;

  // Dust impact particles
  private impactParticles: THREE.Points;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private activeParticleCount: number = 0;

  // Camera settings
  private cameraPreset: CameraPreset = 'batter_pov';
  private targetCamPos = new THREE.Vector3();
  private targetCamLook = new THREE.Vector3();

  // Animation states
  private swingProgress: number = 0;
  private isSwinging: boolean = false;
  private liftProgress: number = 0;
  private isLifting: boolean = false;

  private callbacks: SceneCallbacks;

  constructor(container: HTMLDivElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.physics = new SogotPhysics();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene
    this.scene = new THREE.Scene();
    const skyHorizonColor = new THREE.Color('#d98236');
    this.scene.background = new THREE.Color('#d47b3b');
    this.scene.fog = new THREE.FogExp2(skyHorizonColor, 0.0075);

    // 3. Setup Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 500);

    // 4. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 5. Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Rig (Warm golden African daylight + cool sky fill)
    const hemisphereLight = new THREE.HemisphereLight('#ffd9aa', '#7c3a16', 0.85);
    this.scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight('#fff0d4', 2.2);
    sunLight.position.set(25, 45, -20);
    sunLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 120;
      const d = 30;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    // Warm rim light for wooden edge pop
    const rimLight = new THREE.DirectionalLight('#ff9944', 0.9);
    rimLight.position.set(-20, 15, 30);
    this.scene.add(rimLight);

    // 7. Build Environment, Grounds, Hole, Trees
    this.env = buildEnvironment(this.scene);

    // 8. Build Sticks
    this.longStick = createLongStick();
    this.shortStick = createShortStick();
    this.scene.add(this.longStick);
    this.scene.add(this.shortStick);

    this.resetStickPositions();

    // 9. Particle Impact Emitter (Dust burst on hit/landing)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(pCount * 3);
    this.particleVelocities = new Float32Array(pCount * 3);
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: '#e29d62',
      size: 0.18,
      transparent: true,
      opacity: 0.75,
    });
    this.impactParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.impactParticles);

    // 10. Initial Camera Position
    this.setCameraPreset('batter_pov', true);

    // Listeners
    window.addEventListener('resize', this.onResize);

    // Start Animation Loop
    this.startLoop();
  }

  public setCameraPreset(preset: CameraPreset, immediate = false) {
    this.cameraPreset = preset;

    if (preset === 'batter_pov') {
      this.targetCamPos.set(0, 1.6, -1.8);
      this.targetCamLook.set(0, 0.4, 6.0);
    } else if (preset === 'top_down') {
      this.targetCamPos.set(0, 12, 12);
      this.targetCamLook.set(0, 0, 15);
    } else if (preset === 'free_orbit') {
      this.targetCamPos.set(-2.5, 1.2, -1.2);
      this.targetCamLook.set(0, 0.2, 0);
    } else if (preset === 'dynamic') {
      this.updateDynamicCameraTarget();
    }

    if (immediate) {
      this.camera.position.copy(this.targetCamPos);
      this.camera.lookAt(this.targetCamLook);
    }
  }

  public resetStickPositions() {
    this.physics.resetToHole();

    // Short stick rests across hole: x: 0, y: 0.02, z: 0
    this.shortStick.position.set(0, 0.02, 0);
    this.shortStick.rotation.set(0, 0, Math.PI / 2);

    // Long stick held angled in hitter's ready stance
    this.longStick.position.set(0.28, 0.04, -0.22);
    this.longStick.rotation.set(-0.4, 0.3, 0.6);

    this.isSwinging = false;
    this.swingProgress = 0;
    this.isLifting = false;
    this.liftProgress = 0;

    this.setCameraPreset(this.cameraPreset);
  }

  /**
   * Action A: Perform Lift / Flick Animation
   */
  public triggerLift(flickPower = 0.8) {
    this.isLifting = true;
    this.liftProgress = 0;
    this.physics.liftFromHole(flickPower);
    this.spawnDustPuff(new THREE.Vector3(0, 0.02, 0), 25);
  }

  /**
   * Action B: Perform Strike Swing
   */
  public triggerStrike(params: LaunchParams) {
    this.isSwinging = true;
    this.swingProgress = 0;
    this.physics.strikeAirborne(params);

    // Dust & wooden spark burst at strike point
    this.spawnDustPuff(this.shortStick.position.clone(), 60);
  }

  /**
   * Action C: Throwback towards the launcher
   */
  public triggerThrowback(fielderPos: THREE.Vector3) {
    this.physics.throwBackTowardsHole(fielderPos);
  }

  /**
   * Spawn interactive dust burst
   */
  public spawnDustPuff(origin: THREE.Vector3, count = 30) {
    const startIdx = this.activeParticleCount % 150;
    for (let i = 0; i < count; i++) {
      const idx = (startIdx + i) % 200;
      this.particlePositions[idx * 3] = origin.x + (Math.random() - 0.5) * 0.1;
      this.particlePositions[idx * 3 + 1] = origin.y + Math.random() * 0.1;
      this.particlePositions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.1;

      this.particleVelocities[idx * 3] = (Math.random() - 0.5) * 2.5;
      this.particleVelocities[idx * 3 + 1] = 1.0 + Math.random() * 3.0;
      this.particleVelocities[idx * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    this.activeParticleCount += count;
    this.impactParticles.geometry.attributes.position.needsUpdate = true;
  }

  private updateDynamicCameraTarget() {
    const stickPos = this.shortStick.position;

    // Follow camera: smoothly trails behind and slightly above the stick
    this.targetCamPos.set(
      stickPos.x * 0.4 - 1.8,
      Math.max(2.2, stickPos.y + 1.8),
      Math.max(-2, stickPos.z - 5.5),
    );
    this.targetCamLook.set(stickPos.x, Math.max(0.4, stickPos.y * 0.7), stickPos.z + 4);
  }

  private startLoop() {
    let lastTime = performance.now();

    const tick = () => {
      if (this.isDisposed) return;

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // 1. Step Physics
      const prevY = this.physics.state.velocity.y;
      const justLanded = this.physics.update(delta);

      // Detect ground bounce
      if (
        !this.physics.state.isGrounded &&
        this.physics.state.position.y <= 0.03 &&
        Math.abs(prevY) > 1.2
      ) {
        this.callbacks.onGroundBounce(Math.abs(prevY), this.physics.state.position);
        this.spawnDustPuff(this.physics.state.position, 20);
      }

      if (justLanded) {
        const dist = this.physics.getDistanceMeters();
        this.callbacks.onLanded(dist, this.physics.state.position);
        this.spawnDustPuff(this.physics.state.position, 35);
      }

      // 2. Sync Short Stick 3D Mesh
      this.shortStick.position.copy(this.physics.state.position);
      this.shortStick.rotation.copy(this.physics.state.rotation);

      // 3. Animate Long Stick Swing / Flick
      if (this.isLifting) {
        this.liftProgress += delta * 4.5;
        if (this.liftProgress < 1.0) {
          // Lever motion
          this.longStick.rotation.x = -0.4 + Math.sin(this.liftProgress * Math.PI) * 1.2;
          this.longStick.position.y = 0.04 + Math.sin(this.liftProgress * Math.PI) * 0.35;
        } else {
          this.isLifting = false;
        }
      }

      if (this.isSwinging) {
        this.swingProgress += delta * 6.5;
        if (this.swingProgress < 1.0) {
          // Horizontal batting stroke
          const swingAngle = -1.2 + this.swingProgress * 2.8;
          this.longStick.rotation.set(-0.2, swingAngle, 0.4);
          this.longStick.position.set(0.1 + Math.sin(swingAngle) * 0.3, 0.4, -0.1);
        } else {
          this.isSwinging = false;
          // Settle back to rest position smoothly
        }
      }

      // 4. Update Dust Particles
      for (let i = 0; i < 200; i++) {
        const py = this.particlePositions[i * 3 + 1];
        if (py > 0.01) {
          this.particleVelocities[i * 3 + 1] -= 9.8 * delta;
          this.particlePositions[i * 3] += this.particleVelocities[i * 3] * delta;
          this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * delta;
          this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * delta;

          if (this.particlePositions[i * 3 + 1] < 0.01) {
            this.particlePositions[i * 3 + 1] = 0;
          }
        }
      }
      this.impactParticles.geometry.attributes.position.needsUpdate = true;

      // 5. Camera Damping
      if (this.cameraPreset === 'dynamic') {
        this.updateDynamicCameraTarget();
      }

      // Exponential smooth damping
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCamPos.x, 5.0, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCamPos.y, 5.0, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCamPos.z, 5.0, delta);

      // Smooth look-at
      const currentLook = new THREE.Vector3();
      this.camera.getWorldDirection(currentLook);
      const lookTargetDir = this.targetCamLook.clone().sub(this.camera.position).normalize();
      currentLook.lerp(lookTargetDir, Math.min(1.0, 6.0 * delta));
      this.camera.lookAt(this.camera.position.clone().add(currentLook));

      // 6. Render
      this.renderer.render(this.scene, this.camera);

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  private onResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);

    // Dispose Three.js objects
    this.scene.clear();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
