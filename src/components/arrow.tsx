import type { CSSWithVars } from "../types";

type ArrowDirection = "top" | "left" | "bottom" | "right";
type ArrowPlacement = "outer" | "inner";
type Props = {
  direction: ArrowDirection;
  size: number;
  color?: string;
  placement?: ArrowPlacement;
};

export function Arrow({ direction, size, color, placement }: Props) {
  const isVertical = direction === "top" || direction === "bottom";
  const label = `${Math.round(size)}px`;

  if (size < 2) {
    return null;
  }

  return (
    <div
      style={
        {
          position: "absolute",
          ["position-anchor"]: "--content-box",
          color: color ?? "red",
          background: "currentColor",
          width: isVertical ? "2px" : `${size}px`,
          height: isVertical ? `${size}px` : "2px",
          zIndex: "1000",
          display: "grid",
          placeItems: "center",
          fontSize: "0.8rem",
          pointerEvents: "none",
          opacity: size > 0 ? "1" : "0",
          ...getArrowPositionStyle(direction, placement ?? "outer"),
        } as CSSWithVars
      }
    >
      <span
        style={{
          textAlign: "center",
          display: "block",
          lineHeight: "1",
          ...(isVertical ? { marginLeft: "0.5rem" } : { marginTop: "0.5rem" }),
        }}
      >
        {label}
      </span>
    </div>
  );
}

function getArrowPositionStyle(
  direction: ArrowDirection,
  placement: ArrowPlacement,
): CSSWithVars {
  if (placement === "inner") {
    if (direction === "top") {
      return { top: "anchor(top)", left: "anchor(center)" };
    }
    if (direction === "bottom") {
      return { bottom: "anchor(bottom)", left: "anchor(center)" };
    }
    if (direction === "left") {
      return { left: "anchor(left)", bottom: "anchor(center)" };
    }
    return { right: "anchor(right)", bottom: "anchor(center)" };
  }

  if (direction === "top") {
    return { bottom: "anchor(top)", left: "anchor(center)" };
  }
  if (direction === "bottom") {
    return { top: "anchor(bottom)", left: "anchor(center)" };
  }
  if (direction === "left") {
    return { bottom: "anchor(center)", right: "anchor(left)" };
  }
  return { bottom: "anchor(center)", left: "anchor(right)" };
}
