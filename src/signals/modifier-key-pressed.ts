import { signal } from "@preact/signals";

export const isModifierPressed = signal(false); // Ctrl (Windows/Linux) or Cmd (macOS)

const syncModifierState = (event: KeyboardEvent) => {
  isModifierPressed.value = event.ctrlKey || event.metaKey;
};

const resetModifierState = () => {
  isModifierPressed.value = false;
};

document.addEventListener("keydown", syncModifierState);
document.addEventListener("keyup", syncModifierState);
window.addEventListener("blur", resetModifierState);
window.addEventListener("pagehide", resetModifierState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    resetModifierState();
  }
});
