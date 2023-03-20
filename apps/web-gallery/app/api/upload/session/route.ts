import { z } from "zod";
import { nanoid } from "nanoid";
import { createPresignedUpload } from "@/lib/s3";
import { createUpload } from "@/lib/models/upload";

const uploadSchema = z.object({
  fileType: z.string(),
});

export async function POST(request: Request) {
  const input = await request.json();
  const schema = uploadSchema.safeParse(input);
  if (!schema.success) {
    return new Response(JSON.stringify(schema.error), {
      status: 400,
    });
  }

  const uploadId = nanoid();
  const [presignedUpload, upload] = await Promise.allSettled([
    createPresignedUpload(uploadId, schema.data.fileType),
    createUpload({
      id: uploadId,
      status: "pending",
      name: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }),
  ]);

  if (presignedUpload.status === "rejected") {
    console.error("Error creating presigned upload with S3");
    console.error(presignedUpload.reason);
    return new Response("Something went wrong", { status: 500 });
  }

  if (upload.status === "rejected") {
    console.error("Error creating upload in DB");
    console.error(upload.reason);
    return new Response("Something went wrong", { status: 500 });
  }

  const { url, fields } = presignedUpload.value;
  return new Response(JSON.stringify({ uploadId, url, fields }), {
    status: 201,
  });
}
