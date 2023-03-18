import { MutableRefObject, useCallback, useState } from "react";

const ASPECT_RATIO = 16 / 9;

const getDesiredWidth = () => {
  let width;
  if (window.innerWidth <= 641) {
    width = window.innerWidth;
  } else if (window.innerWidth <= 961) {
    // TODO: Do something else
    width = window.innerWidth;
  } else {
    // TODO: Do something else
    width = window.innerWidth;
  }
  return width;
};

type FacingMode = "user" | "environment";

export const useCamera = (video: MutableRefObject<HTMLVideoElement | null>) => {
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");

  const startCamera = useCallback(async () => {
    const width = getDesiredWidth();
    const camera = await navigator.mediaDevices.getUserMedia({
      video: {
        width,
        facingMode,
        aspectRatio: {
          exact: ASPECT_RATIO,
        },
      },
    });
    if (video.current) {
      video.current.srcObject = camera;
      video.current.play();
    }
  }, [video, facingMode]);

  const flipCamera = useCallback(() => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
    startCamera();
  }, [facingMode, startCamera]);

  const getSnapshot = useCallback(
    (canvas: HTMLCanvasElement, mimeType: string): string | null => {
      if (!video.current) return null;
      const { videoWidth: width, videoHeight: height } = video.current;

      const context = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      context?.drawImage(video.current, 0, 0, width, height);

      return canvas.toDataURL(mimeType);
    },
    [video]
  );

  return { startCamera, flipCamera, getSnapshot };
};
