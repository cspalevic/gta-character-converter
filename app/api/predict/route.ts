import { createPrediction } from "@/lib/replicate";

export async function POST(request: Request) {
  const input = await request.text();

  const prediction = await createPrediction(input);

  return new Response(JSON.stringify(prediction));
}
