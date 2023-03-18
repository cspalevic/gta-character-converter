import { z } from "zod";

/**
 * For image conversions, ML models are used in Replicate
 * https://replicate.com/docs/reference/http
 * 
 * For this specific image -> GTA image conversion, we're using the gta5_lora model
 * https://replicate.com/cloneofsimo/gta5_lora
 */
const REPLICATE_BASE_URL = "https://api.replicate.com/v1/predictions";

const predictionSchema = z.object({
    completed_at: z.string().nullable(),
    created_at: z.string(),
    error: z.string().nullable(),
    id: z.string(),
    input: z.any(),
    output: z.string().array().nullable(),
    status: z.string(),
    version: z.string(),
})

type Prediction = z.infer<typeof predictionSchema>;

export const createPrediction = async (input: string): Promise<Prediction> => {
  const response = await fetch(REPLICATE_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
    },
    body: JSON.stringify({
      version: process.env.GTA5_LORA_VERSION,
      input: {
        prompt: "a photo of <1> gtav style",
        image: input
      }
    })
  });
  const json = await response.json();
  const schema = predictionSchema.safeParse(json);
  if(!schema.success) {
    throw new Error(JSON.stringify(schema.error));
  }
  return schema.data;
}

export const getPrediction = async (id: string) => {
    const url = `${REPLICATE_BASE_URL}/${id}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
        },
    });
    const json = await response.json();
    const schema = predictionSchema.safeParse(json);
    if(!schema.success) {
      throw new Error(JSON.stringify(schema.error));
    }
    return schema.data;
}