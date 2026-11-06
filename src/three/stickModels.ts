import * as THREE from 'three';
import { createWoodGrainTexture } from './proceduralTextures';

/**
 * Procedural 3D Stick Models for SOGOT
 * Built as multi-part composite groups adhering to Three.js 3-12 part directives
 */

export interface StickObjects {
  longStick: THREE.Group;
  shortStick: THREE.Group;
}

export function createLongStick(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'LongStickGroup';

  const woodTexture = createWoodGrainTexture(false);
  const darkWoodTexture = createWoodGrainTexture(true);

  // Material 1: Polished carved acacia wood
  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.42,
    metalness: 0.05,
    bumpMap: woodTexture,
    bumpScale: 0.02,
  });

  // Material 2: Weathered striking tip
  const tipMaterial = new THREE.MeshStandardMaterial({
    map: darkWoodTexture,
    roughness: 0.75,
    metalness: 0.02,
  });

  // Material 3: Fiber cord grip binding
  const cordMaterial = new THREE.MeshStandardMaterial({
    color: '#3a2312',
    roughness: 0.9,
    metalness: 0.0,
  });

  // Material 4: Polished pommel
  const pommelMaterial = new THREE.MeshStandardMaterial({
    color: '#82491e',
    roughness: 0.35,
    metalness: 0.1,
  });

  // 1. Primary Shaft - main branch length (~0.85m)
  const shaftGeo = new THREE.CylinderGeometry(0.016, 0.019, 0.65, 16);
  const shaft = new THREE.Mesh(shaftGeo, woodMaterial);
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  shaft.position.y = 0.4;
  group.add(shaft);

  // 2. Striking Head - slightly wider, beveled contact edge
  const headGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.18, 16);
  const head = new THREE.Mesh(headGeo, tipMaterial);
  head.castShadow = true;
  head.position.y = 0.78;
  group.add(head);

  // 3. Beveled Tip Crown
  const crownGeo = new THREE.ConeGeometry(0.022, 0.04, 16);
  const crown = new THREE.Mesh(crownGeo, tipMaterial);
  crown.castShadow = true;
  crown.position.y = 0.89;
  group.add(crown);

  // 4. Handle Grip Section (Wrapped plant-fiber string)
  const gripGeo = new THREE.CylinderGeometry(0.0205, 0.0205, 0.18, 16);
  const grip = new THREE.Mesh(gripGeo, cordMaterial);
  grip.castShadow = true;
  grip.position.y = 0.12;
  group.add(grip);

  // 5. Grip wrapping rings (decorative ribbed coils)
  for (let i = 0; i < 5; i++) {
    const ringGeo = new THREE.TorusGeometry(0.021, 0.003, 8, 20);
    const ring = new THREE.Mesh(ringGeo, cordMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04 + i * 0.04;
    group.add(ring);
  }

  // 6. Base Pommel / Counterweight
  const pommelGeo = new THREE.SphereGeometry(0.023, 16, 12);
  const pommel = new THREE.Mesh(pommelGeo, pommelMaterial);
  pommel.castShadow = true;
  pommel.position.y = 0.015;
  group.add(pommel);

  // 7. Lifting flick notch (recessed groove near tip)
  const notchGeo = new THREE.BoxGeometry(0.012, 0.04, 0.012);
  const notch = new THREE.Mesh(notchGeo, tipMaterial);
  notch.position.set(0.015, 0.75, 0);
  group.add(notch);

  // Bottom contact shadow plane
  const shadowGeo = new THREE.PlaneGeometry(0.08, 0.9);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: '#1a0d06',
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  group.add(shadow);

  return group;
}

export function createShortStick(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ShortStickGroup';

  const woodTexture = createWoodGrainTexture(false);
  const darkWoodTexture = createWoodGrainTexture(true);

  const mainMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.48,
    metalness: 0.04,
    bumpMap: woodTexture,
    bumpScale: 0.015,
  });

  const carvedTipMat = new THREE.MeshStandardMaterial({
    map: darkWoodTexture,
    roughness: 0.7,
    metalness: 0.02,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: '#421a08',
    roughness: 0.6,
    metalness: 0.05,
  });

  // Total length ~0.22m (22cm traditional short stick)
  // 1. Central cylindrical body
  const bodyGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 16);
  const body = new THREE.Mesh(bodyGeo, mainMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 2. Left carved chisel tip (traditionally beveled for popping out of the hole)
  const tip1Geo = new THREE.ConeGeometry(0.015, 0.045, 16);
  const tip1 = new THREE.Mesh(tip1Geo, carvedTipMat);
  tip1.castShadow = true;
  tip1.position.y = 0.07 + 0.0225;
  group.add(tip1);

  // 3. Right carved chisel tip
  const tip2Geo = new THREE.ConeGeometry(0.015, 0.045, 16);
  const tip2 = new THREE.Mesh(tip2Geo, carvedTipMat);
  tip2.castShadow = true;
  tip2.rotation.z = Math.PI;
  tip2.position.y = -0.07 - 0.0225;
  group.add(tip2);

  // 4. Center balance notch
  const notchGeo = new THREE.TorusGeometry(0.0155, 0.0025, 8, 20);
  const notch = new THREE.Mesh(notchGeo, accentMat);
  notch.rotation.x = Math.PI / 2;
  group.add(notch);

  // 5. Dual traditional identification burned bands
  const band1 = new THREE.TorusGeometry(0.0153, 0.002, 8, 20);
  const ring1 = new THREE.Mesh(band1, accentMat);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = 0.038;
  group.add(ring1);

  const ring2 = new THREE.Mesh(band1, accentMat);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = -0.038;
  group.add(ring2);

  // Contact shadow
  const shadowGeo = new THREE.PlaneGeometry(0.06, 0.24);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: '#1a0d06',
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  group.add(shadow);

  return group;
}
