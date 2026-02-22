import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import { common, createLowlight } from 'lowlight';
import { HorizontalRule as PageBreakRule } from './HorizontalRuleExtension';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  editorRef: React.MutableRefObject<Editor | null>;
  onEditorReady: (editor: Editor) => void;
  onEditorUpdate: () => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  editorRef,
  onEditorReady,
  onEditorUpdate,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      PageBreakRule,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'llm-image',
        },
      }),
      Markdown.configure({
        html: false,
        transformPastedText: false,
      }),
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const internalMarker = clipboardData.getData('application/x-hangeulmd');
        if (internalMarker) {
          return false;
        }

        const plainText = clipboardData.getData('text/plain');
        if (plainText) {
          event.preventDefault();
          const ed = editorRef.current;
          if (ed) {
            try {
              if (ed.storage.markdown?.parser?.parse) {
                const html = ed.storage.markdown.parser.parse(plainText);
                ed.commands.insertContent(html, {
                  parseOptions: { preserveWhitespace: false },
                });
              } else {
                ed.commands.insertContent(plainText);
              }
            } catch {
              ed.commands.insertContent(plainText);
            }
          }
          return true;
        }

        return false;
      },
      handleDOMEvents: {
        copy: (_view, event) => {
          const clipboardEvent = event as ClipboardEvent;
          if (clipboardEvent.clipboardData) {
            try {
              clipboardEvent.clipboardData.setData('application/x-hangeulmd', '1');
            } catch {
              // MIME write failure: acceptable degradation (section 2.6)
            }
          }
          return false;
        },
        cut: (_view, event) => {
          const clipboardEvent = event as ClipboardEvent;
          if (clipboardEvent.clipboardData) {
            try {
              clipboardEvent.clipboardData.setData('application/x-hangeulmd', '1');
            } catch {
              // MIME write failure: acceptable degradation
            }
          }
          return false;
        },
      },
    },
    onUpdate: () => {
      onEditorUpdate();
    },
  });

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
      onEditorReady(editor);
    }
  }, [editor, editorRef, onEditorReady]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
