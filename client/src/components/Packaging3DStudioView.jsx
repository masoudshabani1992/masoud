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
  CircleDot
} from 'lucide-react';
import {
  createMarbleTexture,
  createWoodTexture,
  createKraftTexture,
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

// 2. Finishing & Craft Effects (Pacdora Crafts & Foil in Persian)
const CRAFT_EFFECTS = [
  { id: 'standard', name: 'چاپ افست استاندارد (Offset Print)', desc: 'پوشش ورنی ملایم و رنگ‌های طبیعی افست', color: '#e2e8f0', foil: 'none' },
  { id: 'gold_foil', name: 'طلاکوب براق برجسته (Gold Hot Stamping)', desc: 'فویل متالیک طلایی ۲۴ عیار با رفلکس خیره‌کننده نور', color: '#fbbf24', foil: 'gold' },
  { id: 'silver_foil', name: 'نقره‌کوب براق آینه‌ای (Silver Stamping)', desc: 'فویل کروم متالیک نقره‌ای بازتابنده', color: '#e2e8f0', foil: 'silver' },
  { id: 'rose_gold', name: 'رزگلد متالیک لوکس (Rose Gold Foil)', desc: 'طلاکوب رزگلد مدرن برای بسته‌بندی‌های خاص', color: '#fb7185', foil: 'rosegold' },
  { id: 'spot_uv', name: 'یووی موضعی برجسته (Spot UV Coating)', desc: 'لایه لاک شیشه‌ای براق و برجسته روی نقوش', color: '#38bdf8', foil: 'uv' },
  { id: 'emboss', name: 'برجسته‌کاری ۳ بعدی (Embossing 3D)', desc: 'برآمدگی فیزیکی نقوش و خطوط برجسته', color: '#a855f7', foil: 'emboss' },
  { id: 'soft_touch', name: 'سلفون مخملی لمسی (Soft-Touch Velvet)', desc: 'پوشش فوق‌العاده مات با حس لمس مخمل', color: '#334155', foil: 'velvet' },
  { id: 'natural_kraft', name: 'کرافت طبیعی ارگانیک (Natural Kraft)', desc: 'بافت واقعی الیاف چوب بازیافتی با ذرات طبیعی', color: '#b45309', foil: 'kraft' }
];

// 3. 3D Studio Scenes & Environments
const SCENES = [
  { id: 'luxury_marble', name: 'استودیو لوکس مرمر (Light Luxury)', desc: 'استودیو عکاسی لوکس با سنگ مرمر سفید Carrara', floor: 'marble', bg: 'linear-gradient(135deg, #1e293b, #0f172a)', lightColor: '#ffffff' },
  { id: 'nature_wood', name: 'طبیعت و چوب بلوط (Nature & Wood)', desc: 'استودیو ارگانیک با صفحه چوب بلوط طبیعی', floor: 'wood', bg: 'linear-gradient(135deg, #2e1065, #0f172a)', lightColor: '#fef3c7' },
  { id: 'minimal_white', name: 'استودیو مینیمال روشن (Studio Minimal)', desc: 'استودیو عکاسی صنعتی با پس‌زمینه روشن', floor: 'concrete', bg: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', lightColor: '#ffffff' },
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

// 5. Pre-made Brand Design Templates
const BRAND_PRESETS = [
  { id: 'luxury_perfume', name: 'عطر و ادکلن لوکس زمردین', desc: 'مشکی طلایی ۲۴ عیار با نشان برجسته' },
  { id: 'organic_coffee', name: 'قهوه ارگانیک تخصصی عربیکا', desc: 'تم خاکی گرم با بافت طبیعی' },
  { id: 'pharma_med', name: 'دارویی و بهداشتی آرمان امیران', desc: 'سفید و آبی کلینیکال با کادر فنی' },
  { id: 'minimal_cosmetic', name: 'سرم مراقبت پوست هیالورونیک', desc: 'صورتی ملایم با طلاکوب رزگلد' }
];

export default function Packaging3DStudioView({
  initialBoxSpecs = null,
  onSwitchTo2DDieline,
  onTransferToOrder
}) {
  const mountRef = useRef(null);

  // Active Tool Tab: 'models', 'upload', 'crafts', 'scenes', 'lighting', 'animation'
  const [activeTab, setActiveTab] = useState('models');

  // Model & Dimensions State
  const [selectedModelId, setSelectedModelId] = useState(initialBoxSpecs?.modelId || 'mailer');
  const [activeCategory, setActiveCategory] = useState('boxes');
  const [lengthMm, setLengthMm] = useState(initialBoxSpecs?.length || 200);
  const [widthMm, setWidthMm] = useState(initialBoxSpecs?.width || 150);
  const [heightMm, setHeightMm] = useState(initialBoxSpecs?.height || 60);
  const [thicknessMm, setThicknessMm] = useState(initialBoxSpecs?.thickness || 1.5);
  const [unitMode, setUnitMode] = useState('mm');

  // Materials & Finishing State
  const [selectedCraft, setSelectedCraft] = useState('gold_foil');
  const [boxBaseColor, setBoxBaseColor] = useState('#dfbe95');
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0.1);

  // Artwork & Face Textures
  const [selectedBrandPreset, setSelectedBrandPreset] = useState('luxury_perfume');
  const [uploadedArtworkUrl, setUploadedArtworkUrl] = useState(null);

  // Scene & Environment
  const [selectedScene, setSelectedScene] = useState('luxury_marble');
  const [hasPodium, setHasPodium] = useState(true);

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

  // Reset Camera Position
  const handleSetCameraAngle = (view) => {
    setCameraView(view);
    const camera = threeRef.current.camera;
    if (!camera) return;

    const maxDim = Math.max(lengthMm, widthMm, heightMm, 120);
    const dist = maxDim * 2.5;

    switch (view) {
      case 'front':
        camera.position.set(0, heightMm / 2, dist);
        break;
      case 'top':
        camera.position.set(0, dist * 1.2, 0.001);
        break;
      case 'left':
        camera.position.set(-dist, heightMm / 2, 0);
        break;
      case 'right':
        camera.position.set(dist, heightMm / 2, 0);
        break;
      case 'isometric':
        camera.position.set(dist * 0.7, dist * 0.7, dist * 0.7);
        break;
      case 'perspective':
      default:
        camera.position.set(dist * 0.8, dist * 0.9, dist * 1.1);
        break;
    }
    camera.lookAt(0, heightMm / 2, 0);
  };

  // Export 4K Image Render
  const handleExport4KRender = () => {
    setIsExporting(true);
    setTimeout(() => {
      const renderer = threeRef.current.renderer;
      if (renderer) {
        const link = document.createElement('a');
        link.download = `رندر-سه-بعدی-آرمان-امیران-${selectedModelId}-${Date.now()}.png`;
        link.href = renderer.domElement.toDataURL('image/png', 1.0);
        link.click();
      }
      setIsExporting(false);
    }, 400);
  };

  // ==========================================
  // THREE.JS MASTER ENGINE & WEBGL PIPELINE
  // ==========================================
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    threeRef.current.scene = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 4000);
    const maxDim = Math.max(lengthMm, widthMm, heightMm, 120);
    camera.position.set(maxDim * 1.6, maxDim * 1.8, maxDim * 2.3);
    camera.lookAt(0, heightMm / 2, 0);
    threeRef.current.camera = camera;

    // 3. WebGL Renderer with High Precision PBR Shaders
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clear previous elements
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    threeRef.current.renderer = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, lightIntensity * 1.2);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.bias = -0.0001;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    scene.add(rimLight);

    // Compute Light Position from Azimuth & Elevation
    const radAz = (lightAngle * Math.PI) / 180;
    const radEl = (55 * Math.PI) / 180;
    const lightDist = 600;
    mainKeyLight.position.set(
      lightDist * Math.cos(radAz) * Math.cos(radEl),
      lightDist * Math.sin(radEl),
      lightDist * Math.sin(radAz) * Math.cos(radEl)
    );
    fillLight.position.set(-lightDist * 0.6, lightDist * 0.4, -lightDist * 0.6);
    rimLight.position.set(0, -lightDist * 0.3, lightDist * 0.8);

    // 5. Floor & Ground Shadow Mesh
    const floorGeo = new THREE.PlaneGeometry(1600, 1600);
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
        color: 0xf1f5f9,
        roughness: 0.8,
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

    // Generate Textures & Materials
    let artworkTex = null;
    if (uploadedArtworkUrl) {
      const img = new Image();
      img.src = uploadedArtworkUrl;
      artworkTex = new THREE.Texture(img);
      img.onload = () => {
        artworkTex.needsUpdate = true;
      };
    } else {
      const presetData = createPresetArtwork(selectedBrandPreset, 'شرکت آرمان امیران');
      artworkTex = presetData.texture;
    }

    // Calculate Materials for PBR Shader & Finishing Crafts
    let foilMetalness = metalness;
    let foilRoughness = roughness;
    let foilColor = new THREE.Color(boxBaseColor);

    if (selectedCraft === 'gold_foil') {
      foilMetalness = 0.85;
      foilRoughness = 0.2;
      foilColor = new THREE.Color(0xfbbf24);
    } else if (selectedCraft === 'silver_foil') {
      foilMetalness = 0.95;
      foilRoughness = 0.1;
      foilColor = new THREE.Color(0xf1f5f9);
    } else if (selectedCraft === 'rose_gold') {
      foilMetalness = 0.85;
      foilRoughness = 0.2;
      foilColor = new THREE.Color(0xfb7185);
    } else if (selectedCraft === 'spot_uv') {
      foilRoughness = 0.05;
      foilMetalness = 0.3;
    } else if (selectedCraft === 'soft_touch') {
      foilRoughness = 0.95;
      foilMetalness = 0.0;
    } else if (selectedCraft === 'natural_kraft') {
      const kraftTex = createKraftTexture();
      artworkTex = kraftTex;
      foilRoughness = 0.85;
      foilColor = new THREE.Color(0xc89d6c);
    }

    const boxMat = new THREE.MeshStandardMaterial({
      color: foilColor,
      map: artworkTex,
      roughness: foilRoughness,
      metalness: foilMetalness,
      side: THREE.DoubleSide
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      linewidth: 1.5,
      transparent: true,
      opacity: showWireframe ? 0.9 : 0.25
    });

    const L = Math.max(20, lengthMm);
    const W = Math.max(20, widthMm);
    const H = Math.max(10, heightMm);
    const T = Math.max(0.4, thicknessMm);

    // ===============================================
    // DYNAMIC GEOMETRY BUILDER (Boxes, Bottles, Cans, Pouches)
    // ===============================================
    if (selectedModelId === 'mailer' || selectedModelId === 'tuck_end' || selectedModelId === 'auto_bottom') {
      // Articulated Box Assembly
      const makeBoxPanel = (w, h, d = T) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, boxMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const wireGeo = new THREE.EdgesGeometry(geo);
        const wire = new THREE.LineSegments(wireGeo, edgeMat);
        mesh.add(wire);
        return mesh;
      };

      const f = foldAngle;
      const foldRad = (Math.PI / 2) * f;

      // Base Bottom Panel
      const bottom = makeBoxPanel(L, W);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = 0;
      modelGroup.add(bottom);

      // Rear Wall & Hinged Lid
      const rearPivot = new THREE.Group();
      rearPivot.position.set(0, 0, -W / 2);
      modelGroup.add(rearPivot);

      const rearWall = makeBoxPanel(L, H);
      rearWall.position.set(0, H / 2, 0);
      rearPivot.add(rearWall);
      rearPivot.rotation.x = foldRad;

      // Top Lid (Hinged to Rear Wall)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, H, 0);
      rearPivot.add(lidPivot);

      const lidPanel = makeBoxPanel(L, W);
      lidPanel.position.set(0, W / 2, 0);
      lidPivot.add(lidPanel);
      lidPivot.rotation.x = foldRad;

      // Front Locking Flap
      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, W, 0);
      lidPivot.add(flapPivot);

      const flapPanel = makeBoxPanel(L, Math.min(H * 0.6, W * 0.4));
      flapPanel.position.set(0, Math.min(H * 0.6, W * 0.4) / 2, 0);
      flapPivot.add(flapPanel);
      flapPivot.rotation.x = foldRad;

      // Front Wall
      const frontPivot = new THREE.Group();
      frontPivot.position.set(0, 0, W / 2);
      modelGroup.add(frontPivot);

      const frontWall = makeBoxPanel(L, H);
      frontWall.position.set(0, H / 2, 0);
      frontPivot.add(frontWall);
      frontPivot.rotation.x = -foldRad;

      // Left Wall
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-L / 2, 0, 0);
      modelGroup.add(leftPivot);

      const leftWall = makeBoxPanel(H, W);
      leftWall.position.set(0, H / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftPivot.add(leftWall);
      leftPivot.rotation.z = -foldRad;

      // Right Wall
      const rightPivot = new THREE.Group();
      rightPivot.position.set(L / 2, 0, 0);
      modelGroup.add(rightPivot);

      const rightWall = makeBoxPanel(H, W);
      rightWall.position.set(0, H / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightPivot.add(rightWall);
      rightPivot.rotation.z = foldRad;

    } else if (selectedModelId === 'rigid_box') {
      // Luxury Rigid Gift Box
      const baseGeo = new THREE.BoxGeometry(L, H * 0.8, W);
      const baseMesh = new THREE.Mesh(baseGeo, boxMat);
      baseMesh.position.set(0, (H * 0.8) / 2, 0);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      modelGroup.add(baseMesh);

      // Lid raised slightly with fold animation
      const lidGeo = new THREE.BoxGeometry(L * 1.04, H * 0.4, W * 1.04);
      const lidMesh = new THREE.Mesh(lidGeo, boxMat);
      const lidElevation = H * 0.8 + (1 - foldAngle) * 80;
      lidMesh.position.set(0, lidElevation, 0);
      lidMesh.rotation.y = (1 - foldAngle) * 0.4;
      lidMesh.castShadow = true;
      modelGroup.add(lidMesh);

    } else if (selectedModelId === 'dropper_bottle' || selectedModelId === 'wine_bottle') {
      // Glass Dropper Bottle
      const bottleRadius = L / 2;
      const bodyHeight = H * 0.7;
      const bottleGeo = new THREE.CylinderGeometry(bottleRadius, bottleRadius, bodyHeight, 32);
      const bottleMesh = new THREE.Mesh(bottleGeo, boxMat);
      bottleMesh.position.y = bodyHeight / 2;
      bottleMesh.castShadow = true;
      modelGroup.add(bottleMesh);

      const capGeo = new THREE.CylinderGeometry(bottleRadius * 0.6, bottleRadius * 0.6, H * 0.25, 32);
      const goldCapMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15
      });
      const capMesh = new THREE.Mesh(capGeo, goldCapMat);
      capMesh.position.y = bodyHeight + (H * 0.25) / 2;
      capMesh.castShadow = true;
      modelGroup.add(capMesh);

    } else if (selectedModelId === 'beverage_can') {
      // Beverage Can
      const canGeo = new THREE.CylinderGeometry(L / 2, L / 2, H, 36);
      const canMesh = new THREE.Mesh(canGeo, boxMat);
      canMesh.position.y = H / 2;
      canMesh.castShadow = true;
      modelGroup.add(canMesh);

      const rimGeo = new THREE.TorusGeometry(L / 2, 1.5, 12, 36);
      const aluMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
      const topRim = new THREE.Mesh(rimGeo, aluMat);
      topRim.rotation.x = Math.PI / 2;
      topRim.position.y = H;
      modelGroup.add(topRim);

    } else if (selectedModelId === 'cosmetic_jar') {
      // Luxury Jar
      const jarGeo = new THREE.CylinderGeometry(L / 2, L / 2, H * 0.65, 36);
      const jarMesh = new THREE.Mesh(jarGeo, boxMat);
      jarMesh.position.y = (H * 0.65) / 2;
      jarMesh.castShadow = true;
      modelGroup.add(jarMesh);

      const lidGeo = new THREE.CylinderGeometry(L / 2 + 1, L / 2 + 1, H * 0.35, 36);
      const goldLidMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
      const lidMesh = new THREE.Mesh(lidGeo, goldLidMat);
      lidMesh.position.y = H * 0.65 + (H * 0.35) / 2 + (1 - foldAngle) * 40;
      lidMesh.castShadow = true;
      modelGroup.add(lidMesh);

    } else {
      // Default Box
      const geo = new THREE.BoxGeometry(L, H, W);
      const mesh = new THREE.Mesh(geo, boxMat);
      mesh.position.y = H / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelGroup.add(mesh);
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
    threeRef.current.animId = animId;

    // Resize
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
    selectedBrandPreset,
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
              <span className="font-black text-amber-400 text-sm tracking-wide">استودیو طراحی و رندرینگ ۳ بعدی Pacdora</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO 4K
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              شبیه‌ساز تاشدن، اعمال متریال و افکت‌های چاپ و طلاکوب
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
              { id: 'upload', label: 'طراحی', icon: Upload },
              { id: 'crafts', label: 'افکت‌ها', icon: Sparkles },
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

            {/* TAB 2: UPLOAD & ARTWORK */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>آپلود طرح گرافیکی روی محصول</span>
                  </h3>
                </div>

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-2xl p-5 bg-indigo-950/20 hover:bg-indigo-950/40 cursor-pointer transition">
                  <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                  <span className="text-xs font-black text-indigo-200">بارگذاری فایل طرح (PNG / JPG / SVG)</span>
                  <span className="text-[10px] text-slate-400 mt-1">اعمال آنی بر روی تمام سطوح سه‌بعدی</span>
                  <input type="file" accept="image/*" onChange={handleArtworkUpload} className="hidden" />
                </label>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-black text-slate-300">طرح‌های نمونه آماده صنعتی:</span>
                  <div className="space-y-2">
                    {BRAND_PRESETS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedBrandPreset(p.id);
                          setUploadedArtworkUrl(null);
                        }}
                        className={`p-3 rounded-2xl border text-right cursor-pointer transition ${
                          selectedBrandPreset === p.id && !uploadedArtworkUrl
                            ? 'bg-indigo-950/80 border-amber-400'
                            : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="text-xs font-black text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CRAFTS & FOIL */}
            {activeTab === 'crafts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>افکت‌های ویژه چاپ و طلاکوب</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {CRAFT_EFFECTS.map((craft) => (
                    <div
                      key={craft.id}
                      onClick={() => setSelectedCraft(craft.id)}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition ${
                        selectedCraft === craft.id
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{craft.name}</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: craft.color }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{craft.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-black text-slate-300 block">خصوصیات فیزیکی متریال (PBR):</span>
                  
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>زبری سطح (Roughness):</span>
                      <span className="font-mono text-amber-300">{Math.round(roughness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>ضریب متالیک و درخشش (Metalness):</span>
                      <span className="font-mono text-amber-300">{Math.round(metalness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={metalness}
                      onChange={(e) => setMetalness(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
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
                          ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400/20'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-xs font-black text-white">{scene.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{scene.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <span className="text-xs font-bold text-slate-300">سکوی نمایشگاهی پودیوم (Podium Stand)</span>
                    <input
                      type="checkbox"
                      checked={hasPodium}
                      onChange={(e) => setHasPodium(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 rounded"
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
                    <span>تنظیمات استودیویی نور و زاویه تابش</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {LIGHTING_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setLightingPreset(preset.id);
                        setLightIntensity(preset.intensity);
                        setLightAngle(preset.azimuth);
                      }}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition ${
                        lightingPreset === preset.id
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-xs font-black text-white">{preset.name}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>شدت نور اصلی:</span>
                      <span className="font-mono text-amber-300">{lightIntensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.5"
                      step="0.1"
                      value={lightIntensity}
                      onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>زاویه تابش نور در افق:</span>
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

            {/* TAB 6: ANIMATION */}
            {activeTab === 'animation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span>شبیه‌ساز تاشدن و چرخش ۳۶۰ درجه</span>
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
                    <span>نیمه‌باز (۵۰٪)</span>
                    <span>بسته کامل (۱۰۰٪)</span>
                  </div>
                </div>

                {/* Rotation Toggle & Speed */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">چرخش خودکار ۳۶۰ درجه:</span>
                    <button
                      type="button"
                      onClick={() => setIsAutoRotating((r) => !r)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                        isAutoRotating
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isAutoRotating ? 'در حال چرخش' : 'متوقف'}
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
                      step="0.2"
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
            CENTER 3D VIEWPORT CANVAS
           ==================================================== */}
        <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          
          {/* WebGL Mount */}
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
          />

          {/* Top Left Floating Studio Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-xs text-white backdrop-blur-md flex items-center gap-2 shadow-lg pointer-events-none" dir="ltr">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-black text-amber-300">Three.js PBR Engine</span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] text-slate-300 font-mono">60 FPS</span>
          </div>

          {/* Center Floating Animation Bottom Bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 px-5 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-4 shadow-2xl z-10 flex-wrap">
            
            {/* Quick Fold Presets */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <button
                type="button"
                onClick={() => setFoldAngle(0)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  foldAngle === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                شیت تخت (۰٪)
              </button>
              <button
                type="button"
                onClick={() => setFoldAngle(0.5)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  foldAngle === 0.5 ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ۵۰٪ مونتاژ
              </button>
              <button
                type="button"
                onClick={() => setFoldAngle(1)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  foldAngle === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                جعبه بسته (۱۰۰٪)
              </button>
            </div>

            {/* Auto-Rotate Play/Pause */}
            <button
              type="button"
              onClick={() => setIsAutoRotating((r) => !r)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isAutoRotating ? 'توقف چرخش' : 'چرخش ۳۶۰°'}</span>
            </button>

            {/* Wireframe Toggle */}
            <button
              type="button"
              onClick={() => setShowWireframe((w) => !w)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
                showWireframe ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>خطوط CAD</span>
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
