// Replicate API for GTA5 Lora
// https://replicate.com/cloneofsimo/gta5_lora/api
const REPLICATE_BASE_URL = "https://api.replicate.com/v1/predictions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const response = await fetch(`${REPLICATE_BASE_URL}/${id}`, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
    },
  })
  const json = await response.json();
  if(json.status === "succeeded" && json.output.length) {
    const outputUrl = json.output[0];
    const outputImage = await fetch(outputUrl);
    const imageBuffer = await outputImage.arrayBuffer();
    const image = Buffer.from(imageBuffer);
    return new Response(image, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  }
  return new Response(JSON.stringify(json), { 
    status: response.status, 
    statusText: response.statusText 
  });
}

export async function POST(request: Request) {
  const tempResponse = new Response(request.body);
  const input = await tempResponse.text();
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
  return new Response(JSON.stringify(json), {
    status: response.status, 
    statusText: response.statusText 
  })
}