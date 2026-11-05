<script setup lang="ts">
import { onSlideEnter } from '@slidev/client'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  /** Largest size the text may grow to, in slide pixels. */
  max?: number
  /** Smallest size the text may shrink to, in slide pixels. */
  min?: number
}>(), {
  max: 200,
  min: 12,
})

/** Width of one character in the display font, in em. */
const CHAR_WIDTH = 0.98
/** `line-height` of `.monta-content`, in em. */
const LINE_HEIGHT = 1.35

const stageEl = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
/** False until the text has a fitted size worth showing. */
const ready = ref(false)

let frame = 0
let resizeObserver: ResizeObserver | undefined
let mutationObserver: MutationObserver | undefined
/** Fonts only arrive sometime after mount; until they do the metrics lie. */
let fontsSettled = false

function setSize(size: number) {
  if (contentEl.value)
    contentEl.value.style.fontSize = `${size}px`
}

/** True when the rendered text no longer fits the stage. */
function overflows(): boolean {
  const content = contentEl.value
  const stage = stageEl.value
  if (!content || !stage)
    return false
  return content.scrollHeight > stage.clientHeight
    || content.scrollWidth > stage.clientWidth + 1
}

/** The source lines of the slide, as the reader will see them. */
function sourceLines(): string[] {
  const content = contentEl.value
  if (!content)
    return []

  const lines: string[] = []
  let current = ''

  const walk = (node: Node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        current += child.textContent ?? ''
      }
      else if (child instanceof HTMLElement && child.tagName === 'BR') {
        lines.push(current.trim())
        current = ''
      }
      else {
        walk(child)
      }
    }
  }

  walk(content)
  lines.push(current.trim())
  return lines.filter(Boolean)
}

/**
 * Pick the font size for the slide.
 *
 * The size is estimated from the text itself — how many characters each source
 * line holds, and how many lines that takes at a given size — instead of being
 * read back from the rendered layout. Measuring the layout is more exact in
 * theory, but while a slide animates in (or a webfont swaps) the layout is
 * still moving, and a size fitted to a half-laid-out slide comes out wrong.
 *
 * Because the estimate only knows an average glyph width, the rendered result
 * is checked on the next frame and stepped down if it does not fit.
 */
function refit() {
  const content = contentEl.value
  const stage = stageEl.value
  // `display: none` slides (not on screen yet) measure as zero; leave them
  // alone until they are shown and `onSlideEnter` runs again.
  if (!content || !stage || !stage.clientWidth || !stage.clientHeight)
    return

  const lines = sourceLines()
  if (!lines.length)
    return

  const maxWidth = stage.clientWidth * 0.97
  const maxHeight = stage.clientHeight * 0.98

  /** Largest size satisfying `fits`, by binary search. */
  const largest = (fits: (size: number) => boolean) => {
    let low = props.min
    let high = props.max
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2)
      if (fits(mid))
        low = mid
      else
        high = mid
    }
    return low
  }

  // Wrapping allowed: a line may take several visual lines.
  const wrapped = largest((size) => {
    const perLine = Math.max(1, maxWidth / (CHAR_WIDTH * size))
    const taken = lines.reduce((count, line) => count + Math.max(1, Math.ceil(line.length / perLine)), 0)
    return taken * LINE_HEIGHT * size <= maxHeight
  })

  // Every source line kept whole, as written.
  const whole = largest(size => lines.length * LINE_HEIGHT * size <= maxHeight
    && lines.every(line => line.length * CHAR_WIDTH * size <= maxWidth))

  // Keeping lines whole is worth some size, but not a lot of it.
  const size = whole >= wrapped * 0.55 ? whole : wrapped

  setSize(size)
  verifyFit()

  if (fontsSettled)
    ready.value = true
}

/** Step down if the rendered text still overflows the estimate. */
function verifyFit(attempt = 0) {
  requestAnimationFrame(() => {
    const content = contentEl.value
    if (!content || attempt >= 4 || !overflows())
      return

    const size = Number.parseFloat(content.style.fontSize) || props.min
    setSize(Math.max(props.min, Math.floor(size * 0.94)))
    verifyFit(attempt + 1)
  })
}

function scheduleRefit() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(refit)
}

/**
 * Fit now, and again a moment later. While a slide animates in it is still
 * being scaled, so a fit taken right then can come out small.
 */
function scheduleRefitSoon() {
  refit()
  scheduleRefit()
  setTimeout(scheduleRefit, 250)
  setTimeout(scheduleRefit, 700)
}

/**
 * Fit once the webfont is actually in use. Fitting before that measures the
 * fallback font, picks a size that is a little too big, and the slide then
 * visibly jumps to the correct size when the font swaps in.
 */
async function fitWithFonts() {
  const content = contentEl.value
  const family = content
    ? getComputedStyle(content).fontFamily.split(',')[0].replace(/["']/g, '').trim()
    : ''

  try {
    await Promise.race([
      family ? document.fonts.load(`700 100px "${family}"`) : Promise.resolve(),
      // Never leave the slide blank just because a font is slow to arrive.
      new Promise(resolve => setTimeout(resolve, 800)),
    ])
  }
  finally {
    fontsSettled = true
    scheduleRefitSoon()
  }
}

onMounted(() => {
  void fitWithFonts()

  // Only the stage is observed: watching the text would feed the fitting back
  // into itself, since every size it tries resizes the text.
  resizeObserver = new ResizeObserver(scheduleRefit)
  if (stageEl.value)
    resizeObserver.observe(stageEl.value)

  // Only structural changes matter. A v-click being revealed merely uncovers
  // text that was already laid out, and refitting on that class change would
  // nudge the wrapping in the middle of the wipe animation.
  mutationObserver = new MutationObserver(scheduleRefit)
  if (contentEl.value) {
    mutationObserver.observe(contentEl.value, {
      childList: true,
      subtree: true,
    })
  }

  document.fonts.ready.then(scheduleRefit)
  document.fonts.addEventListener('loadingdone', scheduleRefit)
})

// Slides are created before they are shown, so the first fit often happens at
// zero size. Fit again as soon as this slide is on screen.
onSlideEnter(scheduleRefitSoon)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  document.fonts.removeEventListener('loadingdone', scheduleRefit)
})
</script>

<template>
  <div ref="stageEl" class="monta-stage">
    <div ref="contentEl" class="monta-content" :class="{ 'is-ready': ready }">
      <slot />
    </div>
  </div>
</template>
