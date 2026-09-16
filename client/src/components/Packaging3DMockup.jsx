import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Packaging3DMockup({
  boxType = 'tuck_end',
  length = 120,
  width = 60,
  height = 160,
  thickness = 0.5,
  materialColor = '#ffffff',
  foldAngle = 1.0, // 0 to 1
  isRotating = true
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const widthPx = container.clientWidth || 300;
    const heightPx = container.clientHeight || 200;

    // 1. Scene & Dark Studio Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, widthPx / heightPx, 1, 4000);
    const maxDim = Math.max(length, width, height, 100);
    camera.position.set(maxDim * 1.6, maxDim * 1.5, maxDim * 2.2);
    camera.lookAt(0, height / 2, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(widthPx, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous canvases
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Bright Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(250, 400, 250);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(-250, 200, -200);
    scene.add(fillLight);

    const bottomLight = new THREE.DirectionalLight(0xfef08a, 0.8);
    bottomLight.position.set(0, -200, 200);
    scene.add(bottomLight);

    // 5. Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Master Box Group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const L = Math.max(20, parseFloat(length) || 120);
    const W = Math.max(20, parseFloat(width) || 60);
    const H = Math.max(15, parseFloat(height) || 160);
    const T = Math.max(0.6, parseFloat(thickness) || 0.8);

    // Realistic Paperboard Material
    const baseColor = new THREE.Color(materialColor || 0xffffff);
    const boxMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.35,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 1.5 });

    const makePanel = (w, h, d = T, mat = boxMat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const wireGeo = new THREE.EdgesGeometry(geo);
      const wire = new THREE.LineSegments(wireGeo, edgeMat);
      mesh.add(wire);
      return mesh;
    };

    // Fold angle in radians
    const f = Math.max(0, Math.min(1, parseFloat(foldAngle) ?? 1.0));
    const foldRad = (Math.PI / 2) * f;

    const bType = (boxType || 'tuck_end').toLowerCase();

    // ================= MODEL-SPECIFIC 3D GEOMETRIES =================
    if (bType.includes('hexagon')) {
      // Hexagonal 6-sided Box
      const radius = L / 2;
      const hexGeo = new THREE.CylinderGeometry(radius, radius, H, 6, 1, false);
      const hexMesh = new THREE.Mesh(hexGeo, boxMat);
      hexMesh.position.set(0, H / 2, 0);
      hexMesh.castShadow = true;
      boxGroup.add(hexMesh);

      const hexEdge = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), edgeMat);
      hexMesh.add(hexEdge);

    } else if (bType.includes('triangle') || bType.includes('triangular')) {
      // Triangular 3-sided Prism Box
      const radius = L * 0.6;
      const triGeo = new THREE.CylinderGeometry(radius, radius, H, 3, 1, false);
      const triMesh = new THREE.Mesh(triGeo, boxMat);
      triMesh.position.set(0, H / 2, 0);
      triMesh.castShadow = true;
      boxGroup.add(triMesh);

      const triEdge = new THREE.LineSegments(new THREE.EdgesGeometry(triGeo), edgeMat);
      triMesh.add(triEdge);

    } else if (bType.includes('pillow')) {
      // Pillow Box (Convex Lens Mesh)
      const pillowGroup = new THREE.Group();
      const pL = L;
      const pW = W;
      const pH = Math.max(25, H * 0.35);

      const frontCurve = new THREE.Mesh(new THREE.SphereGeometry(pL * 0.7, 32, 16, 0, Math.PI, 0, Math.PI / 2), boxMat);
      frontCurve.scale.set(1, pH / (pL * 0.7), pW / (pL * 0.7));
      frontCurve.position.set(0, H / 2, 0);
      pillowGroup.add(frontCurve);

      boxGroup.add(pillowGroup);

    } else if (bType.includes('two_piece') || bType.includes('base_lid') || bType.includes('rigid')) {
      // Two-Piece Base & Lid Rigid Box
      // Base Tray
      const baseMesh = makePanel(L, W);
      baseMesh.position.set(0, 0, 0);
      baseMesh.rotation.x = -Math.PI / 2;
      boxGroup.add(baseMesh);

      const bWallFront = makePanel(L, H);
      bWallFront.position.set(0, H / 2, W / 2);
      boxGroup.add(bWallFront);

      const bWallBack = makePanel(L, H);
      bWallBack.position.set(0, H / 2, -W / 2);
      boxGroup.add(bWallBack);

      const bWallLeft = makePanel(H, W);
      bWallLeft.position.set(-L / 2, H / 2, 0);
      bWallLeft.rotation.y = Math.PI / 2;
      boxGroup.add(bWallLeft);

      const bWallRight = makePanel(H, W);
      bWallRight.position.set(L / 2, H / 2, 0);
      bWallRight.rotation.y = -Math.PI / 2;
      boxGroup.add(bWallRight);

      // Lid Tray (Elevated with fold slider)
      const lidGroup = new THREE.Group();
      const lidH = Math.max(15, H * 0.5);
      const lidElevation = H + ((1 - f) * 80);
      lidGroup.position.set(0, lidElevation, 0);

      const lidTop = makePanel(L + 3, W + 3);
      lidTop.position.set(0, lidH, 0);
      lidTop.rotation.x = -Math.PI / 2;
      lidGroup.add(lidTop);

      const lWallF = makePanel(L + 3, lidH);
      lWallF.position.set(0, lidH / 2, (W + 3) / 2);
      lidGroup.add(lWallF);

      const lWallB = makePanel(L + 3, lidH);
      lWallB.position.set(0, lidH / 2, -(W + 3) / 2);
      lidGroup.add(lWallB);

      const lWallL = makePanel(lidH, W + 3);
      lWallL.position.set(-(L + 3) / 2, lidH / 2, 0);
      lWallL.rotation.y = Math.PI / 2;
      lidGroup.add(lWallL);

      const lWallR = makePanel(lidH, W + 3);
      lWallR.position.set((L + 3) / 2, lidH / 2, 0);
      lWallR.rotation.y = -Math.PI / 2;
      lidGroup.add(lWallR);

      boxGroup.add(lidGroup);

    } else if (bType.includes('sleeve') || bType.includes('drawer') || bType.includes('matchbox')) {
      // Sleeve & Slide Drawer Box
      // Outer Sleeve
      const sleeveMesh = makePanel(L + 4, H + 4);
      sleeveMesh.position.set(0, H / 2, -(W + 2) / 2);
      boxGroup.add(sleeveMesh);

      const sleeveFront = makePanel(L + 4, H + 4);
      sleeveFront.position.set(0, H / 2, (W + 2) / 2);
      boxGroup.add(sleeveFront);

      const sleeveTop = makePanel(L + 4, W + 4);
      sleeveTop.position.set(0, H + 2, 0);
      sleeveTop.rotation.x = -Math.PI / 2;
      boxGroup.add(sleeveTop);

      const sleeveBot = makePanel(L + 4, W + 4);
      sleeveBot.position.set(0, 0, 0);
      sleeveBot.rotation.x = -Math.PI / 2;
      boxGroup.add(sleeveBot);

      // Inner Drawer (Slides out with fold slider)
      const slideDist = (1 - f) * (L * 0.8);
      const drawerGroup = new THREE.Group();
      drawerGroup.position.set(slideDist, 0, 0);

      const dBot = makePanel(L, W);
      dBot.position.set(0, 2, 0);
      dBot.rotation.x = -Math.PI / 2;
      drawerGroup.add(dBot);

      const dFront = makePanel(L, H - 2);
      dFront.position.set(0, H / 2, W / 2 - 2);
      drawerGroup.add(dFront);

      const dBack = makePanel(L, H - 2);
      dBack.position.set(0, H / 2, -W / 2 + 2);
      drawerGroup.add(dBack);

      const dLeft = makePanel(H - 2, W - 4);
      dLeft.position.set(-L / 2 + 2, H / 2, 0);
      dLeft.rotation.y = Math.PI / 2;
      drawerGroup.add(dLeft);

      const dRight = makePanel(H - 2, W - 4);
      dRight.position.set(L / 2 - 2, H / 2, 0);
      dRight.rotation.y = -Math.PI / 2;
      drawerGroup.add(dRight);

      boxGroup.add(drawerGroup);

    } else if (bType.includes('gable') || bType.includes('handle')) {
      // Gable Top Handle Box
      const bottomMesh = makePanel(L, W);
      bottomMesh.position.set(0, 0, 0);
      bottomMesh.rotation.x = -Math.PI / 2;
      boxGroup.add(bottomMesh);

      const bodyH = H * 0.7;
      const roofH = H * 0.3;

      const fWall = makePanel(L, bodyH);
      fWall.position.set(0, bodyH / 2, W / 2);
      boxGroup.add(fWall);

      const bWall = makePanel(L, bodyH);
      bWall.position.set(0, bodyH / 2, -W / 2);
      boxGroup.add(bWall);

      const lWall = makePanel(bodyH, W);
      lWall.position.set(-L / 2, bodyH / 2, 0);
      lWall.rotation.y = Math.PI / 2;
      boxGroup.add(lWall);

      const rWall = makePanel(bodyH, W);
      rWall.position.set(L / 2, bodyH / 2, 0);
      rWall.rotation.y = -Math.PI / 2;
      boxGroup.add(rWall);

      // Slanted Roof & Handle
      const fRoof = makePanel(L, roofH);
      fRoof.position.set(0, bodyH + roofH / 2, W / 4);
      fRoof.rotation.x = -Math.PI / 6;
      boxGroup.add(fRoof);

      const bRoof = makePanel(L, roofH);
      bRoof.position.set(0, bodyH + roofH / 2, -W / 4);
      bRoof.rotation.x = Math.PI / 6;
      boxGroup.add(bRoof);

      // Handle Tab
      const handleMesh = makePanel(L * 0.8, 30);
      handleMesh.position.set(0, H + 10, 0);
      boxGroup.add(handleMesh);

    } else if (bType.includes('hanging') || bType.includes('euro')) {
      // Hanging Tab Display Box
      const bottomMesh = makePanel(L, W);
      bottomMesh.position.set(0, 0, 0);
      bottomMesh.rotation.x = -Math.PI / 2;
      boxGroup.add(bottomMesh);

      const frontWall = makePanel(L, H);
      frontWall.position.set(0, H / 2, W / 2);
      boxGroup.add(frontWall);

      // Extended Back Wall with Euro Hanging Tab (+40mm)
      const backWall = makePanel(L, H + 40);
      backWall.position.set(0, (H + 40) / 2, -W / 2);
      boxGroup.add(backWall);

      const leftWall = makePanel(H, W);
      leftWall.position.set(-L / 2, H / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      boxGroup.add(leftWall);

      const rightWall = makePanel(H, W);
      rightWall.position.set(L / 2, H / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      boxGroup.add(rightWall);

      // Top Lid
      const lidMesh = makePanel(L, W);
      lidMesh.position.set(0, H, 0);
      lidMesh.rotation.x = -Math.PI / 2;
      boxGroup.add(lidMesh);

    } else if (bType.includes('counter') || bType.includes('display')) {
      // Counter Display Stand with Stepped Front and Riser Billboard
      const baseMesh = makePanel(L, W);
      baseMesh.position.set(0, 0, 0);
      baseMesh.rotation.x = -Math.PI / 2;
      boxGroup.add(baseMesh);

      // Low front lip
      const fLip = makePanel(L, H * 0.35);
      fLip.position.set(0, (H * 0.35) / 2, W / 2);
      boxGroup.add(fLip);

      // Tall Header Riser Billboard
      const headerH = Math.max(60, H * 0.8);
      const bHeader = makePanel(L, H + headerH);
      bHeader.position.set(0, (H + headerH) / 2, -W / 2);
      boxGroup.add(bHeader);

      const lSide = makePanel(H, W);
      lSide.position.set(-L / 2, H / 2, 0);
      lSide.rotation.y = Math.PI / 2;
      boxGroup.add(lSide);

      const rSide = makePanel(H, W);
      rSide.position.set(L / 2, H / 2, 0);
      rSide.rotation.y = -Math.PI / 2;
      boxGroup.add(rSide);

    } else {
      // Standard Folding Carton (Tuck End, Mailer, RSC, Auto Bottom)
      // Bottom Base Panel
      const bottomMesh = makePanel(L, W);
      bottomMesh.position.set(0, 0, 0);
      bottomMesh.rotation.x = -Math.PI / 2;
      boxGroup.add(bottomMesh);

      // Rear Wall & Top Lid
      const rearPivot = new THREE.Group();
      rearPivot.position.set(0, 0, -W / 2);
      boxGroup.add(rearPivot);

      const rearMesh = makePanel(L, H);
      rearMesh.position.set(0, H / 2, 0);
      rearPivot.add(rearMesh);
      rearPivot.rotation.x = foldRad;

      // Top Lid
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, H, 0);
      rearPivot.add(lidPivot);

      const lidMesh = makePanel(L, W);
      lidMesh.position.set(0, W / 2, 0);
      lidPivot.add(lidMesh);
      lidPivot.rotation.x = foldRad;

      // Front Flap
      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, W, 0);
      lidPivot.add(flapPivot);

      const flapMesh = makePanel(L, Math.min(H * 0.4, 30));
      flapMesh.position.set(0, Math.min(H * 0.4, 30) / 2, 0);
      flapPivot.add(flapMesh);
      flapPivot.rotation.x = foldRad;

      // Front Wall
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, 0, W / 2);
      boxGroup.add(frontPivot);

      const frontMesh = makePanel(L, H);
      frontMesh.position.set(0, H / 2, 0);
      frontPivot.add(frontMesh);
      frontPivot.rotation.x = -foldRad;

      // Left Wall
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-L / 2, 0, 0);
      boxGroup.add(leftPivot);

      const leftMesh = makePanel(H, W);
      leftMesh.position.set(0, H / 2, 0);
      leftMesh.rotation.y = Math.PI / 2;
      leftPivot.add(leftMesh);
      leftPivot.rotation.z = -foldRad;

      // Right Wall
      const rightPivot = new THREE.Group();
      rightPivot.position.set(L / 2, 0, 0);
      boxGroup.add(rightPivot);

      const rightMesh = makePanel(H, W);
      rightMesh.position.set(0, H / 2, 0);
      rightMesh.rotation.y = -Math.PI / 2;
      rightPivot.add(rightMesh);
      rightPivot.rotation.z = foldRad;
    }

    // Center pivot
    boxGroup.position.set(0, 0, 0);

    // Camera Framing
    camera.position.set(maxDim * 1.5, maxDim * 1.6, maxDim * 2.2);
    camera.lookAt(0, H / 2, 0);

    // Mouse Drag Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const domEl = renderer.domElement;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;

      boxGroup.rotation.y += dx * 0.01;
      boxGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, boxGroup.rotation.x + dy * 0.01));
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(80, Math.min(1500, camera.position.z + e.deltaY * 0.5));
    };

    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Render Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isRotating && !isDragging) {
        boxGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [boxType, length, width, height, thickness, materialColor, foldAngle, isRotating]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden flex items-center justify-center bg-slate-950"
    />
  );
}
