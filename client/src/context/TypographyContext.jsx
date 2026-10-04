import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { showToast } from '../utils/helpers';

const TypographyContext = createContext(null);

export const DEFAULT_TYPOGRAPHY = {
  body_font_family: 'Vazirmatn',
  heading_font_family: 'Vazirmatn',
  numbers_font_family: 'Vazirmatn',
  font_scale: 100, // percentage: 80% to 140%
  base_font_size: 14, // px
  body_font_weight: '500',
  heading_font_weight: '800',
  line_height: 1.6,
  letter_spacing: 0,
  custom_css: ''
};

// Font family display name mappings & fallback chains
export const FONT_FALLBACKS = {
  'Vazirmatn': "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'IRANSans': "'IRANSans', 'IRANSansX', 'Vazirmatn', sans-serif",
  'IRANYekan': "'IRANYekan', 'IRANYekanX', 'Vazirmatn', sans-serif",
  'Yekan Bakh': "'Yekan Bakh', 'YekanBakh', 'Vazirmatn', sans-serif",
  'Shabnam': "'Shabnam', 'Vazirmatn', sans-serif",
  'Sahel': "'Sahel', 'Vazirmatn', sans-serif",
  'Samim': "'Samim', 'Vazirmatn', sans-serif",
  'Dana': "'Dana', 'Dana-VF', 'Vazirmatn', sans-serif",
  'Tanha': "'Tanha', 'Vazirmatn', sans-serif",
  'Estedad': "'Estedad', 'Estedad-VF', 'Vazirmatn', sans-serif",
  'Pinar': "'Pinar', 'Pinar-VF', 'Vazirmatn', sans-serif",
  'Parastoo': "'Parastoo', 'Vazirmatn', sans-serif",
  'Traffic': "'B Traffic', 'Traffic', 'Vazirmatn', sans-serif",
  'Titr': "'B Titr', 'Titr', 'Vazirmatn', sans-serif",
  'Tahoma': "Tahoma, 'Segoe UI', Arial, sans-serif",
  'Vazir Code': "'Vazir Code', 'VazirCode', monospace, 'Courier New', sans-serif"
};

export const FONT_SIZE_PRESETS = [
  { id: 'compact', label: 'بسیار ریز (Compact)', scale: 88, basePx: 12.5, desc: 'حداکثر نمایش داده‌ها در صفحات عریض' },
  { id: 'small', label: 'کوچک (Small)', scale: 94, basePx: 13.2, desc: 'فشرده و استاندارد مانیتورهای کوچک' },
  { id: 'normal', label: 'استاندارد (Normal)', scale: 100, basePx: 14, desc: 'پیش‌فرض کارخانه - بالانس بهینه وضوح' },
  { id: 'large', label: 'خوانا / بزرگ (Large)', scale: 108, basePx: 15.2, desc: 'خوانایی بالا و مطالعه آسان متون' },
  { id: 'xlarge', label: 'خیلی بزرگ (Extra Large)', scale: 118, basePx: 16.5, desc: 'مناسب مانیتورهای دور و خستگی چشم' },
  { id: 'industrial', label: 'درشت کارگاهی (Industrial)', scale: 128, basePx: 18, desc: 'ویژه تبلت و تاچ‌اسکرین سالن تولید' }
];

export function TypographyProvider({ children, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';

  // Load initial from localStorage cache for 0ms instant render
  const [typography, setTypography] = useState(() => {
    try {
      const cached = localStorage.getItem('box_factory_typography');
      if (cached) {
        return { ...DEFAULT_TYPOGRAPHY, ...JSON.parse(cached) };
      }
    } catch (e) {}
    return DEFAULT_TYPOGRAPHY;
  });

  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Apply typography CSS variables & dynamic font faces to document root
  const applyTypographyStyles = useCallback((config, customFontsList = []) => {
    if (!config) return;

    const root = document.documentElement;
    const scale = Number(config.font_scale || 100) / 100;
    const basePx = Number(config.base_font_size || 14);
    const lineHeight = Number(config.line_height || 1.6);
    const letterSpacing = Number(config.letter_spacing || 0);

    const bodyFamily = FONT_FALLBACKS[config.body_font_family] || `'${config.body_font_family}', 'Vazirmatn', sans-serif`;
    const headingFamily = FONT_FALLBACKS[config.heading_font_family] || (config.heading_font_family ? `'${config.heading_font_family}', ${bodyFamily}` : bodyFamily);
    const numbersFamily = FONT_FALLBACKS[config.numbers_font_family] || (config.numbers_font_family ? `'${config.numbers_font_family}', ${bodyFamily}` : bodyFamily);

    // 1. Set CSS Custom Properties on :root
    root.style.setProperty('--system-font-family', bodyFamily);
    root.style.setProperty('--system-heading-font-family', headingFamily);
    root.style.setProperty('--system-numbers-font-family', numbersFamily);
    root.style.setProperty('--system-font-scale', String(scale));
    root.style.setProperty('--system-font-size-base', `${basePx * scale}px`);
    root.style.setProperty('--system-line-height-scale', String(lineHeight));
    root.style.setProperty('--system-letter-spacing', `${letterSpacing}px`);
    root.style.setProperty('--system-body-weight', String(config.body_font_weight || '500'));
    root.style.setProperty('--system-heading-weight', String(config.heading_font_weight || '800'));

    // Proportionally scale root html font-size so all Tailwind rem-based utility classes scale seamlessly!
    root.style.fontSize = `${16 * scale}px`;

    // 2. Generate and inject @font-face rules for custom uploaded fonts
    let dynamicStyleEl = document.getElementById('system-custom-fonts-dynamic-style');
    if (!dynamicStyleEl) {
      dynamicStyleEl = document.createElement('style');
      dynamicStyleEl.id = 'system-custom-fonts-dynamic-style';
      document.head.appendChild(dynamicStyleEl);
    }

    let cssRules = '';
    const activeFonts = customFontsList.length > 0 ? customFontsList : fonts;

    activeFonts.forEach((f) => {
      if (f.is_custom && f.file_url) {
        let formatStr = 'woff2';
        if (f.format === 'ttf') formatStr = 'truetype';
        else if (f.format === 'otf') formatStr = 'opentype';
        else if (f.format === 'woff') formatStr = 'woff';
        else if (f.format === 'woff2') formatStr = 'woff2';

        cssRules += `
          @font-face {
            font-family: '${f.font_family}';
            src: url('${f.file_url}') format('${formatStr}');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
      }
    });

    if (config.custom_css) {
      cssRules += `\n/* User Custom Typography CSS */\n${config.custom_css}\n`;
    }

    dynamicStyleEl.textContent = cssRules;

    // Cache in localStorage
    try {
      localStorage.setItem('box_factory_typography', JSON.stringify(config));
    } catch (e) {}
  }, [fonts]);

  // Load typography and fonts from server on mount
  const loadTypographyData = useCallback(async () => {
    setLoading(true);
    try {
      const [typoRes, fontsRes] = await Promise.all([
        api.getTypography().catch(() => null),
        api.getFonts().catch(() => null)
      ]);

      let currentTypo = DEFAULT_TYPOGRAPHY;
      if (typoRes && typoRes.success && typoRes.typography) {
        currentTypo = { ...DEFAULT_TYPOGRAPHY, ...typoRes.typography };
        setTypography(currentTypo);
      }

      let fontsList = [];
      if (fontsRes && fontsRes.success && Array.isArray(fontsRes.fonts)) {
        fontsList = fontsRes.fonts;
        setFonts(fontsList);
      }

      applyTypographyStyles(currentTypo, fontsList);
    } catch (err) {
      console.warn('TypographyProvider: fallback to local defaults', err);
    } finally {
      setLoading(false);
    }
  }, [applyTypographyStyles]);

  useEffect(() => {
    loadTypographyData();
  }, [loadTypographyData]);

  // Quick live preview without saving
  const previewTypography = (previewConfig) => {
    const merged = { ...typography, ...previewConfig };
    applyTypographyStyles(merged);
  };

  // Revert preview to current active
  const cancelPreview = () => {
    applyTypographyStyles(typography);
  };

  // Save typography configuration permanently to backend SQLite
  const saveTypography = async (newConfig) => {
    setSaving(true);
    try {
      const payload = { ...typography, ...newConfig };
      const res = await api.updateTypography(payload);
      
      if (res && res.success) {
        const updated = res.typography || payload;
        setTypography(updated);
        applyTypographyStyles(updated);
        showToast(res.message || 'تنظیمات فونت و اندازه قلم با موفقیت اعمال شد.', { type: 'success' });
        return true;
      }
      return false;
    } catch (err) {
      showToast('خطا در ذخیره تنظیمات تایپوگرافی: ' + (err.message || 'نامشخص'), { type: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Reset typography to factory defaults
  const resetTypography = async () => {
    setSaving(true);
    try {
      const res = await api.resetTypography();
      if (res && res.success) {
        const defaults = res.typography || DEFAULT_TYPOGRAPHY;
        setTypography(defaults);
        applyTypographyStyles(defaults);
        showToast('فونت و اندازه قلم به حالت پیش‌فرض کارخانه بازنشانی شد.', { type: 'success' });
        return true;
      }
      return false;
    } catch (err) {
      showToast('خطا در بازنشانی فونت: ' + err.message, { type: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Upload new custom font file
  const uploadCustomFont = async (formData) => {
    setSaving(true);
    try {
      const res = await api.uploadFont(formData);
      if (res && res.success) {
        showToast(res.message || 'فونت جدید با موفقیت اضافه شد.', { type: 'success' });
        await loadTypographyData();
        return res.font;
      }
      return null;
    } catch (err) {
      showToast('خطا در آپلود فایل فونت: ' + (err.message || 'نامشخص'), { type: 'error' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Delete custom font
  const deleteCustomFont = async (fontId) => {
    try {
      const res = await api.deleteFont(fontId);
      if (res && res.success) {
        showToast(res.message || 'فونت با موفقیت حذف شد.', { type: 'success' });
        await loadTypographyData();
        return true;
      }
      return false;
    } catch (err) {
      showToast('خطا در حذف فونت: ' + err.message, { type: 'error' });
      return false;
    }
  };

  const value = {
    typography,
    fonts,
    loading,
    saving,
    isAdmin,
    saveTypography,
    resetTypography,
    uploadCustomFont,
    deleteCustomFont,
    previewTypography,
    cancelPreview,
    reload: loadTypographyData
  };

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
}

export function useTypography() {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }
  return context;
}
