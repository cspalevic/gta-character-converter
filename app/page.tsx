'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '@/ui/IconButton/IconButton';
import { PictureIcon } from '@/ui/Icons/PictureIcon';
import { FlipIcon } from '@/ui/Icons/FlipIcon';
import { RetryIcon } from '@/ui/Icons/RetryIcon';
import { UploadIcon } from '@/ui/Icons/UploadIcon';
import styles from './page.module.css';

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
      height = window.innerHeight * .8;
    } else if(window.innerWidth <= 961) {
      // TODO: Do something else
      width = window.innerWidth;
      height = window.innerHeight-100;
    } else {
      // TODO: Do something else
      width = window.innerWidth;
      height = window.innerHeight-100;
    }
    return { width, height }
  }, []);

  const convert = async () => {
    const gtaImage = await fetch("/api/convert", {
      method: "POST",
      body: imageSrc
    });
    console.log(gtaImage);
  }
  
  const startCamera = async () => {
    const { width, height } = getWindowSize();

    const camera = await navigator.mediaDevices.getUserMedia({
        video: {
          width,
          height,
          facingMode
        }
    });
    if(video.current) {
      video.current.srcObject = camera;
      video.current.play();
    }
  }

  const resetPicture = () => {
    setImageSrc(null);
    startCamera();
  }

  const takePicture = () => {
    if(!video.current || !canvas.current) return;

    const { width, height } = getWindowSize();

    const context = canvas.current.getContext("2d");
    canvas.current.width = width;
    canvas.current.height = height;
    context?.drawImage(video.current, 0, 0, width, height);

    const dataUrl = canvas.current.toDataURL("image/png");
    setImageSrc(dataUrl);
  }

  const flipPicture = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
    startCamera();
  }

  useEffect(() => {
    startCamera();
    window.addEventListener("resize", startCamera);
    return () => {
      window.removeEventListener("resize", startCamera);
    }
  }, [])

  return (
    <main className={styles.main}>
      <canvas ref={canvas} className={styles.canvas} />
      {imageSrc ? (
        // for some reason data url's completely break nextjs
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={image} className={styles.image} alt="Your pic" src={imageSrc} />
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
            <IconButton className={styles.pictureButton} onClick={() => takePicture()}>
              <PictureIcon />
            </IconButton>
            <IconButton onClick={() => flipPicture()}>
              <FlipIcon />
            </IconButton>
          </>
        )}
      </footer>
    </main>
  )
}
