import './style.css'
import {computed, signal} from '@preact/signals'
import type {CSSProperties} from 'preact'
import {render} from 'preact'
import {getFontData, getMeasureData, isTextInspectable} from './helper'

/**
 * Signals for dynamic values
 */
const hoveredElement = signal<HTMLElement | null>(null) // Element survolé par l'utilisateur
const measureData = computed(() => {
  const target = hoveredElement.value
  return target ? getMeasureData(target) : null
})

const fontTarget = computed(() => {
  const target = hoveredElement.value
  if (!target || !isTextInspectable(target)) {
    return null
  }
  return target
})

const fontData = computed(() => {
  const target = fontTarget.value
  return target ? getFontData(target) : null
})

/**
 * Main logic
 */
const container = ensureContainer()
render(<InspectorOverlay/>, container)
document.addEventListener('mouseover', (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) {
      return
    }
    hoveredElement.value = target
  }
)

/**
 * Components
 */
function InspectorOverlay() {
  const measure = measureData.value
  const font = fontData.value

  if (!measure) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: '1000',
          background: 'rgba(104, 168, 236, 0.24)',
          left: `${measure.x}px`,
          top: `${measure.y}px`,
          borderColor: '#ffda0830',
          borderLeftWidth: `${measure.paddingLeft}px`,
          borderRightWidth: `${measure.paddingRight}px`,
          borderTopWidth: `${measure.paddingTop}px`,
          borderBottomWidth: `${measure.paddingBottom}px`,
          width: `${measure.width}px`,
          height: `${measure.height}px`,
          ['anchor-name']: '--content-box',
        } as CSSWithVars}
      />
      <Arrow direction="left" size={measure.left}/>
      <Arrow direction="top" size={measure.top}/>
      <Arrow direction="right" size={measure.right}/>
      <Arrow direction="bottom" size={measure.bottom}/>
      <Arrow direction="left" size={measure.paddingLeft} color="#2563eb" placement="inner"/>
      <Arrow direction="top" size={measure.paddingTop} color="#2563eb" placement="inner"/>
      <Arrow direction="right" size={measure.paddingRight} color="#2563eb" placement="inner"/>
      <Arrow direction="bottom" size={measure.paddingBottom} color="#2563eb" placement="inner"/>
      <FontOverlay font={font}/>
    </>
  )
}

function FontOverlay({font}: FontOverlayProps) {
  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '0.5rem',
        borderRadius: '0.75rem',
        position: 'absolute',
        zIndex: '1000',
        transition: 'opacity 150ms ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
        opacity: font ? '1' : '0',
        pointerEvents: 'none',
        left: 'anchor(left)',
        ['position-anchor']: '--content-box',
        ...(font?.placeAbove
          ? {bottom: 'anchor(top)', transform: 'translateY(-5px)'}
          : {top: 'anchor(bottom)', transform: 'translateY(5px)'}),
      } as CSSWithVars}
    >
      {font ? (
        <ul style={{fontSize: '0.875rem', margin: 0, padding: 0, listStyle: 'none'}}>
          <li>
            <span style={{opacity: 0.5}}>Police :</span> {font.family}
          </li>
          <li>
            <span style={{opacity: 0.5}}>Taille :</span> {font.sizeRem}
          </li>
          {font.showWeight ? (
            <li>
              <span style={{opacity: 0.5}}>Graissage :</span> {font.weight}
            </li>
          ) : null}
          <li>
            <span style={{opacity: 0.5}}>Interlignage :</span> {font.lineHeightRatio}
          </li>
        </ul>
      ) : null}
    </div>
  )
}

function Arrow({direction, size, color, placement}: ArrowProps) {
  const isVertical = direction === 'top' || direction === 'bottom'
  const label = `${Math.round(size)}px`

  return (
    <div
      data-inspector-ui
      style={{
        position: 'absolute',
        ['position-anchor']: '--content-box',
        color: color ?? 'red',
        background: 'currentColor',
        width: isVertical ? '2px' : `${size}px`,
        height: isVertical ? `${size}px` : '2px',
        zIndex: '1000',
        display: 'grid',
        placeItems: 'center',
        fontSize: '0.8rem',
        pointerEvents: 'none',
        opacity: size > 0 ? '1' : '0',
        ...getArrowPositionStyle(direction, placement ?? 'outer'),
      } as CSSWithVars}
    >
      <span
        style={{
          textAlign: 'center',
          display: 'block',
          lineHeight: '1',
          ...(isVertical ? {marginLeft: '0.5rem'} : {marginTop: '0.5rem'}),
        }}
      >
        {label}
      </span>
    </div>
  )
}

function ensureContainer() {
  const existing = document.getElementById('botanic-inspector-root')
  if (existing) {
    return existing as HTMLDivElement
  }
  const root = document.createElement('div')
  root.id = 'botanic-inspector-root'
  document.body.appendChild(root)
  return root
}

function getArrowPositionStyle(direction: ArrowDirection, placement: ArrowPlacement): CSSWithVars {
  if (placement === 'inner') {
    if (direction === 'top') {
      return {top: 'anchor(top)', left: 'anchor(center)'}
    }
    if (direction === 'bottom') {
      return {bottom: 'anchor(bottom)', left: 'anchor(center)'}
    }
    if (direction === 'left') {
      return {left: 'anchor(left)', bottom: 'anchor(center)'}
    }
    return {right: 'anchor(right)', bottom: 'anchor(center)'}
  }

  if (direction === 'top') {
    return {bottom: 'anchor(top)', left: 'anchor(center)'}
  }
  if (direction === 'bottom') {
    return {top: 'anchor(bottom)', left: 'anchor(center)'}
  }
  if (direction === 'left') {
    return {bottom: 'anchor(center)', right: 'anchor(left)'}
  }
  return {bottom: 'anchor(center)', left: 'anchor(right)'}
}

type CSSWithVars = CSSProperties & Record<string, string | number | undefined>
type ArrowDirection = 'top' | 'left' | 'bottom' | 'right'
type ArrowPlacement = 'outer' | 'inner'

type ArrowProps = {
  direction: ArrowDirection
  size: number
  color?: string
  placement?: ArrowPlacement
}

type FontOverlayProps = {
  font: ReturnType<typeof getFontData> | null
}
