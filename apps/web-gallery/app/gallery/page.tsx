import Image from "next/image";
import { getPresignedUrl } from "@/lib/s3";
import { getClient } from "@/lib/supabase";
import styles from "./page.module.css";

async function getImages() {
  const uploads = await getClient("upload")
    .select("*")
    .range(0, 10)
    .throwOnError();
  const signedUrls = uploads.data!.map(async (upload) => {
    const url = await getPresignedUrl(upload.reference_id);
    return {
      ...upload,
      url,
    };
  });
  return await Promise.all(signedUrls);
}

export default async function Gallery() {
  const uploads = await getImages();
  return (
    <>
      <main className={styles.gallery}>
        {uploads.map(({ reference_id, name, url }) => (
          <div key={reference_id}>
            <Image alt={name} src={url} width="828" height="466" />
          </div>
        ))}
      </main>
    </>
  );
}
