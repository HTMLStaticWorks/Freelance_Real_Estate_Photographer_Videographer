/* 
=========================================
PREMIUM WebGL 3D ARCHITECTURAL SIMULATION
=========================================
*/

(function() {
  let scene, camera, renderer, villa;
  let scrollPercent = 0;
  let targetScrollPercent = 0;
  let theme = 'dark';
  
  // 3D Objects that we need to reference during scroll
  let mainSunLight, ambientLight, interiorSpot;
  let photoFrames = [];
  let poolMesh;

  // Camera paths: [x, y, z, rx, ry, rz]
  // Array of keyframes based on scroll position
  const cameraKeyframes = [
    { percent: 0,   pos: { x: 30, y: 25, z: 45 }, lookAt: { x: 0, y: 4, z: 0 } },   // Drone high aerial view
    { percent: 0.25, pos: { x: 12, y: 8, z: 22 }, lookAt: { x: 0, y: 3, z: 0 } },   // Fly down, approach exterior
    { percent: 0.50, pos: { x: 0, y: 3, z: 8 },    lookAt: { x: 0, y: 2.5, z: -2 } }, // Penetrating the glass exterior
    { percent: 0.75, pos: { x: -4, y: 2, z: -2 },   lookAt: { x: 4, y: 2, z: -4 } },  // Interior living walkthrough
    { percent: 1.00, pos: { x: 0, y: 35, z: 1 },   lookAt: { x: 0, y: 0, z: 0 } }    // High orthographic-like floorplan view
  ];

  window.addEventListener('load', () => {
    init3D();
  });

  function init3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    theme = document.documentElement.getAttribute('data-theme') || 'dark';

    // 1. Create Scene
    scene = new THREE.Scene();
    updateSceneBackground();

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Initial camera placement
    camera.position.set(cameraKeyframes[0].pos.x, cameraKeyframes[0].pos.y, cameraKeyframes[0].pos.z);

    // 3. Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 4. Lights
    ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.2 : 0.6);
    scene.add(ambientLight);

    mainSunLight = new THREE.DirectionalLight(theme === 'dark' ? 0xfff3e0 : 0xffffff, theme === 'dark' ? 1.2 : 1.8);
    mainSunLight.position.set(40, 50, 20);
    mainSunLight.castShadow = true;
    mainSunLight.shadow.mapSize.width = 1024;
    mainSunLight.shadow.mapSize.height = 1024;
    mainSunLight.shadow.camera.near = 0.5;
    mainSunLight.shadow.camera.far = 150;
    const d = 30;
    mainSunLight.shadow.camera.left = -d;
    mainSunLight.shadow.camera.right = d;
    mainSunLight.shadow.camera.top = d;
    mainSunLight.shadow.camera.bottom = -d;
    scene.add(mainSunLight);

    // Warm Interior Spot
    interiorSpot = new THREE.SpotLight(0xffb74d, 5, 25, Math.PI / 4, 0.5, 1);
    interiorSpot.position.set(0, 7, -3);
    interiorSpot.target.position.set(0, 0, -3);
    interiorSpot.castShadow = true;
    scene.add(interiorSpot);
    scene.add(interiorSpot.target);

    // Helper Grid Floor (Abstract Architectural style)
    const gridHelper = new THREE.GridHelper(100, 50, 0xd4af37, theme === 'dark' ? 0x222222 : 0xdddddd);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 5. Build Villa Group
    villa = new THREE.Group();
    buildVillaStructure();
    scene.add(villa);

    // 6. Interaction & Scroll Event
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('themeChanged', (e) => {
      theme = e.detail;
      updateSceneTheme();
    });

    // 7. Start Animation Loop
    animate();
  }

  function updateSceneBackground() {
    if (scene) {
      if (theme === 'dark') {
        scene.fog = new THREE.FogExp2(0x080808, 0.015);
      } else {
        scene.fog = new THREE.FogExp2(0xfaf9f6, 0.015);
      }
    }
  }

  function updateSceneTheme() {
    updateSceneBackground();
    if (theme === 'dark') {
      ambientLight.intensity = 0.25;
      mainSunLight.intensity = 1.2;
      mainSunLight.color.setHex(0xfff3e0);
      interiorSpot.intensity = 6;
      if (poolMesh) poolMesh.material.emissive.setHex(0x008080);
    } else {
      ambientLight.intensity = 0.65;
      mainSunLight.intensity = 1.8;
      mainSunLight.color.setHex(0xffffff);
      interiorSpot.intensity = 2;
      if (poolMesh) poolMesh.material.emissive.setHex(0x004040);
    }
  }

  function buildVillaStructure() {
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c2c2a, 
      roughness: 0.8,
      metalness: 0.1
    });
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a483a,
      roughness: 0.6
    });
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.9,
      ior: 1.5,
      side: THREE.DoubleSide
    });

    // Main Deck / Foundation Floor
    const floorGeo = new THREE.BoxGeometry(32, 0.5, 24);
    const floorMesh = new THREE.Mesh(floorGeo, wallMaterial);
    floorMesh.position.y = 0.25;
    floorMesh.receiveShadow = true;
    villa.add(floorMesh);

    // Swimming Pool Deck cutout visualizer
    const poolGeo = new THREE.BoxGeometry(10, 0.1, 6);
    const poolWaterMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x008080,
      emissiveIntensity: 0.5
    });
    poolMesh = new THREE.Mesh(poolGeo, poolWaterMat);
    poolMesh.position.set(8, 0.52, 6);
    villa.add(poolMesh);

    // Minimal Concrete Pillars
    const pillarGeo = new THREE.BoxGeometry(0.8, 6, 0.8);
    const positions = [
      [-15, 3.5, -11], [15, 3.5, -11],
      [-15, 3.5, 11], [15, 3.5, 11],
      [-5, 3.5, -11], [5, 3.5, -11],
      [-5, 3.5, 11], [5, 3.5, 11]
    ];
    positions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeo, wallMaterial);
      pillar.position.set(pos[0], pos[1], pos[2]);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      villa.add(pillar);
    });

    // Solid concrete back walls
    const backWallGeo = new THREE.BoxGeometry(16, 6, 0.5);
    const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
    backWall.position.set(-7, 3.5, -11);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    villa.add(backWall);

    // Luxury Glass Front wall (Living Room entrance)
    const glassWallGeo = new THREE.BoxGeometry(14, 6, 0.2);
    const glassWall = new THREE.Mesh(glassWallGeo, glassMaterial);
    glassWall.position.set(5, 3.5, 0);
    villa.add(glassWall);

    // Minimal Roof Slab
    const roofGeo = new THREE.BoxGeometry(34, 0.4, 26);
    const roofMesh = new THREE.Mesh(roofGeo, wallMaterial);
    roofMesh.position.y = 6.7;
    roofMesh.castShadow = true;
    villa.add(roofMesh);

    // Wood ceilings structure inside
    const ceilingGeo = new THREE.BoxGeometry(16, 0.1, 12);
    const woodCeiling = new THREE.Mesh(ceilingGeo, woodMaterial);
    woodCeiling.position.set(-4, 6.4, -3);
    villa.add(woodCeiling);

    // Minimalist Luxury Couch Blocks
    const couchGeo = new THREE.BoxGeometry(5, 0.8, 2);
    const couchMat = new THREE.MeshStandardMaterial({ color: 0xefede8, roughness: 0.9 });
    const couch1 = new THREE.Mesh(couchGeo, couchMat);
    couch1.position.set(-2, 0.9, -4);
    couch1.castShadow = true;
    couch1.receiveShadow = true;
    villa.add(couch1);

    const couch2 = new THREE.Mesh(couchGeo, couchMat);
    couch2.rotation.y = Math.PI / 2;
    couch2.position.set(-4.5, 0.9, -1.5);
    couch2.castShadow = true;
    couch2.receiveShadow = true;
    villa.add(couch2);

    // Center Coffee Table (Beige marble slab on gold frames)
    const tableGeo = new THREE.BoxGeometry(3, 0.4, 2);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(-1, 0.7, -1.5);
    table.castShadow = true;
    villa.add(table);

    // Floating Photography Frames (Cinematic display inside room)
    const frameGeo = new THREE.PlaneGeometry(3.2, 2.0);
    const frameColors = [0x504030, 0x405060, 0x303030];
    
    for (let i = 0; i < 3; i++) {
      const frameMat = new THREE.MeshBasicMaterial({
        color: frameColors[i],
        side: THREE.DoubleSide
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      // Floating coordinates inside/near glass
      frame.position.set(-6 + (i * 4), 3.0, -8);
      frame.rotation.y = 0.1 * (i - 1);
      villa.add(frame);
      photoFrames.push(frame);
    }
  }

  // Linear interpolation function (lerp)
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  function handleScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    
    // We only animate the 3D scene over the first 40% of page scroll
    // Beyond that, the scene fades/scales or locks in position
    const rawPercent = window.scrollY / docHeight;
    targetScrollPercent = Math.min(rawPercent / 0.4, 1.0);
  }

  function handleResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function updateCamera() {
    // Lerp scroll percent for smooth floating momentum
    scrollPercent = lerp(scrollPercent, targetScrollPercent, 0.05);

    // Interpolate camera position and target looking direction between keyframes
    let startFrame = cameraKeyframes[0];
    let endFrame = cameraKeyframes[cameraKeyframes.length - 1];

    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      if (scrollPercent >= cameraKeyframes[i].percent && scrollPercent <= cameraKeyframes[i + 1].percent) {
        startFrame = cameraKeyframes[i];
        endFrame = cameraKeyframes[i + 1];
        break;
      }
    }

    // Segment percentage
    const segmentRange = endFrame.percent - startFrame.percent;
    const segmentFactor = segmentRange === 0 ? 0 : (scrollPercent - startFrame.percent) / segmentRange;

    // Interpolated camera position
    const currentPos = {
      x: lerp(startFrame.pos.x, endFrame.pos.x, segmentFactor),
      y: lerp(startFrame.pos.y, endFrame.pos.y, segmentFactor),
      z: lerp(startFrame.pos.z, endFrame.pos.z, segmentFactor)
    };

    // Interpolated lookAt target
    const currentLook = {
      x: lerp(startFrame.lookAt.x, endFrame.lookAt.x, segmentFactor),
      y: lerp(startFrame.lookAt.y, endFrame.lookAt.y, segmentFactor),
      z: lerp(startFrame.lookAt.z, endFrame.lookAt.z, segmentFactor)
    };

    camera.position.set(currentPos.x, currentPos.y, currentPos.z);
    camera.lookAt(new THREE.Vector3(currentLook.x, currentLook.y, currentLook.z));

    // Slow floating hover effect based on mouse/time
    const time = Date.now() * 0.0008;
    camera.position.y += Math.sin(time) * 0.15;
    camera.position.x += Math.cos(time * 0.8) * 0.15;

    // Photography frames pulsing opacity / brightness
    photoFrames.forEach((frame, idx) => {
      frame.position.y = 3.0 + Math.sin(time + idx) * 0.1;
    });

    // Rotate villa slightly based on time to create a living space look
    villa.rotation.y = Math.sin(time * 0.1) * 0.05;
  }

  function animate() {
    requestAnimationFrame(animate);
    
    // Smooth camera coordinates update
    updateCamera();

    // Render Scene
    renderer.render(scene, camera);
  }
})();
