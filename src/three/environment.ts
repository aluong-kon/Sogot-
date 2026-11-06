import * as THREE from 'three';
import {
  createSavannahDirtTexture,
  createDirtBumpMap,
  createCircularBoundaryTexture,
  createDistanceMarkerTexture,
  createSouthSudanFlagTexture,
} from './proceduralTextures';

/**
 * 3D South Sudanese Savannah Playing Field Environment for SOGOT
 */

export interface EnvironmentResult {
  ground: THREE.Mesh;
  holeGroup: THREE.Group;
  boundaryDecal: THREE.Mesh;
  fieldersGroup: THREE.Group;
  distanceMarkersGroup: THREE.Group;
  treesGroup: THREE.Group;
  dustParticles: THREE.Points;
}

export function buildEnvironment(scene: THREE.Scene): EnvironmentResult {
  const dirtTexture = createSavannahDirtTexture();
  const dirtBump = createDirtBumpMap();

  // 1. Huge Continuous Outdoor Ground Plane (260m long x 140m wide)
  const groundGeo = new THREE.PlaneGeometry(160, 320, 64, 64);
  // Add subtle terrain elevation wave to ground
  const posAttr = groundGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    // Keep playing strip near (0,0 to 0, 150) very flat, gentle rolls on flanks
    const distFromCenter = Math.abs(x);
    if (distFromCenter > 15) {
      const elevation = Math.sin(x * 0.04) * Math.cos(y * 0.03) * 0.8;
      posAttr.setZ(i, elevation);
    }
  }
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    map: dirtTexture,
    bumpMap: dirtBump,
    bumpScale: 0.03,
    roughness: 0.88,
    metalness: 0.02,
  });

  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  // Offset so the launcher hole is at z = 0, and the launch fairway stretches down positive Z
  ground.position.set(0, 0, 100);
  scene.add(ground);

  // 2. The Traditional Launcher Hole (Dhol/Pit)
  // Excavated trench (~0.35m long, 0.12m wide, 0.08m deep)
  const holeGroup = new THREE.Group();
  holeGroup.name = 'LauncherHoleGroup';
  holeGroup.position.set(0, 0, 0);

  // Excavation rim (darker soil collar)
  const rimGeo = new THREE.RingGeometry(0.08, 0.32, 24);
  const rimMat = new THREE.MeshStandardMaterial({
    color: '#54210e',
    roughness: 0.95,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.002;
  rim.receiveShadow = true;
  holeGroup.add(rim);

  // Interior trench geometry
  const trenchGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.08, 20);
  const trenchMat = new THREE.MeshStandardMaterial({
    color: '#2b0f05',
    roughness: 0.98,
  });
  const trench = new THREE.Mesh(trenchGeo, trenchMat);
  trench.position.y = -0.04;
  trench.scale.set(1.4, 1.0, 2.2); // Elongated along launch axis
  trench.receiveShadow = true;
  holeGroup.add(trench);

  // Two resting notch stones on the trench edges for resting the short stick
  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#8c7662',
    roughness: 0.8,
  });
  const stone1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035, 1), stoneMat);
  stone1.position.set(-0.14, 0.015, 0);
  stone1.castShadow = true;
  holeGroup.add(stone1);

  const stone2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.032, 1), stoneMat);
  stone2.position.set(0.14, 0.015, 0);
  stone2.castShadow = true;
  holeGroup.add(stone2);

  scene.add(holeGroup);

  // 3. Circular Boundary Decal (Traditional safety ring around the launcher)
  const boundaryTexture = createCircularBoundaryTexture();
  const boundaryGeo = new THREE.PlaneGeometry(5.2, 5.2);
  const boundaryMat = new THREE.MeshBasicMaterial({
    map: boundaryTexture,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const boundaryDecal = new THREE.Mesh(boundaryGeo, boundaryMat);
  boundaryDecal.rotation.x = -Math.PI / 2;
  boundaryDecal.position.set(0, 0.003, 0);
  scene.add(boundaryDecal);

  // 4. Distance Markers along the fairway (10m, 25m, 50m, 75m, 100m, 150m, 200m)
  const distanceMarkersGroup = new THREE.Group();
  distanceMarkersGroup.name = 'DistanceMarkers';

  const distances = [10, 25, 50, 75, 100, 150, 200];
  const flagTex = createSouthSudanFlagTexture();

  distances.forEach((dist) => {
    // Both left and right side of fairway
    [-1, 1].forEach((side) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.set(side * 8, 0, dist);

      // Wooden pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 3.2, 12);
      const poleMat = new THREE.MeshStandardMaterial({ color: '#523821', roughness: 0.7 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 1.6;
      pole.castShadow = true;
      markerGroup.add(pole);

      // Distance billboard
      const bannerTex = createDistanceMarkerTexture(`${dist}m`);
      const bannerGeo = new THREE.PlaneGeometry(1.6, 0.8);
      const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.4 });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, 2.7, 0);
      banner.rotation.y = side === 1 ? -Math.PI / 6 : Math.PI / 6;
      banner.castShadow = true;
      markerGroup.add(banner);

      // South Sudan small flag on top
      if (dist === 50 || dist === 100 || dist === 200) {
        const flagGeo = new THREE.PlaneGeometry(1.2, 0.6);
        const flagMat = new THREE.MeshStandardMaterial({
          map: flagTex,
          side: THREE.DoubleSide,
          roughness: 0.5,
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0.6 * side, 3.2, 0);
        flag.castShadow = true;
        markerGroup.add(flag);
      }

      // Stone base grounding
      const baseStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), stoneMat);
      baseStone.position.y = 0.12;
      baseStone.castShadow = true;
      markerGroup.add(baseStone);

      distanceMarkersGroup.add(markerGroup);
    });

    // Faint chalk line across the fairway at milestone distances (25, 50, 100)
    if (dist === 25 || dist === 50 || dist === 100) {
      const lineGeo = new THREE.PlaneGeometry(14, 0.2);
      const lineMat = new THREE.MeshBasicMaterial({
        color: '#f0ebe1',
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.003, dist);
      distanceMarkersGroup.add(line);
    }
  });

  scene.add(distanceMarkersGroup);

  // 5. Procedural Acacia Trees & Savannah Landscape
  const treesGroup = new THREE.Group();
  treesGroup.name = 'SavannahTrees';

  // Seeded coordinates for natural acacia placement outside the fairway
  const treePositions = [
    { x: -22, z: 20, s: 1.2 },
    { x: 24, z: 35, s: 1.1 },
    { x: -30, z: 65, s: 1.35 },
    { x: 28, z: 85, s: 1.4 },
    { x: -26, z: 120, s: 1.3 },
    { x: 32, z: 145, s: 1.5 },
    { x: -35, z: 180, s: 1.6 },
    { x: 38, z: 210, s: 1.7 },
    { x: -16, z: -15, s: 1.0 },
    { x: 18, z: -18, s: 1.1 },
    { x: -45, z: 40, s: 1.4 },
    { x: 48, z: 70, s: 1.3 },
  ];

  treePositions.forEach((pos) => {
    const tree = createAcaciaTree(pos.s);
    tree.position.set(pos.x, 0, pos.z);
    treesGroup.add(tree);
  });

  scene.add(treesGroup);

  // 6. Savannah Grass Clumps (Tufts)
  const grassMat = new THREE.MeshStandardMaterial({
    color: '#8a7d3f', // Dry savannah yellow-green
    roughness: 0.9,
    side: THREE.DoubleSide,
  });

  const grassGeo = new THREE.PlaneGeometry(0.6, 0.8);
  const grassInstanced = new THREE.InstancedMesh(grassGeo, grassMat, 90);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < 90; i++) {
    // Keep central fairway (x: -5 to 5, z: 0 to 180) clear
    const angle = Math.random() * Math.PI * 2;
    const radius = 9 + Math.random() * 55;
    const x = Math.cos(angle) * radius;
    const z = Math.abs(Math.sin(angle) * (radius * 2.5));

    dummy.position.set(x, 0.4, z);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.scale.set(0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.6, 1);
    dummy.updateMatrix();
    grassInstanced.setMatrixAt(i, dummy.matrix);
  }
  grassInstanced.instanceMatrix.needsUpdate = true;
  grassInstanced.computeBoundingSphere();
  scene.add(grassInstanced);

  // 7. Opponent Fielders Group (Stylized 3D character avatars placed on the field)
  const fieldersGroup = new THREE.Group();
  fieldersGroup.name = 'FieldersGroup';

  const fielderPositions = [
    { x: -4, z: 35, name: 'Deng' },
    { x: 6, z: 48, name: 'Ajak' },
    { x: -8, z: 75, name: 'Bol' },
    { x: 5, z: 95, name: 'Garang' },
    { x: -3, z: 125, name: 'Majok' },
  ];

  fielderPositions.forEach((f) => {
    const fielder = createFielderCharacter(f.name);
    fielder.position.set(f.x, 0, f.z);
    fieldersGroup.add(fielder);
  });

  scene.add(fieldersGroup);

  // 8. Procedural Ambient Dust Particles
  const dustCount = 180;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 60;
    dustPositions[i * 3 + 1] = 0.2 + Math.random() * 8.0;
    dustPositions[i * 3 + 2] = -10 + Math.random() * 150;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

  const dustMat = new THREE.PointsMaterial({
    color: '#d6975a',
    size: 0.14,
    transparent: true,
    opacity: 0.4,
  });
  const dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  return {
    ground,
    holeGroup,
    boundaryDecal,
    fieldersGroup,
    distanceMarkersGroup,
    treesGroup,
    dustParticles,
  };
}

/**
 * Creates a 5-part procedural Umbrella Acacia Tree (Acacia tortilis)
 */
function createAcaciaTree(scale = 1.0): THREE.Group {
  const group = new THREE.Group();

  const barkMat = new THREE.MeshStandardMaterial({
    color: '#3d2516',
    roughness: 0.9,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: '#556b2f', // Olive green savannah foliage
    roughness: 0.85,
  });

  // 1. Slanted Main Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.22 * scale, 0.35 * scale, 4.5 * scale, 12);
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.position.set(0, 2.25 * scale, 0);
  trunk.rotation.z = (Math.random() - 0.5) * 0.15;
  trunk.castShadow = true;
  group.add(trunk);

  // 2. Crown Branch Forks (Y-fork)
  const branch1Geo = new THREE.CylinderGeometry(0.14 * scale, 0.2 * scale, 3.2 * scale, 8);
  const branch1 = new THREE.Mesh(branch1Geo, barkMat);
  branch1.position.set(0.9 * scale, 4.8 * scale, 0.2 * scale);
  branch1.rotation.z = -0.55;
  branch1.castShadow = true;
  group.add(branch1);

  const branch2Geo = new THREE.CylinderGeometry(0.13 * scale, 0.19 * scale, 3.0 * scale, 8);
  const branch2 = new THREE.Mesh(branch2Geo, barkMat);
  branch2.position.set(-0.85 * scale, 4.7 * scale, -0.3 * scale);
  branch2.rotation.z = 0.52;
  branch2.castShadow = true;
  group.add(branch2);

  // 3. Flat Umbrella Canopy Discs (3 tiers)
  const canopy1Geo = new THREE.CylinderGeometry(3.2 * scale, 2.8 * scale, 0.65 * scale, 14);
  const canopy1 = new THREE.Mesh(canopy1Geo, leafMat);
  canopy1.position.set(0, 5.8 * scale, 0);
  canopy1.castShadow = true;
  group.add(canopy1);

  const canopy2Geo = new THREE.CylinderGeometry(2.4 * scale, 2.0 * scale, 0.5 * scale, 12);
  const canopy2 = new THREE.Mesh(canopy2Geo, leafMat);
  canopy2.position.set(1.1 * scale, 6.2 * scale, 0.4 * scale);
  canopy2.castShadow = true;
  group.add(canopy2);

  const canopy3Geo = new THREE.CylinderGeometry(2.2 * scale, 1.8 * scale, 0.5 * scale, 12);
  const canopy3 = new THREE.Mesh(canopy3Geo, leafMat);
  canopy3.position.set(-1.0 * scale, 6.1 * scale, -0.4 * scale);
  canopy3.castShadow = true;
  group.add(canopy3);

  // Ground contact shadow
  const shadowGeo = new THREE.CircleGeometry(3.5 * scale, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: '#1a0d06',
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  group.add(shadow);

  return group;
}

/**
 * Creates a procedural 7-part stylized South Sudanese youth fielder character
 */
function createFielderCharacter(name: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `Fielder_${name}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: '#341d13', // Deep melanin skin tone
    roughness: 0.65,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: '#078930', // Team Green or Team Gold
    roughness: 0.7,
  });

  const shortsMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.8,
  });

  // 1. Torso
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.65, 12);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  group.add(torso);

  // 2. Head
  const headGeo = new THREE.SphereGeometry(0.16, 14, 12);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  // 3. Ready Arms (poised to catch)
  const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.55, 8);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.set(-0.32, 1.15, 0.18);
  leftArm.rotation.x = 0.6;
  leftArm.rotation.z = 0.3;
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.set(0.32, 1.15, 0.18);
  rightArm.rotation.x = 0.6;
  rightArm.rotation.z = -0.3;
  rightArm.castShadow = true;
  group.add(rightArm);

  // 4. Shorts
  const shortsGeo = new THREE.CylinderGeometry(0.23, 0.25, 0.35, 12);
  const shorts = new THREE.Mesh(shortsGeo, shortsMat);
  shorts.position.y = 0.65;
  shorts.castShadow = true;
  group.add(shorts);

  // 5. Legs
  const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.6, 8);
  const leftLeg = new THREE.Mesh(legGeo, skinMat);
  leftLeg.position.set(-0.12, 0.3, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, skinMat);
  rightLeg.position.set(0.12, 0.3, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // 6. Name label sprite / overhead billboard
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.roundRect(4, 4, 120, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 64, 24);

  const labelTex = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: labelTex });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(0, 1.95, 0);
  sprite.scale.set(0.8, 0.3, 1);
  group.add(sprite);

  // Ground shadow
  const shadowGeo = new THREE.CircleGeometry(0.35, 12);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: '#1a0d06',
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  group.add(shadow);

  return group;
}
