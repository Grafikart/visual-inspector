import type { CSSWithVars, FontData } from "../types.ts";

type Props = {
  font: FontData | null;
  width: number;
};

export function FontOverlay({ font, width }: Props) {
  if (!font) {
    return null;
  }

  return (
    <div
      style={
        {
          background: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          padding: "0.5rem",
          borderRadius: "0.75rem",
          position: "absolute",
          zIndex: "1000",
          transition: "opacity 150ms ease-in-out",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
          opacity: font ? "1" : "0",
          pointerEvents: "none",
          ["position-anchor"]: "--content-box",
          ...(font?.placeAbove
            ? { bottom: "anchor(top)", transform: "translateY(-5px)" }
            : { top: "anchor(bottom)", transform: "translateY(5px)" }),
        } as CSSWithVars
      }
    >
      <ul
        style={{
          fontSize: "0.875rem",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        <li>
          <span style={{ opacity: 0.5 }}>Police :</span> {font.family}
        </li>
        <li>
          <span style={{ opacity: 0.5 }}>Taille :</span> {font.sizeRem}
        </li>
        {font.showWeight ? (
          <li>
            <span style={{ opacity: 0.5 }}>Graissage :</span> {font.weight}
          </li>
        ) : null}
        <li>
          <span style={{ opacity: 0.5 }}>Interlignage :</span>{" "}
          {font.lineHeightRatio}
        </li>
      </ul>
    </div>
  );
}
