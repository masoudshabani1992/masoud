import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Packaging3DMockup({
  boxType = 'keyboard',
  length = 200,
  width = 150,
  height = 50,
  thickness = 1.5,
  materialColor = '#dfbe95',
  textureType = 'corrugated',
  foldAngle = 0 // 0 to 1 (0 = open flat, 1 = fully folded box)
}) {
  const mountRef = useRef(null);
  const [internalFold, setInternalFold] = useState(foldAngle);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    setInternalFold(foldAngle);
  }, [foldAngle]);

  useEffect(() => {
    if (!mountRef.current) return;

    const widthPx = mountRef.current.clientWidth || 500;
    const heightPx = mountRef.current.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate background

    const camera = new THREE.PerspectiveCamera(45, widthPx / heightPx, 1, 3000);
    camera.position.set(250, 320, 420);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(widthPx, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous canvases
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 3. Studio Lighting (Pacdora 3-point HD Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0xffffff, 2.2);
    mainSpot.position.set(300, 500, 300);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    fillLight.position.set(-300, 200, -200);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xfef08a, 1.5, 800);
    rimLight.position.set(0, -100, 250);
    scene.add(rimLight);

    // 4. Ground Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -60;
    ground.receiveShadow = true;
    scene.add(ground);

    // 5. Build Dynamic Box Hierarchy
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    // Scale conversion for visualization
    const L = Math.max(20, length);
    const W = Math.max(20, width);
    const H = Math.max(10, height);
    const T = Math.max(0.5, thickness);

    // Create realistic paperboard/corrugated shader material
    const baseColor = new THREE.Color(materialColor || 0xdfbe95);
    const boxMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: textureType === 'smooth_white' ? 0.3 : 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 1.5 });

    // Helper to create panel mesh with crisp CAD outline
    const makePanel = (w, h, depth = T) => {
      const geo = new THREE.BoxGeometry(w, h, depth);
      const mesh = new THREE.Mesh(geo, boxMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const wireGeo = new THREE.EdgesGeometry(geo);
      const wire = new THREE.LineSegments(wireGeo, edgeMat);
      mesh.add(wire);

      return mesh;
    };

    // Construct FEFCO 0427 Mailer / STE Articulated Joint System
    const f = internalFold; // 0 (flat) to 1 (folded 90 deg)
    const foldRad = (Math.PI / 2) * f;

    // --- Bottom Base ---
    const bottomMesh = makePanel(L, W);
    bottomMesh.position.set(0, 0, 0);
    bottomMesh.rotation.x = -Math.PI / 2;
    boxGroup.add(bottomMesh);

    // --- Rear Wall (Hinged to Bottom rear) ---
    const rearPivot = new THREE.Group();
    rearPivot.position.set(0, 0, -W / 2);
    boxGroup.add(rearPivot);

    const rearMesh = makePanel(L, H);
    rearMesh.position.set(0, H / 2, 0);
    rearPivot.add(rearMesh);
    rearPivot.rotation.x = foldRad;

    // --- Top Lid (Hinged to Rear Top) ---
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, H, 0);
    rearPivot.add(lidPivot);

    const lidMesh = makePanel(L, W);
    lidMesh.position.set(0, W / 2, 0);
    lidPivot.add(lidMesh);
    lidPivot.rotation.x = foldRad;

    // --- Front Tuck Flap (Hinged to Lid Front) ---
    const flapPivot = new THREE.Group();
    flapPivot.position.set(0, W, 0);
    lidPivot.add(flapPivot);

    const flapMesh = makePanel(L, Math.min(H, W * 0.4));
    flapMesh.position.set(0, Math.min(H, W * 0.4) / 2, 0);
    flapPivot.add(flapMesh);
    flapPivot.rotation.x = foldRad;

    // --- Front Wall (Hinged to Bottom front) ---
    const frontPivot = new THREE.Group();
    frontPivot.position.set(0, 0, W / 2);
    boxGroup.add(frontPivot);

    const frontMesh = makePanel(L, H);
    frontMesh.position.set(0, H / 2, 0);
    frontPivot.add(frontMesh);
    frontPivot.rotation.x = -foldRad;

    // --- Left Wall (Hinged to Bottom left) ---
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-L / 2, 0, 0);
    boxGroup.add(leftPivot);

    const leftMesh = makePanel(H, W);
    leftMesh.position.set(0, H / 2, 0);
    leftMesh.rotation.y = Math.PI / 2;
    leftPivot.add(leftMesh);
    leftPivot.rotation.z = -foldRad;

    // --- Right Wall (Hinged to Bottom right) ---
    const rightPivot = new THREE.Group();
    rightPivot.position.set(L / 2, 0, 0);
    boxGroup.add(rightPivot);

    const rightMesh = makePanel(H, W);
    rightMesh.position.set(0, H / 2, 0);
    rightMesh.rotation.y = -Math.PI / 2;
    rightPivot.add(rightMesh);
    rightPivot.rotation.z = foldRad;

    // Fit camera view bounds
    const maxDim = Math.max(L, W, H);
    camera.position.set(maxDim * 1.5, maxDim * 1.8, maxDim * 2.2);
    camera.lookAt(0, H / 2, 0);

    // Interactive Drag Controls (Rotate & Pitch)
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
      boxGroup.rotation.x += dy * 0.01;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(100, Math.min(1200, camera.position.z + e.deltaY * 0.5));
    };

    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isRotating && !isDragging) {
        boxGroup.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
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
  }, [boxType, length, width, height, thickness, materialColor, textureType, internalFold, isRotating]);

  return (
    <div className="relative w-full h-full min-h-[480px] flex flex-col rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge */}
      <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-xs text-white backdrop-blur-md flex items-center gap-2 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-black text-amber-300">Pacdora 3D Real-time Engine</span>
        <span className="text-slate-400">|</span>
        <span className="text-[11px] text-slate-300 font-mono">
          {length} × {width} × {height} mm
        </span>
      </div>

      {/* 3D Interactive Controls Bottom Floating Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-md flex items-center justify-between flex-wrap gap-3 shadow-2xl">
        {/* Fold / Unfold Slider (0% Flat -> 100% Folded) */}
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <span className="text-xs font-black text-slate-300 whitespace-nowrap">تاشدن ۳ بعدی (Fold):</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={internalFold}
            onChange={(e) => setInternalFold(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <span className="text-xs font-mono font-bold text-amber-300 w-12 text-left">
            {Math.round(internalFold * 100)}%
          </span>
        </div>

        {/* Quick Fold Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInternalFold(0)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition border ${
              internalFold === 0 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            گسترده (Flat)
          </button>
          <button
            type="button"
            onClick={() => setInternalFold(0.5)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition border ${
              internalFold === 0.5 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            نیمه‌باز (50%)
          </button>
          <button
            type="button"
            onClick={() => setInternalFold(1)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition border ${
              internalFold === 1 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            بسته کامل (100%)
          </button>

          <button
            type="button"
            onClick={() => setIsRotating((r) => !r)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition border ${
              isRotating ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isRotating ? 'توقف چرخش' : 'چرخش خودکار'}
          </button>
        </div>
      </div>
    </div>
  );
}
