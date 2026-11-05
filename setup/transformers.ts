import { defineTransformersSetup } from '@slidev/types'

/**
 * A Monta slide is written one line per line. Markdown turns a single newline
 * into a space, and Vue's template compiler then collapses that space, so this
 * transformer makes the line breaks explicit (`<br>`) before parsing.
 *
 * `<br>` is used rather than the usual "two trailing spaces" because a line
 * that starts with a component (`<v-click>…`) is an HTML block to markdown-it,
 * where two trailing spaces would only produce a literal space.
 *
 * Structural Markdown, YAML frontmatter and code blocks are left alone.
 */

const FENCE = /^\s*(`{3,}|~{3,})/

const SKIP = [
  /^\s*#{1,6}(?:\s|$)/, // heading
  /^\s*>/, // blockquote
  /^\s*\|/, // table
  /^\s*::/, // slot / directive sugar
  /^\s*:{3,}/, // container
  /^\s*(?:[-*+]|\d+[.)])\s+/, // list item
  /^\s*-{3,}\s*$/, // slide separator and frontmatter fence
  /^\s*[\w-]+:\s/, // YAML frontmatter key
]

export default defineTransformersSetup(() => ({
  pre: [
    ({ s }) => {
      const source = s.toString()
      if (!source.includes('\n'))
        return

      let offset = 0
      let inFence = false

      for (const line of source.split('\n')) {
        const end = offset + line.length

        if (FENCE.test(line)) {
          inFence = !inFence
        }
        else if (
          !inFence
          && line.trim()
          && !SKIP.some(re => re.test(line))
          && !line.endsWith('\\')
          && !line.endsWith('<br>')
        ) {
          s.appendLeft(end, '<br>')
        }

        offset = end + 1
      }
    },
  ],
}))
