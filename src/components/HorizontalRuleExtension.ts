/**
 * Custom HorizontalRule Extension -- Rule A
 *
 * Every HR in HangeulMD is a page break.
 * Rendered with class="page-break-node" for both screen styling and print splitting.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

export const HorizontalRule = Node.create({
  name: 'horizontalRule',

  group: 'block',

  parseHTML() {
    return [{ tag: 'hr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'hr',
      mergeAttributes(HTMLAttributes, {
        class: 'page-break-node',
      }),
    ];
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name })
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                const { $to } = tr.selection;
                const posAfter = $to.end();

                if ($to.nodeAfter) {
                  tr.setSelection(
                    TextSelection.create(tr.doc, posAfter)
                  );
                } else {
                  const node =
                    $to.parent.type.contentMatch.defaultType?.create();
                  if (node) {
                    tr.insert(posAfter, node);
                    tr.setSelection(
                      TextSelection.create(tr.doc, posAfter + 1)
                    );
                  }
                }
                tr.scrollIntoView();
              }
              return true;
            })
            .run();
        },
    };
  },

  addInputRules() {
    return [];
  },

  addKeyboardShortcuts() {
    return {};
  },
});
