function Editor({ markdown, onChange }) {
  return (
    <div className="editor-pane">
      <textarea
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="여기에 Markdown을 입력하거나 붙여넣으세요..."
      />
    </div>
  )
}

export default Editor
