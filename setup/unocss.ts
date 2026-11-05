import { defineUnoSetup } from '@slidev/types'
import { presetWebFonts } from 'unocss'

export default defineUnoSetup(() => ({
  presets: [
    presetWebFonts({
      // Font source: google | bunny | fontshare | fontsource | coollabs | zeoseven
      provider: 'google',
      // The built-in default is warning 1s / failure 2s, which is too tight
      // right after startup while Vite is still warming up. `false` disables it.
      timeouts: { warning: 8000, failure: 15000 },
      // We declare `theme.fontFamily` below, so don't let the preset prepend
      // the font names to it (it would duplicate them).
      extendTheme: false,
      fonts: {
        sans: 'LINE Seed JP:400,700',
        mono: 'Fira Code:400,700',
      },
    }),
  ],
  theme: {
    colors: {
      themePrimary: '#22252A',
      themeBackground: '#F0F8FF',

      // Monta Method palette. A slide is a sheet of paper, the words are ink,
      // and anything not revealed yet is covered by a bar of solid ink.
      montaPaper: '#F0F8FF',
      montaInk: '#22252A',
      montaRedaction: '#1B1D21',

      // The same palette on a dark sheet of paper. The bar is the colour of
      // the ink: a solid block that hides the text is what reads as a
      // redaction, whichever way round the contrast goes.
      montaPaperDark: '#15181C',
      montaInkDark: '#F0F8FF',
      montaRedactionDark: '#F0F8FF',
    },
    fontFamily: {
      sans: '"LINE Seed JP", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif',
      mono: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  },
  shortcuts: {
    // The slide itself: a full-bleed sheet with one idea in the middle.
    'monta-layout': 'relative flex h-full w-full items-center justify-center overflow-hidden px-16 py-10',
    // The measured box. components/MontaStage.vue grows the text until it
    // exactly fills this box.
    'monta-stage': 'flex h-full w-full items-center justify-center',
    // Display type: no prose, only words that fill the slide. `min-w-0` lets
    // the flex item shrink below its longest line so the text can wrap.
    'monta-text': 'w-full min-w-0 text-center font-sans font-700 tracking-[-0.01em]',
  },
}))
