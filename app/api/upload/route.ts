import { z } from "zod";
import { v4 as guid } from "uuid";
import { createPresignedUpload } from "@/lib/s3";
import { PresignedPost } from "aws-sdk/clients/s3";
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

  const uploadId = guid();
  let uploadSession: PresignedPost;
  try {
    uploadSession = await createPresignedUpload(uploadId, schema.data.fileType);
  } catch (error) {
    console.error("Error creating upload with S3");
    console.error("Error", error);
    return new Response("Something went wrong.", { status: 500 });
  }

  try {
    await createUpload({ bucketId: uploadId });
  } catch (error) {
    console.error("Error creating upload in Mongo");
    console.error("Error", error);
    return new Response("Something went wrong.", { status: 500 });
  }

  const { url, fields } = uploadSession;
  return new Response(JSON.stringify({ uploadId, url, fields }));
}
