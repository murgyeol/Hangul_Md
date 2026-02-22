import React, { useCallback } from 'react';
import type { Editor } from '@tiptap/core';

interface ToolbarProps {
  editorRef: React.MutableRefObject<Editor | null>;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onPrint: () => void;
  onInsertCover: () => void;
  onInsertPageBreak: () => void;
}

// Simple SVG-like button icons using text/unicode
const ToolbarButton: React.FC<{
  label: string;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}> = ({ label, title, onClick, isActive }) => (
  <button
    className={`toolbar-btn ${isActive ? 'active' : ''}`}
    title={title}
    onClick={onClick}
    type="button"
  >
    <span className="btn-text" style={{ fontSize: label.length > 2 ? '7px' : '12px', lineHeight: 1 }}>
      {label}
    </span>
  </button>
);

const Divider: React.FC = () => <div className="toolbar-divider" />;

const Toolbar: React.FC<ToolbarProps> = ({
  editorRef,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onPrint,
  onInsertCover,
  onInsertPageBreak,
}) => {
  const cmd = useCallback(
    (action: (editor: Editor) => void) => {
      const editor = editorRef.current;
      if (editor) action(editor);
    },
    [editorRef]
  );

  const isActive = useCallback(
    (name: string, attrs?: Record<string, any>): boolean => {
      const editor = editorRef.current;
      if (!editor) return false;
      return editor.isActive(name, attrs);
    },
    [editorRef]
  );

  return (
    <div className="toolbar">
      {/* File Group */}
      <div className="toolbar-group">
        <ToolbarButton label="New" title="New (Ctrl+N)" onClick={onNew} />
        <ToolbarButton label="Open" title="Open (Ctrl+O)" onClick={onOpen} />
        <ToolbarButton label="Save" title="Save (Ctrl+S)" onClick={onSave} />
        <ToolbarButton label="S.As" title="Save As (Ctrl+Shift+S)" onClick={onSaveAs} />
      </div>

      <Divider />

      {/* History Group */}
      <div className="toolbar-group">
        <ToolbarButton
          label="&#8617;"
          title="Undo (Ctrl+Z)"
          onClick={() => cmd((e) => e.chain().focus().undo().run())}
        />
        <ToolbarButton
          label="&#8618;"
          title="Redo (Ctrl+Y)"
          onClick={() => cmd((e) => e.chain().focus().redo().run())}
        />
      </div>

      <Divider />

      {/* Format Group */}
      <div className="toolbar-group">
        <ToolbarButton
          label="B"
          title="Bold (Ctrl+B)"
          onClick={() => cmd((e) => e.chain().focus().toggleBold().run())}
          isActive={isActive('bold')}
        />
        <ToolbarButton
          label="I"
          title="Italic (Ctrl+I)"
          onClick={() => cmd((e) => e.chain().focus().toggleItalic().run())}
          isActive={isActive('italic')}
        />
        <ToolbarButton
          label="S"
          title="Strikethrough (Ctrl+Shift+X)"
          onClick={() => cmd((e) => e.chain().focus().toggleStrike().run())}
          isActive={isActive('strike')}
        />
        <ToolbarButton
          label="<>"
          title="Inline Code (Ctrl+E)"
          onClick={() => cmd((e) => e.chain().focus().toggleCode().run())}
          isActive={isActive('code')}
        />
      </div>

      <Divider />

      {/* Heading Group */}
      <div className="toolbar-group">
        <ToolbarButton
          label="H1"
          title="Heading 1 (Ctrl+Shift+1)"
          onClick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 1 }).run())}
          isActive={isActive('heading', { level: 1 })}
        />
        <ToolbarButton
          label="H2"
          title="Heading 2 (Ctrl+Shift+2)"
          onClick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 2 }).run())}
          isActive={isActive('heading', { level: 2 })}
        />
        <ToolbarButton
          label="H3"
          title="Heading 3 (Ctrl+Shift+3)"
          onClick={() => cmd((e) => e.chain().focus().toggleHeading({ level: 3 }).run())}
          isActive={isActive('heading', { level: 3 })}
        />
      </div>

      <Divider />

      {/* Block Group */}
      <div className="toolbar-group">
        <ToolbarButton
          label="&#8226;"
          title="Bullet List (Ctrl+Shift+8)"
          onClick={() => cmd((e) => e.chain().focus().toggleBulletList().run())}
          isActive={isActive('bulletList')}
        />
        <ToolbarButton
          label="1."
          title="Ordered List (Ctrl+Shift+9)"
          onClick={() => cmd((e) => e.chain().focus().toggleOrderedList().run())}
          isActive={isActive('orderedList')}
        />
        <ToolbarButton
          label="&#10077;"
          title="Blockquote (Ctrl+Shift+B)"
          onClick={() => cmd((e) => e.chain().focus().toggleBlockquote().run())}
          isActive={isActive('blockquote')}
        />
        <ToolbarButton
          label="{..}"
          title="Code Block"
          onClick={() => cmd((e) => e.chain().focus().toggleCodeBlock().run())}
          isActive={isActive('codeBlock')}
        />
      </div>

      <Divider />

      {/* Insert Group */}
      <div className="toolbar-group">
        <ToolbarButton
          label="TBL"
          title="Insert Table"
          onClick={() =>
            cmd((e) =>
              e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            )
          }
        />
        <ToolbarButton
          label="&#9473;"
          title="Page Break (페이지 나눔)"
          onClick={onInsertPageBreak}
        />
        <ToolbarButton
          label="CVR"
          title="Cover Page"
          onClick={onInsertCover}
        />
      </div>

      <Divider />

      {/* Output Group */}
      <div className="toolbar-group">
        <ToolbarButton
          label="PRN"
          title="Print / PDF (Ctrl+P)"
          onClick={onPrint}
        />
      </div>
    </div>
  );
};

export default Toolbar;
