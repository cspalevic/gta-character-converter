import {
  characterSchema,
  createCharacter,
  findCharacter,
} from "@/lib/models/character";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return new Response("id is required", {
      status: 400,
    });

  try {
    const character = await findCharacter(id);
    return new Response(JSON.stringify(character));
  } catch (error) {
    console.error("Error finding character");
    console.error("Error", error);
    return new Response("Something went wrong.", { status: 500 });
  }
}

export async function POST(request: Request) {
  const input = await request.json();
  const schema = characterSchema.safeParse(input);
  if (!schema.success) {
    return new Response(JSON.stringify(schema.error), {
      status: 400,
    });
  }

  try {
    await createCharacter(schema.data);
  } catch (error) {
    console.error(`Error creating character: ${schema.data.name}`);
    console.error("Error", error);
    return new Response("Something went wrong.", { status: 500 });
  }

  return new Response("Ok", { status: 201 });
}
