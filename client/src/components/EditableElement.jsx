import React from 'react';
import { Edit3, Wand2 } from 'lucide-react';
import { useUiCustomizer } from '../context/CustomizerContext';

export default function EditableElement({
  keyId,
  defaultTitle = '',
  defaultSubtitle = '',
  description = '',
  category = 'general',
  className = '',
  children,
  renderMode = 'block', // 'block' | 'inline' | 'custom'
  showHandle = true,
  badge = null
}) {
  const { isEditMode, isAdmin, getElement, openInspector, activeInspector } = useUiCustomizer();
  const current = getElement(keyId, defaultTitle, defaultSubtitle);

  const isCurrentActive = activeInspector?.key === keyId;

  const handleOpenInspector = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    openInspector({
      key: keyId,
      title: current.title,
      subtitle: current.subtitle,
      description: description || current.description,
      category: category || current.category,
      defaultTitle,
      defaultSubtitle,
      raw: current.raw
    });
  };

  // If custom render function is passed as child
  if (typeof children === 'function') {
    return (
      <div 
        className={`relative ${isEditMode && isAdmin ? 'group outline-dashed outline-1 outline-cyan-400/80 hover:outline-pink-500 rounded-lg p-0.5 transition-all' : ''} ${className}`}
        onDoubleClick={isEditMode && isAdmin ? handleOpenInspector : undefined}
      >
        {isEditMode && isAdmin && showHandle && (
          <button
            type="button"
            onClick={handleOpenInspector}
            className="absolute -top-2.5 -left-2.5 z-30 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all bg-gradient-to-r from-pink-600 to-indigo-600 text-white rounded-full p-1 shadow-md flex items-center gap-1 px-1.5 text-[9px] font-black cursor-pointer"
            title={`ویرایش با المنتور: ${keyId}`}
          >
            <Edit3 className="w-2.5 h-2.5" />
            <span>ویرایش</span>
          </button>
        )}
        {children({ title: current.title, subtitle: current.subtitle, get: (field) => current[field] || '' })}
      </div>
    );
  }

  // If children are static JSX, wrap them with Elementor live edit capability
  if (children) {
    return (
      <div
        className={`relative ${
          isEditMode && isAdmin
            ? `group outline-dashed outline-1 ${isCurrentActive ? 'outline-pink-500 ring-2 ring-pink-500/20 bg-pink-500/5' : 'outline-cyan-400/80 hover:outline-pink-500 hover:bg-pink-500/5'} rounded-xl p-1 transition-all`
            : ''
        } ${className}`}
        onDoubleClick={isEditMode && isAdmin ? handleOpenInspector : undefined}
      >
        {isEditMode && isAdmin && showHandle && (
          <button
            type="button"
            onClick={handleOpenInspector}
            className="absolute -top-3 -left-2 z-30 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all bg-gradient-to-r from-[#92003B] via-[#6366f1] to-indigo-600 text-white rounded-full px-2 py-0.5 shadow-lg flex items-center gap-1 text-[10px] font-black cursor-pointer border border-white/30"
            title={`ویرایش زنده المان: ${keyId}`}
          >
            <Edit3 className="w-3 h-3 text-pink-200" />
            <span>ویرایش المنتور</span>
          </button>
        )}
        {children}
      </div>
    );
  }

  // Default block view: Title + Subtitle
  return (
    <div
      className={`relative ${
        isEditMode && isAdmin
          ? `group outline-dashed outline-1 ${isCurrentActive ? 'outline-pink-500 ring-2 ring-pink-500/20 bg-pink-500/5' : 'outline-cyan-400/80 hover:outline-pink-500 hover:bg-pink-500/5'} rounded-xl p-1 transition-all`
          : ''
      } ${className}`}
      onDoubleClick={isEditMode && isAdmin ? handleOpenInspector : undefined}
    >
      {isEditMode && isAdmin && showHandle && (
        <button
          type="button"
          onClick={handleOpenInspector}
          className="absolute -top-3 -left-2 z-30 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all bg-gradient-to-r from-[#92003B] via-[#6366f1] to-indigo-600 text-white rounded-full px-2 py-0.5 shadow-lg flex items-center gap-1 text-[10px] font-black cursor-pointer border border-white/30"
          title={`ویرایش زنده با المنتور: ${keyId}`}
        >
          <Edit3 className="w-3 h-3 text-pink-200" />
          <span>ویرایش</span>
        </button>
      )}

      <div>
        <div className="font-black tracking-tight">{current.title}</div>
        {current.subtitle && (
          <div className="text-xs opacity-80 mt-0.5 leading-relaxed">{current.subtitle}</div>
        )}
      </div>
    </div>
  );
}
