function Toolbar({ viewMode, setViewMode, onOpen, onSave, onSaveAs, onPrint, onInsertCover }) {
  return (
    <div className="retro-toolbar">
      <button className="retro-toolbar-btn" onClick={onOpen} title="파일 열기 (Ctrl+O)">
        📂 열기
      </button>
      <button className="retro-toolbar-btn" onClick={onSave} title="저장 (Ctrl+S)">
        💾 저장
      </button>
      <button className="retro-toolbar-btn" onClick={onSaveAs} title="다른 이름으로 저장">
        📄 다른이름저장
      </button>
      <div className="w-px h-6 bg-gray-400 mx-2" />
      <button className="retro-toolbar-btn" onClick={onPrint} title="인쇄 (Ctrl+P)">
        🖨️ 인쇄
      </button>
      <div className="w-px h-6 bg-gray-400 mx-2" />
      <button className="retro-toolbar-btn" onClick={onInsertCover} title="커버 페이지 삽입">
        📑 커버페이지
      </button>
      <div className="w-px h-6 bg-gray-400 mx-2" />
      <button
        className={`retro-toolbar-btn ${viewMode === 'editor' ? 'active' : ''}`}
        onClick={() => setViewMode('editor')}
      >
        ✏️ 편집
      </button>
      <button
        className={`retro-toolbar-btn ${viewMode === 'split' ? 'active' : ''}`}
        onClick={() => setViewMode('split')}
      >
        📐 분할
      </button>
      <button
        className={`retro-toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`}
        onClick={() => setViewMode('preview')}
      >
        👁️ 미리보기
      </button>
    </div>
  )
}

export default Toolbar
