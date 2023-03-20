"use client";

import { useEffect, useRef, useState } from "react";
import { usePrompt } from "use-prompt";
import Link from "next/link";
import { IconButton } from "@/ui/IconButton/IconButton";
import { PictureIcon } from "@/ui/Icons/PictureIcon";
import { FlipIcon } from "@/ui/Icons/FlipIcon";
import { RetryIcon } from "@/ui/Icons/RetryIcon";
import { UploadIcon } from "@/ui/Icons/UploadIcon";
import { GalleryIcon } from "@/ui/Icons/GalleryIcon";
import { useCamera } from "@/lib/hooks/camera";
import { useUploadSession } from "@/lib/hooks/uploadSession";
import Prompt from "./Prompt";
import styles from "./pageStyles.module.css";

const IMAGE_MIME_TYPE = "image/png";

export default function Home() {
  const video = useRef<HTMLVideoElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [prompt, showPrompt] = usePrompt();
  const { startCamera, flipCamera, getSnapshot } = useCamera(video);
  const { uploadFile, complete } = useUploadSession();

  const convert = async () => {
    if (!imageSrc) return;

    const pendingUpload = uploadFile(imageSrc, IMAGE_MIME_TYPE);

    await showPrompt((props) => (
      <Prompt {...props} fileUpload={pendingUpload} completeUpload={complete} />
    ));

    resetPicture();
  };

  const resetPicture = () => {
    setImageSrc(null);
    startCamera();
  };

  const takePicture = () => {
    if (!video.current || !canvas.current) return;

    const dataUrl = getSnapshot(canvas.current, IMAGE_MIME_TYPE);
    setImageSrc(dataUrl);
  };

  useEffect(() => {
    startCamera();
    window.addEventListener("resize", startCamera);
    return () => {
      window.removeEventListener("resize", startCamera);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {prompt}
      <main className={styles.main}>
        <canvas ref={canvas} className={styles.canvas} />
        {imageSrc ? (
          // for some reason data url's completely break nextjs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={image}
            className={styles.image}
            alt="Your pic"
            src={imageSrc}
          />
        ) : (
          <video ref={video} className={styles.video} playsInline />
        )}
        <footer className={styles.footer}>
          <Link className={styles.galleryLink} href="/gallery">
            <GalleryIcon width={55} height={55} />
          </Link>
          {imageSrc ? (
            <>
              <IconButton onClick={() => convert()}>
                <UploadIcon />
              </IconButton>
              <IconButton onClick={() => resetPicture()}>
                <RetryIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                className={styles.pictureButton}
                onClick={() => takePicture()}
              >
                <PictureIcon />
              </IconButton>
              <IconButton onClick={() => flipCamera()}>
                <FlipIcon width={35} height={35} />
              </IconButton>
            </>
          )}
        </footer>
      </main>
    </>
  );
}
