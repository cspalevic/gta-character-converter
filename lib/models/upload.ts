import { z } from "zod";
import mongoClient, { DB_NAME, COLLECTIONS } from "../mongoClient";

export const uploadSchema = z.object({
  bucketId: z.string(),
});

export type Upload = z.infer<typeof uploadSchema>;

export const createUpload = async (upload: Upload) => {
  const client = await mongoClient;
  const db = client.db(DB_NAME);
  const uploads = db.collection<Upload>(COLLECTIONS.UPLOAD);

  await uploads.insertOne(upload);
};

export const findUpload = async (id: string) => {
  const client = await mongoClient;
  const db = client.db(DB_NAME);
  const uploads = db.collection<Upload>(COLLECTIONS.UPLOAD);

  const existingUpload = await uploads.findOne({ bucketId: id });
  if (!existingUpload) return null;

  return existingUpload;
};
