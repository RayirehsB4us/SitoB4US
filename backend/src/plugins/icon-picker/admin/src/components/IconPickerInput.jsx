import React, { useState, useRef, useEffect } from 'react';

const ICONS = [
  'apartment', 'arrow_forward', 'bluetooth', 'business_center',
  'calendar_today', 'check_circle', 'chevron_left', 'chevron_right',
  'close', 'code', 'directions_car', 'dns', 'error', 'fitness_center',
  'gps_fixed', 'groups', 'handshake', 'history', 'home', 'inventory_2',
  'lock', 'lock_open', 'logout', 'meeting_room', 'people', 'person',
  'place', 'priority_high', 'schedule', 'school', 'search', 'share',
  'smartphone', 'star', 'sync', 'verified_user', 'vpn_key', 'wifi_off',
  'wifi_tethering', 'workspace_premium',
];

// Inject Material Icons font
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
  const containerRef = useRef(null);

  useEffect(() => {
    loadMaterialIconsFont();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredIcons = ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (iconName) => {
    onChange({ target: { name, value: iconName, type: attribute.type } });
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: null, type: attribute.type } });
  };

  // Styles
  const fieldWrapper = {
    marginBottom: '1rem',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  };

  const labelTextStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#32324d',
    lineHeight: 1.33,
    textTransform: 'capitalize',
  };

  const triggerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    border: error ? '1px solid #ee5e52' : '1px solid #dcdce4',
    borderRadius: '4px',
    backgroundColor: disabled ? '#f6f6f9' : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minHeight: '40px',
    transition: 'border-color 0.2s',
  };

  const triggerHoverStyle = {
    borderColor: '#7b79ff',
  };

  const selectedIconStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const materialIconStyle = {
    fontFamily: 'Material Icons',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: '20px',
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

  const iconLabelStyle = {
    fontSize: '0.875rem',
    color: '#32324d',
  };

  const placeholderStyle = {
    fontSize: '0.875rem',
    color: '#a5a5ba',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #dcdce4',
    borderRadius: '4px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
    zIndex: 100,
    maxHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
  };

  const searchInputStyle = {
    padding: '8px 12px',
    border: 'none',
    borderBottom: '1px solid #dcdce4',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '2px',
    padding: '8px',
    overflowY: 'auto',
    maxHeight: '260px',
  };

  const gridItemStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#f0f0ff' : 'transparent',
    border: isSelected ? '1px solid #7b79ff' : '1px solid transparent',
    transition: 'background-color 0.15s, border-color 0.15s',
  });

  const gridItemHoverBg = '#f6f6f9';

  const clearBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    color: '#a5a5ba',
    fontSize: '16px',
  };

  const chevronStyle = {
    ...materialIconStyle,
    fontSize: '18px',
    color: '#a5a5ba',
  };

  const hintStyle = {
    fontSize: '0.75rem',
    color: '#666687',
    marginTop: '4px',
    lineHeight: 1.33,
  };

  const errorStyle = {
    fontSize: '0.75rem',
    color: '#ee5e52',
    marginTop: '4px',
    lineHeight: 1.33,
  };

  return (
    <div style={fieldWrapper} ref={containerRef}>
      {/* Label */}
      <div style={labelStyle}>
        <label style={labelTextStyle}>
          {label || name}
          {required && <span style={{ color: '#ee5e52' }}> *</span>}
        </label>
        {labelAction && labelAction}
      </div>

      {/* Trigger */}
      <div style={{ position: 'relative' }}>
        <div
          style={triggerStyle}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.borderColor = '#7b79ff';
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isOpen)
              e.currentTarget.style.borderColor = error ? '#ee5e52' : '#dcdce4';
          }}
        >
          {value ? (
            <div style={selectedIconStyle}>
              <span style={materialIconStyle}>{value}</span>
              <span style={iconLabelStyle}>{value}</span>
            </div>
          ) : (
            <span style={placeholderStyle}>Seleziona icona...</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {value && !disabled && (
              <button
                type="button"
                style={clearBtnStyle}
                onClick={handleClear}
                title="Rimuovi selezione"
              >
                <span style={{ ...materialIconStyle, fontSize: '16px', color: '#a5a5ba' }}>
                  close
                </span>
              </button>
            )}
            <span style={chevronStyle}>
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div style={dropdownStyle}>
            <input
              type="text"
              placeholder="Cerca icona..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInputStyle}
              autoFocus
            />
            <div style={gridStyle}>
              {filteredIcons.length === 0 ? (
                <div style={{ padding: '16px', color: '#a5a5ba', gridColumn: '1 / -1', textAlign: 'center' }}>
                  Nessuna icona trovata
                </div>
              ) : (
                filteredIcons.map((icon) => (
                  <div
                    key={icon}
                    style={gridItemStyle(value === icon)}
                    onClick={() => handleSelect(icon)}
                    onMouseEnter={(e) => {
                      if (value !== icon)
                        e.currentTarget.style.backgroundColor = gridItemHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (value !== icon)
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ ...materialIconStyle, fontSize: '22px' }}>{icon}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666687' }}>{icon}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {hint && <div style={hintStyle}>{hint}</div>}

      {/* Error */}
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
};

export default IconPickerInput;
