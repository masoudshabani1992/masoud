import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { showToast } from '../utils/helpers';
import { DEFAULT_SYSTEM_TITLES } from '../components/SystemCustomizerView';

const CustomizerContext = createContext(null);

export function CustomizerProvider({ children, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [isEditMode, setIsEditMode] = useState(false);
  const [uiElements, setUiElements] = useState(DEFAULT_SYSTEM_TITLES);
  const [activeInspector, setActiveInspector] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  // Load custom elements from server on mount
  const loadElements = useCallback(async () => {
    try {
      const res = await api.getUiTitles();
      if (res && res.success && res.titles && Object.keys(res.titles).length > 0) {
        setUiElements(prev => ({
          ...DEFAULT_SYSTEM_TITLES,
          ...prev,
          ...res.titles
        }));
      }
    } catch (e) {
      console.warn('Customizer: using local defaults fallback');
    }
  }, []);

  useEffect(() => {
    loadElements();
  }, [loadElements]);

  // Save element modification directly to SQLite database
  const saveElement = async (key, data) => {
    setSavingKey(key);
    try {
      const title = (data.title || '').trim();
      const subtitle = (data.subtitle !== undefined ? data.subtitle : '').trim();
      const description = data.description || '';
      const category = data.category || 'general';

      // Optimistic update in state
      setUiElements(prev => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          key,
          title,
          subtitle,
          description,
          category,
          updated_at: new Date().toISOString()
        }
      }));

      // Persist to server
      await api.updateUiTitle(key, { title, subtitle, description, category });
      
      showToast(`المان «${title || key}» با موفقیت ذخیره شد.`, { type: 'success' });
      setActiveInspector(null);
      return true;
    } catch (err) {
      showToast('خطا در ذخیره المان: ' + err.message, { type: 'error' });
      return false;
    } finally {
      setSavingKey(null);
    }
  };

  // Reset element to default
  const resetElement = async (key, defaultTitle, defaultSubtitle) => {
    const orig = DEFAULT_SYSTEM_TITLES[key] || {
      title: defaultTitle,
      subtitle: defaultSubtitle
    };

    return saveElement(key, {
      title: orig.default_title || orig.title || defaultTitle,
      subtitle: orig.default_subtitle !== undefined ? orig.default_subtitle : (orig.subtitle || defaultSubtitle),
      description: orig.description || ''
    });
  };

  // Helper function to get text with fallback
  const getElement = (key, fallbackTitle = '', fallbackSubtitle = '') => {
    const el = uiElements[key];
    return {
      title: el?.title || fallbackTitle,
      subtitle: el?.subtitle !== undefined ? el.subtitle : fallbackSubtitle,
      description: el?.description || '',
      category: el?.category || 'general',
      raw: el
    };
  };

  const openInspector = (elementConfig) => {
    setActiveInspector(elementConfig);
  };

  const closeInspector = () => {
    setActiveInspector(null);
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      setActiveInspector(null);
    }
  };

  return (
    <CustomizerContext.Provider
      value={{
        isAdmin,
        isEditMode,
        setIsEditMode,
        toggleEditMode,
        uiElements,
        getElement,
        saveElement,
        resetElement,
        activeInspector,
        openInspector,
        closeInspector,
        savingKey,
        reloadElements: loadElements
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
}

export function useUiCustomizer() {
  const context = useContext(CustomizerContext);
  if (!context) {
    // Graceful fallback if used outside Provider
    return {
      isAdmin: false,
      isEditMode: false,
      getElement: (key, fallbackTitle = '', fallbackSubtitle = '') => ({
        title: fallbackTitle,
        subtitle: fallbackSubtitle
      }),
      saveElement: async () => {},
      resetElement: async () => {},
      openInspector: () => {},
      closeInspector: () => {},
      toggleEditMode: () => {}
    };
  }
  return context;
}
