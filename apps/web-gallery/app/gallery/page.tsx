import Image from "next/image";
import { getPresignedUrl } from "@/lib/s3";
import { getClient } from "@/lib/supabase";

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
      <main>
        <h1>Hi</h1>
        {uploads.map(
          ({ reference_id, name, completed_at, created_at, url }) => (
            <div key={reference_id}>
              <p>{name}</p>
              <Image alt="test" src={url} width="50" height="50" />
              <span>Created at: {created_at}</span>
              <br />
              <span>Completed at: {completed_at}</span>
            </div>
          )
        )}
      </main>
    </>
  );
}
