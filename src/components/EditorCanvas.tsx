import React from 'react';
import TiptapEditor from './TiptapEditor';
import type { Editor } from '@tiptap/core';

interface EditorCanvasProps {
  editorRef: React.MutableRefObject<Editor | null>;
  onEditorReady: (editor: Editor) => void;
  onEditorUpdate: () => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  editorRef,
  onEditorReady,
  onEditorUpdate,
}) => {
  return (
    <div className="editor-canvas">
      <div className="a4-paper">
        <TiptapEditor
          editorRef={editorRef}
          onEditorReady={onEditorReady}
          onEditorUpdate={onEditorUpdate}
        />
      </div>
    </div>
  );
};

export default EditorCanvas;
