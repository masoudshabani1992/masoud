import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * High-Performance Interactive 3D Packaging Mockup Engine
 * Features:
 * - Spherical Orbit Controls (centered on box target, no clipping/disappearing)
 * - Articulated Multi-Panel Folding (0.0 Flat Sheet -> 0.5 Half-Assembled -> 1.0 Closed Box)
 * - Raw Natural Cardboard & Kraft Material Shaders
 * - Crisp Red (Cut) and Green (Crease) CAD Vectors
 */
export default function Packaging3DMockup({
  boxType = 'tuck_end',
  length = 120,
  width = 60,
  height = 160,
  thickness = 0.5,
  materialColor = '#ffffff',
  foldAngle = 1.0, // 0.0 (Flat) to 1.0 (Closed)
  isRotating = true
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const widthPx = container.clientWidth || 300;
    const heightPx = container.clientHeight || 200;

    // 1. Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const L = Math.max(20, parseFloat(length) || 120);
    const W = Math.max(20, parseFloat(width) || 60);
    const H = Math.max(15, parseFloat(height) || 160);
    const T = Math.max(0.5, parseFloat(thickness) || 0.8);

    const maxDim = Math.max(L, W, H, 100);
    const target = new THREE.Vector3(0, H * 0.45, 0);

    // 2. Camera Setup with Wide Frustum & High Clipping Margin
    const camera = new THREE.PerspectiveCamera(38, widthPx / heightPx, 1, 10000);
    let orbitRadius = maxDim * 2.5;
    let orbitTheta = 0.6; // azimuth (around Y)
    let orbitPhi = 1.1;   // polar (from top down, ~63 deg)

    const updateCameraPos = () => {
      const x = target.x + orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
      const y = target.y + orbitRadius * Math.cos(orbitPhi);
      const z = target.z + orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
      camera.position.set(x, y, z);
      camera.lookAt(target);
    };
    updateCameraPos();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(widthPx, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(300, 500, 300);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    fillLight.position.set(-300, 300, -300);
    scene.add(fillLight);

    const botLight = new THREE.DirectionalLight(0xfef08a, 0.5);
    botLight.position.set(0, -200, 100);
    scene.add(botLight);

    // 5. Floor Shadow Plane (placed below y=0 to prevent Z-fighting with flat sheet)
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.25, depthWrite: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Master Box Group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    // Realistic Cardboard Material
    const baseColor = new THREE.Color(materialColor || 0xffffff);
    const boxMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.4,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const cutEdgeMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 1.5 });
    const creaseEdgeMat = new THREE.LineDashedMaterial({ color: 0x22c55e, linewidth: 1.5, dashSize: 4, gapSize: 2 });

    const makeBoxPanel = (w, h, d = T, isCrease = false) => {
      const geo = new THREE.BoxGeometry(w, d, h);
      const mesh = new THREE.Mesh(geo, boxMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const wireGeo = new THREE.EdgesGeometry(geo);
      const wire = new THREE.LineSegments(wireGeo, isCrease ? creaseEdgeMat : cutEdgeMat);
      wire.computeLineDistances();
      mesh.add(wire);
      return mesh;
    };

    // Fold Progress & Radian Angle: 0 = Flat Sheet (0 rad), 1 = Closed Box (PI/2 rad)
    const f = Math.max(0, Math.min(1, parseFloat(foldAngle) ?? 1.0));
    const angle = (Math.PI / 2) * f;
    const bType = (boxType || 'tuck_end').toLowerCase();

    // ================= ARTICULATED KINEMATICS BUILDER =================
    if (bType.includes('rigid') || bType.includes('two_piece') || bType.includes('base_lid')) {
      // Two-Piece Rigid Base & Lid Box
      // Base Bottom
      const baseMesh = makeBoxPanel(L, W);
      baseMesh.position.set(0, 0, 0);
      boxGroup.add(baseMesh);

      // 4 Base Walls (articulate with f from flat to 90 deg)
      const bFrontPivot = new THREE.Group();
      bFrontPivot.position.set(0, 0, W / 2);
      boxGroup.add(bFrontPivot);
      const bFront = makeBoxPanel(L, H);
      bFront.position.set(0, 0, H / 2);
      bFrontPivot.add(bFront);
      bFrontPivot.rotation.x = -angle;

      const bBackPivot = new THREE.Group();
      bBackPivot.position.set(0, 0, -W / 2);
      boxGroup.add(bBackPivot);
      const bBack = makeBoxPanel(L, H);
      bBack.position.set(0, 0, -H / 2);
      bBackPivot.add(bBack);
      bBackPivot.rotation.x = +angle;

      const bLeftPivot = new THREE.Group();
      bLeftPivot.position.set(-L / 2, 0, 0);
      boxGroup.add(bLeftPivot);
      const bLeft = makeBoxPanel(H, W);
      bLeft.position.set(-H / 2, 0, 0);
      bLeftPivot.add(bLeft);
      bLeftPivot.rotation.z = -angle;

      const bRightPivot = new THREE.Group();
      bRightPivot.position.set(L / 2, 0, 0);
      boxGroup.add(bRightPivot);
      const bRight = makeBoxPanel(H, W);
      bRight.position.set(H / 2, 0, 0);
      bRightPivot.add(bRight);
      bRightPivot.rotation.z = +angle;

      // Elevated Lid (Floats higher when f < 1)
      const lidGroup = new THREE.Group();
      const lidH = Math.max(15, H * 0.5);
      const lidElevation = (H + 4) * f + (1 - f) * (H * 1.5 + 40);
      lidGroup.position.set(0, lidElevation, 0);

      const lidTop = makeBoxPanel(L + 3, W + 3);
      lidTop.position.set(0, 0, 0);
      lidGroup.add(lidTop);

      // Lid Walls
      const lFrontPivot = new THREE.Group();
      lFrontPivot.position.set(0, 0, (W + 3) / 2);
      lidGroup.add(lFrontPivot);
      const lFront = makeBoxPanel(L + 3, lidH);
      lFront.position.set(0, 0, lidH / 2);
      lFrontPivot.add(lFront);
      lFrontPivot.rotation.x = -angle;

      const lBackPivot = new THREE.Group();
      lBackPivot.position.set(0, 0, -(W + 3) / 2);
      lidGroup.add(lBackPivot);
      const lBack = makeBoxPanel(L + 3, lidH);
      lBack.position.set(0, 0, -lidH / 2);
      lBackPivot.add(lBack);
      lBackPivot.rotation.x = +angle;

      boxGroup.add(lidGroup);

    } else if (bType.includes('sleeve') || bType.includes('drawer')) {
      // Sleeve & Drawer Box
      // Outer Sleeve
      const sleeveMesh = makeBoxPanel(L + 4, W + 4);
      sleeveMesh.position.set(0, 0, 0);
      boxGroup.add(sleeveMesh);

      const sLeftPivot = new THREE.Group();
      sLeftPivot.position.set(-(L + 4) / 2, 0, 0);
      boxGroup.add(sLeftPivot);
      const sLeft = makeBoxPanel(H + 4, W + 4);
      sLeft.position.set(-(H + 4) / 2, 0, 0);
      sLeftPivot.add(sLeft);
      sLeftPivot.rotation.z = -angle;

      const sRightPivot = new THREE.Group();
      sRightPivot.position.set((L + 4) / 2, 0, 0);
      boxGroup.add(sRightPivot);
      const sRight = makeBoxPanel(H + 4, W + 4);
      sRight.position.set((H + 4) / 2, 0, 0);
      sRightPivot.add(sRight);
      sRightPivot.rotation.z = +angle;

      // Inner Drawer (Slides horizontally out as f decreases)
      const slideDist = (1 - f) * (L * 0.9);
      const drawerGroup = new THREE.Group();
      drawerGroup.position.set(slideDist, 1, 0);

      const dBot = makeBoxPanel(L, W);
      dBot.position.set(0, 0, 0);
      drawerGroup.add(dBot);

      const dFront = makeBoxPanel(L, H - 2);
      dFront.position.set(0, 0, (W - 2) / 2);
      drawerGroup.add(dFront);

      const dBack = makeBoxPanel(L, H - 2);
      dBack.position.set(0, 0, -(W - 2) / 2);
      drawerGroup.add(dBack);

      boxGroup.add(drawerGroup);

    } else if (bType.includes('hexagon')) {
      // Hexagonal Box
      const radius = L / 2;
      const hexGeo = new THREE.CylinderGeometry(radius, radius, H * Math.max(0.1, f), 6, 1, false);
      const hexMesh = new THREE.Mesh(hexGeo, boxMat);
      hexMesh.position.set(0, (H * Math.max(0.1, f)) / 2, 0);
      hexMesh.castShadow = true;
      boxGroup.add(hexMesh);

      const hexEdge = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), cutEdgeMat);
      hexMesh.add(hexEdge);

    } else if (bType.includes('triangle') || bType.includes('triangular')) {
      // Triangular Box
      const radius = L * 0.6;
      const triGeo = new THREE.CylinderGeometry(radius, radius, H * Math.max(0.1, f), 3, 1, false);
      const triMesh = new THREE.Mesh(triGeo, boxMat);
      triMesh.position.set(0, (H * Math.max(0.1, f)) / 2, 0);
      triMesh.castShadow = true;
      boxGroup.add(triMesh);

      const triEdge = new THREE.LineSegments(new THREE.EdgesGeometry(triGeo), cutEdgeMat);
      triMesh.add(triEdge);

    } else if (bType.includes('pillow')) {
      // Pillow Box
      const pGeo = new THREE.SphereGeometry(L * 0.6, 32, 16, 0, Math.PI, 0, Math.PI / 2);
      const pMesh = new THREE.Mesh(pGeo, boxMat);
      pMesh.scale.set(1, Math.max(0.1, f) * (H / (L * 0.6)), (W * 0.8) / (L * 0.6));
      pMesh.position.set(0, (H * Math.max(0.1, f)) / 2, 0);
      pMesh.castShadow = true;
      boxGroup.add(pMesh);

      const pEdge = new THREE.LineSegments(new THREE.EdgesGeometry(pGeo), cutEdgeMat);
      pMesh.add(pEdge);

    } else {
      // Standard Master Folding Carton (Tuck End STE, RTE, Mailer 0427, RSC 0201, Snap Lock, Auto Bottom)
      // 1. Bottom Panel (Base)
      const bottom = makeBoxPanel(L, W);
      bottom.position.set(0, 0, 0);
      boxGroup.add(bottom);

      // 2. Rear Wall (Hinged at z = -W/2)
      const rearPivot = new THREE.Group();
      rearPivot.position.set(0, 0, -W / 2);
      boxGroup.add(rearPivot);

      const rearPanel = makeBoxPanel(L, H);
      rearPanel.position.set(0, 0, -H / 2);
      rearPivot.add(rearPanel);
      rearPivot.rotation.x = +angle;

      // 3. Top Lid (Hinged at top of rear wall at local z = -H)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0, -H);
      rearPivot.add(lidPivot);

      const lidPanel = makeBoxPanel(L, W);
      lidPanel.position.set(0, 0, -W / 2);
      lidPivot.add(lidPanel);
      lidPivot.rotation.x = +angle;

      // 4. Top Tuck Flap (Hinged at front of lid at local z = -W)
      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, 0, -W);
      lidPivot.add(flapPivot);

      const flapH = Math.min(H * 0.45, Math.max(18, W * 0.35));
      const flapPanel = makeBoxPanel(L, flapH);
      flapPanel.position.set(0, 0, -flapH / 2);
      flapPivot.add(flapPanel);
      flapPivot.rotation.x = +angle;

      // 5. Front Wall (Hinged at z = +W/2)
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, 0, W / 2);
      boxGroup.add(frontPivot);

      const frontPanel = makeBoxPanel(L, H);
      frontPanel.position.set(0, 0, H / 2);
      frontPivot.add(frontPanel);
      frontPivot.rotation.x = -angle;

      // 6. Left Wall (Hinged at x = -L/2)
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-L / 2, 0, 0);
      boxGroup.add(leftPivot);

      const leftPanel = makeBoxPanel(H, W);
      leftPanel.position.set(-H / 2, 0, 0);
      leftPivot.add(leftPanel);
      leftPivot.rotation.z = -angle;

      // 7. Right Wall (Hinged at x = +L/2)
      const rightPivot = new THREE.Group();
      rightPivot.position.set(L / 2, 0, 0);
      boxGroup.add(rightPivot);

      const rightPanel = makeBoxPanel(H, W);
      rightPanel.position.set(H / 2, 0, 0);
      rightPivot.add(rightPanel);
      rightPivot.rotation.z = +angle;
    }

    // 7. Spherical Orbit Controls (centered on box target)
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

      // Azimuth (Y rotation)
      orbitTheta -= dx * 0.01;

      // Polar (Elevation) - Clamped strictly between top and above-ground horizon
      orbitPhi = Math.max(0.12, Math.min(Math.PI / 2 + 0.1, orbitPhi - dy * 0.01));

      updateCameraPos();
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      // Smooth Distance Zoom
      const zoomFactor = 1 + e.deltaY * 0.0015;
      orbitRadius = Math.max(maxDim * 1.2, Math.min(maxDim * 6.0, orbitRadius * zoomFactor));
      updateCameraPos();
    };

    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Render Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        orbitTheta += 0.006;
        updateCameraPos();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 200;
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
      className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden flex items-center justify-center bg-slate-950 select-none"
    />
  );
}
