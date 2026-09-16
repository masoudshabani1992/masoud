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
    const camera = new THREE.PerspectiveCamera(42, widthPx / heightPx, 1, 3000);
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
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
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

    const makePanel = (w, h, d = T) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, boxMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const wireGeo = new THREE.EdgesGeometry(geo);
      const wire = new THREE.LineSegments(wireGeo, edgeMat);
      mesh.add(wire);
      return mesh;
    };

    // Fold angle in radians: 0 = Flat sheet (0 rad), 1 = 90 deg folded (PI/2 rad)
    const f = Math.max(0, Math.min(1, parseFloat(foldAngle) ?? 1.0));
    const foldRad = (Math.PI / 2) * f;

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
