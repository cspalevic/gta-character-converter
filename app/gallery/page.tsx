import { getUploads } from "@/lib/models/upload";

async function getImages() {
  const uploads = await getUploads();
  return uploads;
}

export default async function Gallery() {
  const images = await getImages();
  return (
    <>
      <main>
        <h1>Hi</h1>
        {images.map((image) => (
          <div key={image.id}>
            <p>{image.name}</p>
            <span>Created at: {image.createdAt}</span>
            <br />
            <span>Completed at: {image.completedAt}</span>
          </div>
        ))}
      </main>
    </>
  );
}
