import { createPrediction } from "@/lib/replicate";
import { getClient } from "@/lib/supabase";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const { id: referenceId } = params;
  if (!referenceId) return new Response("Not found", { status: 404 });

  // Get item from S3
  const image = "";

  // Create replicate
  const [prediction] = await Promise.allSettled([createPrediction(image)]);
  if (prediction.status === "rejected") {
    console.error("Error creating prediction", {
      reason: prediction.reason,
    });
    return new Response("Something went wrong", { status: 500 });
  }

  const [conversion] = await Promise.allSettled([
    getClient("conversion")
      .insert({
        replicate_id: prediction.value.id,
        upload_reference_id: referenceId,
        status: "started",
        message: null,
        url: null,
      })
      .throwOnError(),
  ]);
  if (conversion.status === "rejected") {
    console.error("Error creating coversion", {
      reason: conversion.reason,
    });
    return new Response("Something went wrong", { status: 500 });
  }

  return new Response("Ok");
}
