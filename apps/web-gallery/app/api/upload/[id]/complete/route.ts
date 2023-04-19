import { getClient } from "@/lib/supabase";
import { z } from "zod";

const uploadSchema = z.object({
  name: z.string(),
});

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const { id: referenceId } = params;
  if (!referenceId) return new Response("Not found", { status: 404 });

  const input = await request.json();
  const schema = uploadSchema.safeParse(input);
  if (!schema.success) {
    return new Response(JSON.stringify(schema.error), {
      status: 400,
    });
  }

  const [update] = await Promise.allSettled([
    getClient("upload")
      .update({
        name: schema.data.name,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("reference_id", referenceId)
      .throwOnError(),
  ]);
  if (update.status === "rejected") {
    console.error("Error updating upload", {
      reason: update.reason,
    });
    return new Response("Something went wrong", { status: 500 });
  }

  return new Response("Ok");
}
