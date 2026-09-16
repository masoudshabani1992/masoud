import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Box,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Sun,
  Palette,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Download,
  Upload,
  ArrowRight,
  Sliders,
  Check,
  ChevronRight,
  Camera,
  Film,
  Eye,
  RefreshCw,
  FolderOpen,
  Crown,
  Share2,
  FileCode,
  ShoppingBag,
  CircleDot,
  Trash2
} from 'lucide-react';
import {
  createPaperboardTexture,
  createKraftTexture,
  createDuplexTexture,
  createMarbleTexture,
  createWoodTexture
} from '../utils/proceduralTextures';

// 1. Packaging Model Library matching Pacdora Categories (100% Persian)
const MODEL_CATEGORIES = [
  { id: 'all', name: 'همه مدل‌ها (۲۸)', icon: '✨' },
  { id: 'folding', name: 'دارویی و بهداشتی (ECMA)', icon: '💊' },
  { id: 'corrugated', name: 'پستی و کارتن مادر (FEFCO)', icon: '🚚' },
  { id: 'rigid', name: 'هاردباکس و لوکس', icon: '🎁' },
  { id: 'food', name: 'غذا و شیرینی', icon: '🍰' },
  { id: 'special', name: 'خاص و استند', icon: '🏬' },
  { id: 'bottles', name: 'بطری و شیشه', icon: '🍾' },
  { id: 'pouches', name: 'پاکت و ساک دستی', icon: '🛍️' },
  { id: 'cans', name: 'قوطی و جار', icon: '🥫' }
];

const MODELS_DATA = [
  // 1. Folding Cartons (ECMA)
  { id: 'tuck_end', category: 'folding', name: 'جعبه دارویی دو طرف درب هماهنگ (STE)', farsiName: 'جعبه دارویی دو طرف درب', defaultDim: { l: 120, w: 60, h: 160, t: 0.5 }, icon: '💊' },
  { id: 'reverse_tuck', category: 'folding', name: 'جعبه دارویی دو طرف درب معکوس (RTE)', farsiName: 'جعبه دارویی درب معکوس', defaultDim: { l: 100, w: 50, h: 140, t: 0.5 }, icon: '💄' },
  { id: 'snap_lock_bottom', category: 'folding', name: 'جعبه قفل زیرین چفتی ۱-۲-۳ (Snap-Lock)', farsiName: 'جعبه قفل زیرین چفتی', defaultDim: { l: 140, w: 80, h: 180, t: 0.6 }, icon: '🔒' },
  { id: 'auto_bottom', category: 'folding', name: 'جعبه کفی قفلی اتوماتیک (Crash-Lock)', farsiName: 'جعبه کفی اتوماتیک', defaultDim: { l: 130, w: 75, h: 170, t: 0.6 }, icon: '⚡' },
  { id: 'hanging_tab', category: 'folding', name: 'جعبه آویزدار رگالی سوراخ یوروپانچ', farsiName: 'جعبه آویزدار رگالی', defaultDim: { l: 90, w: 40, h: 130, t: 0.5 }, icon: '🏷️' },

  // 2. Corrugated & Mailers (FEFCO)
  { id: 'mailer', category: 'corrugated', name: 'کارتن پستی کیبوردی قفل‌دار (FEFCO 0427)', farsiName: 'کارتن پستی کیبوردی', defaultDim: { l: 220, w: 160, h: 60, t: 1.5 }, icon: '📦' },
  { id: 'roll_end_tuck_top', category: 'corrugated', name: 'جعبه کیبوردی درب از بالا (RETT)', farsiName: 'کیبوردی درب از بالا', defaultDim: { l: 200, w: 140, h: 50, t: 1.5 }, icon: '📬' },
  { id: 'american', category: 'corrugated', name: 'کارتن مادر ۴ درب استاندارد (FEFCO 0201)', farsiName: 'کارتن مادر استاندارد', defaultDim: { l: 350, w: 250, h: 280, t: 3.0 }, icon: '🏭' },
  { id: 'hsc', category: 'corrugated', name: 'کارتن نیمه‌درب باز (FEFCO 0200)', farsiName: 'کارتن نیمه‌درب باز', defaultDim: { l: 300, w: 200, h: 220, t: 3.0 }, icon: '📦' },
  { id: 'full_overlap', category: 'corrugated', name: 'کارتن با درب اورلب کامل (FEFCO 0203)', farsiName: 'کارتن با اورلب کامل', defaultDim: { l: 320, w: 220, h: 240, t: 3.0 }, icon: '🛡️' },
  { id: 'pizza_box', category: 'corrugated', name: 'جعبه پیتزا کیبوردی با منافذ تهویه', farsiName: 'جعبه پیتزا کیبوردی', defaultDim: { l: 320, w: 320, h: 45, t: 1.5 }, icon: '🍕' },

  // 3. Rigid & Luxury Gift Boxes
  { id: 'rigid_box', category: 'rigid', name: 'هاردباکس لوکس دو تکه (کف و درب جدا)', farsiName: 'هاردباکس لوکس دو تکه', defaultDim: { l: 200, w: 140, h: 60, t: 2.0 }, icon: '🎁' },
  { id: 'sleeve_box', category: 'rigid', name: 'جعبه کشویی کبریتی (غلاف و کشو)', farsiName: 'جعبه کشویی غلاف و کشو', defaultDim: { l: 180, w: 100, h: 45, t: 0.8 }, icon: '🗂️' },
  { id: 'book_style', category: 'rigid', name: 'هاردباکس لوکس کتابی با درب مگنتی', farsiName: 'هاردباکس کتابی مگنتی', defaultDim: { l: 220, w: 150, h: 55, t: 2.0 }, icon: '📖' },

  // 4. Food & Fast Food
  { id: 'gable_top', category: 'food', name: 'جعبه دسته‌دار شیرینی و سوغات (Gable Top)', farsiName: 'جعبه دسته‌دار شیرینی', defaultDim: { l: 180, w: 120, h: 160, t: 0.6 }, icon: '🧁' },
  { id: 'cake_box', category: 'food', name: 'جعبه کیک و شیرینی ۴ گوش با پنجره', farsiName: 'جعبه کیک پنجره‌دار', defaultDim: { l: 240, w: 240, h: 120, t: 0.6 }, icon: '🎂' },
  { id: 'french_fry_box', category: 'food', name: 'پاکت هلالی سیب‌زمینی و فست‌فود', farsiName: 'پاکت هلالی سیب‌زمینی', defaultDim: { l: 110, w: 50, h: 130, t: 0.5 }, icon: '🍟' },

  // 5. Specialty, Novelty & Displays
  { id: 'pillow_box', category: 'special', name: 'جعبه بالشتی فانتزی (Pillow Box)', farsiName: 'جعبه بالشتی فانتزی', defaultDim: { l: 160, w: 110, h: 35, t: 0.5 }, icon: '🎀' },
  { id: 'hexagon_box', category: 'special', name: 'جعبه شش‌ضلعی لوکس قنادی و عطر', farsiName: 'جعبه شش‌ضلعی لوکس', defaultDim: { l: 120, w: 120, h: 150, t: 0.6 }, icon: '⬡' },
  { id: 'triangular_box', category: 'special', name: 'جعبه منشوری سه‌گوش شکلات و اسنک', farsiName: 'جعبه منشوری سه‌گوش', defaultDim: { l: 140, w: 100, h: 180, t: 0.6 }, icon: '📐' },
  { id: 'counter_display', category: 'special', name: 'استند پیشخوان نمایشگاهی پرفراژدار', farsiName: 'استند پیشخوان پرفراژدار', defaultDim: { l: 250, w: 180, h: 200, t: 1.5 }, icon: '🏬' },
  { id: 'four_corner_tray', category: 'special', name: 'سینی ۴ گوش تاشو (Four Corner Tray)', farsiName: 'سینی ۴ گوش تاشو', defaultDim: { l: 260, w: 180, h: 70, t: 0.8 }, icon: '📥' },

  // 6. Bottles
  { id: 'dropper_bottle', category: 'bottles', name: 'بطری شیشه‌ای قطره‌چکانی آرایشی', farsiName: 'قطره‌چکانی آرایشی', defaultDim: { l: 45, w: 45, h: 110, t: 3.0 }, icon: '💧' },
  { id: 'wine_bottle', category: 'bottles', name: 'بطری شیشه‌ای استوانه‌ای ۷۵۰ میل', farsiName: 'بطری شیشه‌ای ۷۵۰ml', defaultDim: { l: 75, w: 75, h: 280, t: 4.0 }, icon: '🍾' },
  
  // 7. Pouches & Bags
  { id: 'standup_pouch', category: 'pouches', name: 'پاکت ایستاده زیپ‌کیپ کرافت/متالایز', farsiName: 'پاکت ایستاده زیپ‌کیپ', defaultDim: { l: 140, w: 70, h: 220, t: 0.2 }, icon: '☕' },
  { id: 'shopping_bag', category: 'pouches', name: 'ساک دستی کاغذی دسته‌دار کرافت', farsiName: 'ساک دستی کاغذی کرافت', defaultDim: { l: 220, w: 100, h: 280, t: 0.4 }, icon: '🛍️' },
  
  // 8. Cans & Jars
  { id: 'beverage_can', category: 'cans', name: 'قوطی آلومینیومی استاندارد ۳۳۰ میل', farsiName: 'قوطی فلزی نوشابه', defaultDim: { l: 66, w: 66, h: 122, t: 0.3 }, icon: '🥤' },
  { id: 'cosmetic_jar', category: 'cans', name: 'جار شیشه‌ای کرم با درب طلایی', farsiName: 'جار شیشه‌ای لوکس', defaultDim: { l: 65, w: 65, h: 55, t: 3.0 }, icon: '🧴' }
];

// 2. Pure Raw Packaging Materials & Board Types (No Forced Colored Designs)
const RAW_MATERIALS = [
  { id: 'white_cardboard', name: 'مقوای ایندربرد سفید بهداشتی (White Board)', desc: 'مقوای سفید مات بهداشتی با الیاف سلولزی خالص بدون طرح اضافه', color: '#ffffff', type: 'paperboard' },
  { id: 'kraft_brown', name: 'مقوای کرافت طبیعی قهوه‌ای (Brown Kraft)', desc: 'بافت طبیعی ارگانیک کرافت با الیاف چوب و ظاهر کلاسیک کارتن', color: '#c89d6c', type: 'kraft' },
  { id: 'duplex_gray', name: 'مقوای پشت طوسی صنعتی (Duplex Board)', desc: 'مقوای صنعتی خاکستری مناسب جعبه‌های عمومی و دارویی', color: '#e2e8f0', type: 'duplex' },
  { id: 'gold_foil', name: 'مقوای سفید + فویل طلاکوب برجسته (Gold Foil)', desc: 'فویل متالیک طلایی ۲۴ عیار با رفلکس نور روی مقوای سفید', color: '#fbbf24', type: 'paperboard', foil: 'gold' },
  { id: 'silver_foil', name: 'مقوای سفید + فویل نقره‌کوب (Silver Foil)', desc: 'فویل کروم متالیک نقره‌ای روی مقوای سفید', color: '#f1f5f9', type: 'paperboard', foil: 'silver' },
  { id: 'kraft_gold', name: 'کرافت طبیعی + طلاکوب متالیک (Kraft & Gold)', desc: 'ترکیب لوکس و جذاب مقوای کرافت قهوه‌ای با طلاکوب براق', color: '#d97706', type: 'kraft', foil: 'gold' },
  { id: 'soft_touch', name: 'سلفون مخملی مات (Soft-Touch Velvet)', desc: 'پوشش فوق‌العاده مات با حس لمس مخملین', color: '#334155', type: 'paperboard', foil: 'velvet' }
];

// 3. 3D Studio Scenes & Environments
const SCENES = [
  { id: 'minimal_white', name: 'استودیو مینیمال صنعتی (Studio Minimal)', desc: 'استودیو عکاسی صنعتی تمیز با پس‌زمینه روشن و نور ملایم', floor: 'concrete', lightColor: '#ffffff' },
  { id: 'luxury_marble', name: 'استودیو سنگ مرمر (Light Luxury)', desc: 'استودیو لوکس با سنگ مرمر سفید Carrara', floor: 'marble', lightColor: '#ffffff' },
  { id: 'nature_wood', name: 'طبیعت و چوب بلوط (Nature & Wood)', desc: 'استودیو ارگانیک با صفحه چوب بلوط طبیعی', floor: 'wood', lightColor: '#fef3c7' },
  { id: 'universe_dark', name: 'صحنه سینمایی دارک (Universe Dark)', desc: 'فضای تاریک سینمایی با نور لبه‌ای نئون', floor: 'mirror', lightColor: '#38bdf8' }
];

export default function Packaging3DStudioView({ onSwitchTo2DDieline, onTransferToOrder }) {
  const mountRef = useRef(null);

  // Active Left Dock Tab
  const [activeDockTab, setActiveDockTab] = useState('materials'); // 'models', 'materials', 'upload', 'scene', 'light', 'export'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selected Packaging Model & Parameters
  const [selectedModelId, setSelectedModelId] = useState('tuck_end');
  const [lengthMm, setLengthMm] = useState(120);
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(160);
  const [thicknessMm, setThicknessMm] = useState(0.5);

  // Materials & PBR Craft Finish
  const [selectedCraft, setSelectedCraft] = useState('white_cardboard');

  // Artwork / Texture Upload (null by default for clean paperboard)
  const [uploadedArtworkUrl, setUploadedArtworkUrl] = useState(null);

  // Scene & Environment
  const [selectedScene, setSelectedScene] = useState('minimal_white');
  const [hasPodium, setHasPodium] = useState(false);

  // Studio Lighting
  const [lightIntensity, setLightIntensity] = useState(1.8);
  const [lightAngle, setLightAngle] = useState(45);

  // Animation & Folding
  const [foldAngle, setFoldAngle] = useState(1.0); // 0.0 (Flat) to 1.0 (Closed)
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);

  // Camera & Rendering Mode
  const [cameraView, setCameraView] = useState('perspective');
  const [showWireframe, setShowWireframe] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Three.js instances ref
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    updateCameraFn: null,
    setOrbitFn: null
  });

  // Handle Model Selection
  const handleSelectModel = (model) => {
    setSelectedModelId(model.id);
    if (model.defaultDim) {
      setLengthMm(model.defaultDim.l);
      setWidthMm(model.defaultDim.w);
      setHeightMm(model.defaultDim.h);
      setThicknessMm(model.defaultDim.t);
    }
  };

  // Artwork Upload Handler
  const handleArtworkUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedArtworkUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearArtwork = () => {
    setUploadedArtworkUrl(null);
    setSelectedCraft('white_cardboard');
  };

  // 4K Render Exporter
  const handleExport4KRender = () => {
    if (!threeRef.current.renderer || !threeRef.current.scene || !threeRef.current.camera) return;

    setIsExporting(true);
    const renderer = threeRef.current.renderer;
    const scene = threeRef.current.scene;
    const camera = threeRef.current.camera;

    const oldW = renderer.domElement.width;
    const oldH = renderer.domElement.height;
    const oldAspect = camera.aspect;

    renderer.setSize(3840, 2160, false);
    camera.aspect = 3840 / 2160;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);

    const dataUrl = renderer.domElement.toDataURL('image/png', 1.0);

    // Restore viewport size
    renderer.setSize(oldW, oldH, false);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    const link = document.createElement('a');
    link.download = `رندر-استودیو-امیران-${selectedModelId}-${lengthMm}x${widthMm}x${heightMm}mm-4K.png`;
    link.href = dataUrl;
    link.click();

    setTimeout(() => setIsExporting(false), 800);
  };

  // Camera Angle Helpers
  const handleSetCameraAngle = (view) => {
    setCameraView(view);
    if (threeRef.current.setOrbitFn) {
      switch (view) {
        case 'front':
          threeRef.current.setOrbitFn(0, Math.PI / 2);
          break;
        case 'top':
          threeRef.current.setOrbitFn(0, 0.08);
          break;
        case 'right':
          threeRef.current.setOrbitFn(Math.PI / 2, Math.PI / 2);
          break;
        case 'isometric':
          threeRef.current.setOrbitFn(0.785, 0.955);
          break;
        case 'perspective':
        default:
          threeRef.current.setOrbitFn(0.65, 1.1);
          break;
      }
    }
  };

  // ========================================================
  // THREE.JS MASTER ENGINE & PBR PIPELINE
  // ========================================================
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    threeRef.current.scene = scene;

    const L = Math.max(20, lengthMm);
    const W = Math.max(20, widthMm);
    const H = Math.max(10, heightMm);
    const T = Math.max(0.4, thicknessMm);
    const maxDim = Math.max(L, W, H, 120);

    // Target box center point
    const target = new THREE.Vector3(0, H * 0.45, 0);

    // 2. Camera Setup with Wide Frustum (Near: 1, Far: 10000)
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 10000);
    let orbitRadius = maxDim * 2.4;
    let orbitTheta = 0.65; // azimuth angle
    let orbitPhi = 1.1;    // polar elevation angle

    const updateCameraPos = () => {
      const x = target.x + orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
      const y = target.y + orbitRadius * Math.cos(orbitPhi);
      const z = target.z + orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
      camera.position.set(x, y, z);
      camera.lookAt(target);
    };
    updateCameraPos();

    threeRef.current.camera = camera;
    threeRef.current.updateCameraFn = updateCameraPos;
    threeRef.current.setOrbitFn = (theta, phi) => {
      orbitTheta = theta;
      orbitPhi = phi;
      updateCameraPos();
    };

    // 3. WebGL Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    threeRef.current.renderer = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, lightIntensity * 0.65);
    scene.add(ambientLight);

    const rad = (lightAngle * Math.PI) / 180;
    const mainLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 1.9);
    mainLight.position.set(Math.cos(rad) * 450, 600, Math.sin(rad) * 450);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 2500;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, lightIntensity * 0.85);
    fillLight.position.set(-Math.sin(rad) * 400, 300, -Math.cos(rad) * 400);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, lightIntensity * 0.5);
    rimLight.position.set(0, -300, 300);
    scene.add(rimLight);

    // 5. Studio Floor Grid / Plane (placed at y = -1.5 with depthWrite: false to prevent Z-fighting)
    const floorGeo = new THREE.PlaneGeometry(3500, 3500);
    let floorMat;

    if (selectedScene === 'luxury_marble') {
      const marbleTex = createMarbleTexture();
      marbleTex.repeat.set(3, 3);
      floorMat = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.15,
        metalness: 0.1,
        depthWrite: false
      });
    } else if (selectedScene === 'nature_wood') {
      const woodTex = createWoodTexture();
      woodTex.repeat.set(2, 2);
      floorMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.45,
        metalness: 0.05,
        depthWrite: false
      });
    } else if (selectedScene === 'universe_dark') {
      floorMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        roughness: 0.05,
        metalness: 0.9,
        depthWrite: false
      });
    } else {
      floorMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85,
        metalness: 0.0,
        depthWrite: false
      });
    }

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = hasPodium ? -30 : -1.5;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 6. Optional Exhibition Podium
    if (hasPodium) {
      const podiumGroup = new THREE.Group();
      const podiumRadius = Math.max(L, W) * 1.1;
      const podiumGeo = new THREE.CylinderGeometry(podiumRadius, podiumRadius * 1.05, 30, 48);
      
      const podiumMarbleTex = createMarbleTexture();
      const podiumMat = new THREE.MeshStandardMaterial({
        map: podiumMarbleTex,
        roughness: 0.2,
        metalness: 0.15
      });
      const pMesh = new THREE.Mesh(podiumGeo, podiumMat);
      pMesh.position.y = -15;
      pMesh.receiveShadow = true;
      pMesh.castShadow = true;
      podiumGroup.add(pMesh);

      const ringGeo = new THREE.TorusGeometry(podiumRadius + 1.5, 2.5, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.15
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -1;
      podiumGroup.add(ringMesh);

      scene.add(podiumGroup);
    }

    // 7. Master Packaging 3D Model Hierarchy
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // ===============================================
    // PURE RAW PACKAGING MATERIAL TEXTURE PIPELINE
    // ===============================================
    let artworkTex = null;
    let foilMetalness = 0.04;
    let foilRoughness = 0.38;
    let foilColor = new THREE.Color('#fafaf9');

    if (uploadedArtworkUrl) {
      const img = new Image();
      img.src = uploadedArtworkUrl;
      artworkTex = new THREE.Texture(img);
      img.onload = () => {
        artworkTex.needsUpdate = true;
      };
    } else if (selectedCraft === 'kraft_brown' || selectedCraft === 'kraft') {
      artworkTex = createKraftTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#c89d6c');
      foilRoughness = 0.82;
      foilMetalness = 0.02;
    } else if (selectedCraft === 'duplex_gray' || selectedCraft === 'duplex') {
      artworkTex = createDuplexTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#f1f1ed');
      foilRoughness = 0.55;
      foilMetalness = 0.03;
    } else if (selectedCraft === 'gold_foil') {
      artworkTex = createPaperboardTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#fbbf24');
      foilMetalness = 0.85;
      foilRoughness = 0.2;
    } else if (selectedCraft === 'silver_foil') {
      artworkTex = createPaperboardTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#f1f5f9');
      foilMetalness = 0.95;
      foilRoughness = 0.1;
    } else if (selectedCraft === 'kraft_gold') {
      artworkTex = createKraftTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#d97706');
      foilMetalness = 0.75;
      foilRoughness = 0.4;
    } else if (selectedCraft === 'soft_touch') {
      artworkTex = createPaperboardTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#334155');
      foilRoughness = 0.95;
      foilMetalness = 0.0;
    } else {
      artworkTex = createPaperboardTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#fafaf9');
      foilRoughness = 0.38;
      foilMetalness = 0.04;
    }

    const boxMat = new THREE.MeshStandardMaterial({
      color: foilColor,
      map: artworkTex,
      roughness: foilRoughness,
      metalness: foilMetalness,
      side: THREE.DoubleSide
    });

    // High-visibility CAD Dieline Materials (Red Cut lines + Green Crease lines)
    const cutEdgeMat = new THREE.LineBasicMaterial({
      color: showWireframe ? 0xef4444 : 0x3b82f6,
      linewidth: showWireframe ? 2.5 : 1.2,
      transparent: true,
      opacity: showWireframe ? 1.0 : 0.4
    });

    const creaseEdgeMat = new THREE.LineDashedMaterial({
      color: 0x22c55e,
      linewidth: 2.0,
      scale: 1,
      dashSize: 4,
      gapSize: 2,
      transparent: true,
      opacity: showWireframe ? 1.0 : 0.3
    });

    // ===============================================
    // UNIVERSAL ARTICULATED KINEMATICS BUILDER
    // ===============================================
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

    const f = Math.max(0, Math.min(1, parseFloat(foldAngle) ?? 1.0));
    const angle = (Math.PI / 2) * f;
    const mId = (selectedModelId || 'tuck_end').toLowerCase();

    if (mId.includes('rigid') || mId.includes('two_piece') || mId.includes('base_lid')) {
      // 1. Two-Piece Rigid Base & Lid Box
      const baseMesh = makeBoxPanel(L, W);
      baseMesh.position.set(0, 0, 0);
      modelGroup.add(baseMesh);

      // 4 Base Walls
      const bFrontPivot = new THREE.Group();
      bFrontPivot.position.set(0, 0, W / 2);
      modelGroup.add(bFrontPivot);
      const bFront = makeBoxPanel(L, H);
      bFront.position.set(0, 0, H / 2);
      bFrontPivot.add(bFront);
      bFrontPivot.rotation.x = -angle;

      const bBackPivot = new THREE.Group();
      bBackPivot.position.set(0, 0, -W / 2);
      modelGroup.add(bBackPivot);
      const bBack = makeBoxPanel(L, H);
      bBack.position.set(0, 0, -H / 2);
      bBackPivot.add(bBack);
      bBackPivot.rotation.x = +angle;

      const bLeftPivot = new THREE.Group();
      bLeftPivot.position.set(-L / 2, 0, 0);
      modelGroup.add(bLeftPivot);
      const bLeft = makeBoxPanel(H, W);
      bLeft.position.set(-H / 2, 0, 0);
      bLeftPivot.add(bLeft);
      bLeftPivot.rotation.z = -angle;

      const bRightPivot = new THREE.Group();
      bRightPivot.position.set(L / 2, 0, 0);
      modelGroup.add(bRightPivot);
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

      modelGroup.add(lidGroup);

    } else if (mId.includes('sleeve') || mId.includes('drawer')) {
      // 2. Sleeve & Drawer Matchbox
      const sleeveMesh = makeBoxPanel(L + 4, W + 4);
      sleeveMesh.position.set(0, 0, 0);
      modelGroup.add(sleeveMesh);

      const sLeftPivot = new THREE.Group();
      sLeftPivot.position.set(-(L + 4) / 2, 0, 0);
      modelGroup.add(sLeftPivot);
      const sLeft = makeBoxPanel(H + 4, W + 4);
      sLeft.position.set(-(H + 4) / 2, 0, 0);
      sLeftPivot.add(sLeft);
      sLeftPivot.rotation.z = -angle;

      const sRightPivot = new THREE.Group();
      sRightPivot.position.set((L + 4) / 2, 0, 0);
      modelGroup.add(sRightPivot);
      const sRight = makeBoxPanel(H + 4, W + 4);
      sRight.position.set((H + 4) / 2, 0, 0);
      sRightPivot.add(sRight);
      sRightPivot.rotation.z = +angle;

      // Inner Drawer
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

      modelGroup.add(drawerGroup);

    } else if (mId.includes('hexagon')) {
      // 3. Hexagonal 6-Sided Box
      const radius = L / 2;
      const hexGeo = new THREE.CylinderGeometry(radius, radius, H * Math.max(0.1, f), 6, 1, false);
      const hexMesh = new THREE.Mesh(hexGeo, boxMat);
      hexMesh.position.set(0, (H * Math.max(0.1, f)) / 2, 0);
      hexMesh.castShadow = true;
      modelGroup.add(hexMesh);

      const hexEdge = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), cutEdgeMat);
      hexMesh.add(hexEdge);

    } else if (mId.includes('triangle') || mId.includes('triangular')) {
      // 4. Triangular 3-Sided Prism Box
      const radius = L * 0.6;
      const triGeo = new THREE.CylinderGeometry(radius, radius, H * Math.max(0.1, f), 3, 1, false);
      const triMesh = new THREE.Mesh(triGeo, boxMat);
      triMesh.position.set(0, (H * Math.max(0.1, f)) / 2, 0);
      triMesh.castShadow = true;
      modelGroup.add(triMesh);

      const triEdge = new THREE.LineSegments(new THREE.EdgesGeometry(triGeo), cutEdgeMat);
      triMesh.add(triEdge);

    } else if (mId.includes('pillow')) {
      // 5. Pillow Box
      const pillowGeo = new THREE.SphereGeometry(L * 0.6, 32, 16, 0, Math.PI, 0, Math.PI / 2);
      const pillowMesh = new THREE.Mesh(pillowGeo, boxMat);
      pillowMesh.scale.set(1, Math.max(0.1, f) * (H / (L * 0.6)), (W * 0.8) / (L * 0.6));
      pillowMesh.position.set(0, (H * Math.max(0.1, f)) / 2, 0);
      pillowMesh.castShadow = true;
      modelGroup.add(pillowMesh);

      const pEdge = new THREE.LineSegments(new THREE.EdgesGeometry(pillowGeo), cutEdgeMat);
      pillowMesh.add(pEdge);

    } else if (mId === 'dropper_bottle' || mId === 'wine_bottle') {
      // Bottles
      const bottleRadius = L / 2;
      const bodyHeight = H * 0.7;
      const bottleGeo = new THREE.CylinderGeometry(bottleRadius, bottleRadius, bodyHeight, 32);
      const bottleMesh = new THREE.Mesh(bottleGeo, boxMat);
      bottleMesh.position.y = bodyHeight / 2;
      bottleMesh.castShadow = true;
      modelGroup.add(bottleMesh);

      const capGeo = new THREE.CylinderGeometry(bottleRadius * 0.6, bottleRadius * 0.6, H * 0.25, 32);
      const goldCapMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
      const capMesh = new THREE.Mesh(capGeo, goldCapMat);
      capMesh.position.y = bodyHeight + (H * 0.25) / 2 + (1 - f) * 40;
      capMesh.castShadow = true;
      modelGroup.add(capMesh);

    } else if (mId === 'beverage_can') {
      // Cans
      const canGeo = new THREE.CylinderGeometry(L / 2, L / 2, H, 36);
      const canMesh = new THREE.Mesh(canGeo, boxMat);
      canMesh.position.y = H / 2;
      canMesh.castShadow = true;
      modelGroup.add(canMesh);

    } else if (mId === 'cosmetic_jar') {
      // Jars
      const jarGeo = new THREE.CylinderGeometry(L / 2, L / 2, H * 0.65, 36);
      const jarMesh = new THREE.Mesh(jarGeo, boxMat);
      jarMesh.position.y = (H * 0.65) / 2;
      jarMesh.castShadow = true;
      modelGroup.add(jarMesh);

      const lidGeo = new THREE.CylinderGeometry(L / 2 + 1, L / 2 + 1, H * 0.35, 36);
      const goldLidMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
      const lidMesh = new THREE.Mesh(lidGeo, goldLidMat);
      lidMesh.position.y = H * 0.65 + (H * 0.35) / 2 + (1 - f) * 40;
      lidMesh.castShadow = true;
      modelGroup.add(lidMesh);

    } else {
      // 6. Master Articulated Folding Carton (STE, RTE, Mailer 0427, RSC 0201, Snap Lock, Auto Bottom, Pizza, Hanging Tab, Cake, Counter Display)
      // Bottom Panel (Base)
      const bottom = makeBoxPanel(L, W);
      bottom.position.set(0, 0, 0);
      modelGroup.add(bottom);

      // Rear Wall
      const rearPivot = new THREE.Group();
      rearPivot.position.set(0, 0, -W / 2);
      modelGroup.add(rearPivot);

      const rearWallH = mId.includes('hanging') ? H + 35 : mId.includes('counter') ? H + 60 : H;
      const rearPanel = makeBoxPanel(L, rearWallH);
      rearPanel.position.set(0, 0, -rearWallH / 2);
      rearPivot.add(rearPanel);
      rearPivot.rotation.x = +angle;

      // Top Lid (Hinged at top of rear wall at local z = -H)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0, -H);
      rearPivot.add(lidPivot);

      const lidPanel = makeBoxPanel(L, W);
      lidPanel.position.set(0, 0, -W / 2);
      lidPivot.add(lidPanel);
      lidPivot.rotation.x = +angle;

      // Top Tuck Flap (Hinged at front of lid at local z = -W)
      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, 0, -W);
      lidPivot.add(flapPivot);

      const flapH = Math.min(H * 0.45, Math.max(18, W * 0.35));
      const flapPanel = makeBoxPanel(L, flapH);
      flapPanel.position.set(0, 0, -flapH / 2);
      flapPivot.add(flapPanel);
      flapPivot.rotation.x = +angle;

      // Front Wall (Hinged at z = +W/2)
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, 0, W / 2);
      modelGroup.add(frontPivot);

      const frontWallH = mId.includes('counter') ? H * 0.4 : H;
      const frontPanel = makeBoxPanel(L, frontWallH);
      frontPanel.position.set(0, 0, frontWallH / 2);
      frontPivot.add(frontPanel);
      frontPivot.rotation.x = -angle;

      // Left Wall (Hinged at x = -L/2)
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-L / 2, 0, 0);
      modelGroup.add(leftPivot);

      const leftPanel = makeBoxPanel(H, W);
      leftPanel.position.set(-H / 2, 0, 0);
      leftPivot.add(leftPanel);
      leftPivot.rotation.z = -angle;

      // Right Wall (Hinged at x = +L/2)
      const rightPivot = new THREE.Group();
      rightPivot.position.set(L / 2, 0, 0);
      modelGroup.add(rightPivot);

      const rightPanel = makeBoxPanel(H, W);
      rightPanel.position.set(H / 2, 0, 0);
      rightPivot.add(rightPanel);
      rightPivot.rotation.z = +angle;
    }

    // 8. Spherical Orbit Drag Controls (centered on box target)
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

      orbitTheta -= dx * 0.008;
      orbitPhi = Math.max(0.08, Math.min(Math.PI / 2 + 0.1, orbitPhi - dy * 0.008));

      updateCameraPos();
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 1 + e.deltaY * 0.0015;
      orbitRadius = Math.max(maxDim * 1.1, Math.min(maxDim * 6.0, orbitRadius * zoomFactor));
      updateCameraPos();
    };

    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // 9. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotating && !isDragging) {
        orbitTheta += 0.005 * rotationSpeed;
        updateCameraPos();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Window Resize Handler
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
  }, [
    selectedModelId,
    lengthMm,
    widthMm,
    heightMm,
    thicknessMm,
    selectedCraft,
    uploadedArtworkUrl,
    selectedScene,
    hasPodium,
    lightIntensity,
    lightAngle,
    foldAngle,
    isAutoRotating,
    rotationSpeed,
    showWireframe
  ]);

  const activeModel = MODELS_DATA.find((m) => m.id === selectedModelId) || MODELS_DATA[0];

  const filteredModels =
    selectedCategory === 'all'
      ? MODELS_DATA
      : MODELS_DATA.filter((m) => m.category === selectedCategory);

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative select-none" dir="rtl">
      
      {/* 1. Master Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-wrap gap-2 z-20">
        
        {/* Left: Studio Title & Back to 2D */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSwitchTo2DDieline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به ترسیم ۲ بعدی</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-wide">استودیو مدل‌سازی و ماکاپ ۳ بعدی امیران</span>
              <span className="text-[10px] text-indigo-400 block font-mono">Three.js PBR Studio Engine</span>
            </div>
          </div>
        </div>

        {/* Center: Active Model Name & Dimensions */}
        <div className="hidden md:flex items-center gap-3 bg-slate-950/70 px-4 py-1.5 rounded-xl border border-slate-800/80 text-xs">
          <span className="text-amber-400 font-bold flex items-center gap-1.5">
            <span>{activeModel.icon}</span>
            <span>{activeModel.name}</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300 font-bold">
            {lengthMm} × {widthMm} × {heightMm} mm
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">ضخامت: {thicknessMm}mm</span>
        </div>

        {/* Right: Transfer to Order & 4K Render */}
        <div className="flex items-center gap-2">
          {onTransferToOrder && (
            <button
              type="button"
              onClick={() => {
                onTransferToOrder({
                  title: `تولید ${activeModel.name}`,
                  box_type: activeModel.name,
                  length: lengthMm,
                  width: widthMm,
                  height: heightMm,
                  thickness: thicknessMm,
                  flute_type: thicknessMm >= 1.5 ? 'E-Flute' : 'ایندربرد بهداشتی'
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ثبت سفارش تولید</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExport4KRender}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>{isExporting ? 'در حال رندر 4K...' : 'خروجی رندر 4K UHD'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ================= LEFT VERTICAL TOOL DOCK ================= */}
        <div className="w-16 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-3 gap-2 z-20 shrink-0">
          {[
            { id: 'models', label: 'مدل‌ها', icon: Box },
            { id: 'materials', label: 'متریال', icon: Palette },
            { id: 'upload', label: 'طرح چاپی', icon: ImageIcon },
            { id: 'scene', label: 'صحنه', icon: Sparkles },
            { id: 'light', label: 'نورپردازی', icon: Sun },
            { id: 'export', label: 'خروجی', icon: Download }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeDockTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDockTab(tab.id)}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition group relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <TabIcon className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= SECONDARY EXPANDED DOCK PANEL ================= */}
        <div className="w-72 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col overflow-y-auto shrink-0 p-4 space-y-5 z-20">
          
          {/* DOCK 1: 3D MODELS LIBRARY */}
          {activeDockTab === 'models' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-amber-400" />
                  <span>کتابخانه مدل‌های سه‌بعدی</span>
                </h3>
                <p className="text-[11px] text-slate-400">۲۸ استاندارد جعبه‌سازی و هاردباکس صنعتی</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {MODEL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-2 gap-2">
                {filteredModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectModel(m)}
                    className={`p-2.5 rounded-xl border text-right transition flex flex-col items-start gap-1 ${
                      selectedModelId === m.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 ring-1 ring-amber-500/40 shadow-sm'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-[11px] font-bold line-clamp-1">{m.farsiName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {m.defaultDim.l}×{m.defaultDim.w}×{m.defaultDim.h}mm
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DOCK 2: RAW CARD BOARD & MATERIALS */}
          {activeDockTab === 'materials' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>جنس و متریال خام جعبه</span>
                </h3>
                <p className="text-[11px] text-slate-400">مقواهای بهداشتی، کرافت ارگانیک و افکت‌های لوکس</p>
              </div>

              <div className="space-y-2">
                {RAW_MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCraft(mat.id);
                      setUploadedArtworkUrl(null);
                    }}
                    className={`w-full p-3 rounded-2xl border text-right transition flex items-start gap-3 ${
                      selectedCraft === mat.id && !uploadedArtworkUrl
                        ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-800/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-xl border border-white/20 shrink-0 mt-0.5 shadow-inner"
                      style={{ backgroundColor: mat.color }}
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="text-xs font-bold text-white">{mat.name}</div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{mat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DOCK 3: UPLOAD CUSTOM ARTWORK */}
          {activeDockTab === 'upload' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>آپلود طرح چاپی روی جعبه</span>
                </h3>
                <p className="text-[11px] text-slate-400">طرح گرافیکی اختصاصی خود را بر روی ماکاپ بیندازید</p>
              </div>

              {uploadedArtworkUrl ? (
                <div className="space-y-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center">
                  <img
                    src={uploadedArtworkUrl}
                    alt="Uploaded Artwork"
                    className="w-full h-32 object-contain bg-slate-950 rounded-xl p-2 border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleClearArtwork}
                    className="w-full py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-500/40"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>پاکسازی و بازگشت به مقوای خام</span>
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-800/40 hover:bg-slate-800/70 text-center">
                  <Upload className="w-8 h-8 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">انتخاب فایل طرح چاپی (PNG / JPG)</span>
                  <span className="text-[10px] text-slate-400">رزولوشن پیشنهادی: ۲۰۰۰×۲۰۰۰ پیکسل</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* DOCK 4: 3D SCENES & PODIUM */}
          {activeDockTab === 'scene' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>محیط و استودیو عکاسی</span>
                </h3>
                <p className="text-[11px] text-slate-400">کف‌پوش‌های استودیویی، مرمر، چوب و سکوی نمایش</p>
              </div>

              {/* Podium Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs font-bold text-slate-200">سکوی مدور نمایشگاهی (Podium)</span>
                <input
                  type="checkbox"
                  checked={hasPodium}
                  onChange={(e) => setHasPodium(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                {SCENES.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScene(sc.id)}
                    className={`w-full p-3 rounded-2xl border text-right transition flex flex-col gap-1 ${
                      selectedScene === sc.id
                        ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-800/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{sc.name}</div>
                    <p className="text-[10px] text-slate-400">{sc.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DOCK 5: LIGHTING CONTROLS */}
          {activeDockTab === 'light' && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>تنظیمات نورپردازی استودیو</span>
                </h3>
                <p className="text-[11px] text-slate-400">شدت و زاویه تابش نورهای ۳ نقطه‌ای صنعتی</p>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-1.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">شدت نور اصلی:</span>
                  <span className="font-mono text-amber-400 font-bold">{lightIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Light Angle Slider */}
              <div className="space-y-1.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">زاویه چرخش نور:</span>
                  <span className="font-mono text-amber-400 font-bold">{lightAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={lightAngle}
                  onChange={(e) => setLightAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* DOCK 6: EXPORT & RENDERING */}
          {activeDockTab === 'export' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>خروجی رندر و استودیو</span>
                </h3>
                <p className="text-[11px] text-slate-400">دریافت تصاویر تبلیغاتی با بالاترین کیفیت</p>
              </div>

              <button
                type="button"
                onClick={handleExport4KRender}
                disabled={isExporting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{isExporting ? 'در حال پردازش رندر 4K...' : 'رندر با رزولوشن 4K (3840×2160)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 3D VIEWPORT CANVAS ================= */}
        <div className="flex-1 relative overflow-hidden bg-slate-950">
          
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden flex items-center justify-center"
          />

          {/* Top Left Floating Studio Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] text-slate-300 font-mono">60 FPS</span>
          </div>

          {/* Top Right Camera Angle Quick Buttons */}
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-1.5 shadow-xl z-10">
            {[
              { id: 'perspective', label: 'پرسپکتیو' },
              { id: 'front', label: 'روبرو' },
              { id: 'top', label: 'از بالا' },
              { id: 'right', label: 'راست' },
              { id: 'isometric', label: 'ایزومتریک' }
            ].map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => handleSetCameraAngle(cam.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                  cameraView === cam.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Center Floating Animation Bottom Bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 px-5 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-4 shadow-2xl z-10 flex-wrap">
            
            {/* Quick Fold Presets */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <button
                type="button"
                onClick={() => setFoldAngle(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  foldAngle === 0 ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                شیت تخت (۰٪)
              </button>
              <button
                type="button"
                onClick={() => setFoldAngle(0.5)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  foldAngle === 0.5 ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ۵۰٪ مونتاژ
              </button>
              <button
                type="button"
                onClick={() => setFoldAngle(1.0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  foldAngle === 1.0 || foldAngle === 1 ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                جعبه بسته (۱۰۰٪)
              </button>
            </div>

            {/* Auto-Rotate Play/Pause */}
            <button
              type="button"
              onClick={() => setIsAutoRotating((r) => !r)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isAutoRotating ? 'توقف چرخش' : 'چرخش ۳۶۰°'}</span>
            </button>

            {/* Wireframe / CAD Lines Toggle */}
            <button
              type="button"
              onClick={() => setShowWireframe((w) => !w)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                showWireframe
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>خطوط CAD و تیغ</span>
            </button>

            {/* Fold Slider */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
              <span className="text-[11px] text-slate-400 font-bold">تا شدن:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={foldAngle}
                onChange={(e) => setFoldAngle(parseFloat(e.target.value))}
                className="w-28 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-xs text-amber-400 font-black min-w-[35px]">
                {Math.round(foldAngle * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
