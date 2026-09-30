import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import FilePreviewModal from './FilePreviewModal';
import { matchProduct, showSuccessToast } from '../utils/helpers';
import {
  Users,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingUp,
  Package,
  Phone,
  Layers,
  Sparkles,
  Award,
  ChevronLeft,
  Calendar,
  X,
  Building,
  Check,
  XCircle,
  Boxes,
  Printer,
  MessageSquare,
  History,
  PhoneCall,
  User,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Info,
  Target,
  Flame,
  Trophy,
  Zap,
  BarChart3,
  Sliders,
  SlidersHorizontal,
  Gift,
  Star,
  Upload,
  Paperclip,
  Download,
  Edit3,
  AlertTriangle,
  Trash2,
  Eye,
  CheckCircle,
  HelpCircle,
  Settings,
  SlidersHorizontal as SlidersIcon
} from 'lucide-react';

export const MAIN_CATEGORIES = [
  { id: 'مقوایی', label: 'مقوایی', desc: 'جعبه مقوایی / مقوای تک‌لا', icon: '📦' },
  { id: 'لمینتی', label: 'لمینتی', desc: 'کارتن لمینتی / سینگل فلوت', icon: '📑' },
  { id: 'کارتن', label: 'کارتن', desc: 'کارتن ۳ و ۵ لایه مادر / دایکاتی', icon: '📦' }
];

export const CARDBOARD_TYPES = [
  'ایندربرد',
  'پشت طوسی',
  'گلاسه',
  'تحریر',
  'کرافت',
  'بهداشتی'
];

export const GRAMMAGES = [
  30, 40, 50, 70, 80, 110, 115, 125, 128, 135, 140, 160, 170, 180, 190, 200, 210, 230, 250, 270, 300, 350, 400, 470, 560, 580, 600, 650
];

export const PRINT_TYPES = [
  'افست نرمال',
  'افست متالایز',
  'بدون چاپ'
];

export const PRINT_COLORS = [
  '۱ رنگ',
  '۲ رنگ',
  '۳ رنگ',
  '۴ رنگ (CMYK)',
  '۵ رنگ',
  '۶ رنگ'
];

export const PRINT_ZINC_OPTIONS = [
  'زینک جدید',
  'زینک موجود'
];

export const COATING_CATEGORIES = [
  { id: 'سلفون', label: 'سلفون', desc: 'حرارتی، واتربیس، طرح‌دار، مخملی' },
  { id: 'ورنی', label: 'ورنی', desc: 'مات یا براق' },
  { id: 'لاک', label: 'لاک', desc: 'لاک محافظ چاپ' },
  { id: 'یو وی سیلندری', label: 'یو وی سیلندری', desc: 'روکش سراسری سیلندری' },
  { id: 'بدون روکش', label: 'بدون روکش (حذف)', desc: 'چاپ مستقیم بدون پوشش' }
];

export const CELLOPHANE_SUBTYPES = [
  'سلفون حرارتی براق',
  'سلفون حرارتی مات',
  'واتربیس براق',
  'واتربیس مات',
  'طرح دار',
  'مخملی'
];

export const VARNISH_SUBTYPES = [
  'ورنی مات',
  'ورنی براق'
];

export const LACQUER_SUBTYPES = [
  'لاک براق',
  'لاک مات'
];

export const UV_CYLINDER_SUBTYPES = [
  'یو وی سیلندری براق',
  'یو وی سیلندری مات'
];

export const UV_CYLINDER_OPTIONS = [
  'یو وی سیلندری براق',
  'یو وی سیلندری مات'
];

export const CELLOPHANE_TYPES = [
  'سلفون حرارتی براق',
  'سلفون حرارتی مات',
  'واتربیس براق',
  'واتربیس مات',
  'طرح دار',
  'مخملی',
  'بدون سلفون'
];

export const VARNISH_OPTIONS = [
  'بدون ورنی',
  'مات',
  'براق'
];

export const LACQUER_OPTIONS = [
  'بدون لاک',
  'یو وی سیلندری'
];

export const SPECIAL_UV_OPTIONS = [
  'موضعی',
  'شنی',
  'هیبرید',
  'اکلیلی',
  '3D'
];

export const UV_OPTIONS = [
  'بدون یووی',
  'موضعی',
  'شنی',
  'هیبرید',
  'اکلیلی',
  '3D'
];

export const EMBOSS_OPTIONS = [
  'بدون برجسته',
  'برجسته (کلیشه جدید)',
  'برجسته (کلیشه موجود)'
];

export const WINDOW_THICKNESS_OPTIONS = [
  '۱۰۰ میکرون (نازک)',
  '۱۵۰ میکرون (استاندارد)',
  '۲۰۰ میکرون (مقاوم)',
  '۲۵۰ میکرون (ضخیم)',
  '۳۰۰ میکرون (بسیار ضخیم)',
  'طلق PVC شفاف'
];

export const GLUE_OPTIONS = [
  'لب چسب',
  'لمینتی',
  'مقوایی',
  'دوطرفه',
  'کارتن'
];

export const FOIL_OPTIONS = [
  'طلاکوب',
  'نقره کوب',
  'رنگی کوب'
];

const MATERIAL_CONSTRUCTIONS = [
  'مقوای تک‌لا (بدون سینگل)',
  'لمینت روی سینگل E-Flute (ای فلوت)',
  'لمینت روی سینگل B-Flute (بی فلوت)',
  'کارتن ۳ لایه C-Flute (کارتن مادر)',
  'کارتن ۵ لایه BC-Flute (کارتن سنگین صادراتی)',
  'هاردباکس مغزی کرجی'
];

const STAGE_NAMES = {
  1: '۱. بازرگانی و تعریف سفارش',
  2: '۲. برآورد و پیش‌فاکتور',
  3: '۳. تایید پیش‌فاکتور و بیعانه',
  4: '۴. تایید مدیرعامل',
  5: '۵. طراحی و خط تیغ',
  6: '۶. تایید طرح مشتری',
  7: '۷. ماکت و کلیشه/قالب',
  8: '۸. تایید ماکت مشتری',
  9: '۹. تامین مقوا و ملزومات',
  10: '۱۰. سالن تولید و تحویل'
};

export default function MarketingLeadsView({ onNavigateToKanban }) {
  const { currentUser, role } = useAuth();
  const isMarketer = role === 'marketer';
  const isCommercialOrCeo = role === 'sales' || role === 'ceo' || role === 'admin' || role === 'secretary' || role === 'accounting';

  const [activeTab, setActiveTab] = useState('leads_list'); // 'leads_list' | 'new_lead' | 'profile_stats'
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Marketer Target & KPI States
  const [targetStats, setTargetStats] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedMarketerId, setSelectedMarketerId] = useState('');
  const [showTargetEditModal, setShowTargetEditModal] = useState(false);
  const [targetFormUser, setTargetFormUser] = useState(null);
  const [editTargetInquiries, setEditTargetInquiries] = useState(20);
  const [editTargetAmount, setEditTargetAmount] = useState(0);
  const [editTargetOrders, setEditTargetOrders] = useState(5);
  const [editTargetNotes, setEditTargetNotes] = useState('');
  const [savingTarget, setSavingTarget] = useState(false);
  const [viewScope, setViewScope] = useState('dashboard'); // 'dashboard' | 'leaderboard'

  // New Lead Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(5000);
  const [mainCategory, setMainCategory] = useState('مقوایی');
  const [cardboardType, setCardboardType] = useState('ایندربرد');
  const [cardboardGrammage, setCardboardGrammage] = useState(300);
  const [materialConstruction, setMaterialConstruction] = useState('مقوایی');
  
  // Print specs
  const [printType, setPrintType] = useState('افست نرمال');
  const [printColors, setPrintColors] = useState('۴ رنگ (CMYK)');
  const [printZinc, setPrintZinc] = useState('زینک جدید');
  const [customSpotColor, setCustomSpotColor] = useState(false);
  
  // Coating specs (سلفون / ورنی / لاک / یو وی سیلندری / بدون روکش)
  const [coatingCategory, setCoatingCategory] = useState('سلفون');
  const [cellophaneType, setCellophaneType] = useState('سلفون حرارتی مات');
  const [varnishType, setVarnishType] = useState('ورنی مات');
  const [lacquerType, setLacquerType] = useState('لاک براق');
  const [uvCylinderType, setUvCylinderType] = useState('یو وی سیلندری براق');
  
  // Special UV section
  const [hasUv, setHasUv] = useState(false);
  const [uvType, setUvType] = useState('موضعی');
  
  // Emboss section
  const [hasEmboss, setHasEmboss] = useState(false);
  const [embossType, setEmbossType] = useState('برجسته (کلیشه جدید)');
  
  // Window Patching / طلق section
  const [hasWindow, setHasWindow] = useState(false);
  const [windowLength, setWindowLength] = useState('');
  const [windowWidth, setWindowWidth] = useState('');
  const [windowThickness, setWindowThickness] = useState('۱۵۰ میکرون (استاندارد)');
  
  // Glue section
  const [hasGlue, setHasGlue] = useState(true);
  const [glueType, setGlueType] = useState('لب چسب');
  const [glueLength, setGlueLength] = useState('');
  const [glueWidth, setGlueWidth] = useState('');
  
  // Foil section
  const [hasFoil, setHasFoil] = useState(false);
  const [foilType, setFoilType] = useState('طلاکوب');
  const [foilLength, setFoilLength] = useState('');
  const [foilWidth, setFoilWidth] = useState('');
  
  // Dimensions & General
  const [boxLength, setBoxLength] = useState('');
  const [boxWidth, setBoxWidth] = useState('');
  const [boxHeight, setBoxHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [dielineFileName, setDielineFileName] = useState('');
  const [dielineFileUrl, setDielineFileUrl] = useState('');
  const [dielineFileSize, setDielineFileSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Edit / Resubmit Incomplete Lead States (تکمیل و ارسال مجدد توسط بازاریاب)
  const [editingLead, setEditingLead] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editProductName, setEditProductName] = useState('');
  const [editQuantity, setEditQuantity] = useState(5000);
  const [editMainCategory, setEditMainCategory] = useState('مقوایی');
  const [editCardboardType, setEditCardboardType] = useState('ایندربرد');
  const [editCardboardGrammage, setEditCardboardGrammage] = useState(300);
  const [editMaterialConstruction, setEditMaterialConstruction] = useState('مقوایی');
  const [editPrintType, setEditPrintType] = useState('افست نرمال');
  const [editPrintColors, setEditPrintColors] = useState('۴ رنگ (CMYK)');
  const [editPrintZinc, setEditPrintZinc] = useState('زینک جدید');
  const [editCustomSpotColor, setEditCustomSpotColor] = useState(false);
  
  const [editCoatingCategory, setEditCoatingCategory] = useState('سلفون');
  const [editCellophaneType, setEditCellophaneType] = useState('سلفون حرارتی مات');
  const [editVarnishType, setEditVarnishType] = useState('ورنی مات');
  const [editLacquerType, setEditLacquerType] = useState('لاک براق');
  const [editUvCylinderType, setEditUvCylinderType] = useState('یو وی سیلندری براق');
  
  const [editHasUv, setEditHasUv] = useState(false);
  const [editUvType, setEditUvType] = useState('موضعی');
  
  const [editHasEmboss, setEditHasEmboss] = useState(false);
  const [editEmbossType, setEditEmbossType] = useState('برجسته (کلیشه جدید)');
  
  const [editHasWindow, setEditHasWindow] = useState(false);
  const [editWindowLength, setEditWindowLength] = useState('');
  const [editWindowWidth, setEditWindowWidth] = useState('');
  const [editWindowThickness, setEditWindowThickness] = useState('۱۵۰ میکرون (استاندارد)');
  
  const [editHasGlue, setEditHasGlue] = useState(true);
  const [editGlueType, setEditGlueType] = useState('لب چسب');
  const [editGlueLength, setEditGlueLength] = useState('');
  const [editGlueWidth, setEditGlueWidth] = useState('');
  
  const [editHasFoil, setEditHasFoil] = useState(false);
  const [editFoilType, setEditFoilType] = useState('طلاکوب');
  const [editFoilLength, setEditFoilLength] = useState('');
  const [editFoilWidth, setEditFoilWidth] = useState('');
  
  const [editBoxLength, setEditBoxLength] = useState('');
  const [editBoxWidth, setEditBoxWidth] = useState('');
  const [editBoxHeight, setEditBoxHeight] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDielineFileName, setEditDielineFileName] = useState('');
  const [editDielineFileUrl, setEditDielineFileUrl] = useState('');
  const [editDielineFileSize, setEditDielineFileSize] = useState('');
  const [updatingLead, setUpdatingLead] = useState(false);

  // Commercial Revision Request Modal (اعلام نقص مدارک توسط واحد برآورد)
  const [revisionModalLead, setRevisionModalLead] = useState(null);
  const [revisionReason, setRevisionReason] = useState('');
  const [sendingRevision, setSendingRevision] = useState(false);

  // Modals State
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [selectedLeadForFollowup, setSelectedLeadForFollowup] = useState(null);
  const [selectedLeadForPrint, setSelectedLeadForPrint] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  
  // Follow-up Form
  const [followupNote, setFollowupNote] = useState('');
  const [followupOutcome, setFollowupOutcome] = useState('پیگیری تلفنی با مشتری');
  const [followupStatus, setFollowupStatus] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);

  // Estimation Modal State (for Commercial Manager / CEO)
  const [estimatingLead, setEstimatingLead] = useState(null);
  const [estimatedUnitPrice, setEstimatedUnitPrice] = useState('');
  const [estimatedTotalPrice, setEstimatedTotalPrice] = useState('');
  const [commercialNotes, setCommercialNotes] = useState('');
  const [estimatingLoading, setEstimatingLoading] = useState(false);

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getMarketingLeads();
      if (res.success) {
        setLeads(res.leads || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Marketer Target Stats
  const fetchTargetStats = async (marketerId = null, month = null) => {
    setTargetLoading(true);
    try {
      const params = {};
      if (marketerId) params.marketer_id = marketerId;
      if (month) params.month = month;
      const res = await api.getMarketerTargetStats(params);
      if (res && res.success) {
        setTargetStats(res);
      }
    } catch (err) {
      console.error('Error fetching target stats:', err);
    } finally {
      setTargetLoading(false);
    }
  };

  const [formOptions, setFormOptions] = useState(null);

  const fetchFormOptions = async () => {
    try {
      const res = await api.getFormOptions();
      if (res && res.success && res.options) {
        setFormOptions(res.options);
      }
    } catch (e) {
      console.warn('Using default form options fallback');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchTargetStats();
    fetchFormOptions();
  }, []);

  const activeCardboardTypes = Array.isArray(formOptions?.cardboard_types?.items) ? formOptions.cardboard_types.items : CARDBOARD_TYPES;
  const activeGrammages = Array.isArray(formOptions?.grammages?.items) ? formOptions.grammages.items : GRAMMAGES;
  const activePrintTypes = Array.isArray(formOptions?.print_types?.items) ? formOptions.print_types.items : PRINT_TYPES;
  const activePrintColors = Array.isArray(formOptions?.print_colors?.items) ? formOptions.print_colors.items : PRINT_COLORS;
  const activePrintZincOptions = Array.isArray(formOptions?.print_zinc_options?.items) ? formOptions.print_zinc_options.items : PRINT_ZINC_OPTIONS;
  const activeCellophaneTypes = Array.isArray(formOptions?.cellophane_types?.items) ? formOptions.cellophane_types.items : CELLOPHANE_TYPES;
  const activeVarnishOptions = Array.isArray(formOptions?.varnish_options?.items) ? formOptions.varnish_options.items : VARNISH_OPTIONS;
  const activeLacquerOptions = Array.isArray(formOptions?.lacquer_options?.items) ? formOptions.lacquer_options.items : LACQUER_OPTIONS;
  const activeUvCylinderOptions = Array.isArray(formOptions?.uv_cylinder_options?.items) ? formOptions.uv_cylinder_options.items : UV_CYLINDER_OPTIONS;
  const activeUvOptions = Array.isArray(formOptions?.uv_options?.items) ? formOptions.uv_options.items : UV_OPTIONS;
  const activeEmbossOptions = Array.isArray(formOptions?.emboss_options?.items) ? formOptions.emboss_options.items : EMBOSS_OPTIONS;
  const activeWindowThicknessOptions = Array.isArray(formOptions?.window_thickness_options?.items) ? formOptions.window_thickness_options.items : WINDOW_THICKNESS_OPTIONS;
  const activeGlueOptions = Array.isArray(formOptions?.glue_options?.items) ? formOptions.glue_options.items : GLUE_OPTIONS;
  const activeFoilOptions = Array.isArray(formOptions?.foil_options?.items) ? formOptions.foil_options.items : FOIL_OPTIONS;
  const activeMaterialConstructions = Array.isArray(formOptions?.material_constructions?.items) ? formOptions.material_constructions.items : MATERIAL_CONSTRUCTIONS;

  // File Upload Handler (for Dieline / Artwork)
  const handleFileUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('حجم فایل انتخابی بیش از حد مجاز (۲۵ مگابایت) است.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      const sizeKb = (file.size / 1024).toFixed(1);
      if (isEdit) {
        setEditDielineFileName(file.name);
        setEditDielineFileUrl(dataUrl);
        setEditDielineFileSize(sizeKb);
      } else {
        setDielineFileName(file.name);
        setDielineFileUrl(dataUrl);
        setDielineFileSize(sizeKb);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Edit & Resubmit Modal (for Marketer when lead is incomplete)
  const handleOpenEditModal = (lead) => {
    let specs = {};
    try {
      if (lead.technical_specs_json) {
        specs = typeof lead.technical_specs_json === 'string' ? JSON.parse(lead.technical_specs_json) : lead.technical_specs_json;
      }
    } catch (e) {}

    setEditingLead(lead);
    setEditCustomerName(lead.customer_name || '');
    setEditCustomerPhone(lead.customer_phone || '');
    setEditProductName(lead.product_name || '');
    setEditQuantity(lead.quantity || 5000);
    setEditMainCategory(specs.main_category || lead.main_category || 'مقوایی');
    setEditCardboardType(specs.cardboard_type || lead.cardboard_type || 'ایندربرد');
    setEditCardboardGrammage(specs.cardboard_grammage || lead.cardboard_grammage || 300);
    setEditMaterialConstruction(lead.material_construction || 'مقوایی');
    setEditPrintType(specs.print_type || lead.print_type || 'افست نرمال');
    setEditPrintColors(specs.print_colors || lead.print_colors || '۴ رنگ (CMYK)');
    setEditPrintZinc(specs.print_zinc || lead.print_zinc || 'زینک جدید');
    setEditCustomSpotColor(!!(specs.custom_spot_color || lead.custom_spot_color));
    
    setEditCoatingCategory(specs.coating_category || lead.coating_category || 'سلفون');
    setEditCellophaneType(specs.cellophane_type || lead.cellophane_type || 'سلفون حرارتی مات');
    setEditVarnishType(specs.varnish_type || lead.varnish_type || 'ورنی مات');
    setEditLacquerType(specs.lacquer_type || lead.lacquer_type || 'لاک براق');
    setEditUvCylinderType(specs.uv_cylinder_type || 'یو وی سیلندری براق');
    
    setEditHasUv(specs.has_uv !== undefined ? !!specs.has_uv : !!(lead.has_uv || (lead.uv_type && lead.uv_type !== 'بدون یووی')));
    setEditUvType(specs.uv_type && specs.uv_type !== 'بدون یووی' ? specs.uv_type : 'موضعی');
    
    setEditHasEmboss(specs.has_emboss !== undefined ? !!specs.has_emboss : !!(lead.has_emboss || (lead.emboss_type && lead.emboss_type !== 'بدون برجسته')));
    setEditEmbossType(specs.emboss_type && specs.emboss_type !== 'بدون برجسته' ? specs.emboss_type : 'برجسته (کلیشه جدید)');
    
    setEditHasWindow(specs.has_window !== undefined ? !!specs.has_window : !!(lead.has_window || lead.window_patching));
    setEditWindowLength(specs.window_length || lead.window_length || '');
    setEditWindowWidth(specs.window_width || lead.window_width || '');
    setEditWindowThickness(specs.window_thickness || lead.window_thickness || '۱۵۰ میکرون (استاندارد)');
    
    setEditHasGlue(specs.has_glue !== undefined ? !!specs.has_glue : (lead.has_glue !== undefined ? !!lead.has_glue : true));
    setEditGlueType(specs.glue_type || lead.glue_type || 'لب چسب');
    setEditGlueLength(specs.glue_length || lead.glue_length || '');
    setEditGlueWidth(specs.glue_width || lead.glue_width || '');
    
    setEditHasFoil(specs.has_foil !== undefined ? !!specs.has_foil : !!(lead.has_foil || (lead.foil_type && lead.foil_type !== 'بدون فویل')));
    setEditFoilType(specs.foil_type && specs.foil_type !== 'بدون فویل' ? specs.foil_type : 'طلاکوب');
    setEditFoilLength(specs.foil_length || lead.foil_length || '');
    setEditFoilWidth(specs.foil_width || lead.foil_width || '');
    
    setEditBoxLength(lead.box_length !== null ? String(lead.box_length) : '');
    setEditBoxWidth(lead.box_width !== null ? String(lead.box_width) : '');
    setEditBoxHeight(lead.box_height !== null ? String(lead.box_height) : '');
    setEditNotes(lead.notes || '');
    setEditDielineFileName(lead.dieline_filename || '');
    setEditDielineFileUrl(lead.dieline_file_url || '');
    setEditDielineFileSize('');
  };

  // Submit Edit & Resubmit
  const handleUpdateAndResubmitLead = async (e) => {
    e.preventDefault();
    if (!editCustomerName || !editCustomerPhone || !editProductName || !editQuantity) {
      alert('لطفاً فیلدهای ضروری را تکمیل فرمایید.');
      return;
    }

    setUpdatingLead(true);
    try {
      const effectiveCoating = editCoatingCategory === 'سلفون' ? editCellophaneType
        : editCoatingCategory === 'ورنی' ? editVarnishType
        : editCoatingCategory === 'لاک' ? editLacquerType
        : editCoatingCategory === 'یو وی سیلندری' ? editUvCylinderType
        : 'بدون روکش';

      const technicalSpecs = {
        main_category: editMainCategory,
        cardboard_type: editCardboardType,
        cardboard_grammage: Number(editCardboardGrammage),
        print_type: editPrintType,
        print_colors: editPrintColors,
        print_zinc: editPrintZinc,
        custom_spot_color: editCustomSpotColor,
        coating_category: editCoatingCategory,
        cellophane_type: effectiveCoating,
        varnish_type: editVarnishType,
        lacquer_type: editLacquerType,
        uv_cylinder_type: editUvCylinderType,
        has_uv: editHasUv ? 1 : 0,
        uv_type: editHasUv ? editUvType : 'بدون یووی',
        has_emboss: editHasEmboss ? 1 : 0,
        emboss_type: editHasEmboss ? editEmbossType : 'بدون برجسته',
        has_window: editHasWindow ? 1 : 0,
        window_length: editHasWindow && editWindowLength ? Number(editWindowLength) : null,
        window_width: editHasWindow && editWindowWidth ? Number(editWindowWidth) : null,
        window_thickness: editHasWindow ? editWindowThickness : null,
        has_glue: editHasGlue ? 1 : 0,
        glue_type: editHasGlue ? editGlueType : 'بدون چسب',
        glue_length: editHasGlue && editGlueLength ? Number(editGlueLength) : null,
        glue_width: editHasGlue && editGlueWidth ? Number(editGlueWidth) : null,
        has_foil: editHasFoil ? 1 : 0,
        foil_type: editHasFoil ? editFoilType : 'بدون فویل',
        foil_length: editHasFoil && editFoilLength ? Number(editFoilLength) : null,
        foil_width: editHasFoil && editFoilWidth ? Number(editFoilWidth) : null
      };

      const res = await api.updateMarketingLead(editingLead.id, {
        customer_name: editCustomerName,
        customer_phone: editCustomerPhone,
        product_name: editProductName,
        quantity: Number(editQuantity),
        main_category: editMainCategory,
        cardboard_type: editCardboardType,
        cardboard_grammage: Number(editCardboardGrammage),
        material_construction: editMainCategory === 'مقوایی' ? `مقوای تک‌لا (${editCardboardType})` : editMainCategory,
        print_type: editPrintType,
        print_colors: editPrintColors,
        print_zinc: editPrintZinc,
        custom_spot_color: editCustomSpotColor,
        coating_category: editCoatingCategory,
        cellophane_type: effectiveCoating,
        varnish_type: editVarnishType,
        lacquer_type: editLacquerType,
        has_uv: editHasUv ? 1 : 0,
        uv_type: editHasUv ? editUvType : 'بدون یووی',
        has_emboss: editHasEmboss ? 1 : 0,
        emboss_type: editHasEmboss ? editEmbossType : 'بدون برجسته',
        has_window: editHasWindow ? 1 : 0,
        window_length: editHasWindow && editWindowLength ? Number(editWindowLength) : null,
        window_width: editHasWindow && editWindowWidth ? Number(editWindowWidth) : null,
        window_thickness: editHasWindow ? editWindowThickness : null,
        has_glue: editHasGlue ? 1 : 0,
        glue_type: editHasGlue ? editGlueType : 'بدون چسب',
        glue_length: editHasGlue && editGlueLength ? Number(editGlueLength) : null,
        glue_width: editHasGlue && editGlueWidth ? Number(editGlueWidth) : null,
        has_foil: editHasFoil ? 1 : 0,
        foil_type: editHasFoil ? editFoilType : 'بدون فویل',
        foil_length: editHasFoil && editFoilLength ? Number(editFoilLength) : null,
        foil_width: editHasFoil && editFoilWidth ? Number(editFoilWidth) : null,
        box_length: editBoxLength ? Number(editBoxLength) : null,
        box_width: editBoxWidth ? Number(editBoxWidth) : null,
        box_height: editBoxHeight ? Number(editBoxHeight) : null,
        notes: editNotes,
        dieline_filename: editDielineFileName || null,
        dieline_file_url: editDielineFileUrl || null,
        technical_specs: technicalSpecs
      });

      if (res.success) {
        showSuccessToast('اطلاعات با موفقیت ثبت و به واحد مربوطه ارسال شد.');
        setEditingLead(null);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در ویرایش استعلام.');
    } finally {
      setUpdatingLead(false);
    }
  };

  // Submit Revision Request (Commercial Manager sends back as incomplete)
  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionReason.trim()) {
      alert('لطفاً دلیل و موارد نقص اطلاعات را وارد فرمایید.');
      return;
    }

    setSendingRevision(true);
    try {
      const res = await api.requestMarketingLeadRevision(revisionModalLead.id, {
        incomplete_reason: revisionReason.trim()
      });

      if (res.success) {
        showSuccessToast('اعلام نقص مدارک با موفقیت به بازاریاب ارسال شد.');
        setRevisionModalLead(null);
        setEstimatingLead(null);
        setRevisionReason('');
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در اعلام نقص اطلاعات.');
    } finally {
      setSendingRevision(false);
    }
  };

  // Handle Submit Form
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !productName || !quantity) {
      alert('لطفاً فیلدهای ستاره‌دار (نام مشتری، شماره تماس، نام محصول و تیراژ) را تکمیل فرمایید.');
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);
    try {
      const effectiveCoating = coatingCategory === 'سلفون' ? cellophaneType
        : coatingCategory === 'ورنی' ? varnishType
        : coatingCategory === 'لاک' ? lacquerType
        : coatingCategory === 'یو وی سیلندری' ? uvCylinderType
        : 'بدون روکش';

      const technicalSpecs = {
        main_category: mainCategory,
        cardboard_type: cardboardType,
        cardboard_grammage: Number(cardboardGrammage),
        print_type: printType,
        print_colors: printColors,
        print_zinc: printZinc,
        custom_spot_color: customSpotColor,
        coating_category: coatingCategory,
        cellophane_type: effectiveCoating,
        varnish_type: varnishType,
        lacquer_type: lacquerType,
        uv_cylinder_type: uvCylinderType,
        has_uv: hasUv ? 1 : 0,
        uv_type: hasUv ? uvType : 'بدون یووی',
        has_emboss: hasEmboss ? 1 : 0,
        emboss_type: hasEmboss ? embossType : 'بدون برجسته',
        has_window: hasWindow ? 1 : 0,
        window_length: hasWindow && windowLength ? Number(windowLength) : null,
        window_width: hasWindow && windowWidth ? Number(windowWidth) : null,
        window_thickness: hasWindow ? windowThickness : null,
        has_glue: hasGlue ? 1 : 0,
        glue_type: hasGlue ? glueType : 'بدون چسب',
        glue_length: hasGlue && glueLength ? Number(glueLength) : null,
        glue_width: hasGlue && glueWidth ? Number(glueWidth) : null,
        has_foil: hasFoil ? 1 : 0,
        foil_type: hasFoil ? foilType : 'بدون فویل',
        foil_length: hasFoil && foilLength ? Number(foilLength) : null,
        foil_width: hasFoil && foilWidth ? Number(foilWidth) : null
      };

      const res = await api.createMarketingLead({
        customer_name: customerName,
        customer_phone: customerPhone,
        product_name: productName,
        quantity: Number(quantity),
        main_category: mainCategory,
        cardboard_type: cardboardType,
        cardboard_grammage: Number(cardboardGrammage),
        material_construction: mainCategory === 'مقوایی' ? `مقوای تک‌لا (${cardboardType})` : mainCategory,
        print_type: printType,
        print_colors: printColors,
        print_zinc: printZinc,
        custom_spot_color: customSpotColor,
        coating_category: coatingCategory,
        cellophane_type: effectiveCoating,
        varnish_type: varnishType,
        lacquer_type: lacquerType,
        has_uv: hasUv ? 1 : 0,
        uv_type: hasUv ? uvType : 'بدون یووی',
        has_emboss: hasEmboss ? 1 : 0,
        emboss_type: hasEmboss ? embossType : 'بدون برجسته',
        has_window: hasWindow ? 1 : 0,
        window_length: hasWindow && windowLength ? Number(windowLength) : null,
        window_width: hasWindow && windowWidth ? Number(windowWidth) : null,
        window_thickness: hasWindow ? windowThickness : null,
        has_glue: hasGlue ? 1 : 0,
        glue_type: hasGlue ? glueType : 'بدون چسب',
        glue_length: hasGlue && glueLength ? Number(glueLength) : null,
        glue_width: hasGlue && glueWidth ? Number(glueWidth) : null,
        has_foil: hasFoil ? 1 : 0,
        foil_type: hasFoil ? foilType : 'بدون فویل',
        foil_length: hasFoil && foilLength ? Number(foilLength) : null,
        foil_width: hasFoil && foilWidth ? Number(foilWidth) : null,
        box_length: boxLength ? Number(boxLength) : null,
        box_width: boxWidth ? Number(boxWidth) : null,
        box_height: boxHeight ? Number(boxHeight) : null,
        notes: notes,
        dieline_filename: dielineFileName || null,
        dieline_file_url: dielineFileUrl || null,
        technical_specs: technicalSpecs
      });

      if (res.success) {
        showSuccessToast('اطلاعات با موفقیت ثبت و به واحد مربوطه ارسال شد.');
        setSubmitSuccess({
          code: res.lead_code,
          msg: res.message
        });
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setProductName('');
        setQuantity(5000);
        setMainCategory('مقوایی');
        setCardboardType('ایندربرد');
        setCardboardGrammage(300);
        setPrintType('افست نرمال');
        setPrintColors('۴ رنگ (CMYK)');
        setPrintZinc('زینک جدید');
        setCustomSpotColor(false);
        setCoatingCategory('سلفون');
        setCellophaneType('سلفون حرارتی مات');
        setVarnishType('ورنی مات');
        setLacquerType('لاک براق');
        setUvCylinderType('یو وی سیلندری براق');
        setHasUv(false);
        setUvType('موضعی');
        setHasEmboss(false);
        setEmbossType('برجسته (کلیشه جدید)');
        setHasWindow(false);
        setWindowLength('');
        setWindowWidth('');
        setWindowThickness('۱۵۰ میکرون (استاندارد)');
        setHasGlue(true);
        setGlueType('لب چسب');
        setGlueLength('');
        setGlueWidth('');
        setHasFoil(false);
        setFoilType('طلاکوب');
        setFoilLength('');
        setFoilWidth('');
        setBoxLength('');
        setBoxWidth('');
        setBoxHeight('');
        setNotes('');
        setDielineFileName('');
        setDielineFileUrl('');
        setDielineFileSize('');
        fetchLeads();
        fetchTargetStats();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت استعلام.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Estimation Modal (Commercial / CEO)
  const handleOpenEstimateModal = (lead) => {
    setEstimatingLead(lead);
    setEstimatedUnitPrice(lead.estimated_unit_price || '');
    setEstimatedTotalPrice(lead.estimated_total_price || (lead.estimated_unit_price ? lead.estimated_unit_price * lead.quantity : ''));
    setCommercialNotes(lead.commercial_notes || '');
  };

  // Submit Estimation (Commercial Manager)
  const handleSubmitEstimate = async () => {
    if (!estimatedUnitPrice) {
      alert('لطفاً قیمت برآورد شده هر عدد را وارد فرمایید.');
      return;
    }

    setEstimatingLoading(true);
    try {
      const res = await api.estimateMarketingLead(estimatingLead.id, {
        estimated_unit_price: Number(estimatedUnitPrice),
        estimated_total_price: Number(estimatedTotalPrice) || (Number(estimatedUnitPrice) * estimatingLead.quantity),
        commercial_notes: commercialNotes
      });

      if (res.success) {
        showSuccessToast('برآورد قیمت با موفقیت ثبت و به کارتابل بازاریاب و مشتری ارسال شد.', 'ارسال برآورد قیمت');
        setEstimatingLead(null);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت برآورد قیمت.');
    } finally {
      setEstimatingLoading(false);
    }
  };

  // Open Follow-up Modal
  const handleOpenFollowupModal = (lead) => {
    setSelectedLeadForFollowup(lead);
    setFollowupNote('');
    setFollowupOutcome('پیگیری تلفنی با مشتری');
    setFollowupStatus(lead.status);
  };

  // Submit Follow-up Log
  const handleSubmitFollowup = async (e) => {
    e.preventDefault();
    if (!followupNote.trim()) {
      alert('لطفاً متن یادداشت پیگیری را وارد نمایید.');
      return;
    }

    setFollowupLoading(true);
    try {
      const res = await api.addMarketingLeadFollowup(selectedLeadForFollowup.id, {
        note: followupNote,
        outcome: followupOutcome,
        new_status: followupStatus || selectedLeadForFollowup.status
      });

      if (res.success) {
        alert(res.message || 'یادداشت پیگیری ثبت شد.');
        setSelectedLeadForFollowup(null);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت پیگیری.');
    } finally {
      setFollowupLoading(false);
    }
  };

  // Convert Lead to Official Factory Order
  const handleConvertToProject = async (lead) => {
    if (!window.confirm(`آیا از تبدیل استعلام «${lead.customer_name}» (${lead.product_name}) به سفارش رسمی و شروع فرآیند تولید در کارخانه اطمینان دارید؟`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.convertMarketingLeadToProject(lead.id);
      if (res.success) {
        alert(res.message);
        fetchLeads();
        if (onNavigateToKanban) {
          onNavigateToKanban();
        }
      }
    } catch (err) {
      alert(err.message || 'خطا در تبدیل استعلام.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (leadId, status, rejectionReason = '') => {
    try {
      await api.updateMarketingLeadStatus(leadId, {
        status,
        rejection_reason: rejectionReason
      });
      fetchLeads();
      fetchTargetStats(selectedMarketerId, selectedMonth);
    } catch (err) {
      alert(err.message || 'خطا در تغییر وضعیت.');
    }
  };

  // Save / Update Target (Commercial Manager / CEO)
  const handleSaveTarget = async (e) => {
    e.preventDefault();
    if (!targetFormUser) return;

    setSavingTarget(true);
    try {
      const res = await api.updateMarketerTarget(targetFormUser.id, {
        target_inquiries: Number(editTargetInquiries) || 20,
        target_amount: Number(editTargetAmount) || 0,
        target_orders: Number(editTargetOrders) || 5,
        year_month_fa: selectedMonth || targetStats?.current_period?.yearMonth,
        notes: editTargetNotes
      });

      if (res.success) {
        alert(res.message);
        setShowTargetEditModal(false);
        fetchTargetStats(selectedMarketerId, selectedMonth);
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت تارگت.');
    } finally {
      setSavingTarget(false);
    }
  };

  // Filter Leads
  const safeLeads = Array.isArray(leads) ? leads : [];
  const filteredLeads = safeLeads.filter((l) => {
    if (!l) return false;
    // 1. Marketer Privacy Isolation
    if (isMarketer && l.marketer_id && currentUser?.id && l.marketer_id !== currentUser.id && l.marketer_name !== currentUser?.fullName && l.marketer_name !== currentUser?.username) {
      return false;
    }

    // 2. Comprehensive Search Filter (مشتری، موبایل، محصول، پرونده)
    const matchesSearch = matchProduct(l, searchTerm);

    // 3. Status Filter
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalLeads = safeLeads.length;
  const pendingCount = safeLeads.filter(l => l && l.status === 'pending_commercial').length;
  const needsRevisionCount = safeLeads.filter(l => l && l.status === 'needs_revision').length;
  const estimatedCount = safeLeads.filter(l => l && l.status === 'estimated').length;
  const approvedCount = safeLeads.filter(l => l && l.status === 'customer_approved').length;
  const convertedCount = safeLeads.filter(l => l && l.status === 'converted_to_order').length;
  const rejectedCount = safeLeads.filter(l => l && l.status === 'customer_rejected').length;

  const totalConvertedValue = safeLeads
    .filter(l => l && (l.status === 'converted_to_order' || l.status === 'customer_approved'))
    .reduce((sum, l) => sum + (l.estimated_total_price || 0), 0);

  const conversionRate = totalLeads > 0 ? Math.round(((approvedCount + convertedCount) / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Top Header Card with Marketer Profile Specs */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 border border-teal-400/30">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">پروفایل و کارتابل پیگیری استعلامات بازاریاب</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {currentUser?.fullName || currentUser?.full_name || 'کارشناس بازاریابی'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
                سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی، ثبت لاگ تماس و پیگیری مشتری، و صدور پیش‌فاکتور رسمی.
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('leads_list');
                setViewScope('dashboard');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'leads_list' && viewScope === 'dashboard'
                  ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>استعلام‌های من ({totalLeads})</span>
            </button>

            {isCommercialOrCeo && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('leads_list');
                  setViewScope('leaderboard');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  viewScope === 'leaderboard'
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>رتبه‌بندی تیم بازاریابی</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('new_lead')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'new_lead'
                  ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>ثبت استعلام جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 🎯 MARKETER MONTHLY TARGET & KPI TRACKER ================= */}
      {viewScope === 'dashboard' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-teal-200 shadow-md space-y-5 relative overflow-hidden animate-fadeIn">
          {/* Top Row: Month, Marketer, Target Goal & Management Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-100 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    هدف‌گذاری و تارگت استعلام ماهانه ({targetStats?.current_period?.fullMonthText || 'ماه جاری'})
                  </h2>
                  {targetStats?.kpi?.is_target_achieved ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 animate-pulse">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>تارگت محقق شد! 🎉</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>در حال تلاش برای تکمیل تارگت</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>کارشناس: <strong className="text-slate-800">{targetStats?.marketer?.full_name || currentUser?.fullName || 'بازاریاب'}</strong></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>تارگت مصوب مدیریت: <strong className="text-teal-700 font-black">{targetStats?.targets?.inquiries || 20} استعلام قیمت در ماه</strong></span>
                </div>
              </div>
            </div>

            {/* Management Controls & Month Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter by Marketer (for CEO / Sales) */}
              {isCommercialOrCeo && Array.isArray(targetStats?.all_marketers_leaderboard) && targetStats.all_marketers_leaderboard.length > 1 && (
                <select
                  value={selectedMarketerId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    setSelectedMarketerId(mId);
                    fetchTargetStats(mId, selectedMonth);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500"
                >
                  <option value="">نمایش خودم / همه</option>
                  {targetStats.all_marketers_leaderboard.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.full_name} ({m.achieved_inquiries}/{m.target_inquiries} استعلام)
                    </option>
                  ))}
                </select>
              )}

              {/* Month Selector */}
              {Array.isArray(targetStats?.history_months) && targetStats.history_months.length > 0 && (
                <select
                  value={selectedMonth || targetStats?.current_period?.yearMonth}
                  onChange={(e) => {
                    const m = e.target.value;
                    setSelectedMonth(m);
                    fetchTargetStats(selectedMarketerId, m);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500"
                >
                  {targetStats.history_months.map((h) => (
                    <option key={h.year_month} value={h.year_month}>
                      {h.full_title} ({h.achieved_inquiries} استعلام)
                    </option>
                  ))}
                </select>
              )}

              {/* CEO / Commercial Target Edit Button */}
              {isCommercialOrCeo && (
                <button
                  type="button"
                  onClick={() => {
                    const currentTargetUser = targetStats?.marketer?.id
                      ? { id: targetStats.marketer.id, name: targetStats.marketer.full_name }
                      : { id: currentUser?.id, name: currentUser?.fullName };
                    setTargetFormUser(currentTargetUser);
                    setEditTargetInquiries(targetStats?.targets?.inquiries || 20);
                    setEditTargetAmount(targetStats?.targets?.amount || 0);
                    setEditTargetOrders(targetStats?.targets?.orders || 5);
                    setShowTargetEditModal(true);
                  }}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>تنظیم تارگت بازاریاب</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Milestone Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">پیشرفت تارگت استعلام این ماه:</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {targetStats?.achieved?.total_inquiries || 0} از {targetStats?.targets?.inquiries || 20} استعلام
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-teal-700">
                <span>{targetStats?.kpi?.progress_percent || 0}٪</span>
                <span className="text-[11px] font-sans font-bold text-slate-400">تحقق یافته</span>
              </div>
            </div>

            {/* Big Progress Bar */}
            <div className="w-full bg-slate-100 rounded-2xl h-4 p-0.5 border border-slate-200 overflow-hidden relative">
              <div
                className={`h-full rounded-xl transition-all duration-700 shadow-sm ${
                  (targetStats?.kpi?.progress_percent || 0) >= 100
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500'
                    : (targetStats?.kpi?.progress_percent || 0) >= 60
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500'
                }`}
                style={{ width: `${Math.min(100, targetStats?.kpi?.progress_percent || 0)}%` }}
              />
            </div>

            {/* Visual Goal Markers (25%, 50%, 75%, 100%) */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 pt-0.5">
              <span>۰</span>
              <span>{Math.round((targetStats?.targets?.inquiries || 20) * 0.25)} استعلام</span>
              <span>{Math.round((targetStats?.targets?.inquiries || 20) * 0.5)} استعلام (نیمی از مسیر)</span>
              <span>{Math.round((targetStats?.targets?.inquiries || 20) * 0.75)} استعلام</span>
              <span className="font-black text-teal-700">🎯 تارگت نهایی ({targetStats?.targets?.inquiries || 20})</span>
            </div>
          </div>

          {/* 4 Detail Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Metric 1: Remaining Needed */}
            <div className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between ${
              targetStats?.kpi?.remaining_inquiries === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div>
                <div className="text-[11px] font-bold text-slate-500">مانده تا تکمیل تارگت:</div>
                <div className="text-lg font-black font-mono mt-0.5">
                  {targetStats?.kpi?.remaining_inquiries === 0 ? '۰ (تکمیل شد)' : `${targetStats?.kpi?.remaining_inquiries || 0} استعلام`}
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                targetStats?.kpi?.remaining_inquiries === 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}>
                <Target className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2: Daily Pace Needed */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-right flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500">سرعت روزانه مورد نیاز:</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  {targetStats?.kpi?.daily_pace_needed || 0} <span className="text-xs font-sans font-bold text-slate-400">استعلام/روز</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 3: Converted to Orders */}
            <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200 text-right flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-teal-800">سفارشات قطعی شده:</div>
                <div className="text-lg font-black font-mono text-teal-950 mt-0.5">
                  {targetStats?.achieved?.converted || 0} <span className="text-xs font-sans font-bold text-teal-700">سفارش کارخانه</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-200 text-teal-800 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 4: Approved Value */}
            <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 text-right flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-purple-800">مبلغ استعلام تایید شده:</div>
                <div className="text-base font-black font-mono text-purple-950 mt-0.5 truncate">
                  {(targetStats?.achieved?.approved_sales_amount || 0).toLocaleString('fa-IR')} <span className="text-[10px] font-sans font-bold">تومان</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Motivational Banner */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
            (targetStats?.kpi?.progress_percent || 0) >= 100
              ? 'bg-gradient-to-r from-emerald-100 via-teal-100 to-green-100 border-emerald-300 text-emerald-950'
              : (targetStats?.kpi?.progress_percent || 0) >= 50
              ? 'bg-gradient-to-r from-teal-50 to-indigo-50 border-teal-200 text-teal-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            {(targetStats?.kpi?.progress_percent || 0) >= 100 ? (
              <>
                <Trophy className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                <span>
                  <strong>تبریک ویژه همکار گرامی!</strong> شما تارگت {targetStats?.targets?.inquiries} استعلامی ماه {targetStats?.current_period?.monthName} را به طور کامل تکمیل کردید و واجد شرایط دریافت بالاترین ضریب پاداش فروش شدید.
                </span>
              </>
            ) : (targetStats?.kpi?.progress_percent || 0) >= 50 ? (
              <>
                <Flame className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>عملکرد عالی!</strong> بیش از نیمی از مسیر تارگت ماهانه را با موفقیت طی کرده‌اید. تنها <strong>{targetStats?.kpi?.remaining_inquiries} استعلام دیگر</strong> تا پاداش ماهانه باقیست.
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
                <span>
                  <strong>شروع پرانرژی ماه {targetStats?.current_period?.monthName}:</strong> با ثبت روزانه <strong>{targetStats?.kpi?.daily_pace_needed || 1} استعلام قیمت</strong> با مشتریان صنعتی، به راحتی تارگت ۲۰ موردی این ماه محقق خواهد شد.
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= 🏆 TEAM LEADERBOARD VIEW ================= */}
      {viewScope === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-800">
                جدول رتبه‌بندی و ارزیابی تارگت کارشناسان بازاریابی ({targetStats?.current_period?.fullMonthText || 'ماه جاری'})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setViewScope('dashboard')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900"
            >
              ← بازگشت به داشبورد استعلامات
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                  <th className="p-3 rounded-r-xl">رتبه</th>
                  <th className="p-3">نام بازاریاب</th>
                  <th className="p-3 text-center">تارگت ماهانه</th>
                  <th className="p-3 text-center">استعلام ثبت شده</th>
                  <th className="p-3 text-center">درصد تحقق</th>
                  <th className="p-3 text-center">مانده تا هدف</th>
                  <th className="p-3 text-center">سفارش قطعی</th>
                  <th className="p-3 text-center">مبلغ فروش تایید شده</th>
                  <th className="p-3 text-center rounded-l-xl">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targetStats?.all_marketers_leaderboard?.map((m, idx) => (
                  <tr key={m.user_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-black text-slate-700">
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && <span className="text-amber-500">🥇</span>}
                        {idx === 1 && <span className="text-slate-400">🥈</span>}
                        {idx === 2 && <span className="text-amber-700">🥉</span>}
                        <span>{idx + 1}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-black text-slate-900">{m.full_name}</div>
                      <div className="text-[11px] text-slate-400">@{m.username} {m.phone ? `| ${m.phone}` : ''}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800">
                      {m.target_inquiries} استعلام
                    </td>
                    <td className="p-3 text-center font-mono font-black text-teal-700 text-sm">
                      {m.achieved_inquiries}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              m.progress_percent >= 100 ? 'bg-emerald-500' : m.progress_percent >= 50 ? 'bg-teal-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, m.progress_percent)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs">{m.progress_percent}٪</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {m.remaining_inquiries === 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">تکمیل شد ✓</span>
                      ) : (
                        <span className="text-amber-700">{m.remaining_inquiries} عدد</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-black text-indigo-700">
                      {m.converted_orders}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-purple-900">
                      {m.achieved_amount > 0 ? `${m.achieved_amount.toLocaleString('fa-IR')} تومان` : '---'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMarketerId(m.user_id);
                            fetchTargetStats(m.user_id, selectedMonth);
                            setViewScope('dashboard');
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition"
                        >
                          مشاهده کارتابل
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetFormUser({ id: m.user_id, name: m.full_name });
                            setEditTargetInquiries(m.target_inquiries || 20);
                            setEditTargetAmount(m.target_amount || 0);
                            setEditTargetOrders(5);
                            setShowTargetEditModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded-lg transition"
                          title="ویرایش تارگت"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marketer Performance & Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل استعلام‌ها</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{totalLeads}</span>
            <span className="text-[10px] text-slate-400">موردی</span>
          </div>
        </div>

        {/* Pending Estimation (Yellow) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending_commercial' ? 'all' : 'pending_commercial')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'pending_commercial'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-md'
              : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>در انتظار برآورد</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-900 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-amber-700">واحد بازرگانی</span>
          </div>
        </button>

        {/* Estimated / Price Ready (Green) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'estimated' ? 'all' : 'estimated')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'estimated'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-md'
              : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>قیمت‌گذاری شده</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-900 font-mono">{estimatedCount}</span>
            <span className="text-[10px] text-emerald-700">آماده اعلام</span>
          </div>
        </button>

        {/* Needs Revision (Rose / Amber Alert) */}
        {needsRevisionCount > 0 && (
          <button
            onClick={() => setStatusFilter(statusFilter === 'needs_revision' ? 'all' : 'needs_revision')}
            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between animate-pulse ${
              statusFilter === 'needs_revision'
                ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 shadow-md'
                : 'bg-rose-50/50 border-rose-200 hover:border-rose-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
              <span>نیازمند اصلاح مشخصات</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-rose-950 font-mono">{needsRevisionCount}</span>
              <span className="text-[10px] text-rose-700 font-bold">اقدام بازاریاب</span>
            </div>
          </button>
        )}

        {/* Customer Approved (Sky) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'customer_approved' ? 'all' : 'customer_approved')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'customer_approved'
              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400 shadow-md'
              : 'bg-white border-sky-200 hover:border-sky-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-sky-800 text-xs font-bold">
            <span>تایید مشتری</span>
            <Check className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-sky-900 font-mono">{approvedCount}</span>
            <span className="text-[10px] text-sky-700">آماده پیش‌فاکتور</span>
          </div>
        </button>

        {/* In Production (Indigo) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'converted_to_order' ? 'all' : 'converted_to_order')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'converted_to_order'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400 shadow-md'
              : 'bg-white border-indigo-200 hover:border-indigo-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-800 text-xs font-bold">
            <span>در حال تولید سالن</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-indigo-900 font-mono">{convertedCount}</span>
            <span className="text-[10px] text-indigo-700">سفارش رسمی</span>
          </div>
        </button>

        {/* Conversion Rate & Total Value */}
        <div className="bg-gradient-to-tr from-slate-900 to-teal-900 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-300 text-xs font-bold">
            <span>نرخ تبدیل موفق</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-300 font-mono">{conversionRate}٪</span>
            <span className="text-[10px] text-teal-200">
              {totalConvertedValue > 0 ? `${(totalConvertedValue / 1000000).toFixed(1)} م ت` : 'موفق'}
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: LEADS LIST & REALTIME TRACKER */}
      {activeTab === 'leads_list' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                همه ({totalLeads})
              </button>
              <button
                onClick={() => setStatusFilter('pending_commercial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'pending_commercial'
                    ? 'bg-amber-500 text-white font-black'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>در انتظار برآورد ({pendingCount})</span>
              </button>
              {needsRevisionCount > 0 && (
                <button
                  onClick={() => setStatusFilter('needs_revision')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 animate-pulse ${
                    statusFilter === 'needs_revision'
                      ? 'bg-rose-600 text-white font-black'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>نیازمند اصلاح ({needsRevisionCount})</span>
                </button>
              )}
              <button
                onClick={() => setStatusFilter('estimated')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'estimated'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>قیمت‌گذاری شده ({estimatedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('customer_approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'customer_approved'
                    ? 'bg-sky-600 text-white font-black'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>تایید مشتری ({approvedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('converted_to_order')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'converted_to_order'
                    ? 'bg-indigo-600 text-white font-black'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>در حال تولید ({convertedCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-96">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجو: نام مشتری، شماره موبایل، محصول، کد MKT/پرونده..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none transition-all shadow-2xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="پاک کردن جستجو"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={fetchLeads}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-2xs"
                title="بروزرسانی داده‌ها"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leads Cards Grid */}
          {loading ? (
            <div className="p-16 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-sm font-bold">در حال بارگذاری استعلام‌های بازاریاب...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 text-slate-400">
              <Package className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-base font-bold text-slate-700">هیچ استعلامی با این مشخصات یافت نشد.</p>
              <button
                onClick={() => setActiveTab('new_lead')}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                ثبت استعلام جدید
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead) => {
                const isPending = lead.status === 'pending_commercial';
                const isNeedsRevision = lead.status === 'needs_revision';
                const isEstimated = lead.status === 'estimated';
                const isApproved = lead.status === 'customer_approved';
                const isConverted = lead.status === 'converted_to_order';
                const isRejected = lead.status === 'customer_rejected';

                let statusBadge = (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>در انتظار برآورد واحد بازرگانی</span>
                  </span>
                );

                if (isNeedsRevision) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>⚠️ ناقص - نیازمند اصلاح و تکمیل مشخصات</span>
                    </span>
                  );
                } else if (isEstimated) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>قیمت‌گذاری شد (آماده مذاکره با مشتری)</span>
                    </span>
                  );
                } else if (isApproved) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-sky-600" />
                      <span>تایید قیمت توسط مشتری</span>
                    </span>
                  );
                } else if (isConverted) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-950 border border-indigo-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>در حال تولید در سالن کارخانه (پرونده #{lead.converted_archive_code || lead.project_archive_code})</span>
                    </span>
                  );
                } else if (isRejected) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>عدم توافق / انصراف مشتری</span>
                    </span>
                  );
                }

                const followupsCount = lead.followup_logs?.length || 0;

                return (
                  <div
                    key={lead.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
                  >
                    {/* Top Row: Lead Code, Status Badge, and Fast Actions */}
                    <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 font-mono font-black text-xs border border-teal-200">
                          {lead.lead_code}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{lead.created_at?.split(' ')[0] || lead.created_at?.split('T')[0] || '1405/01/15'}</span>
                        </span>
                        {lead.marketer_name && (
                          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                            بازاریاب: <strong>{lead.marketer_name}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {statusBadge}
                      </div>
                    </div>

                    {/* Middle Specs & Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer and Product */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400">مشتری و عنوان جعبه:</span>
                        <div className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <Building className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{lead.customer_name}</span>
                        </div>
                        <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.product_name}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.customer_phone}</span>
                        </div>
                      </div>

                      {/* Technical Specs & Dimensions */}
                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div>
                            <span className="text-slate-400">تیراژ:</span>{' '}
                            <strong className="font-mono text-teal-800 text-sm font-black">{Number(lead.quantity).toLocaleString('fa-IR')} عدد</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">جنس و گرماژ:</span>{' '}
                            <strong className="text-slate-900">{lead.cardboard_type || 'ایندربرد'} ({lead.cardboard_grammage || lead.grammage || 300}g)</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">چاپ:</span>{' '}
                            <strong>{lead.print_type || 'افست نرمال'} ({lead.print_colors || '۴ رنگ'})</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">روکش و سلفون:</span>{' '}
                            <strong>{lead.cellophane_type || 'سلفون مات'}</strong>
                          </div>
                          {lead.box_length && (
                            <div className="text-slate-500 font-mono text-[11px]">
                              ابعاد: {lead.box_length} × {lead.box_width} × {lead.box_height} cm
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="mt-1 text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 self-start"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده کامل مشخصات فنی</span>
                        </button>
                      </div>

                      {/* Price Estimation & Factory Status */}
                      <div className="space-y-2 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                        {lead.estimated_unit_price > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-emerald-800 block">برآورد قیمت واحد بازرگانی:</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-slate-500">قیمت هر عدد:</span>
                              <strong className="text-base font-black text-emerald-700 font-mono">
                                {Number(lead.estimated_unit_price).toLocaleString('fa-IR')} تومان
                              </strong>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-slate-500">مبلغ کل برآورد:</span>
                              <strong className="text-xs font-black text-slate-800 font-mono">
                                {Number(lead.estimated_total_price || (lead.estimated_unit_price * lead.quantity)).toLocaleString('fa-IR')} تومان
                              </strong>
                            </div>
                            {lead.commercial_notes && (
                              <div className="text-[11px] text-indigo-700 font-medium bg-white/80 p-1.5 rounded-lg border border-indigo-100 mt-1">
                                <strong>توضیحات بازرگانی:</strong> {lead.commercial_notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-1 py-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-800">
                              {isNeedsRevision ? 'نیازمند تکمیل اطلاعات توسط بازاریاب' : 'در حال محاسبه قیمت توسط واحد برآورد'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isNeedsRevision ? 'لطفاً موارد اعلامی را بررسی و مجدداً ارسال نمایید' : 'به محض تعیین قیمت در این قسمت نمایش داده خواهد شد'}
                            </span>
                          </div>
                        )}

                        {/* Live Production Stage (if converted) */}
                        {isConverted && (
                          <div className="pt-2 border-t border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                            <span>مرحله در سالن تولید:</span>
                            <strong className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                              {STAGE_NAMES[lead.project_current_stage] || 'در صف تولید'}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Incomplete Reason Warning Callout */}
                    {lead.incomplete_reason && (
                      <div className="bg-rose-50/90 border border-rose-300 rounded-2xl p-3.5 text-xs text-rose-950 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-1">
                          <strong className="font-black text-rose-900 block">نقص اطلاعات اعلام شده توسط واحد برآورد / مدیریت:</strong>
                          <p className="text-slate-800 leading-relaxed font-medium">{lead.incomplete_reason}</p>
                          <div className="pt-1 text-[11px] text-rose-700 font-bold">
                            جهت اصلاح ابعاد، نوع متریال یا پیوست خط تیغ صحیح، روی دکمه «تکمیل و ارسال مجدد جهت برآورد» در پایین کلیک فرمایید.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dieline Attachment Box (if uploaded) */}
                    {lead.dieline_filename && (
                      <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-teal-700 shrink-0" />
                          <span className="text-slate-600 font-bold">فایل خط تیغ / طرح پیوست:</span>
                          <strong className="text-teal-950 font-black">{lead.dieline_filename}</strong>
                        </div>
                        {lead.dieline_file_url && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewFile({
                                file_url: lead.dieline_file_url,
                                original_filename: lead.dieline_filename
                              })}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
                              title="مشاهده مستقیم فایل در داشبورد"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-300" />
                              <span>مشاهده فایل</span>
                            </button>

                            <a
                              href={lead.dieline_file_url}
                              download={lead.dieline_filename}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
                              title="دانلود فایل به سیستم"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>دانلود</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Timeline Stepper */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-5 gap-1 text-center text-[10px] sm:text-xs">
                        {/* Step 1: Registered */}
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-900 font-bold border border-teal-200">
                          <div className="w-5 h-5 mx-auto rounded-full bg-teal-600 text-white flex items-center justify-center font-bold mb-1 text-[10px]">✓</div>
                          <span>۱. ثبت استعلام</span>
                        </div>

                        {/* Step 2: In Estimation */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          lead.estimated_unit_price ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200 animate-pulse'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            lead.estimated_unit_price ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {lead.estimated_unit_price ? '✓' : '۲'}
                          </div>
                          <span>۲. برآورد قیمت</span>
                        </div>

                        {/* Step 3: Price Quoted */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          lead.estimated_unit_price ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            lead.estimated_unit_price ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {lead.estimated_unit_price ? '✓' : '۳'}
                          </div>
                          <span>۳. اعلام فی به مشتری</span>
                        </div>

                        {/* Step 4: Customer Feedback */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          isApproved || isConverted ? 'bg-sky-50 text-sky-900 border-sky-200' : isRejected ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            isApproved || isConverted ? 'bg-sky-600 text-white' : isRejected ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {isApproved || isConverted ? '✓' : isRejected ? '✕' : '۴'}
                          </div>
                          <span>۴. بازخورد مشتری</span>
                        </div>

                        {/* Step 5: Factory Production */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          isConverted ? 'bg-indigo-50 text-indigo-900 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            isConverted ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {isConverted ? '✓' : '۵'}
                          </div>
                          <span>۵. خط تولید کارخانه</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Logs Preview (if any) */}
                    {followupsCount > 0 && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-teal-800">
                            <History className="w-3.5 h-3.5" />
                            <span>آخرین یادداشت‌های پیگیری با مشتری ({followupsCount} مورد):</span>
                          </span>
                          <button
                            onClick={() => handleOpenFollowupModal(lead)}
                            className="text-teal-700 hover:underline text-[11px]"
                          >
                            + ثبت پیگیری جدید
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span>{lead.followup_logs[0]?.note}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 mr-2">{lead.followup_logs[0]?.date_shamsi}</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {/* Follow-up Log Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenFollowupModal(lead)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                          <span>ثبت پیگیری و تماس</span>
                        </button>

                        {/* Print Proforma / Quote Sheet */}
                        {lead.estimated_unit_price > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForPrint(lead)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            <span>چاپ پیش‌فاکتور استعلام</span>
                          </button>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Marketer: Edit and Resubmit Lead (When Incomplete / Needs Revision or Pending) */}
                        {(isNeedsRevision || isPending) && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(lead)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تکمیل و ارسال مجدد جهت برآورد</span>
                          </button>
                        )}

                        {/* Marketer: Confirm Customer Acceptance */}
                        {isEstimated && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(lead.id, 'customer_approved')}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تایید قیمت توسط مشتری</span>
                          </button>
                        )}

                        {/* Marketer: Reject */}
                        {(isEstimated || isPending) && !isRejected && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('لطفاً دلیل عدم توافق یا انصراف مشتری را وارد نمایید:');
                              if (reason !== null) {
                                handleQuickStatusChange(lead.id, 'customer_rejected', reason);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200"
                          >
                            انصراف مشتری
                          </button>
                        )}

                        {/* Commercial / CEO: Estimate Price Button */}
                        {isCommercialOrCeo && (
                          <button
                            type="button"
                            onClick={() => handleOpenEstimateModal(lead)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{isPending ? 'برآورد و اعلام قیمت' : 'ویرایش قیمت'}</span>
                          </button>
                        )}

                        {/* Commercial / CEO: Convert to Production Order */}
                        {isCommercialOrCeo && (isEstimated || isApproved) && !isConverted && (
                          <button
                            type="button"
                            onClick={() => handleConvertToProject(lead)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>ارسال به خط تولید کارخانه</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NEW MARKETING LEAD SUBMISSION FORM */}
      {activeTab === 'new_lead' && (
        <form onSubmit={handleSubmitLead} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" />
                فرم ثبت استعلام جدید توسط بازاریاب
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                اطلاعات مشتری و مشخصات فنی جعبه را وارد فرمایید تا مستقیماً به کارتابل مدیر بازرگانی و ماشین حساب برآورد ارسال گردد.
              </p>
            </div>
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-bold">
              ثبت استعلام میدانی
            </span>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>{submitSuccess.msg}</strong> (کد پیگیری: <strong className="font-mono">{submitSuccess.code}</strong>)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('leads_list')}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition"
              >
                مشاهده در کارتابل پیگیری
              </button>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              ۱. مشخصات مشتری و سفارش
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  نام مشتری / شرکت: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صنایع دارویی سینا / میهن یدک"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  شماره موبایل مشتری: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="0912..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  نام محصول / عنوان جعبه: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جعبه شربت گیاهی ۱۲۰ میل"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specs (Hierarchical: مقوایی / لمینتی / کارتن) */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shadow-sm" />
                ۲. مشخصات فنی متریال و تیراژ
              </h3>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                فرم استاندارد محاسبه بهای تمام‌شده جعبه
              </span>
            </div>

            {/* Quantity and Tier 1 Material Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Quantity */}
              <div className="md:col-span-1">
                <label className="font-black text-slate-800 block mb-1.5">
                  تیراژ سفارش (عدد): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="100"
                    step="500"
                    placeholder="مثال: ۵۰۰۰"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-teal-500 font-mono shadow-xs"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">عدد</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {[1000, 2500, 5000, 10000, 20000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition ${
                        Number(quantity) === q
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {q.toLocaleString('fa-IR')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier 1 Primary Material Category (مقوایی / لمینتی / کارتن) */}
              <div className="md:col-span-3">
                <label className="font-black text-slate-800 block mb-1.5">
                  دسته‌بندی کلی ساختار متریال: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MAIN_CATEGORIES.map((cat) => {
                    const isSelected = mainCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setMainCategory(cat.id);
                          setMaterialConstruction(cat.id === 'مقوایی' ? 'مقوای تک‌لا' : cat.id);
                        }}
                        className={`p-3 rounded-2xl border text-right transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-500 shadow-sm text-teal-950 ring-2 ring-teal-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <div className="font-black text-xs text-slate-900">{cat.label}</div>
                            <div className="text-[10px] text-slate-500">{cat.desc}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TIER 2: SPECIFICATIONS WHEN «مقوایی» IS SELECTED */}
            {mainCategory === 'مقوایی' && (
              <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    اطلاعات کامل و اختصاصی جعبه مقوایی (Cardboard Specs)
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    تعیین دقیق گرماژ، متد چاپ، زینک، روکش و تکمیل
                  </span>
                </div>

                {/* 1. Cardboard Type (لیستی) & Grammage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Cardboard Type as Select List */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      نوع مقوا (انتخاب از لیست): <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={cardboardType}
                      onChange={(e) => setCardboardType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs"
                    >
                      {activeCardboardTypes.map((type) => (
                        <option key={type} value={type}>مقوای {type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cardboard Grammage (28 exact grammages) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800">
                        گرماژ مقوا (۲۸ گرماژ استاندارد):
                      </label>
                      <span className="text-[11px] font-mono font-black text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-lg">
                        {cardboardGrammage} گرم
                      </span>
                    </div>
                    <select
                      value={cardboardGrammage}
                      onChange={(e) => setCardboardGrammage(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs"
                    >
                      {activeGrammages.map((g) => (
                        <option key={g} value={g}>
                          {g} گرم {g === 300 ? '(استاندارد جعبه‌سازی)' : ''} {g === 250 ? '(سبک)' : ''} {g === 350 ? '(سنگین)' : ''}
                        </option>
                      ))}
                    </select>
                    {/* Quick Grammage Chips */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 text-[10px]">
                      <span className="text-slate-400 text-[10px] shrink-0">پرکاربرد:</span>
                      {[230, 250, 280, 300, 350, 400].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCardboardGrammage(g)}
                          className={`px-2 py-0.5 rounded-lg border font-mono font-bold transition shrink-0 ${
                            cardboardGrammage === g
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {g}g
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Printing Specifications (نوع چاپ اول -> بعد تعداد رنگ -> زینک و رنگ ساختگی - ابعاد فرم حذف شد) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-indigo-600" />
                      مشخصات چاپ افست
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">انتخاب روش چاپ و تعداد رنگ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Step 1: Print Type Selection */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        ۱. نوع چاپ: <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={printType}
                        onChange={(e) => setPrintType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        {activePrintTypes.map((pt) => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Step 2: Number of Colors (1 to 6) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        ۲. تعداد رنگ چاپ:
                      </label>
                      <select
                        disabled={printType === 'بدون چاپ'}
                        value={printColors}
                        onChange={(e) => setPrintColors(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs disabled:opacity-50"
                      >
                        {activePrintColors.map((pc) => (
                          <option key={pc} value={pc}>{pc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zinc Status */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">وضعیت زینک:</label>
                      <select
                        disabled={printType === 'بدون چاپ'}
                        value={printZinc}
                        onChange={(e) => setPrintZinc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs disabled:opacity-50"
                      >
                        {activePrintZincOptions.map((zo) => (
                          <option key={zo} value={zo}>{zo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Spot color checkbox */}
                  {printType !== 'بدون چاپ' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={customSpotColor}
                          onChange={(e) => setCustomSpotColor(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span>دارای رنگ ساختگی پنتون (Spot / Pantone Color)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 3. Surface Coatings Section (سلفون / ورنی / لاک / یو وی سیلندری با زیرمجموعه پویا) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-600" />
                      روکش و پوشش چاپ (سلفون / ورنی / لاک / یو وی سیلندری)
                    </span>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      {coatingCategory}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Coating Type */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        انتخاب نوع روکش اصلی:
                      </label>
                      <select
                        value={coatingCategory}
                        onChange={(e) => setCoatingCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                      >
                        {COATING_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic Sub-Option Selection */}
                    <div>
                      {coatingCategory === 'سلفون' && (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">نوع سلفون:</label>
                          <select
                            value={cellophaneType}
                            onChange={(e) => setCellophaneType(e.target.value)}
                            className="w-full bg-white border border-teal-400 rounded-xl px-3 py-2 font-bold text-teal-950 focus:outline-none text-xs"
                          >
                            {activeCellophaneTypes.map((cp) => (
                              <option key={cp} value={cp}>{cp}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {coatingCategory === 'ورنی' && (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">نوع ورنی:</label>
                          <select
                            value={varnishType}
                            onChange={(e) => setVarnishType(e.target.value)}
                            className="w-full bg-white border border-teal-400 rounded-xl px-3 py-2 font-bold text-teal-950 focus:outline-none text-xs"
                          >
                            {activeVarnishOptions.map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {coatingCategory === 'لاک' && (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">نوع لاک:</label>
                          <select
                            value={lacquerType}
                            onChange={(e) => setLacquerType(e.target.value)}
                            className="w-full bg-white border border-teal-400 rounded-xl px-3 py-2 font-bold text-teal-950 focus:outline-none text-xs"
                          >
                            {activeLacquerOptions.map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {coatingCategory === 'یو وی سیلندری' && (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">نوع یو وی سیلندری:</label>
                          <select
                            value={uvCylinderType}
                            onChange={(e) => setUvCylinderType(e.target.value)}
                            className="w-full bg-white border border-teal-400 rounded-xl px-3 py-2 font-bold text-teal-950 focus:outline-none text-xs"
                          >
                            {activeUvCylinderOptions.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {coatingCategory === 'بدون روکش' && (
                        <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs flex items-center gap-1.5 mt-5">
                          <span>بدون روکش و پوشش سلفون یا ورنی</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. DEDICATED SECTION: یو وی موضعی / تخصصی (اگر یو وی دارد) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={hasUv}
                        onChange={(e) => setHasUv(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>یو وی موضعی / تخصصی (Spot UV)</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${hasUv ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-500'}`}>
                      {hasUv ? 'فعال' : 'ندارد'}
                    </span>
                  </div>

                  {hasUv && (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">نوع یووی موضعی:</label>
                        <select
                          value={uvType}
                          onChange={(e) => setUvType(e.target.value)}
                          className="w-full bg-purple-50/60 border border-purple-300 rounded-xl px-3 py-2 font-bold text-purple-950 text-xs focus:outline-none"
                        >
                          {activeUvOptions.map((u) => (
                            <option key={u} value={u}>یووی {u}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-[11px] text-purple-800 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex items-center">
                        افکت یووی موضعی روی نواحی منتخب طرح چاپی یا سلفون مات اعمال می‌گردد.
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. DEDICATED SECTION: برجسته‌کاری (اگر برجسته دارد) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={hasEmboss}
                        onChange={(e) => setHasEmboss(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <SlidersIcon className="w-4 h-4 text-amber-600" />
                      <span>برجسته‌کاری (Embossing)</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${hasEmboss ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                      {hasEmboss ? 'فعال' : 'ندارد'}
                    </span>
                  </div>

                  {hasEmboss && (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">نوع و وضعیت کلیشه برجسته:</label>
                        <select
                          value={embossType}
                          onChange={(e) => setEmbossType(e.target.value)}
                          className="w-full bg-amber-50/60 border border-amber-300 rounded-xl px-3 py-2 font-bold text-amber-950 text-xs focus:outline-none"
                        >
                          <option value="برجسته (کلیشه جدید)">برجسته با ساخت کلیشه جدید</option>
                          <option value="برجسته (کلیشه موجود)">برجسته با کلیشه موجود از قبل</option>
                        </select>
                      </div>
                      <div className="text-[11px] text-amber-800 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 flex items-center">
                        عملیات امباس و برجسته‌سازی لوگو و نوشتار با کلیشه فلزی حرارتی.
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. DEDICATED SECTION: طلق پنجره جعبه (طول ، عرض ، ضخامت) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={hasWindow}
                        onChange={(e) => setHasWindow(e.target.checked)}
                        className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                      />
                      <Box className="w-4 h-4 text-cyan-600" />
                      <span>پنجره طلق‌دار (Window Patching)</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${hasWindow ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-slate-100 text-slate-500'}`}>
                      {hasWindow ? 'دارد' : 'بدون طلق'}
                    </span>
                  </div>

                  {hasWindow && (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">طول طلق (mm):</label>
                        <input
                          type="number"
                          placeholder="مثال: ۸۰"
                          value={windowLength}
                          onChange={(e) => setWindowLength(e.target.value)}
                          className="w-full bg-cyan-50/50 border border-cyan-300 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">عرض طلق (mm):</label>
                        <input
                          type="number"
                          placeholder="مثال: ۵۰"
                          value={windowWidth}
                          onChange={(e) => setWindowWidth(e.target.value)}
                          className="w-full bg-cyan-50/50 border border-cyan-300 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">ضخامت طلق:</label>
                        <select
                          value={windowThickness}
                          onChange={(e) => setWindowThickness(e.target.value)}
                          className="w-full bg-cyan-50/50 border border-cyan-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeWindowThicknessOptions.map((th) => (
                            <option key={th} value={th}>{th}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. DEDICATED SECTION: چسب و لب‌چسب (فقط ابعاد اگر چسب دارد) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={hasGlue}
                        onChange={(e) => setHasGlue(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>چسب و اتصال جعبه (Gluing)</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${hasGlue ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-500'}`}>
                      {hasGlue ? 'دارد' : 'بدون چسب (قفل شونده)'}
                    </span>
                  </div>

                  {hasGlue && (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">نوع چسب:</label>
                        <select
                          value={glueType}
                          onChange={(e) => setGlueType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeGlueOptions.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">طول لب‌چسب (mm):</label>
                        <input
                          type="number"
                          placeholder="طول mm"
                          value={glueLength}
                          onChange={(e) => setGlueLength(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">عرض لب‌چسب (mm):</label>
                        <input
                          type="number"
                          placeholder="عرض mm"
                          value={glueWidth}
                          onChange={(e) => setGlueWidth(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. DEDICATED SECTION: فویل و طلاکوب */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-slate-800 text-xs">
                      <input
                        type="checkbox"
                        checked={hasFoil}
                        onChange={(e) => setHasFoil(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                      />
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>فویل و طلاکوب / نقره‌کوب (Hot Foil)</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${hasFoil ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                      {hasFoil ? 'دارد' : 'بدون فویل'}
                    </span>
                  </div>

                  {hasFoil && (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">نوع فویل:</label>
                        <select
                          value={foilType}
                          onChange={(e) => setFoilType(e.target.value)}
                          className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeFoilOptions.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">طول فویل (mm):</label>
                        <input
                          type="number"
                          placeholder="طول mm"
                          value={foilLength}
                          onChange={(e) => setFoilLength(e.target.value)}
                          className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">عرض فویل (mm):</label>
                        <input
                          type="number"
                          placeholder="عرض mm"
                          value={foilWidth}
                          onChange={(e) => setFoilWidth(e.target.value)}
                          className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 font-mono font-bold text-center text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TIER 2: SPECIFICATIONS WHEN «لمینتی» IS SELECTED */}
            {mainCategory === 'لمینتی' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>مشخصات ساختار کارتن لمینتی (Laminated Box Specs)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نوع مقوای رویه:</label>
                    <select
                      value={cardboardType}
                      onChange={(e) => setCardboardType(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                    >
                      {activeCardboardTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نوع سینگل فلوت زیره:</label>
                    <select
                      value={materialConstruction}
                      onChange={(e) => setMaterialConstruction(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                    >
                      <option value="لمینت روی سینگل E-Flute (ای فلوت)">لمینت روی سینگل E-Flute (ای فلوت - ظریف)</option>
                      <option value="لمینت روی سینگل B-Flute (بی فلوت)">لمینت روی سینگل B-Flute (بی فلوت - متوسط)</option>
                      <option value="لمینت روی سینگل C-Flute (سی فلوت)">لمینت روی سینگل C-Flute (سی فلوت - ضخیم)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نوع سلفون پوستر:</label>
                    <select
                      value={cellophaneType}
                      onChange={(e) => setCellophaneType(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                    >
                      {activeCellophaneTypes.map((cp) => (
                        <option key={cp} value={cp}>{cp}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200">
                  💡 <strong>نکته:</strong> مشخصات تکمیلی لمینتی در این مرحله به صورت پایه ثبت و پس از هماهنگی با واحد فنی و مهندسی نهایی می‌گردد.
                </p>
              </div>
            )}

            {/* TIER 2: SPECIFICATIONS WHEN «کارتن» IS SELECTED */}
            {mainCategory === 'کارتن' && (
              <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sky-950 font-black text-xs">
                  <Package className="w-4 h-4 text-sky-600" />
                  <span>مشخصات کارتن مادر و دایکاتی (Corrugated Carton Specs)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نوع ساختار ورق کارتن:</label>
                    <select
                      value={materialConstruction}
                      onChange={(e) => setMaterialConstruction(e.target.value)}
                      className="w-full bg-white border border-sky-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                    >
                      <option value="کارتن ۳ لایه C-Flute (کارتن مادر)">کارتن ۳ لایه C-Flute (کارتن مادر)</option>
                      <option value="کارتن ۳ لایه E-Flute (کارتن دایکاتی)">کارتن ۳ لایه E-Flute (کارتن دایکاتی)</option>
                      <option value="کارتن ۵ لایه BC-Flute (کارتن سنگین صادراتی)">کارتن ۵ لایه BC-Flute (کارتن سنگین صادراتی)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نوع چاپ کارتن:</label>
                    <select
                      value={printType}
                      onChange={(e) => setPrintType(e.target.value)}
                      className="w-full bg-white border border-sky-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                    >
                      <option value="چاپ فلکسو ۱ الی ۲ رنگ">چاپ فلکسو ۱ الی ۲ رنگ</option>
                      <option value="چاپ فلکسو ۳ الی ۴ رنگ">چاپ فلکسو ۳ الی ۴ رنگ</option>
                      <option value="چاپ سیلک اسکرین">چاپ سیلک اسکرین</option>
                      <option value="بدون چاپ (کارتن خام)">بدون چاپ (کارتن خام)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">نوع مدل کارتن:</label>
                    <select
                      className="w-full bg-white border border-sky-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                    >
                      <option value="چهاردر ساده آمریکایی (RSC)">چهاردر ساده آمریکایی (RSC)</option>
                      <option value="دایکاتی قفلی (Die-cut)">دایکاتی قفلی (Die-cut)</option>
                      <option value="سینی و درب جداگانه">سینی و درب جداگانه</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-sky-200">
                  💡 <strong>نکته:</strong> مشخصات فنی کارتن در مراحل بعدی قابل سفارشی‌سازی کامل خواهد بود.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Approximate Dimensions & Notes */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              ۳. ابعاد تقریبی (سانتی‌متر) و توضیحات تکمیلی
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">طول (L):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: ۸"
                  value={boxLength}
                  onChange={(e) => setBoxLength(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عرض (W):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: ۱.۵"
                  value={boxWidth}
                  onChange={(e) => setBoxWidth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ارتفاع (H):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: ۱۶.۵"
                  value={boxHeight}
                  onChange={(e) => setBoxHeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                توضیحات و نیازمندی‌های مشتری (یووی موضعی، طلاکوب، طلق پنجره، نوع تحویل):
              </label>
              <textarea
                rows="3"
                placeholder="توضیحات تکمیلی مشتری، نمونه رنگ، موعد تحویل و نکات خاص..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Section 4: Dieline & Artwork Upload (Optional) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              ۴. پیوست فایل خط تیغ، قالب یا طرح چاپی (اختیاری)
            </h3>

            <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-4 sm:p-6 text-center transition bg-slate-50/50">
              <input
                type="file"
                id="dieline-upload-input"
                accept=".pdf,.ai,.eps,.cdr,.dxf,.svg,.jpg,.jpeg,.png,.zip"
                onChange={(e) => handleFileUpload(e, false)}
                className="hidden"
              />
              {dielineFileName ? (
                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-2xl p-3.5 max-w-lg mx-auto">
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-5 h-5 text-teal-600 shrink-0" />
                    <div className="text-right">
                      <div className="font-bold text-xs text-teal-950 truncate max-w-xs">{dielineFileName}</div>
                      <div className="text-[10px] text-teal-700 font-mono">{dielineFileSize ? `${dielineFileSize} KB` : 'پیوست شده'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDielineFileName('');
                      setDielineFileUrl('');
                      setDielineFileSize('');
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition"
                    title="حذف فایل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="dieline-upload-input" className="cursor-pointer flex flex-col items-center space-y-2 py-2">
                  <Upload className="w-8 h-8 text-teal-600 stroke-[1.75]" />
                  <span className="text-xs font-bold text-slate-800">
                    جهت آپلود فایل خط تیغ، قالب، PDF یا عکس جعبه کلیک نمایید
                  </span>
                  <span className="text-[11px] text-slate-400">
                    فرمت‌های مجاز: PDF, AI, CDR, EPS, DXF, SVG, JPG, PNG, ZIP (حداکثر ۲۵ مگابایت)
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-lg shadow-teal-100 transition flex items-center gap-2 active:scale-95"
            >
              {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>ثبت استعلام و ارسال به مدیر بازرگانی جهت برآورد قیمت</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: FOLLOW-UP LOGGER (ثبت پیگیری و لاگ تماس) */}
      {selectedLeadForFollowup && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-800 font-black text-sm">
                <PhoneCall className="w-5 h-5 text-teal-600" />
                <span>ثبت پیگیری و مذاکره با مشتری ({selectedLeadForFollowup.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForFollowup(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری:</span>
                <strong className="text-slate-900">{selectedLeadForFollowup.customer_name} ({selectedLeadForFollowup.product_name})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">شماره تماس:</span>
                <strong className="text-slate-900 font-mono" dir="ltr">{selectedLeadForFollowup.customer_phone}</strong>
              </div>
              {selectedLeadForFollowup.estimated_unit_price > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>قیمت اعلامی واحد بازرگانی:</span>
                  <span className="font-mono">فی {Number(selectedLeadForFollowup.estimated_unit_price).toLocaleString('fa-IR')} ت</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitFollowup} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع اقدام / پیگیری:</label>
                <select
                  value={followupOutcome}
                  onChange={(e) => setFollowupOutcome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="تماس تلفنی با کارفرما">تماس تلفنی با کارفرما</option>
                  <option value="جلسه حضوری و ارائه نمونه">جلسه حضوری و ارائه نمونه</option>
                  <option value="ارسال پیش‌فاکتور رسمی در پیام‌رسان">ارسال پیش‌فاکتور رسمی در پیام‌رسان</option>
                  <option value="مذاکره روی تخفیف تیراژ">مذاکره روی تخفیف تیراژ</option>
                  <option value="تایید قیمت و نهایی‌سازی پیش‌پرداخت">تایید قیمت و نهایی‌سازی پیش‌پرداخت</option>
                  <option value="انصراف موقت مشتری">انصراف موقت مشتری</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شرح مذاکره و نتیجه تماس با مشتری: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="مثال: با مدیر خرید شرکت تماس گرفته شد، قیمت تایید شد و قرار شد فردا چک بیعانه ارسال گردد..."
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تغییر وضعیت استعلام به:</label>
                <select
                  value={followupStatus}
                  onChange={(e) => setFollowupStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="estimated">قیمت اعلام شده (در حال مذاکره)</option>
                  <option value="customer_approved">تایید قطعی قیمت توسط مشتری</option>
                  <option value="customer_rejected">انصراف / عدم توافق قیمت</option>
                </select>
              </div>

              {/* Previous Follow-up History */}
              {Array.isArray(selectedLeadForFollowup?.followup_logs) && selectedLeadForFollowup.followup_logs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto">
                  <span className="text-[11px] font-bold text-slate-500">تاریخچه پیگیری‌های قبلی:</span>
                  {selectedLeadForFollowup.followup_logs.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-0.5">
                      <div className="flex justify-between font-bold text-teal-900">
                        <span>{log.outcome}</span>
                        <span className="font-mono text-[10px] text-slate-400">{log.date_shamsi}</span>
                      </div>
                      <p className="text-slate-600">{log.note}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForFollowup(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={followupLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {followupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>ذخیره در پرونده استعلام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULL TECHNICAL SPECIFICATIONS DETAIL (شناسنامه فنی کامل استعلام) */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-800 font-black text-sm sm:text-base">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>شناسنامه و مشخصات فنی استعلام #{selectedLeadForDetail.lead_code}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gradient-to-r from-teal-50 to-slate-50 rounded-2xl border border-teal-100 text-xs">
              <div>
                <span className="text-slate-500">نام مشتری / شرکت:</span>{' '}
                <strong className="text-slate-900 text-sm">{selectedLeadForDetail.customer_name}</strong>
              </div>
              <div>
                <span className="text-slate-500">شماره تماس مستقیم:</span>{' '}
                <strong className="text-slate-900 font-mono" dir="ltr">{selectedLeadForDetail.customer_phone}</strong>
              </div>
              <div>
                <span className="text-slate-500">عنوان جعبه / محصول:</span>{' '}
                <strong className="text-teal-950">{selectedLeadForDetail.product_name}</strong>
              </div>
              <div>
                <span className="text-slate-500">تیراژ درخواستی:</span>{' '}
                <strong className="text-teal-800 font-mono text-sm">{Number(selectedLeadForDetail.quantity).toLocaleString('fa-IR')} عدد</strong>
              </div>
            </div>

            {/* Technical Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Box 1: Material */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs text-teal-900">
                  <Box className="w-4 h-4 text-teal-600" />
                  متریال و گرماژ
                </span>
                <div className="space-y-1 text-slate-700">
                  <div>دسته‌بندی: <strong>{selectedLeadForDetail.main_category || 'مقوایی'}</strong></div>
                  <div>نوع مقوا: <strong>{selectedLeadForDetail.cardboard_type || 'ایندربرد'}</strong></div>
                  <div>گرماژ مقوا: <strong className="font-mono text-teal-700">{selectedLeadForDetail.cardboard_grammage || selectedLeadForDetail.grammage || 300} گرم</strong></div>
                  {selectedLeadForDetail.box_length && (
                    <div className="font-mono text-slate-600">ابعاد: {selectedLeadForDetail.box_length} × {selectedLeadForDetail.box_width} × {selectedLeadForDetail.box_height} سانتی‌متر</div>
                  )}
                </div>
              </div>

              {/* Box 2: Print */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs text-indigo-900">
                  <Printer className="w-4 h-4 text-indigo-600" />
                  مشخصات چاپ
                </span>
                <div className="space-y-1 text-slate-700">
                  <div>متد چاپ: <strong>{selectedLeadForDetail.print_type || 'افست نرمال'}</strong></div>
                  <div>تعداد رنگ: <strong>{selectedLeadForDetail.print_colors || '۴ رنگ'}</strong></div>
                  <div>زینک: <strong>{selectedLeadForDetail.print_zinc || 'زینک جدید'}</strong></div>
                  <div>رنگ ساختگی: <strong>{selectedLeadForDetail.custom_spot_color ? 'دارد (پنتون)' : 'ندارد'}</strong></div>
                  {selectedLeadForDetail.print_form_length && selectedLeadForDetail.print_form_width && (
                    <div className="font-mono text-slate-600">فرم چاپی: {selectedLeadForDetail.print_form_length} × {selectedLeadForDetail.print_form_width} mm {selectedLeadForDetail.boxes_per_sheet ? `(${selectedLeadForDetail.boxes_per_sheet} در فرم)` : ''}</div>
                  )}
                </div>
              </div>

              {/* Box 3: Coatings & Finish */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs text-cyan-900">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  روکش و تکمیل سطحی
                </span>
                <div className="space-y-1 text-slate-700">
                  <div>سلفون: <strong>{selectedLeadForDetail.cellophane_type || 'سلفون حرارتی مات'}</strong></div>
                  <div>ورنی: <strong>{selectedLeadForDetail.varnish_type || 'بدون ورنی'}</strong></div>
                  <div>لاک: <strong>{selectedLeadForDetail.lacquer_type || 'بدون لاک'}</strong></div>
                  <div>یووی: <strong>{selectedLeadForDetail.uv_type || 'بدون یووی'}</strong></div>
                  <div>برجسته: <strong>{selectedLeadForDetail.emboss_type || 'بدون برجسته'}</strong></div>
                </div>
              </div>

              {/* Box 4: Glue & Foil */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs text-amber-900">
                  <SlidersIcon className="w-4 h-4 text-amber-600" />
                  چسب و فویل / طلاکوب
                </span>
                <div className="space-y-1 text-slate-700">
                  <div>نوع چسب: <strong>{selectedLeadForDetail.glue_type || 'لب چسب'}</strong> {selectedLeadForDetail.glue_length && selectedLeadForDetail.glue_width ? `(${selectedLeadForDetail.glue_length}×${selectedLeadForDetail.glue_width} mm)` : ''}</div>
                  <div>فویل: <strong>{selectedLeadForDetail.foil_type || 'بدون فویل'}</strong> {selectedLeadForDetail.foil_length && selectedLeadForDetail.foil_width ? `(${selectedLeadForDetail.foil_length}×${selectedLeadForDetail.foil_width} mm)` : ''}</div>
                </div>
              </div>
            </div>

            {/* Notes if any */}
            {selectedLeadForDetail.notes && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-600">توضیحات و نیازمندی‌های مشتری:</span>
                <p className="text-slate-800 leading-relaxed">{selectedLeadForDetail.notes}</p>
              </div>
            )}

            {/* Attached Dieline File */}
            {selectedLeadForDetail.dieline_filename && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-bold text-slate-700">فایل خط تیغ پیوست:</span>
                  <strong className="text-teal-950 font-black">{selectedLeadForDetail.dieline_filename}</strong>
                </div>
                {selectedLeadForDetail.dieline_file_url && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewFile({
                        file_url: selectedLeadForDetail.dieline_file_url,
                        original_filename: selectedLeadForDetail.dieline_filename
                      })}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-300" />
                      <span>مشاهده فایل</span>
                    </button>
                    <a
                      href={selectedLeadForDetail.dieline_file_url}
                      download={selectedLeadForDetail.dieline_filename}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedLeadForDetail.estimated_unit_price > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeadForPrint(selectedLeadForDetail);
                    setSelectedLeadForDetail(null);
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ پیش‌فاکتور</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedLeadForDetail(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs mr-auto"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL QUOTATION SHEET (پیش‌فاکتور استعلام) */}
      {selectedLeadForPrint && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <span className="text-sm font-bold text-slate-700">پیش‌نمایش پیش‌فاکتور و برگه رسمی استعلام قیمت</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ / ذخیره PDF</span>
                </button>
                <button
                  onClick={() => setSelectedLeadForPrint(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  بستن
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="border-2 border-slate-800 p-6 rounded-2xl space-y-5 bg-white text-slate-900" dir="rtl">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">شرکت صنایع بسته‌بندی آرمان امیران</h2>
                  <p className="text-xs text-slate-600">استودیو طراحی امیران | برگه رسمی اعلام قیمت و پیش‌فاکتور استعلام</p>
                </div>
                <div className="text-left font-mono text-xs space-y-0.5" dir="ltr">
                  <div><strong>INQUIRY:</strong> #{selectedLeadForPrint.lead_code}</div>
                  <div><strong>DATE:</strong> 1405/01/15</div>
                  <div><strong>REP:</strong> {selectedLeadForPrint.marketer_name || 'کارشناس بازاریابی'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">نام مشتری / کارفرما:</span> <strong>{selectedLeadForPrint.customer_name}</strong></div>
                  <div><span className="text-slate-500">شماره تماس:</span> <strong className="font-mono">{selectedLeadForPrint.customer_phone}</strong></div>
                  <div><span className="text-slate-500">نام محصول / جعبه:</span> <strong>{selectedLeadForPrint.product_name}</strong></div>
                  <div><span className="text-slate-500">تیراژ درخواستی:</span> <strong className="font-mono text-teal-700">{Number(selectedLeadForPrint.quantity).toLocaleString('fa-IR')} عدد</strong></div>
                  {selectedLeadForPrint.box_length && (
                    <div><span className="text-slate-500">ابعاد جعبه:</span> <strong className="font-mono">{selectedLeadForPrint.box_length} × {selectedLeadForPrint.box_width} × {selectedLeadForPrint.box_height} cm</strong></div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">دسته‌بندی و مقوا:</span> <strong>{selectedLeadForPrint.main_category || 'مقوایی'} - {selectedLeadForPrint.cardboard_type} ({selectedLeadForPrint.cardboard_grammage}g)</strong></div>
                  <div><span className="text-slate-500">چاپ و زینک:</span> <strong>{selectedLeadForPrint.print_type || 'افست'} - {selectedLeadForPrint.print_colors || '۴ رنگ'} {selectedLeadForPrint.print_zinc ? `(${selectedLeadForPrint.print_zinc})` : ''} {selectedLeadForPrint.custom_spot_color ? '+ پنتون' : ''}</strong></div>
                  <div><span className="text-slate-500">روکش و سلفون:</span> <strong>{selectedLeadForPrint.cellophane_type || 'سلفون مات'} {selectedLeadForPrint.varnish_type && selectedLeadForPrint.varnish_type !== 'بدون ورنی' ? `+ ${selectedLeadForPrint.varnish_type}` : ''}</strong></div>
                  <div><span className="text-slate-500">یووی و افکت:</span> <strong>{selectedLeadForPrint.uv_type && selectedLeadForPrint.uv_type !== 'بدون یووی' ? `یووی ${selectedLeadForPrint.uv_type}` : 'بدون یووی'} {selectedLeadForPrint.emboss_type && selectedLeadForPrint.emboss_type !== 'بدون برجسته' ? `+ ${selectedLeadForPrint.emboss_type}` : ''}</strong></div>
                  <div><span className="text-slate-500">چسب و فویل:</span> <strong>{selectedLeadForPrint.glue_type ? `چسب ${selectedLeadForPrint.glue_type}` : 'لب‌چسب'} {selectedLeadForPrint.foil_type && selectedLeadForPrint.foil_type !== 'بدون فویل' ? `+ ${selectedLeadForPrint.foil_type}` : ''}</strong></div>
                </div>
              </div>

              {/* Price Table */}
              <table className="w-full text-xs text-right border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300">شرح خدمات و کالا</th>
                    <th className="p-2 border border-slate-300 text-center">تیراژ</th>
                    <th className="p-2 border border-slate-300 text-center">قیمت واحد (تومان)</th>
                    <th className="p-2 border border-slate-300 text-center">مبلغ کل (تومان)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border border-slate-300 font-bold">
                      تولید {selectedLeadForPrint.product_name} با مشخصات فنی فوق
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-bold">
                      {Number(selectedLeadForPrint.quantity).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-black text-emerald-700">
                      {Number(selectedLeadForPrint.estimated_unit_price).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-black text-slate-900">
                      {Number(selectedLeadForPrint.estimated_total_price || (selectedLeadForPrint.estimated_unit_price * selectedLeadForPrint.quantity)).toLocaleString('fa-IR')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {selectedLeadForPrint.commercial_notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-0.5">
                  <strong>شرایط و ملاحظات بازرگانی:</strong>
                  <p>{selectedLeadForPrint.commercial_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300 text-xs">
                <div className="p-3 border border-slate-300 rounded-xl text-center space-y-4">
                  <span className="font-bold text-slate-700">مهر و امضای کارشناس بازاریابی</span>
                  <div className="h-12 flex items-center justify-center text-slate-400 text-[10px]">
                    {selectedLeadForPrint.marketer_name || 'کارشناس بازاریابی'}
                  </div>
                </div>
                <div className="p-3 border border-slate-300 rounded-xl text-center space-y-4">
                  <span className="font-bold text-slate-700">مهر و امضای مدیریت بازرگانی کارخانه</span>
                  <div className="h-12 flex items-center justify-center text-slate-400 text-[10px]">
                    شرکت صنایع بسته‌بندی آرمان امیران
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMMERCIAL PRICE ESTIMATION (برآورد قیمت مدیر بازرگانی) */}
      {estimatingLead && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
                <DollarSign className="w-5 h-5" />
                <span>برآورد قیمت توسط مدیر بازرگانی ({estimatingLead.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setEstimatingLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری و محصول:</span>
                <strong className="text-slate-800">{estimatingLead.customer_name} ({estimatingLead.product_name})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تیراژ:</span>
                <strong className="text-slate-800 font-mono">{Number(estimatingLead.quantity).toLocaleString('fa-IR')} عدد</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">متریال و ساختار:</span>
                <strong className="text-slate-800">{estimatingLead.cardboard_type} - {estimatingLead.material_construction}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  قیمت برآورد شده هر عدد جعبه (تومان): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    step="100"
                    placeholder="مثال: ۲۴۵۰"
                    value={estimatedUnitPrice}
                    onChange={(e) => {
                      const uPrice = Number(e.target.value);
                      setEstimatedUnitPrice(e.target.value);
                      setEstimatedTotalPrice(uPrice * estimatingLead.quantity);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 text-[10px]">تومان</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">قیمت کل برآورد شده سفارش (تومان):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    value={estimatedTotalPrice}
                    onChange={(e) => setEstimatedTotalPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 text-[10px]">تومان</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات و شرایط بازرگانی جهت ابلاغ به بازاریاب:</label>
                <textarea
                  rows="2"
                  placeholder="شرایط پرداخت بیعانه، موعد تحویل، نحوه ارسال و تخفیف..."
                  value={commercialNotes}
                  onChange={(e) => setCommercialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const leadToRevise = estimatingLead;
                  setEstimatingLead(null);
                  setRevisionModalLead(leadToRevise);
                  setRevisionReason('');
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs border border-rose-200 transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>اعلام نقص اطلاعات به بازاریاب</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEstimatingLead(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={estimatingLoading}
                  onClick={handleSubmitEstimate}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {estimatingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>ثبت برآورد و اعلام به کارتابل بازاریاب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MARKETER MONTHLY TARGET CONFIGURATION (تنظیم تارگت بازاریاب توسط مدیریت) */}
      {showTargetEditModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-700 font-black text-sm">
                <Target className="w-5 h-5 text-teal-600" />
                <span>تعیین تارگت ماهانه بازاریاب: {targetFormUser?.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-4 text-xs">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-teal-950 space-y-1">
                <div className="font-bold">
                  دوره اعمال تارگت: <strong className="text-teal-900 font-black">{selectedMonth || targetStats?.current_period?.fullMonthText || 'ماه جاری'}</strong>
                </div>
                <div className="text-[11px] text-teal-800 leading-relaxed">
                  تارگت تعیین‌شده در بالای کارتابل بازاریاب به صورت لحظه‌ای با نوار پیشرفت، نشان‌های انگیزشی و درصد تحقق نمایش داده خواهد شد.
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  تعداد استعلام قیمت هدف در ماه (تارگت ورودی): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    placeholder="مثال: 20"
                    value={editTargetInquiries}
                    onChange={(e) => setEditTargetInquiries(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-teal-500 font-mono text-center"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">استعلام / ماه</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setEditTargetInquiries(15)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                  >
                    ۱۵ استعلام
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTargetInquiries(20)}
                    className="px-2 py-0.5 rounded bg-teal-100 hover:bg-teal-200 text-teal-900 text-[10px] font-bold"
                  >
                    ۲۰ استعلام (پیش‌فرض)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTargetInquiries(30)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                  >
                    ۳۰ استعلام
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTargetInquiries(50)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                  >
                    ۵۰ استعلام (پرتلاش)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  تارگت مبلغ فروش کل استعلامات (تومان - اختیاری):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000000"
                    placeholder="مثال: 150000000"
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-teal-500 font-mono text-center"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 text-[10px]">تومان</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">یادداشت و شرایط پاداش تحقق تارگت:</label>
                <textarea
                  rows="2"
                  placeholder="مثال: در صورت ثبت ۲۰ استعلام و تبدیل حداقل ۳ مورد به سفارش، ۱۰ درصد پاداش تعلق می‌گیرد."
                  value={editTargetNotes}
                  onChange={(e) => setEditTargetNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savingTarget}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {savingTarget ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>ذخیره و ابلاغ تارگت به بازاریاب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: MARKETER EDIT & RESUBMIT LEAD (تکمیل و ارسال مجدد استعلام توسط بازاریاب) */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp my-8 max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>ویرایش و تکمیل مشخصات استعلام ({editingLead.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Incomplete Reason Banner if present */}
            {editingLead.incomplete_reason && (
              <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold text-rose-900 block">نقص اطلاعات اعلام شده توسط واحد برآورد / مدیریت:</strong>
                  <p className="text-slate-800 leading-relaxed font-medium">{editingLead.incomplete_reason}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateAndResubmitLead} className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    نام کامل مشتری / شرکت: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    شماره تماس مستقیم: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={editCustomerPhone}
                    onChange={(e) => setEditCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500 text-left font-mono"
                  />
                </div>
              </div>

              {/* Product and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    نام محصول / عنوان جعبه: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    تیراژ سفارش (عدد): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-black text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Tier 1: Main Category Selection in Edit Modal */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-black text-slate-800 block mb-1">
                  دسته‌بندی کلی ساختار متریال: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MAIN_CATEGORIES.map((cat) => {
                    const isSelected = editMainCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setEditMainCategory(cat.id);
                          setEditMaterialConstruction(cat.id === 'مقوایی' ? 'مقوای تک‌لا' : cat.id);
                        }}
                        className={`p-2.5 rounded-2xl border text-right transition flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 shadow-xs text-amber-950 font-bold ring-2 ring-amber-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-xs">{cat.label}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIER 2: EDIT SPECS FOR «مقوایی» */}
              {editMainCategory === 'مقوایی' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>مشخصات فنی مقوایی</span>
                  </div>

                  {/* 1. نوع و گرماژ مقوا (لیستی Dropdown) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        نوع مقوا: <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editCardboardType}
                        onChange={(e) => setEditCardboardType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                      >
                        {activeCardboardTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        گرماژ مقوا: <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editCardboardGrammage}
                        onChange={(e) => setEditCardboardGrammage(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                      >
                        {activeGrammages.map((g) => (
                          <option key={g} value={g}>{g} گرم</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. مشخصات چاپ: ابتدا نوع چاپ -> سپس تعداد رنگ */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
                    <div className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>مشخصات چاپ</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                          ۱. نوع چاپ:
                        </label>
                        <select
                          value={editPrintType}
                          onChange={(e) => setEditPrintType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                        >
                          {activePrintTypes.map((pt) => (
                            <option key={pt} value={pt}>{pt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                          ۲. تعداد رنگ چاپ:
                        </label>
                        <select
                          disabled={editPrintType === 'بدون چاپ'}
                          value={editPrintColors}
                          onChange={(e) => setEditPrintColors(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {activePrintColors.map((pc) => (
                            <option key={pc} value={pc}>{pc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                          وضعیت زینک:
                        </label>
                        <select
                          disabled={editPrintType === 'بدون چاپ'}
                          value={editPrintZinc}
                          onChange={(e) => setEditPrintZinc(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {activePrintZincOptions.map((zo) => (
                            <option key={zo} value={zo}>{zo}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editCustomSpotColor}
                          onChange={(e) => setEditCustomSpotColor(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span>دارای رنگ ساختگی (پنتون Spot Color)</span>
                      </label>
                    </div>
                  </div>

                  {/* 3. روکش سطح (سلفون / ورنی / لاک / یو وی سیلندری / بدون روکش) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
                    <div className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>روکش سطح</span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5 text-[11px]">
                        انتخاب نوع روکش اصلی:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {COATING_CATEGORIES.map((coat) => {
                          const isSel = editCoatingCategory === coat.id;
                          return (
                            <button
                              key={coat.id}
                              type="button"
                              onClick={() => setEditCoatingCategory(coat.id)}
                              className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                                isSel
                                  ? 'bg-purple-50 border-purple-500 text-purple-900 font-black shadow-xs ring-2 ring-purple-500/20'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="text-xs">{coat.label}</span>
                              <span className="text-[9px] text-slate-500">{coat.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic Sub-type selector based on primary coating */}
                    {editCoatingCategory === 'سلفون' && (
                      <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-200 text-xs">
                        <label className="font-bold text-purple-950 block mb-1 text-[11px]">زیرمجموعه سلفون:</label>
                        <select
                          value={editCellophaneType}
                          onChange={(e) => setEditCellophaneType(e.target.value)}
                          className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeCellophaneTypes.map((cp) => (
                            <option key={cp} value={cp}>{cp}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {editCoatingCategory === 'ورنی' && (
                      <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-200 text-xs">
                        <label className="font-bold text-purple-950 block mb-1 text-[11px]">زیرمجموعه ورنی:</label>
                        <select
                          value={editVarnishType}
                          onChange={(e) => setEditVarnishType(e.target.value)}
                          className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeVarnishOptions.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {editCoatingCategory === 'لاک' && (
                      <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-200 text-xs">
                        <label className="font-bold text-purple-950 block mb-1 text-[11px]">زیرمجموعه لاک:</label>
                        <select
                          value={editLacquerType}
                          onChange={(e) => setEditLacquerType(e.target.value)}
                          className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeLacquerOptions.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {editCoatingCategory === 'یو وی سیلندری' && (
                      <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-200 text-xs">
                        <label className="font-bold text-purple-950 block mb-1 text-[11px]">زیرمجموعه یو وی سیلندری:</label>
                        <select
                          value={editUvCylinderType}
                          onChange={(e) => setEditUvCylinderType(e.target.value)}
                          className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeUvCylinderOptions.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 4. سکشن اختصاصی یو وی موضعی/تخصصی */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-slate-800 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>یو وی (موضعی و افکت‌های خاص)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHasUv}
                          onChange={(e) => setEditHasUv(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold text-slate-700">دارد</span>
                      </label>
                    </div>

                    {editHasUv && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="font-bold text-slate-600 block mb-1 text-[11px]">نوع یووی موضعی:</label>
                        <select
                          value={editUvType}
                          onChange={(e) => setEditUvType(e.target.value)}
                          className="w-full bg-slate-50 border border-amber-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeUvOptions.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 5. سکشن اختصاصی برجسته (Embossing) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-slate-800 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>برجسته / فرورفته (Emboss / Deboss)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHasEmboss}
                          onChange={(e) => setEditHasEmboss(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold text-slate-700">دارد</span>
                      </label>
                    </div>

                    {editHasEmboss && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="font-bold text-slate-600 block mb-1 text-[11px]">وضعیت کلیشه برجسته:</label>
                        <select
                          value={editEmbossType}
                          onChange={(e) => setEditEmbossType(e.target.value)}
                          className="w-full bg-slate-50 border border-teal-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                        >
                          {activeEmbossOptions.map((eb) => (
                            <option key={eb} value={eb}>{eb}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 6. سکشن اختصاصی طلق (پنجره جعبه) با ویژگی‌های طول، عرض و ضخامت */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-slate-800 text-[11px]">
                        <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        <span>طلق (پنجره‌دار / Window Patching)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHasWindow}
                          onChange={(e) => setEditHasWindow(e.target.checked)}
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold text-slate-700">دارد</span>
                      </label>
                    </div>

                    {editHasWindow && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">طول طلق (mm):</label>
                          <input
                            type="number"
                            placeholder="طول"
                            value={editWindowLength}
                            onChange={(e) => setEditWindowLength(e.target.value)}
                            className="w-full bg-slate-50 border border-cyan-300 rounded-lg px-2 py-1.5 font-mono text-center text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">عرض طلق (mm):</label>
                          <input
                            type="number"
                            placeholder="عرض"
                            value={editWindowWidth}
                            onChange={(e) => setEditWindowWidth(e.target.value)}
                            className="w-full bg-slate-50 border border-cyan-300 rounded-lg px-2 py-1.5 font-mono text-center text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">ضخامت طلق:</label>
                          <select
                            value={editWindowThickness}
                            onChange={(e) => setEditWindowThickness(e.target.value)}
                            className="w-full bg-slate-50 border border-cyan-300 rounded-lg px-2 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                          >
                            {activeWindowThicknessOptions.map((wt) => (
                              <option key={wt} value={wt}>{wt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. سکشن چسب: ابعاد طول و عرض لب‌چسب */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-slate-800 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>چسب (لب‌چسب جعبه)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHasGlue}
                          onChange={(e) => setEditHasGlue(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold text-slate-700">دارد</span>
                      </label>
                    </div>

                    {editHasGlue && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">نوع چسب:</label>
                          <select
                            value={editGlueType}
                            onChange={(e) => setEditGlueType(e.target.value)}
                            className="w-full bg-slate-50 border border-emerald-300 rounded-lg px-2 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                          >
                            {activeGlueOptions.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">طول لب‌چسب (mm):</label>
                          <input
                            type="number"
                            placeholder="طول"
                            value={editGlueLength}
                            onChange={(e) => setEditGlueLength(e.target.value)}
                            className="w-full bg-slate-50 border border-emerald-300 rounded-lg px-2 py-1.5 font-mono text-center text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">عرض لب‌چسب (mm):</label>
                          <input
                            type="number"
                            placeholder="عرض"
                            value={editGlueWidth}
                            onChange={(e) => setEditGlueWidth(e.target.value)}
                            className="w-full bg-slate-50 border border-emerald-300 rounded-lg px-2 py-1.5 font-mono text-center text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 8. سکشن فویل و طلاکوب */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-slate-800 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>فویل (طلاکوب / نقره‌کوب)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHasFoil}
                          onChange={(e) => setEditHasFoil(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold text-slate-700">دارد</span>
                      </label>
                    </div>

                    {editHasFoil && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">نوع فویل:</label>
                          <select
                            value={editFoilType}
                            onChange={(e) => setEditFoilType(e.target.value)}
                            className="w-full bg-slate-50 border border-amber-300 rounded-lg px-2 py-1.5 font-bold text-slate-800 text-xs focus:outline-none"
                          >
                            {activeFoilOptions.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">طول فویل (mm):</label>
                          <input
                            type="number"
                            placeholder="طول"
                            value={editFoilLength}
                            onChange={(e) => setEditFoilLength(e.target.value)}
                            className="w-full bg-slate-50 border border-amber-300 rounded-lg px-2 py-1.5 font-mono text-center text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600 block mb-1 text-[10px]">عرض فویل (mm):</label>
                          <input
                            type="number"
                            placeholder="عرض"
                            value={editFoilWidth}
                            onChange={(e) => setEditFoilWidth(e.target.value)}
                            className="w-full bg-slate-50 border border-amber-300 rounded-lg px-2 py-1.5 font-mono text-center text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TIER 2: EDIT SPECS FOR «لمینتی» OR «کارتن» */}
              {editMainCategory !== 'مقوایی' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                  <div className="font-bold text-amber-900">مشخصات ساختار {editMainCategory}:</div>
                  <select
                    value={editMaterialConstruction}
                    onChange={(e) => setEditMaterialConstruction(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-2 font-bold text-slate-800 text-xs"
                  >
                    {activeMaterialConstructions.map((mc) => (
                      <option key={mc} value={mc}>{mc}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">طول (L):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="طول"
                    value={editBoxLength}
                    onChange={(e) => setEditBoxLength(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عرض (W):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="عرض"
                    value={editBoxWidth}
                    onChange={(e) => setEditBoxWidth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ارتفاع (H):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ارتفاع"
                    value={editBoxHeight}
                    onChange={(e) => setEditBoxHeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dieline Attachment in Edit Modal */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">پیوست فایل خط تیغ، قالب یا عکس جعبه:</label>
                <input
                  type="file"
                  id="edit-dieline-upload"
                  accept=".pdf,.ai,.eps,.cdr,.dxf,.svg,.jpg,.jpeg,.png,.zip"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
                {editDielineFileName ? (
                  <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl p-2.5">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-bold text-teal-950 truncate max-w-xs">{editDielineFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDielineFileName('');
                        setEditDielineFileUrl('');
                        setEditDielineFileSize('');
                      }}
                      className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="edit-dieline-upload"
                    className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:border-amber-500 text-slate-600 hover:text-amber-700 font-bold transition"
                  >
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>آپلود فایل خط تیغ / قالب جدید (PDF, AI, CDR, DXF, SVG, JPG, ZIP)</span>
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات تکمیلی:</label>
                <textarea
                  rows="2"
                  placeholder="توضیحات تکمیلی مشتری یا پاسخ به نقص اعلامی..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={updatingLead}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  {updatingLead ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>تکمیل مشخصات و ارسال مجدد جهت برآورد قیمت</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: COMMERCIAL REVISION REQUEST (اعلام نقص اطلاعات توسط مدیر بازرگانی) */}
      {revisionModalLead && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>اعلام نقص اطلاعات به بازاریاب ({revisionModalLead.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setRevisionModalLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl text-xs space-y-1 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری:</span>
                <strong className="text-slate-900">{revisionModalLead.customer_name} ({revisionModalLead.product_name})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">بازاریاب مربوطه:</span>
                <strong className="text-rose-800 font-bold">{revisionModalLead.marketer_name || 'کارشناس بازاریابی'}</strong>
              </div>
            </div>

            <form onSubmit={handleRequestRevision} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  شرح موارد نقص اطلاعات و درخواست اصلاح: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="مثال: لطفاً ابعاد دقیق عطف جعبه مشخص گردد و فایل خط تیغ با فرمت وکتور یا PDF پیوست شود..."
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalLead(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={requestingRevision}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  {requestingRevision ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>ثبت نقص و عودت به کارتابل بازاریاب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP LIVE FILE PREVIEW MODAL */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
