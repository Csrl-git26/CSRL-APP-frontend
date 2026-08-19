import React, { useState, useRef, useEffect } from 'react';

export default function MultiSelectDropdown({ options, selectedOptions, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAllFmt = (e) => {
    e.stopPropagation();
    const fmtOptions = options.filter(o => String(o).toUpperCase().startsWith('FMT'));
    const allFmtSelected = fmtOptions.length > 0 && fmtOptions.every(o => selectedOptions.includes(o));
    
    if (allFmtSelected) {
      onChange(selectedOptions.filter(o => !String(o).toUpperCase().startsWith('FMT')));
    } else {
      onChange([...new Set([...selectedOptions, ...fmtOptions])]);
    }
  };

  const toggleOption = (option, e) => {
    e.stopPropagation();
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter(o => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const displayText = selectedOptions.length === 0 ? "Select Tests" : 
         selectedOptions.length === 1 ? selectedOptions[0] : 
         `${selectedOptions.length} tests selected`;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        type="button"
        className="input select" 
        style={{ width: 170, fontSize: 13, textAlign: 'left', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayText}</span>
        <span style={{ fontSize: 10 }}>▼</span>
      </button>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: 220, background: '#fff', border: '1px solid var(--gray-300)', borderRadius: 6, zIndex: 9999, maxHeight: 300, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', cursor: 'pointer' }} onClick={handleSelectAllFmt}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={options.filter(o => String(o).toUpperCase().startsWith('FMT')).length > 0 && options.filter(o => String(o).toUpperCase().startsWith('FMT')).every(o => selectedOptions.includes(o))} 
                readOnly
              />
              <strong style={{ fontSize: 13 }}>All FMT Tests</strong>
            </label>
          </div>
          <div style={{ padding: '4px 0' }}>
            {options.map(col => (
              <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', cursor: 'pointer', margin: 0, fontSize: 13, color: '#333' }} onClick={(e) => toggleOption(col, e)}>
                <input 
                  type="checkbox" 
                  checked={selectedOptions.includes(col)} 
                  readOnly
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
