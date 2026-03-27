import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MATERIAL_ICONS } from './materialIcons.js';

// Google Material Icons font
const FONT_URL = 'https://fonts.googleapis.com/icon?family=Material+Icons';
let fontLoaded = false;

function loadMaterialIconsFont() {
  if (fontLoaded) return;
  if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
  }
  fontLoaded = true;
}

const IconPickerInput = ({
  name,
  value,
  onChange,
  attribute,
  disabled,
  error,
  required,
  label,
  hint,
  labelAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    loadMaterialIconsFont();
  }, []);

  // Calcola posizione dropdown
  const updateDropdownPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 420;

    setDropdownPos({
      top: spaceBelow >= dropdownHeight ? rect.bottom + 2 : rect.top - dropdownHeight - 2,
      left: rect.left,
      width: Math.max(rect.width, 360),
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPos();
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    }
  }, [isOpen, updateDropdownPos]);

  // Riposiziona su scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updateDropdownPos();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isOpen, updateDropdownPos]);

  // Chiudi su click fuori
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Chiudi su Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return MATERIAL_ICONS;
    const q = search.toLowerCase().replace(/\s+/g, '_');
    return MATERIAL_ICONS.filter((icon) => icon.includes(q));
  }, [search]);

  // Max 300 per performance
  const displayIcons = filteredIcons.slice(0, 300);

  const handleSelect = (iconName) => {
    onChange({ target: { name, value: iconName, type: attribute.type } });
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: null, type: attribute.type } });
  };

  const materialIconStyle = {
    fontFamily: 'Material Icons',
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 1,
    letterSpacing: 'normal',
    textTransform: 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    direction: 'ltr',
    WebkitFontSmoothing: 'antialiased',
    color: '#32324d',
  };

  const dropdown = isOpen && createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        backgroundColor: '#ffffff',
        border: '1px solid #dcdce4',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 100000,
        maxHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #eaeaef', backgroundColor: '#fafafa' }}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Cerca icona... (es. home, lock, car, person)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #dcdce4',
            borderRadius: '4px',
            fontSize: '0.875rem',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#7b79ff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#dcdce4'; }}
        />
        <div style={{ fontSize: '0.7rem', color: '#a5a5ba', marginTop: '4px', paddingLeft: '2px' }}>
          {filteredIcons.length} icone{filteredIcons.length > 300 ? ' (prime 300 mostrate - affina la ricerca)' : ''}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
        gap: '4px',
        padding: '10px',
        overflowY: 'auto',
        flex: 1,
      }}>
        {displayIcons.length === 0 ? (
          <div style={{ padding: '24px', color: '#a5a5ba', gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.875rem' }}>
            Nessuna icona trovata
          </div>
        ) : (
          displayIcons.map((iconName) => {
            const isSelected = value === iconName;
            return (
              <div
                key={iconName}
                title={iconName}
                onClick={() => handleSelect(iconName)}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f0f0ff';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 2px 6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eeeeff' : 'transparent',
                  border: isSelected ? '2px solid #7b79ff' : '2px solid transparent',
                  transition: 'all 0.12s ease',
                  minHeight: '60px',
                }}
              >
                <span style={{ ...materialIconStyle, fontSize: '26px' }}>{iconName}</span>
                <span style={{
                  fontSize: '0.55rem',
                  color: '#666687',
                  marginTop: '3px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  paddingInline: '2px',
                }}>
                  {iconName}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#32324d', lineHeight: 1.33 }}>
          {label || name}
          {required && <span style={{ color: '#ee5e52' }}> *</span>}
        </label>
        {labelAction && labelAction}
      </div>

      {/* Trigger */}
      <div
        ref={triggerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: error ? '1px solid #ee5e52' : isOpen ? '1px solid #7b79ff' : '1px solid #dcdce4',
          borderRadius: '4px',
          backgroundColor: disabled ? '#f6f6f9' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '40px',
          transition: 'border-color 0.2s',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) e.currentTarget.style.borderColor = '#7b79ff';
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) e.currentTarget.style.borderColor = error ? '#ee5e52' : '#dcdce4';
        }}
      >
        {value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...materialIconStyle, fontSize: '20px' }}>{value}</span>
            <span style={{ fontSize: '0.875rem', color: '#32324d' }}>{value}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.875rem', color: '#a5a5ba' }}>Seleziona icona...</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {value && !disabled && (
            <button
              type="button"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px', display: 'flex', alignItems: 'center',
              }}
              onClick={handleClear}
              title="Rimuovi selezione"
            >
              <span style={{ ...materialIconStyle, fontSize: '16px', color: '#a5a5ba' }}>close</span>
            </button>
          )}
          <span style={{ ...materialIconStyle, fontSize: '18px', color: '#a5a5ba' }}>
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </div>

      {/* Dropdown via Portal */}
      {dropdown}

      {/* Hint */}
      {hint && <div style={{ fontSize: '0.75rem', color: '#666687', marginTop: '4px' }}>{hint}</div>}
      {/* Error */}
      {error && <div style={{ fontSize: '0.75rem', color: '#ee5e52', marginTop: '4px' }}>{error}</div>}
    </div>
  );
};

export default IconPickerInput;
