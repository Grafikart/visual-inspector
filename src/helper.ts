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

export type FontData = {
  family: string
  sizeRem: string
  weight: string
  showWeight: boolean
  lineHeightRatio: number
  placeAbove: boolean
}

// Rounds numeric values to 2 decimals for stable UI labels.
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// Converts computed pixel font sizes to rem values for font inspector display.
export function toRemFromPx(value: string): string {
  const px = parseFloat(value)
  if (!Number.isFinite(px)) {
    return '0rem'
  }
  return `${round2(px / 16)}rem`
}

// Returns the target content box rectangle (excluding padding and border) for overlay placement.
export function getContentRect(el: HTMLElement): ContentRect {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)

  const paddingLeft = parseFloat(style.paddingLeft) || 0
  const paddingRight = parseFloat(style.paddingRight) || 0
  const paddingTop = parseFloat(style.paddingTop) || 0
  const paddingBottom = parseFloat(style.paddingBottom) || 0
  const borderLeft = parseFloat(style.borderLeftWidth) || 0
  const borderRight = parseFloat(style.borderRightWidth) || 0
  const borderTop = parseFloat(style.borderTopWidth) || 0
  const borderBottom = parseFloat(style.borderBottomWidth) || 0

  const x = rect.left + paddingLeft + borderLeft
  const y = rect.top + paddingTop + borderTop
  const width = Math.max(0, rect.width - paddingLeft - paddingRight - borderLeft - borderRight)
  const height = Math.max(0, rect.height - paddingTop - paddingBottom - borderTop - borderBottom)

  return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height }
}

// Computes top/left spacing for the measurement overlay against previous sibling or parent fallback.
export function getTopLeftDistance(target: HTMLElement): [number, number] {
  return getDistance(target, topLeftDistanceStrategy)
}

// Computes bottom/right spacing for the measurement overlay against next sibling or parent fallback.
export function getBottomRightDistance(target: HTMLElement): [number, number] {
  return getDistance(target, bottomRightDistanceStrategy)
}

// Aggregates all geometry needed by the measurement inspector (box + 4 spacing labels).
export function getMeasureData(target: HTMLElement): MeasureData {
  const rect = target.getBoundingClientRect()
  const [top, left] = getTopLeftDistance(target)
  const [bottom, right] = getBottomRightDistance(target)
  const scrollX = window.scrollX || document.documentElement.scrollLeft
  const scrollY = window.scrollY || document.documentElement.scrollTop
  const style = getComputedStyle(target)

  return {
    x: rect.x + scrollX,
    y: rect.y + scrollY,
    width: rect.width,
    height: rect.height,
    top,
    left,
    bottom,
    right,
    paddingTop: parsePx(style.paddingTop),
    paddingRight: parsePx(style.paddingRight),
    paddingBottom: parsePx(style.paddingBottom),
    paddingLeft: parsePx(style.paddingLeft),
  }
}

// Normalizes CSS line-height formats to a numeric ratio used by the font inspector.
export function getLineHeightRatio(style: CSSStyleDeclaration): number {
  const fontSize = parseFloat(style.fontSize) || 0
  if (fontSize <= 0) {
    return 1
  }

  const lineHeight = style.lineHeight.trim().toLowerCase()
  if (lineHeight === 'normal') {
    return 1.2
  }

  const value = parseFloat(lineHeight)
  if (!Number.isFinite(value)) {
    return 1
  }

  if (/^[\d.]+$/.test(lineHeight)) {
    return value
  }

  if (lineHeight.endsWith('%')) {
    return value / 100
  }

  return value / fontSize
}

// Extracts and formats font metadata displayed in the tooltip overlay.
export function getFontData(target: HTMLElement): FontData {
  const style = getComputedStyle(target)
  const rect = target.getBoundingClientRect()

  return {
    family: style.fontFamily.split(',')[0]?.trim() ?? style.fontFamily,
    sizeRem: toRemFromPx(style.fontSize),
    weight: style.fontWeight,
    showWeight: style.fontWeight !== '400',
    lineHeightRatio: round2(getLineHeightRatio(style)),
    placeAbove: rect.top > 100,
  }
}

// Filters hover targets so the font inspector only appears on meaningful text elements.
export function isTextInspectable(target: HTMLElement): boolean {
  return target.textContent?.trim() !== ''
}

type DistancePair = [number, number]

type DistanceStrategy = {
  getSibling: (target: HTMLElement) => HTMLElement | null
  getParentDelta: (targetRect: ContentRect, parentRect: ContentRect) => DistancePair
  getSiblingDelta: (targetRect: ContentRect, siblingRect: ContentRect) => DistancePair
  shouldRecurse: (distance: DistancePair) => boolean
}

const topLeftDistanceStrategy: DistanceStrategy = {
  getSibling: (target) => target.previousElementSibling as HTMLElement | null,
  getParentDelta: (targetRect, parentRect) => [
    Math.round(targetRect.top - parentRect.top),
    Math.round(targetRect.left - parentRect.left),
  ],
  getSiblingDelta: (targetRect, siblingRect) => [
    Math.round(targetRect.top === siblingRect.top ? 0 : targetRect.top - siblingRect.bottom),
    Math.round(targetRect.left === siblingRect.left ? 0 : targetRect.left - siblingRect.right),
  ],
  shouldRecurse: ([first, second]) => first === 0 && second === 0,
}

const bottomRightDistanceStrategy: DistanceStrategy = {
  getSibling: (target) => target.nextElementSibling as HTMLElement | null,
  getParentDelta: (targetRect, parentRect) => [
    Math.round(parentRect.bottom - targetRect.bottom),
    Math.round(parentRect.right - targetRect.right),
  ],
  getSiblingDelta: (targetRect, siblingRect) => [
    Math.round(targetRect.top === siblingRect.top ? 0 : siblingRect.top - targetRect.bottom),
    Math.round(targetRect.left === siblingRect.left ? 0 : siblingRect.left - targetRect.right),
  ],
  shouldRecurse: ([first, second]) => first === 0 && second === 0,
}

function getDistance(target: HTMLElement, strategy: DistanceStrategy): DistancePair {
  const sibling = strategy.getSibling(target)
  const targetRect = target.getBoundingClientRect()

  if (!sibling) {
    const parentRect = (target.parentElement ?? document.documentElement).getBoundingClientRect()
    const distance = strategy.getParentDelta(targetRect, parentRect)
    if (strategy.shouldRecurse(distance) && target.parentElement) {
      return getDistance(target.parentElement, strategy)
    }
    return normalizeDistance(distance)
  }

  const siblingRect = getContentRect(sibling)
  const distance = strategy.getSiblingDelta(targetRect, siblingRect)
  return normalizeDistance(distance)
}

function normalizeDistance([first, second]: DistancePair): DistancePair {
  return [Math.abs(first), Math.abs(second)]
}

function parsePx(value: string): number {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}
