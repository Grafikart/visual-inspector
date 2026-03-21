import type {CSSProperties} from 'preact'

// Shared type contracts for the inspector overlay: geometry measurements,
// spacing strategies, and visual props consumed across UI/components.
// Normalized DOMRect-like values for a measured element/content box.
export type ContentRect = {
  x: number
  y: number
  left: number
  top: number
  width: number
  height: number
  right: number
  bottom: number
}

// Full measurement payload used to render size/position and padding overlays.
export type MeasureData = {
  x: number
  y: number
  width: number
  height: number
  top: number
  left: number
  bottom: number
  right: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
}

// Typography metadata displayed by the font overlay.
export type FontData = {
  family: string
  sizeRem: string
  weight: string
  showWeight: boolean
  lineHeightRatio: number
  placeAbove: boolean
}

// Horizontal/vertical distance tuple used by spacing calculations.
export type DistancePair = [number, number]

// Strategy contract for finding reference elements and distance deltas.
export type DistanceStrategy = {
  getSibling: (target: HTMLElement) => HTMLElement | null
  getParentDelta: (targetRect: ContentRect, parentRect: ContentRect) => DistancePair
  getSiblingDelta: (targetRect: ContentRect, siblingRect: ContentRect) => DistancePair
  shouldRecurse: (distance: DistancePair) => boolean
}

// Inline style object that also allows CSS custom properties.
export type CSSWithVars = CSSProperties & Record<string, string | number | undefined>

// Cardinal direction used to orient arrow indicators.
export type ArrowDirection = 'top' | 'left' | 'bottom' | 'right'

// Whether an arrow is rendered inside or outside its anchor edge.
export type ArrowPlacement = 'outer' | 'inner'

// Config for rendering an arrow marker in the overlay.
export type ArrowProps = {
  direction: ArrowDirection
  size: number
  color?: string
  placement?: ArrowPlacement
}

// Props for the font overlay component.
export type FontOverlayProps = {
  font: FontData | null
}
