"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@/ui/IconButton/IconButton";
import { PictureIcon } from "@/ui/Icons/PictureIcon";
import { FlipIcon } from "@/ui/Icons/FlipIcon";
import { RetryIcon } from "@/ui/Icons/RetryIcon";
import { UploadIcon } from "@/ui/Icons/UploadIcon";
import styles from "./page.module.css";
import { dataUrlToBlob, handleRequest } from "@/lib/browser";

const IMAGE_MIME_TYPE = "image/png";

export default function Home() {
  const video = useRef<HTMLVideoElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const getWindowSize = useCallback(() => {
    let width, height;
    if (window.innerWidth <= 641) {
      width = window.innerWidth;
      height = window.innerHeight * 0.8;
    } else if (window.innerWidth <= 961) {
      // TODO: Do something else
      width = window.innerWidth;
      height = window.innerHeight - 100;
    } else {
      // TODO: Do something else
      width = window.innerWidth;
      height = window.innerHeight - 100;
    }
    return { width, height };
  }, []);

  const handleUpload = async (): Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }> => {
    try {
      if (!imageSrc) return { success: false, error: "No image" };

      const [sessionError, session] = await handleRequest("/api/upload", {
        method: "POST",
        body: JSON.stringify({ fileType: IMAGE_MIME_TYPE }),
      });
      if (sessionError) {
        return { success: false, error: "Error creating upload session" };
      }

      const { uploadId, url, fields } = session;
      const blobData = dataUrlToBlob(imageSrc, IMAGE_MIME_TYPE);
      const formData = new FormData();
      Object.entries({ ...fields, file: blobData }).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const [[predictionError, prediction], [uploadError]] = await Promise.all([
        await handleRequest("/api/predict", {
          method: "POST",
          body: imageSrc,
        }),
        await handleRequest(
          url,
          {
            method: "POST",
            body: formData,
          },
          { skipParse: true }
        ),
      ]);

      if (predictionError) {
        return { success: false, error: "Error creating prediction" };
      }
      if (uploadError) {
        return { success: false, error: "Error creating upload" };
      }

      return { success: true, data: { uploadId, prediction } };
    } catch (error) {
      console.error("Catch-all error inside handleUpload", error);
      return { success: false, error: "Something went wrong" };
    }
  };

  const convert = async () => {
    if (!imageSrc) return;

    const upload = handleUpload();

    // Get name non blockingly
    const name = "Charlie";

    const { success, error, data } = await upload;
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
  };

  const startCamera = async () => {
    const { width, height } = getWindowSize();

    const camera = await navigator.mediaDevices.getUserMedia({
      video: {
        width,
        height,
        facingMode,
      },
    });
    if (video.current) {
      video.current.srcObject = camera;
      video.current.play();
    }
  };

  const resetPicture = () => {
    setImageSrc(null);
    startCamera();
  };

  const takePicture = () => {
    if (!video.current || !canvas.current) return;

    const { width, height } = getWindowSize();

    const context = canvas.current.getContext("2d");
    canvas.current.width = width;
    canvas.current.height = height;
    context?.drawImage(video.current, 0, 0, width, height);

    const dataUrl = canvas.current.toDataURL(IMAGE_MIME_TYPE);
    setImageSrc(dataUrl);
  };

  const flipPicture = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
    startCamera();
  };

  useEffect(() => {
    startCamera();
    window.addEventListener("resize", startCamera);
    return () => {
      window.removeEventListener("resize", startCamera);
    };
  }, []);

  return (
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
        <video ref={video} className={styles.video} />
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
            <IconButton onClick={() => flipPicture()}>
              <FlipIcon />
            </IconButton>
          </>
        )}
      </footer>
    </main>
  );
}
