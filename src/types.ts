import type {CSSProperties} from 'preact'

// Typography metadata displayed by the font overlay.
export type FontData = {
  family: string
  sizeRem: string
  weight: string
  showWeight: boolean
  lineHeightRatio: number
  placeAbove: boolean
}

// Inline style object that also allows CSS custom properties.
export type CSSWithVars = CSSProperties & Record<string, string | number | undefined>
