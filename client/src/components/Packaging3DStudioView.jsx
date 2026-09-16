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
  createWoodTexture,
  createPresetArtwork
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
  { id: 'cosmetic_jar', category: 'cans', name: 'جار شیشه‌ای کرم با درب طلایی', farsiName: 'جار شیشه‌ای لوکس', defaultDim: { l: 65, w: 65, h: 55, t: 3.0 }, icon: '🧴' },
  { id: 'lotion_tube', category: 'cans', name: 'تیوب انعطاف‌پذیر کرم و لوسیون', farsiName: 'تیوب کرم و لوسیون', defaultDim: { l: 40, w: 30, h: 140, t: 0.5 }, icon: '🧪' }
];

// 2. Pure Raw Packaging Materials & Board Types (No Forced Colored Designs)
const RAW_MATERIALS = [
  { id: 'white_cardboard', name: 'مقوای ایندربرد سفید بهداشتی (White Board)', desc: 'مقوای سفید مات بهداشتی با الیاف سلولزی خالص بدون طرح اضافه', color: '#ffffff', type: 'paperboard' },
  { id: 'kraft_brown', name: 'مقوای کرافت طبیعی قهوه‌ای (Brown Kraft)', desc: 'بافت طبیعی ارگانیک کرافت با الیاف چوب و ظاهر کلاسیک کارتن', color: '#c89d6c', type: 'kraft' },
  { id: 'duplex_gray', name: 'مقوای پشت طوسی صنعتی (Duplex Board)', desc: 'مقوای صنعتی خاکستری مناسب جعبه‌های عمومی و دارویی', color: '#e2e8f0', type: 'duplex' },
  { id: 'gold_foil', name: 'مقوای سفید + فویل طلاکوب برجسته (Gold Foil)', desc: 'فویل متالیک طلایی ۲۴ عیار با رفلکس نور روی مقوای سفید', color: '#fbbf24', type: 'paperboard', foil: 'gold' },
  { id: 'silver_foil', name: 'مقوای سفید + فویل نقره‌کوب (Silver Foil)', desc: 'فویل کروم متالیک نقره‌ای روی مقوای سفید', color: '#f1f5f9', type: 'paperboard', foil: 'silver' },
  { id: 'kraft_gold', name: 'کرافت طبیعی + طلاکوب متالیک (Kraft & Gold)', desc: 'ترکیب لوکس و جذاب مقوای کرافت قهوه‌ای با طلاکوب براق', color: '#d97706', type: 'kraft', foil: 'gold' },
  { id: 'spot_uv', name: 'یووی موضعی برجسته شیشه‌ای (Spot UV)', desc: 'لایه لاک شیشه‌ای براق و برجسته روی مقوای مات', color: '#38bdf8', type: 'paperboard', foil: 'uv' },
  { id: 'soft_touch', name: 'سلفون مخملی مات (Soft-Touch Velvet)', desc: 'پوشش فوق‌العاده مات با حس لمس مخملین', color: '#334155', type: 'paperboard', foil: 'velvet' }
];

// 3. 3D Studio Scenes & Environments
const SCENES = [
  { id: 'minimal_white', name: 'استودیو مینیمال صنعتی (Studio Minimal)', desc: 'استودیو عکاسی صنعتی تمیز با پس‌زمینه روشن و نور ملایم', floor: 'concrete', bg: 'linear-gradient(135deg, #1e293b, #0f172a)', lightColor: '#ffffff' },
  { id: 'luxury_marble', name: 'استودیو سنگ مرمر (Light Luxury)', desc: 'استودیو لوکس با سنگ مرمر سفید Carrara', floor: 'marble', bg: 'linear-gradient(135deg, #1e293b, #0f172a)', lightColor: '#ffffff' },
  { id: 'nature_wood', name: 'طبیعت و چوب بلوط (Nature & Wood)', desc: 'استودیو ارگانیک با صفحه چوب بلوط طبیعی', floor: 'wood', bg: 'linear-gradient(135deg, #2e1065, #0f172a)', lightColor: '#fef3c7' },
  { id: 'universe_dark', name: 'صحنه سینمایی دارک (Universe Dark)', desc: 'فضای تاریک سینمایی با نور لبه‌ای نئون', floor: 'mirror', bg: 'linear-gradient(135deg, #09090b, #030712)', lightColor: '#38bdf8' },
  { id: 'podium_stand', name: 'استند نمایشگاهی (Exhibition Podium)', desc: 'سکوی پودیوم مدور نمایشگاهی با رینگ طلایی', floor: 'marble', bg: 'linear-gradient(135deg, #172554, #0f172a)', lightColor: '#fef08a' }
];

// 4. Studio Lighting Presets
const LIGHTING_PRESETS = [
  { id: '3point_soft', name: 'استودیو ۳ نقطه‌ای ملایم (Soft 3-Point)', intensity: 1.8, azimuth: 45, elevation: 55, temp: 'neutral' },
  { id: 'golden_hour', name: 'غروب گرم طلایی (Warm Golden Hour)', intensity: 2.2, azimuth: 65, elevation: 30, temp: 'warm' },
  { id: 'dramatic_rim', name: 'نور لبه‌ای کنتراست بالا (Dramatic Rim)', intensity: 2.5, azimuth: 120, elevation: 40, temp: 'cool' },
  { id: 'commercial_softbox', name: 'سافت‌باکس تبلیغاتی (High-Key Commercial)', intensity: 2.0, azimuth: 30, elevation: 70, temp: 'neutral' }
];

export default function Packaging3DStudioView({
  initialBoxSpecs = null,
  onSwitchTo2DDieline,
  onTransferToOrder
}) {
  const mountRef = useRef(null);

  // Active Tool Tab: 'models', 'materials', 'upload', 'scenes', 'lighting', 'animation'
  const [activeTab, setActiveTab] = useState('models');

  // Model & Dimensions State
  const [selectedModelId, setSelectedModelId] = useState(initialBoxSpecs?.modelId || 'mailer');
  const [activeCategory, setActiveCategory] = useState('boxes');
  const [lengthMm, setLengthMm] = useState(initialBoxSpecs?.length || 220);
  const [widthMm, setWidthMm] = useState(initialBoxSpecs?.width || 160);
  const [heightMm, setHeightMm] = useState(initialBoxSpecs?.height || 60);
  const [thicknessMm, setThicknessMm] = useState(initialBoxSpecs?.thickness || 1.5);
  const [unitMode, setUnitMode] = useState('mm');

  // Materials & Board Type State - Pure Raw White Paperboard by Default (بدون طرح و رنگ اضافی)
  const [selectedCraft, setSelectedCraft] = useState('white_cardboard');
  const [boxBaseColor, setBoxBaseColor] = useState('#fafaf9');
  const [roughness, setRoughness] = useState(0.38);
  const [metalness, setMetalness] = useState(0.04);

  // Artwork / Texture Upload (null by default for clean paperboard)
  const [uploadedArtworkUrl, setUploadedArtworkUrl] = useState(null);

  // Scene & Environment
  const [selectedScene, setSelectedScene] = useState('minimal_white');
  const [hasPodium, setHasPodium] = useState(false);

  // Studio Lighting
  const [lightingPreset, setLightingPreset] = useState('3point_soft');
  const [lightIntensity, setLightIntensity] = useState(1.8);
  const [lightAngle, setLightAngle] = useState(45);

  // Animation & Folding
  const [foldAngle, setFoldAngle] = useState(1.0);
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
    modelGroup: null,
    podiumGroup: null,
    floorMesh: null,
    lights: {},
    animId: null
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

    // Temporary resize to 4K resolution (3840 x 2160)
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
    const camera = threeRef.current.camera;
    if (!camera) return;

    const maxDim = Math.max(lengthMm, widthMm, heightMm, 120);
    const dist = maxDim * 2.2;

    switch (view) {
      case 'front':
        camera.position.set(0, heightMm / 2, dist);
        break;
      case 'top':
        camera.position.set(0, dist * 1.3, 0.001);
        break;
      case 'right':
        camera.position.set(dist, heightMm / 2, 0);
        break;
      case 'isometric':
        camera.position.set(dist * 0.8, dist * 0.9, dist * 0.8);
        break;
      case 'perspective':
      default:
        camera.position.set(dist * 0.9, dist * 0.7, dist * 1.1);
        break;
    }
    camera.lookAt(0, heightMm / 2, 0);
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
    threeRef.current.scene = scene;

    // Background Gradient Color
    scene.background = new THREE.Color(0x0a0f1d);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 6000);
    const maxDim = Math.max(lengthMm, widthMm, heightMm, 120);
    camera.position.set(maxDim * 1.8, maxDim * 1.4, maxDim * 2.2);
    camera.lookAt(0, heightMm / 2, 0);
    threeRef.current.camera = camera;

    // 3. WebGL Renderer with High-Precision Shadows & Tone Mapping
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
    renderer.toneMappingExposure = 1.15;
    threeRef.current.renderer = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, lightIntensity * 0.6);
    scene.add(ambientLight);

    const rad = (lightAngle * Math.PI) / 180;
    const mainLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 1.8);
    mainLight.position.set(Math.cos(rad) * 450, 600, Math.sin(rad) * 450);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 2000;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, lightIntensity * 0.8);
    fillLight.position.set(-Math.sin(rad) * 400, 300, -Math.cos(rad) * 400);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, lightIntensity * 0.6);
    rimLight.position.set(0, -300, 300);
    scene.add(rimLight);

    // 5. Studio Floor Grid / Plane
    const floorGeo = new THREE.PlaneGeometry(3000, 3000);
    let floorMat;

    if (selectedScene === 'luxury_marble') {
      const marbleTex = createMarbleTexture();
      marbleTex.repeat.set(3, 3);
      floorMat = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.15,
        metalness: 0.1
      });
    } else if (selectedScene === 'nature_wood') {
      const woodTex = createWoodTexture();
      woodTex.repeat.set(2, 2);
      floorMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.45,
        metalness: 0.05
      });
    } else if (selectedScene === 'universe_dark') {
      floorMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        roughness: 0.05,
        metalness: 0.9
      });
    } else {
      floorMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85,
        metalness: 0.0
      });
    }

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = hasPodium ? -30 : 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 6. Optional Podium Stand
    const podiumGroup = new THREE.Group();
    if (hasPodium) {
      const podiumRadius = Math.max(lengthMm, widthMm) * 1.0;
      const podiumGeo = new THREE.CylinderGeometry(podiumRadius, podiumRadius * 1.05, 30, 48);
      
      const podiumMarbleTex = createMarbleTexture();
      const podiumMat = new THREE.MeshStandardMaterial({
        map: podiumMarbleTex,
        roughness: 0.2,
        metalness: 0.15
      });
      const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
      podiumMesh.position.y = -15;
      podiumMesh.receiveShadow = true;
      podiumMesh.castShadow = true;
      podiumGroup.add(podiumMesh);

      // Gold Trim Ring around Podium
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
    threeRef.current.modelGroup = modelGroup;

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
    } else if (selectedCraft === 'kraft_brown' || selectedCraft === 'kraft' || selectedCraft === 'natural_kraft') {
      // Natural Brown Kraft Paperboard (مقوای کرافت طبیعی قهوه‌ای)
      artworkTex = createKraftTexture();
      artworkTex.repeat.set(2, 2);
      foilColor = new THREE.Color('#c89d6c');
      foilRoughness = 0.82;
      foilMetalness = 0.02;
    } else if (selectedCraft === 'duplex_gray' || selectedCraft === 'duplex') {
      // Duplex Greyback Board (مقوای پشت طوسی)
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
      // Default: Clean Pure White Paperboard (مقوای ایندربرد سفید بهداشتی خام)
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
      opacity: showWireframe ? 1.0 : 0.35
    });

    const creaseEdgeMat = new THREE.LineDashedMaterial({
      color: 0x22c55e,
      linewidth: 2.0,
      scale: 1,
      dashSize: 4,
      gapSize: 2,
      transparent: true,
      opacity: showWireframe ? 1.0 : 0.25
    });

    const L = Math.max(20, lengthMm);
    const W = Math.max(20, widthMm);
    const H = Math.max(10, heightMm);
    const T = Math.max(0.4, thicknessMm);

    // ===============================================
    // UNIVERSAL ARTICULATED GEOMETRY BUILDER FOR ALL 28 MODELS
    // ===============================================
    const makeBoxPanel = (w, h, d = T, isCrease = false) => {
      const geo = new THREE.BoxGeometry(w, h, d);
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
    const foldRad = (Math.PI / 2) * f;
    const mId = (selectedModelId || 'tuck_end').toLowerCase();

    if (mId.includes('rigid') || mId.includes('two_piece')) {
      // 1. Two-Piece Rigid Base & Lid Box
      const baseMesh = makeBoxPanel(L, W, T);
      baseMesh.rotation.x = -Math.PI / 2;
      baseMesh.position.y = 0;
      modelGroup.add(baseMesh);

      // Base Walls
      const bFront = makeBoxPanel(L, H);
      bFront.position.set(0, H / 2, W / 2);
      modelGroup.add(bFront);

      const bBack = makeBoxPanel(L, H);
      bBack.position.set(0, H / 2, -W / 2);
      modelGroup.add(bBack);

      const bLeft = makeBoxPanel(H, W);
      bLeft.position.set(-L / 2, H / 2, 0);
      bLeft.rotation.y = Math.PI / 2;
      modelGroup.add(bLeft);

      const bRight = makeBoxPanel(H, W);
      bRight.position.set(L / 2, H / 2, 0);
      bRight.rotation.y = -Math.PI / 2;
      modelGroup.add(bRight);

      // Lid Tray (Elevates with foldAngle slider from closed 1.0 to exploded 0.0)
      const lidGroup = new THREE.Group();
      const lidH = Math.max(15, H * 0.5);
      const lidElevation = H + ((1 - f) * 90);
      lidGroup.position.set(0, lidElevation, 0);
      lidGroup.rotation.y = (1 - f) * 0.35;

      const lidTop = makeBoxPanel(L + 4, W + 4);
      lidTop.position.set(0, lidH, 0);
      lidTop.rotation.x = -Math.PI / 2;
      lidGroup.add(lidTop);

      const lFront = makeBoxPanel(L + 4, lidH);
      lFront.position.set(0, lidH / 2, (W + 4) / 2);
      lidGroup.add(lFront);

      const lBack = makeBoxPanel(L + 4, lidH);
      lBack.position.set(0, lidH / 2, -(W + 4) / 2);
      lidGroup.add(lBack);

      const lLeft = makeBoxPanel(lidH, W + 4);
      lLeft.position.set(-(L + 4) / 2, lidH / 2, 0);
      lLeft.rotation.y = Math.PI / 2;
      lidGroup.add(lLeft);

      const lRight = makeBoxPanel(lidH, W + 4);
      lRight.position.set((L + 4) / 2, lidH / 2, 0);
      lRight.rotation.y = -Math.PI / 2;
      lidGroup.add(lRight);

      modelGroup.add(lidGroup);

    } else if (mId.includes('sleeve') || mId.includes('drawer')) {
      // 2. Sleeve & Drawer Matchbox
      const sleeveMesh = makeBoxPanel(L + 4, H + 4);
      sleeveMesh.position.set(0, H / 2, -(W + 2) / 2);
      modelGroup.add(sleeveMesh);

      const sleeveFront = makeBoxPanel(L + 4, H + 4);
      sleeveFront.position.set(0, H / 2, (W + 2) / 2);
      modelGroup.add(sleeveFront);

      const sleeveTop = makeBoxPanel(L + 4, W + 4);
      sleeveTop.position.set(0, H + 2, 0);
      sleeveTop.rotation.x = -Math.PI / 2;
      modelGroup.add(sleeveTop);

      const sleeveBot = makeBoxPanel(L + 4, W + 4);
      sleeveBot.position.set(0, 0, 0);
      sleeveBot.rotation.x = -Math.PI / 2;
      modelGroup.add(sleeveBot);

      // Inner Drawer (slides horizontally with fold slider)
      const slideDist = (1 - f) * (L * 0.85);
      const drawerGroup = new THREE.Group();
      drawerGroup.position.set(slideDist, 0, 0);

      const dBot = makeBoxPanel(L, W);
      dBot.position.set(0, 2, 0);
      dBot.rotation.x = -Math.PI / 2;
      drawerGroup.add(dBot);

      const dFront = makeBoxPanel(L, H - 2);
      dFront.position.set(0, H / 2, W / 2 - 2);
      drawerGroup.add(dFront);

      const dBack = makeBoxPanel(L, H - 2);
      dBack.position.set(0, H / 2, -W / 2 + 2);
      drawerGroup.add(dBack);

      const dLeft = makeBoxPanel(H - 2, W - 4);
      dLeft.position.set(-L / 2 + 2, H / 2, 0);
      dLeft.rotation.y = Math.PI / 2;
      drawerGroup.add(dLeft);

      const dRight = makeBoxPanel(H - 2, W - 4);
      dRight.position.set(L / 2 - 2, H / 2, 0);
      dRight.rotation.y = -Math.PI / 2;
      drawerGroup.add(dRight);

      modelGroup.add(drawerGroup);

    } else if (mId.includes('book_style')) {
      // 3. Book Style Magnetic Rigid Box
      const spineW = H;
      const baseCover = makeBoxPanel(L, W);
      baseCover.position.set(0, 0, 0);
      baseCover.rotation.x = -Math.PI / 2;
      modelGroup.add(baseCover);

      // Inner Box on Base
      const iFront = makeBoxPanel(L - 6, H - 4);
      iFront.position.set(0, (H - 4) / 2, W / 2 - 3);
      modelGroup.add(iFront);

      const iBack = makeBoxPanel(L - 6, H - 4);
      iBack.position.set(0, (H - 4) / 2, -W / 2 + 3);
      modelGroup.add(iBack);

      const iLeft = makeBoxPanel(H - 4, W - 6);
      iLeft.position.set(-L / 2 + 3, (H - 4) / 2, 0);
      iLeft.rotation.y = Math.PI / 2;
      modelGroup.add(iLeft);

      const iRight = makeBoxPanel(H - 4, W - 6);
      iRight.position.set(L / 2 - 3, (H - 4) / 2, 0);
      iRight.rotation.y = -Math.PI / 2;
      modelGroup.add(iRight);

      // Spine & Front Book Lid
      const spinePivot = new THREE.Group();
      spinePivot.position.set(0, 0, -W / 2);
      modelGroup.add(spinePivot);

      const spineMesh = makeBoxPanel(L, spineW);
      spineMesh.position.set(0, spineW / 2, 0);
      spinePivot.add(spineMesh);
      spinePivot.rotation.x = foldRad;

      const bookLidPivot = new THREE.Group();
      bookLidPivot.position.set(0, spineW, 0);
      spinePivot.add(bookLidPivot);

      const bookLidMesh = makeBoxPanel(L, W + 6);
      bookLidMesh.position.set(0, (W + 6) / 2, 0);
      bookLidPivot.add(bookLidMesh);
      bookLidPivot.rotation.x = foldRad;

    } else if (mId.includes('hexagon')) {
      // 4. Hexagonal 6-Sided Box
      const radius = L / 2;
      const hexGeo = new THREE.CylinderGeometry(radius, radius, H, 6, 1, false);
      const hexMesh = new THREE.Mesh(hexGeo, boxMat);
      hexMesh.position.set(0, H / 2, 0);
      hexMesh.castShadow = true;
      modelGroup.add(hexMesh);

      const hexEdge = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), cutEdgeMat);
      hexMesh.add(hexEdge);

    } else if (mId.includes('triangle') || mId.includes('triangular')) {
      // 5. Triangular 3-Sided Prism Box
      const radius = L * 0.6;
      const triGeo = new THREE.CylinderGeometry(radius, radius, H, 3, 1, false);
      const triMesh = new THREE.Mesh(triGeo, boxMat);
      triMesh.position.set(0, H / 2, 0);
      triMesh.castShadow = true;
      modelGroup.add(triMesh);

      const triEdge = new THREE.LineSegments(new THREE.EdgesGeometry(triGeo), cutEdgeMat);
      triMesh.add(triEdge);

    } else if (mId.includes('pillow')) {
      // 6. Pillow Box
      const pillowGeo = new THREE.SphereGeometry(L * 0.6, 32, 16, 0, Math.PI, 0, Math.PI / 2);
      const pillowMesh = new THREE.Mesh(pillowGeo, boxMat);
      pillowMesh.scale.set(1, Math.max(0.25, f) * (H / (L * 0.6)), (W * 0.8) / (L * 0.6));
      pillowMesh.position.set(0, H / 2, 0);
      pillowMesh.castShadow = true;
      modelGroup.add(pillowMesh);

      const pEdge = new THREE.LineSegments(new THREE.EdgesGeometry(pillowGeo), cutEdgeMat);
      pillowMesh.add(pEdge);

    } else if (mId.includes('gable')) {
      // 7. Gable Top Handle Box
      const bodyH = H * 0.7;
      const roofH = H * 0.3;

      const bottom = makeBoxPanel(L, W);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = 0;
      modelGroup.add(bottom);

      const fWall = makeBoxPanel(L, bodyH);
      fWall.position.set(0, bodyH / 2, W / 2);
      modelGroup.add(fWall);

      const bWall = makeBoxPanel(L, bodyH);
      bWall.position.set(0, bodyH / 2, -W / 2);
      modelGroup.add(bWall);

      const lWall = makeBoxPanel(bodyH, W);
      lWall.position.set(-L / 2, bodyH / 2, 0);
      lWall.rotation.y = Math.PI / 2;
      modelGroup.add(lWall);

      const rWall = makeBoxPanel(bodyH, W);
      rWall.position.set(L / 2, bodyH / 2, 0);
      rWall.rotation.y = -Math.PI / 2;
      modelGroup.add(rWall);

      const fRoof = makeBoxPanel(L, roofH);
      fRoof.position.set(0, bodyH + roofH / 2, W / 4);
      fRoof.rotation.x = -Math.PI / 6 * f;
      modelGroup.add(fRoof);

      const bRoof = makeBoxPanel(L, roofH);
      bRoof.position.set(0, bodyH + roofH / 2, -W / 4);
      bRoof.rotation.x = Math.PI / 6 * f;
      modelGroup.add(bRoof);

      const handle = makeBoxPanel(L * 0.75, 28);
      handle.position.set(0, bodyH + roofH + 10, 0);
      modelGroup.add(handle);

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
      // 8. Articulated Master Folding Carton (Tuck End, RTE, Snap Lock, Auto Bottom, Mailer, RSC, HSC, FOL, Pizza, Hanging Tab, Cake, Fry, Counter Display, 4-Corner Tray)
      const bottom = makeBoxPanel(L, W);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = 0;
      modelGroup.add(bottom);

      const rearPivot = new THREE.Group();
      rearPivot.position.set(0, 0, -W / 2);
      modelGroup.add(rearPivot);

      const rearWallH = mId.includes('hanging') ? H + 35 : mId.includes('counter') ? H + 60 : H;
      const rearWall = makeBoxPanel(L, rearWallH);
      rearWall.position.set(0, rearWallH / 2, 0);
      rearPivot.add(rearWall);
      rearPivot.rotation.x = foldRad;

      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, H, 0);
      rearPivot.add(lidPivot);

      const lidPanel = makeBoxPanel(L, W);
      lidPanel.position.set(0, W / 2, 0);
      lidPivot.add(lidPanel);
      lidPivot.rotation.x = foldRad;

      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, W, 0);
      lidPivot.add(flapPivot);

      const flapH = Math.min(H * 0.5, Math.max(20, W * 0.35));
      const flapPanel = makeBoxPanel(L, flapH);
      flapPanel.position.set(0, flapH / 2, 0);
      flapPivot.add(flapPanel);
      flapPivot.rotation.x = foldRad;

      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, 0, W / 2);
      modelGroup.add(frontPivot);

      const frontWallH = mId.includes('counter') ? H * 0.4 : H;
      const frontWall = makeBoxPanel(L, frontWallH);
      frontWall.position.set(0, frontWallH / 2, 0);
      frontPivot.add(frontWall);
      frontPivot.rotation.x = -foldRad;

      const leftPivot = new THREE.Group();
      leftPivot.position.set(-L / 2, 0, 0);
      modelGroup.add(leftPivot);

      const leftWall = makeBoxPanel(H, W);
      leftWall.position.set(0, H / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftPivot.add(leftWall);
      leftPivot.rotation.z = -foldRad;

      const rightPivot = new THREE.Group();
      rightPivot.position.set(L / 2, 0, 0);
      modelGroup.add(rightPivot);

      const rightWall = makeBoxPanel(H, W);
      rightWall.position.set(0, H / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightPivot.add(rightWall);
      rightPivot.rotation.z = foldRad;
    }

    // Interactive Drag Controls
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

      modelGroup.rotation.y += dx * 0.008;
      modelGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, modelGroup.rotation.x + dy * 0.008));
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.6;
      camera.position.z = Math.max(100, Math.min(2500, camera.position.z + zoomDelta));
    };

    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotating && !isDragging) {
        modelGroup.rotation.y += 0.006 * rotationSpeed;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
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
    boxBaseColor,
    roughness,
    metalness,
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

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[780px] bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none font-sans" dir="rtl">
      
      {/* ========================================================
          1. TOP PACDORA STUDIO HEADER BAR (Persian)
         ======================================================== */}
      <header className="h-16 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 backdrop-blur-md z-20">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-400 text-sm tracking-wide">استودیو طراحی و رندرینگ ۳ بعدی امیران</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO 4K
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              شبیه‌ساز تاشدن، متریال مقوای خام/کرافت و خطوط دقیق CAD
            </span>
          </div>
        </div>

        {/* Dimension Display */}
        <div className="hidden md:flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-2xl border border-slate-800 font-mono text-xs text-left" dir="ltr">
          <span className="text-slate-400 font-sans">ابعاد:</span>
          <span className="text-amber-300 font-black">
            {lengthMm} × {widthMm} × {heightMm} mm
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-sans">کالیپر:</span>
          <span className="text-cyan-300 font-bold">{thicknessMm} mm</span>
        </div>

        {/* Camera Views */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'perspective', label: 'پرسپکتیو' },
            { id: 'front', label: 'دید جلو' },
            { id: 'top', label: 'دید بالا' },
            { id: 'right', label: 'دید راست' },
            { id: 'isometric', label: 'ایزومتریک' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => handleSetCameraAngle(c.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                cameraView === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Switch to 2D Dieline */}
          <button
            onClick={() => onSwitchTo2DDieline && onSwitchTo2DDieline({
              modelId: selectedModelId,
              length: lengthMm,
              width: widthMm,
              height: heightMm,
              thickness: thicknessMm
            })}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition shadow-sm"
            title="مشاهده نقشه و خروجی‌های خط تیغ ۲ بعدی"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">قالب خط تیغ ۲ بعدی</span>
          </button>

          {/* Transfer to Order */}
          <button
            onClick={() => onTransferToOrder && onTransferToOrder({
              box_type: selectedModelId,
              length: lengthMm,
              width: widthMm,
              height: heightMm,
              sheet_thickness: thicknessMm,
              material_name: selectedCraft
            })}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white transition shadow-lg shadow-emerald-900/30"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">انتقال به ثبت سفارش</span>
          </button>

          {/* Golden 4K Render Download Button */}
          <button
            onClick={handleExport4KRender}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>{isExporting ? 'در حال رندر...' : 'رندر 4K (PNG)'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MASTER STUDIO BODY
         ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ====================================================
            RIGHT PANEL: TOOLS & PARAMETERS (RTL)
           ==================================================== */}
        <div className="w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-10 shadow-2xl flex-shrink-0">
          
          {/* Top Tabs */}
          <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950 p-1.5 gap-1">
            {[
              { id: 'models', label: 'مدل‌ها', icon: Box },
              { id: 'materials', label: 'متریال', icon: Layers },
              { id: 'upload', label: 'طرح چاپی', icon: Upload },
              { id: 'scenes', label: 'صحنه', icon: Palette },
              { id: 'lighting', label: 'نور', icon: Sun },
              { id: 'animation', label: 'حرکت', icon: Film }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white font-black shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right font-sans">
            
            {/* TAB 1: MODELS */}
            {activeTab === 'models' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-indigo-400" />
                    <span>کتابخانه مدل‌های بسته‌بندی</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{MODELS_DATA.length} مدل</span>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {MODEL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold transition border ${
                        activeCategory === cat.id
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span>{cat.icon}</span> {cat.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {MODELS_DATA.filter((m) => activeCategory === 'all' || m.category === activeCategory).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectModel(m)}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        selectedModelId === m.id
                          ? 'bg-indigo-950/70 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">{m.icon}</div>
                      <div className="text-xs font-black text-white line-clamp-1">{m.farsiName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">{m.name}</div>
                    </div>
                  ))}
                </div>

                {/* Dimensions */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-black text-slate-300 block">تنظیم ابعاد مدل سه‌بعدی:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">طول (L):</label>
                      <input
                        type="number"
                        value={lengthMm}
                        onChange={(e) => setLengthMm(Math.max(10, parseFloat(e.target.value) || 10))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">عرض (W):</label>
                      <input
                        type="number"
                        value={widthMm}
                        onChange={(e) => setWidthMm(Math.max(10, parseFloat(e.target.value) || 10))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">ارتفاع (H):</label>
                      <input
                        type="number"
                        value={heightMm}
                        onChange={(e) => setHeightMm(Math.max(10, parseFloat(e.target.value) || 10))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RAW PACKAGING MATERIALS (مقوای ایندربرد / کرافت خام) */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>جنس و متریال مقوای خام / کرافت</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {RAW_MATERIALS.map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => {
                        setSelectedCraft(mat.id);
                        setUploadedArtworkUrl(null);
                      }}
                      className={`p-3.5 rounded-2xl border text-right cursor-pointer transition ${
                        selectedCraft === mat.id && !uploadedArtworkUrl
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{mat.name}</span>
                        <span className="w-4 h-4 rounded-full border border-white/30 shadow-xs" style={{ backgroundColor: mat.color }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{mat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD & CUSTOM PRINT (اختیاری) */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>آپلود طرح گرافیکی اختصاصی (اختیاری)</span>
                  </h3>
                </div>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-2xl p-5 bg-indigo-950/20 hover:bg-indigo-950/40 cursor-pointer transition">
                  <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                  <span className="text-xs font-black text-indigo-200">بارگذاری فایل طرح چاپی (PNG / JPG / SVG)</span>
                  <span className="text-[10px] text-slate-400 mt-1">اعمال روی تمام وجوه مدل سه‌بعدی</span>
                  <input type="file" accept="image/*" onChange={handleArtworkUpload} className="hidden" />
                </label>

                {uploadedArtworkUrl && (
                  <button
                    type="button"
                    onClick={handleClearArtwork}
                    className="w-full py-2.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>پاکسازی طرح و بازگشت به مقوای خام</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: SCENES */}
            {activeTab === 'scenes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span>تم‌های صحنه و دکور استودیو</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {SCENES.map((scene) => (
                    <div
                      key={scene.id}
                      onClick={() => setSelectedScene(scene.id)}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition ${
                        selectedScene === scene.id
                          ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xs font-black text-white block">{scene.name}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{scene.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-300">نمایش سکوی پودیوم زیر محصول:</span>
                    <input
                      type="checkbox"
                      checked={hasPodium}
                      onChange={(e) => setHasPodium(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: LIGHTING */}
            {activeTab === 'lighting' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>تنظیمات نورپردازی استودیو</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {LIGHTING_PRESETS.map((light) => (
                    <div
                      key={light.id}
                      onClick={() => {
                        setLightingPreset(light.id);
                        setLightIntensity(light.intensity);
                        setLightAngle(light.azimuth);
                      }}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition ${
                        lightingPreset === light.id
                          ? 'bg-amber-950/50 border-amber-400'
                          : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xs font-black text-white block">{light.name}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>شدت نور (Intensity):</span>
                      <span className="font-mono text-amber-300">{lightIntensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="4.0"
                      step="0.1"
                      value={lightIntensity}
                      onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>زاویه تابش نور اصلی:</span>
                      <span className="font-mono text-amber-300">{lightAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={lightAngle}
                      onChange={(e) => setLightAngle(parseInt(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ANIMATION & FOLD */}
            {activeTab === 'animation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span>انیمیشن تاشدن و چرخش محصول</span>
                  </h3>
                </div>

                {/* Master Fold Slider */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>مرحله تاشدن (Fold / Unfold):</span>
                    <span className="font-mono text-amber-300">{Math.round(foldAngle * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={foldAngle}
                    onChange={(e) => setFoldAngle(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>گسترده تخت (۰٪)</span>
                    <span>نیمه تا (۵۰٪)</span>
                    <span>بسته (۱۰۰٪)</span>
                  </div>
                </div>

                {/* Auto Rotate Control */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">چرخش مداوم استودیویی:</span>
                    <button
                      onClick={() => setIsAutoRotating((r) => !r)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        isAutoRotating ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isAutoRotating ? 'فعال (روشن)' : 'خاموش'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>سرعت چرخش:</span>
                      <span className="font-mono text-amber-300">{rotationSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={rotationSpeed}
                      onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ====================================================
            CENTER: THREE.JS 3D CANVAS VIEWPORT (Pacdora 3D Engine)
           ==================================================== */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
          
          {/* Main Three.js Mount Container */}
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative select-none"
          />

          {/* Top Left Floating Studio Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] text-slate-300 font-mono">60 FPS</span>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                showWireframe ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md ring-2 ring-cyan-400/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>خطوط CAD و تیغ</span>
            </button>

            {/* Reset Camera Angle */}
            <button
              type="button"
              onClick={() => handleSetCameraAngle('perspective')}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="بازنشانی زاویه دوربین"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
