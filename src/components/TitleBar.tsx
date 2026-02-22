import React from 'react';
import { minimizeWindow, maximizeWindow, closeWindow } from '../utils/tauriCommands';

interface TitleBarProps {
  fileName: string;
  isDirty: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({ fileName, isDirty }) => {
  const title = `${fileName}${isDirty ? ' \u2022' : ''} \u2014 \uD55C\uAE00MD 1.0`;

  return (
    <div className="titlebar">
      <div className="flex items-center gap-2 pl-2">
        <span className="text-xs font-bold tracking-wide" style={{ fontFamily: 'monospace' }}>
          HMD
        </span>
        <span className="text-xs truncate max-w-[500px]">{title}</span>
      </div>
      <div className="titlebar-controls">
        <button
          className="titlebar-btn"
          onClick={minimizeWindow}
          title="Minimize"
        >
          &#x2500;
        </button>
        <button
          className="titlebar-btn"
          onClick={maximizeWindow}
          title="Maximize"
        >
          &#x25A1;
        </button>
        <button
          className="titlebar-btn close"
          onClick={closeWindow}
          title="Close"
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
