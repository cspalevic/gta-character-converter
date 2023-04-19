import { z } from "zod";
import { nanoid } from "nanoid";
import { createPresignedUpload } from "@/lib/s3";
import { getClient } from "@/lib/supabase";

const createUploadSchema = z.object({
  fileType: z.string(),
});

export async function POST(request: Request) {
  const input = await request.json();
  const schema = createUploadSchema.safeParse(input);
  if (!schema.success) {
    return new Response(JSON.stringify(schema.error), {
      status: 400,
    });
  }

  const referenceId = nanoid();
  const [presignedUpload, upload] = await Promise.allSettled([
    createPresignedUpload(referenceId, schema.data.fileType),
    getClient("upload")
      .insert({
        reference_id: referenceId,
        completed_at: null,
        name: null,
        status: "started",
      })
      .select()
      .throwOnError(),
  ]);

  if (presignedUpload.status === "rejected") {
    console.error("Error creating presigned upload with S3", {
      reason: presignedUpload.reason,
    });
    return new Response("Something went wrong", { status: 500 });
  }

  if (upload.status === "rejected") {
    console.error("Error creating upload in DB", { reason: upload.reason });
    return new Response("Something went wrong", { status: 500 });
  }

  const { url, fields } = presignedUpload.value;
  return new Response(JSON.stringify({ uploadId: referenceId, url, fields }), {
    status: 201,
  });
}
