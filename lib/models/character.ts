import { z } from "zod";
import mongoClient, { DB_NAME, COLLECTIONS } from "../mongoClient";
import { findUpload } from "./upload";

export const characterSchema = z.object({
  uploadId: z.string(),
  predictionId: z.string(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  name: z.string(),
});

export type Character = z.infer<typeof characterSchema>;

export const createCharacter = async (character: Character) => {
  const client = await mongoClient;
  const db = client.db(DB_NAME);
  const characters = db.collection<Character>(COLLECTIONS.CHARACTER);

  // Not allowing you to create a character, unless an upload session was created
  const upload = await findUpload(character.uploadId);
  if (!upload) throw new Error(`No upload found with id ${character.uploadId}`);

  await characters.insertOne(character);
};

export const findCharacter = async (id: string): Promise<Character | null> => {
  const client = await mongoClient;
  const db = client.db(DB_NAME);
  const characters = db.collection<Character>(COLLECTIONS.CHARACTER);

  const existingCharacter = await characters.findOne({ predictionId: id });
  if (!existingCharacter) return null;

  return existingCharacter as Character;
};

export const updateCharacter = async (character: Partial<Character>) => {
  const client = await mongoClient;
  const db = client.db(DB_NAME);
  const characters = db.collection<Character>(COLLECTIONS.CHARACTER);

  await characters.updateOne(
    { predictionId: character.predictionId },
    {
      $set: {
        completedAt: character.completedAt,
      },
    }
  );
};
