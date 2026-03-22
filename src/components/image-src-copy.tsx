import { useEffect, useRef, useState } from "preact/hooks";
import { copyTextToClipboard } from "../helper";

export function ImageSrcCopy() {
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null,
  );
  const notificationTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const showNotification = (message: string) => {
      setNotificationMessage(message);
      if (notificationTimer.current) {
        window.clearTimeout(notificationTimer.current);
      }
      notificationTimer.current = window.setTimeout(() => {
        setNotificationMessage(null);
      }, 1800);
    };

    const handleClick = async (event: MouseEvent) => {
      const imageSrc = getImageSourceFromTarget(event.target);
      if (!imageSrc) {
        return;
      }

      const copied = await copyTextToClipboard(imageSrc);
      showNotification(
        copied ? "Lien de l image copie" : "Impossible de copier le lien de l image",
      );
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (notificationTimer.current) {
        window.clearTimeout(notificationTimer.current);
      }
    };
  }, []);

  if (!notificationMessage) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: "1001",
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "0.6rem 0.8rem",
        borderRadius: "0.5rem",
        fontSize: "0.8rem",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.22)",
        pointerEvents: "none",
      }}
    >
      {notificationMessage}
    </div>
  );
}

function getImageSourceFromTarget(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const image =
    target instanceof HTMLImageElement ? target : target.closest("img");
  if (!(image instanceof HTMLImageElement)) {
    return null;
  }

  return image.currentSrc || image.src || null;
}
