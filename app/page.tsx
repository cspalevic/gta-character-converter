"use client";

import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { RenderProps, usePrompt } from "use-prompt";
import { IconButton } from "@/ui/IconButton/IconButton";
import { PictureIcon } from "@/ui/Icons/PictureIcon";
import { FlipIcon } from "@/ui/Icons/FlipIcon";
import { RetryIcon } from "@/ui/Icons/RetryIcon";
import { UploadIcon } from "@/ui/Icons/UploadIcon";
import { dataUrlToBlob, handleRequest } from "@/lib/browser";
import styles from "./page.module.css";
import { useCamera } from "@/lib/hooks/camera";
import { useUpload } from "@/lib/hooks/upload";

const IMAGE_MIME_TYPE = "image/png";

function Prompt({ resolve, visible }: RenderProps) {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handlInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    if (!value) setError("Enter a name");
    if (value && error) setError("");
    setName(value);
  };

  const submit = () => {
    if (!name) {
      setError("Enter a name");
      return;
    }
    resolve(name);
  };

  if (!visible) return null;

  return (
    <div className={styles.prompt}>
      <h2>{"Who's this?"}</h2>
      <div className={styles.body}>
        <div
          className={cx(styles.inputContainer, {
            [styles.inputContainerError]: !!error,
          })}
        >
          <input type="text" onChange={handlInputChange} />
          {error && <span className={styles.error}>{error}</span>}
        </div>
        <button onClick={() => submit()}>Save</button>
      </div>
    </div>
  );
}

export default function Home() {
  const video = useRef<HTMLVideoElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [prompt, showPrompt] = usePrompt();
  const { startCamera, flipCamera, getSnapshot } = useCamera(video);
  const upload = useUpload();

  const convert = async () => {
    if (!imageSrc) return;

    const pendingUpload = upload(imageSrc, IMAGE_MIME_TYPE);

    const name = await showPrompt((props) => <Prompt {...props} />);

    const { success, error, data } = await pendingUpload;
    if (!success) {
      // Show some error messagee
      alert(error);
    }

    // Loading spinner now?
    const {
      uploadId,
      prediction: {
        id: predictionId,
        created_at: createdAt,
        completed_at: completedAt,
      },
    } = data;

    await handleRequest("/api/character", {
      method: "POST",
      body: JSON.stringify({
        uploadId,
        predictionId,
        createdAt,
        completedAt,
        name,
      }),
    });
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
          <button className={styles.galleryButton} onClick={() => {}} />
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
                <FlipIcon />
              </IconButton>
            </>
          )}
        </footer>
      </main>
    </>
  );
}
