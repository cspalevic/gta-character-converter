import { Prediction, getPrediction } from "@/lib/replicate";
import { Conversion, getClient } from "@/lib/supabase";

async function updateConversion(
  referenceId: string,
  conversion: Partial<Conversion>
) {
  const [conversionUpdate] = await Promise.allSettled([
    getClient("conversion")
      .update(conversion)
      .eq("upload_reference_id", referenceId)
      .throwOnError(),
  ]);
  if (conversionUpdate.status === "rejected") {
    console.error("Error getting conversions during cron job", {
      reason: conversionUpdate.reason,
    });
  }
}

async function getConversionPrediction(
  replicateId: string
): Promise<Prediction | null> {
  const [prediction] = await Promise.allSettled([getPrediction(replicateId)]);
  if (prediction.status === "rejected") {
    console.error(`Error getting prediction (${replicateId}) during cron job`, {
      reason: prediction.reason,
    });
    return null;
  }

  return prediction.value;
}

export async function GET(request: Request) {
  const [conversions] = await Promise.allSettled([
    getClient("conversion")
      .select("*")
      .filter("status", "eq", "started")
      .throwOnError(),
  ]);
  if (conversions.status === "rejected") {
    console.error("Error getting conversions during cron job", {
      reason: conversions.reason,
    });
    return new Response("Something went wrong", { status: 500 });
  }

  for await (const conversion of conversions.value.data ?? []) {
    const prediction = await getConversionPrediction(conversion.replicate_id);
    if (!prediction) continue;

    const referenceId = conversion.upload_reference_id;
    let status = prediction.status;
    let message = prediction.error;
    let url = prediction.output?.at(0);
    if (status === "succeeded" && !url) {
      status = "failed";
      message = "No output image";
    }
    if (status === "canceled" || status === "failed") {
      await updateConversion(referenceId, {
        status,
        message,
      });
    }
    if (status === "succeeded") {
      await updateConversion(referenceId, {
        status: "completed",
        url,
      });
      // Send SMS
    }
  }

  return new Response("Ok");
}
