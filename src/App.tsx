import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import matter from 'gray-matter';
import TitleBar from './components/TitleBar';
import Toolbar from './components/Toolbar';
import EditorCanvas from './components/EditorCanvas';
import HeaderFooterPanel from './components/HeaderFooterPanel';
import {
  PrintSettings,
  DocumentState,
  DEFAULT_PRINT_SETTINGS,
  DEFAULT_FILE_NAME,
  isDefaultPrintSettings,
  printSettingsToYaml,
  yamlToPrintSettings,
} from './utils/types';
import { preparePrintDOM } from './utils/printUtils';
import {
  confirmUnsaved,
  openFile,
  saveFile,
  saveFileAs,
} from './utils/tauriCommands';

const DEFAULT_DOC_STATE: DocumentState = {
  filePath: null,
  savedContent: '',
  isDirty: false,
  fileName: DEFAULT_FILE_NAME,
  printSettings: { ...DEFAULT_PRINT_SETTINGS },
};

function App() {
  const [docState, setDocState] = useState<DocumentState>({ ...DEFAULT_DOC_STATE });
  const [hfPanelOpen, setHfPanelOpen] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const editorInitialized = useRef(false);

  // ===== Markdown Conversion Helpers =====
  const getMarkdownString = useCallback((editor: Editor): string => {
    if (typeof editor.storage.markdown?.getMarkdown === 'function') {
      return editor.storage.markdown.getMarkdown();
    }
    return editor.getHTML();
  }, []);

  const markdownToHtml = useCallback((editor: Editor, md: string): string => {
    if (typeof editor.storage.markdown?.parser?.parse === 'function') {
      return editor.storage.markdown.parser.parse(md);
    }
    return md;
  }, []);

  // ===== Editor Initialization =====
  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
    if (!editorInitialized.current) {
      const hasParser = typeof editor.storage.markdown?.parser?.parse === 'function';
      const hasGetMd = typeof editor.storage.markdown?.getMarkdown === 'function';
      console.log('[한글MD] tiptap-markdown parser:', hasParser ? 'available' : 'unavailable');
      console.log('[한글MD] tiptap-markdown getMarkdown:', hasGetMd ? 'available' : 'unavailable');
      console.log('[한글MD] Using', hasParser && hasGetMd ? 'PRIMARY' : 'FALLBACK', 'conversion path');
      editorInitialized.current = true;
    }
  }, []);

  // ===== Dirty Tracking =====
  const handleEditorUpdate = useCallback(() => {
    setDocState((prev: DocumentState) => {
      if (!prev.isDirty) {
        return { ...prev, isDirty: true };
      }
      return prev;
    });
  }, []);

  // ===== Serialize document: body MD + optional YAML front-matter =====
  const getCurrentContent = useCallback((): string => {
    const editor = editorRef.current;
    if (!editor) return '';
    const pureMd = getMarkdownString(editor);
    const settings = docState.printSettings;

    if (isDefaultPrintSettings(settings)) {
      return pureMd;
    }
    return matter.stringify(pureMd, printSettingsToYaml(settings));
  }, [docState.printSettings, getMarkdownString]);

  // ===== File Operations =====

  const handleSaveAs = useCallback(async (): Promise<boolean> => {
    const content = getCurrentContent();
    const newPath = await saveFileAs(content);

    if (newPath) {
      const fileName = newPath.split(/[\\/]/).pop() || DEFAULT_FILE_NAME;
      setDocState((prev: DocumentState) => ({
        ...prev,
        filePath: newPath,
        savedContent: content,
        isDirty: false,
        fileName,
      }));
      return true;
    }
    return false;
  }, [getCurrentContent]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const content = getCurrentContent();

    if (docState.filePath) {
      const ok = await saveFile(docState.filePath, content);
      if (ok) {
        setDocState((prev: DocumentState) => ({
          ...prev,
          savedContent: content,
          isDirty: false,
        }));
        return true;
      }
      return false;
    }

    return await handleSaveAs();
  }, [docState.filePath, getCurrentContent, handleSaveAs]);

  // ===== Unsaved Check =====
  const handleUnsavedCheck = useCallback(async (): Promise<boolean> => {
    if (!docState.isDirty) return true;
    const result = await confirmUnsaved(
      '변경사항이 저장되지 않았습니다. 저장하시겠습니까?'
    );
    if (result === 'cancel') return false;
    if (result === 'save') {
      return await handleSave();
    }
    return true; // discard
  }, [docState.isDirty, handleSave]);

  const handleNew = useCallback(async () => {
    const ok = await handleUnsavedCheck();
    if (!ok) return;

    const editor = editorRef.current;
    if (editor) {
      editor.commands.clearContent();
    }
    setDocState({
      ...DEFAULT_DOC_STATE,
      printSettings: { ...DEFAULT_PRINT_SETTINGS },
    });
  }, [handleUnsavedCheck]);

  const handleOpen = useCallback(async () => {
    const ok = await handleUnsavedCheck();
    if (!ok) return;

    const fileData = await openFile();
    if (!fileData) return;

    const editor = editorRef.current;
    if (!editor) return;

    // Parse front-matter with gray-matter
    const parsed = matter(fileData.content);
    const printSettings =
      parsed.data && Object.keys(parsed.data).length > 0
        ? yamlToPrintSettings(parsed.data)
        : { ...DEFAULT_PRINT_SETTINGS };

    const html = markdownToHtml(editor, parsed.content);
    editor.commands.setContent(html);

    const fileName = fileData.path.split(/[\\/]/).pop() || DEFAULT_FILE_NAME;

    setDocState({
      filePath: fileData.path,
      savedContent: fileData.content,
      isDirty: false,
      fileName,
      printSettings,
    });
  }, [handleUnsavedCheck, markdownToHtml]);

  // ===== Print =====
  const handlePrint = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.getHTML();
    preparePrintDOM(html, docState.printSettings);
  }, [docState.printSettings]);

  // ===== Print Settings =====
  const handlePrintSettingsChange = useCallback((settings: PrintSettings) => {
    setDocState((prev: DocumentState) => ({
      ...prev,
      printSettings: settings,
      isDirty: true,
    }));
  }, []);

  // ===== Cover Page =====
  const handleInsertCover = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const firstNode = editor.state.doc.firstChild;
    if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
      const text = firstNode.textContent;
      if (text === '제목을 입력하세요' || text.includes('제목')) {
        alert('커버 페이지가 이미 존재합니다.');
        return;
      }
    }

    editor.commands.focus('start');
    editor
      .chain()
      .insertContentAt(0, [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '제목을 입력하세요' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '작성자: 이름을 입력하세요' }] },
        { type: 'horizontalRule' },
      ])
      .run();
  }, []);

  // ===== Page Break =====
  const handleInsertPageBreak = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
  }, []);

  // ===== Window Close Protection =====
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (docState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [docState.isDirty]);

  // ===== Keyboard Shortcuts =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      const editor = editorRef.current;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          handleNew();
          break;
        case 'o':
          e.preventDefault();
          handleOpen();
          break;
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            handleSaveAs();
          } else {
            handleSave();
          }
          break;
        case 'p':
          e.preventDefault();
          handlePrint();
          break;
        case 'e':
          if (editor && !e.shiftKey) {
            e.preventDefault();
            editor.chain().focus().toggleCode().run();
          }
          break;
        case 'b':
          if (editor && e.shiftKey) {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }
          break;
      }

      // Handle Ctrl+Shift+Number shortcuts
      if (e.shiftKey && editor) {
        if (e.key === '!' || e.code === 'Digit1') {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        } else if (e.key === '@' || e.code === 'Digit2') {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        } else if (e.key === '#' || e.code === 'Digit3') {
          e.preventDefault();
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        } else if (e.key === '*' || e.code === 'Digit8') {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        } else if (e.key === '(' || e.code === 'Digit9') {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        } else if (e.key === 'X') {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNew, handleOpen, handleSave, handleSaveAs, handlePrint]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-app-bg">
      <TitleBar
        fileName={docState.fileName}
        isDirty={docState.isDirty}
      />
      <Toolbar
        editorRef={editorRef}
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onPrint={handlePrint}
        onInsertCover={handleInsertCover}
        onInsertPageBreak={handleInsertPageBreak}
      />
      <EditorCanvas
        editorRef={editorRef}
        onEditorReady={handleEditorReady}
        onEditorUpdate={handleEditorUpdate}
      />
      <HeaderFooterPanel
        isOpen={hfPanelOpen}
        onToggle={() => setHfPanelOpen(!hfPanelOpen)}
        settings={docState.printSettings}
        onChange={handlePrintSettingsChange}
      />
    </div>
  );
}

export default App;
