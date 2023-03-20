import { z } from "zod";
import mongoClient, { dbInfo } from "../mongoClient";

export const uploadSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "done"]),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

export type Upload = z.infer<typeof uploadSchema>;

const getCollection = async () => {
  const client = await mongoClient;
  const db = client.db(dbInfo.characterConverter.name);
  return db.collection<Upload>(dbInfo.characterConverter.collections.uploads);
};

export const createUpload = async (upload: Upload) => {
  const collection = await getCollection();

  return await collection.insertOne(upload);
};

export const updateUpload = async (upload: Upload) => {
  const collection = await getCollection();
  await collection.updateOne(
    { id: upload.id },
    {
      $set: {
        name: upload.name,
        status: upload.status,
        completedAt: upload.completedAt,
      },
    }
  );
};

export const getUploads = async () => {
  const collection = await getCollection();

  const result = await collection.find();
  const uploads: Upload[] = [];
  await result.forEach((doc) => {
    uploads.push({
      id: doc.id,
      status: doc.status,
      name: doc.name,
      createdAt: doc.createdAt,
      completedAt: doc.completedAt,
    });
  });
  return uploads;
};

export const getUpload = async (id: string) => {
  const collection = await getCollection();

  const existingUpload = await collection.findOne({ id });
  if (!existingUpload) return null;

  return existingUpload;
};
