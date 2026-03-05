import { EMOJI_SHORTCUTS } from '@/components/editor/defaultEmojis'

const MAX_SHORTCUT_LEN = Math.max(...EMOJI_SHORTCUTS.map(([s]) => s.length))

/**
 * The Quill instance.
 * @returns The Quill instance.
 */
type Quill = {
  getSelection: (focus?: boolean) => { index: number; length: number } | null
  getText: () => string
  deleteText: (index: number, length: number, source?: string) => void
  insertText: (index: number, text: string, source?: string) => void
  setSelection: (index: number, length?: number, source?: string) => void
  on: (event: string, handler: (...args: unknown[]) => void) => void
}

/**
 * Registers the emoji shortcuts module with Quill.
 * When the user types a shortcut (e.g. :D, :), <3), it is replaced by the corresponding emoji.
 * Must be called before creating any Quill editor (e.g. when loading react-quill-new).
 */
export function registerEmojiShortcuts(Quill: {
  register: (name: string, fn: (quill: Quill, options: unknown) => void) => void
}) {
  Quill.register(
    'modules/emojiShortcuts',
    function emojiShortcutsModule(quill: Quill, _options: unknown) {
      quill.on('text-change', (_delta, _oldDelta, source) => {
        if (source !== 'user') return

        const sel = quill.getSelection(true)
        if (!sel) return

        const index = sel.index
        const fullText = quill.getText()
        const start = Math.max(0, index - MAX_SHORTCUT_LEN)
        const textBefore = fullText.slice(start, index)

        for (const [shortcut, emoji] of EMOJI_SHORTCUTS) {
          if (!textBefore.endsWith(shortcut)) continue

          const replaceAt = index - shortcut.length
          quill.deleteText(replaceAt, shortcut.length, 'silent')
          quill.insertText(replaceAt, emoji, 'silent')
          quill.setSelection(replaceAt + emoji.length, 0, 'silent')
          return
        }
      })
    },
  )
}
