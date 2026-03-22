import { computed, signal } from "@preact/signals";
import { render } from "preact";
import { Arrow } from "./components/arrow";
import { FontOverlay } from "./components/font-overlay.tsx";
import { ImageSrcCopy } from "./components/image-src-copy";
import { getFontData, getMeasureData, isTextInspectable } from "./helper";
import { isModifierPressed } from "./signals/modifier-key-pressed";
import type { CSSWithVars } from "./types";

/**
 * Signals for dynamic values
 */
const hoveredElement = signal<HTMLElement | null>(null);
const measureData = computed(() => {
  if (!isModifierPressed.value) {
    return null;
  }
  const target = hoveredElement.value;
  return target ? getMeasureData(target) : null;
});

const fontTarget = computed(() => {
  if (!isModifierPressed.value) {
    return null;
  }
  const target = hoveredElement.value;
  if (!target || !isTextInspectable(target)) {
    return null;
  }
  return target;
});

const fontData = computed(() => {
  const target = fontTarget.value;
  return target ? getFontData(target) : null;
});

/**
 * Main logic
 */
const root = document.createElement("div");
document.body.appendChild(root);
render(
  <>
    <InspectorOverlay />
    <ImageSrcCopy />
  </>,
  root,
);
document.addEventListener("mouseover", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  hoveredElement.value = target;
});

/**
 * Components
 */
function InspectorOverlay() {
  const measure = measureData.value;
  const font = fontData.value;

  if (!measure) {
    return null;
  }

  return (
    <>
      <div
        style={
          {
            position: "absolute",
            pointerEvents: "none",
            zIndex: "1000",
            background: "rgba(104, 168, 236, 0.24)",
            left: `${measure.x}px`,
            top: `${measure.y}px`,
            borderColor: "#ffda0830",
            borderLeftWidth: `${measure.paddingLeft}px`,
            borderRightWidth: `${measure.paddingRight}px`,
            borderTopWidth: `${measure.paddingTop}px`,
            borderBottomWidth: `${measure.paddingBottom}px`,
            width: `${measure.width}px`,
            height: `${measure.height}px`,
            ["anchor-name"]: "--content-box",
          } as CSSWithVars
        }
      />
      <ContentSizeLabel width={measure.width} height={measure.height} />
      <Arrow direction="left" size={measure.left} />
      <Arrow direction="top" size={measure.top} />
      <Arrow direction="right" size={measure.right} />
      <Arrow direction="bottom" size={measure.bottom} />
      <Arrow
        direction="left"
        size={measure.paddingLeft}
        color="#2563eb"
        placement="inner"
      />
      <Arrow
        direction="top"
        size={measure.paddingTop}
        color="#2563eb"
        placement="inner"
      />
      <Arrow
        direction="right"
        size={measure.paddingRight}
        color="#2563eb"
        placement="inner"
      />
      <Arrow
        direction="bottom"
        size={measure.paddingBottom}
        color="#2563eb"
        placement="inner"
      />
      <FontOverlay font={font} width={measure.width} />
    </>
  );
}

function ContentSizeLabel({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <div
      style={
        {
          position: "absolute",
          right: "anchor(right)",
          bottom: "anchor(top)",
          textAlign: "right",
          transform: "translateY(-6px)",
          ["position-anchor"]: "--content-box",
          color: "#2563eb",
          fontSize: "0.7rem",
          fontWeight: "600",
          lineHeight: "1",
          pointerEvents: "none",
          zIndex: "1000",
        } as CSSWithVars
      }
    >
      {`${Math.round(width)}px × ${Math.round(height)}px`}
    </div>
  );
}
