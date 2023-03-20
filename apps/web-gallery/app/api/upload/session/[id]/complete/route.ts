import { z } from "zod";
import { Upload, getUpload, updateUpload } from "@/lib/models/upload";

const uploadSchema = z.object({
  name: z.string(),
});

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const { id: uploadId } = params;
  console.log(uploadId);
  if (!uploadId) return new Response("Not found", { status: 404 });

  const input = await request.json();
  const schema = uploadSchema.safeParse(input);
  if (!schema.success) {
    return new Response(JSON.stringify(schema.error), {
      status: 400,
    });
  }

  const [upload] = await Promise.allSettled([await getUpload(uploadId)]);
  if (upload.status === "rejected") {
    console.error("Error getting upload");
    console.error(upload.reason);
    return new Response("Something went wrong", { status: 500 });
  }

  if (!upload.value) return new Response("Not found", { status: 404 });

  const completedUpload: Upload = {
    ...upload.value,
    name: schema.data.name,
    status: "done",
    completedAt: new Date().toISOString(),
  };
  const [update] = await Promise.allSettled([
    await updateUpload(completedUpload),
  ]);
  if (update.status === "rejected") {
    console.error("Error during update");
    console.error(update.reason);
    return new Response("Something went wrong", { status: 500 });
  }

  return new Response("Ok");
}
