import React, { useCallback } from 'react';
import { PrintSettings } from '../utils/types';

interface HeaderFooterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  settings: PrintSettings;
  onChange: (settings: PrintSettings) => void;
}

const HeaderFooterPanel: React.FC<HeaderFooterPanelProps> = ({
  isOpen,
  onToggle,
  settings,
  onChange,
}) => {
  const update = useCallback(
    (field: keyof PrintSettings, value: string | boolean) => {
      onChange({ ...settings, [field]: value });
    },
    [settings, onChange]
  );

  return (
    <div className="hf-panel">
      <div className="hf-panel-toggle" onClick={onToggle}>
        <span>{isOpen ? '\u25BC' : '\u25B6'}</span>
        <span>Header / Footer Settings</span>
        <span style={{ fontSize: '10px', color: '#888', marginLeft: 8 }}>
          {'{page}'} = current page, {'{pages}'} = total pages
        </span>
      </div>

      {isOpen && (
        <>
          <div className="hf-panel-grid">
            {/* Header row labels */}
            <label></label>
            <label style={{ textAlign: 'center', fontSize: '10px' }}>Left</label>
            <label style={{ textAlign: 'center', fontSize: '10px' }}>Center</label>
            <label style={{ textAlign: 'center', fontSize: '10px' }}>Right</label>

            {/* Header row */}
            <label>Header</label>
            <input
              type="text"
              value={settings.headerLeft}
              onChange={(e) => update('headerLeft', e.target.value)}
              placeholder="Left header"
            />
            <input
              type="text"
              value={settings.headerCenter}
              onChange={(e) => update('headerCenter', e.target.value)}
              placeholder="Center header"
            />
            <input
              type="text"
              value={settings.headerRight}
              onChange={(e) => update('headerRight', e.target.value)}
              placeholder="Right header"
            />

            {/* Footer row */}
            <label>Footer</label>
            <input
              type="text"
              value={settings.footerLeft}
              onChange={(e) => update('footerLeft', e.target.value)}
              placeholder="Left footer"
            />
            <input
              type="text"
              value={settings.footerCenter}
              onChange={(e) => update('footerCenter', e.target.value)}
              placeholder="Center footer"
            />
            <input
              type="text"
              value={settings.footerRight}
              onChange={(e) => update('footerRight', e.target.value)}
              placeholder="Right footer (e.g., {page} / {pages})"
            />
          </div>

          <div className="hf-checkbox-row">
            <input
              type="checkbox"
              id="excludeFirstPage"
              checked={settings.excludeFirstPage}
              onChange={(e) => update('excludeFirstPage', e.target.checked)}
            />
            <label htmlFor="excludeFirstPage">
              Exclude header/footer on first page (cover page)
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderFooterPanel;
