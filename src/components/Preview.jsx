import { useState } from 'react'
import { markdownToHtml } from '../utils/markdown'

function Preview({ markdown, printSettings, setPrintSettings }) {
  const [showSettings, setShowSettings] = useState(false)

  const html = markdownToHtml(markdown)

  return (
    <div className="preview-pane">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-300">
        <span className="text-sm font-bold text-gray-700">미리보기</span>
        <button
          className="retro-toolbar-btn text-xs"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ 인쇄설정
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showHeader"
              checked={printSettings.showHeader}
              onChange={(e) => setPrintSettings(prev => ({ ...prev, showHeader: e.target.checked }))}
            />
            <label htmlFor="showHeader">헤더 표시</label>
            <input
              type="text"
              className="flex-1 border border-gray-300 px-2 py-1 text-xs"
              placeholder="헤더 내용 ({page}, {pages} 사용 가능)"
              value={printSettings.header}
              onChange={(e) => setPrintSettings(prev => ({ ...prev, header: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFooter"
              checked={printSettings.showFooter}
              onChange={(e) => setPrintSettings(prev => ({ ...prev, showFooter: e.target.checked }))}
            />
            <label htmlFor="showFooter">푸터 표시</label>
            <input
              type="text"
              className="flex-1 border border-gray-300 px-2 py-1 text-xs"
              placeholder="푸터 내용 ({page}, {pages} 사용 가능)"
              value={printSettings.footer}
              onChange={(e) => setPrintSettings(prev => ({ ...prev, footer: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <label>글꼴 크기:</label>
            <input
              type="number"
              className="w-16 border border-gray-300 px-2 py-1 text-xs"
              value={printSettings.fontSize}
              onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 14 }))}
              min={8}
              max={24}
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>
      )}

      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export default Preview
