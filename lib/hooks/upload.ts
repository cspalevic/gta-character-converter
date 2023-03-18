import { useCallback } from "react";
import { dataUrlToBlob, handleRequest } from "../browser";

type UploadResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

export const useUpload = () => {
  const upload = useCallback(
    async (imageSrc: string, mimeType: string): Promise<UploadResponse> => {
      {
        try {
          if (!imageSrc) {
            return { success: false, error: "No image" };
          }

          const [sessionError, session] = await handleRequest("/api/upload", {
            method: "POST",
            body: JSON.stringify({ fileType: mimeType }),
          });
          if (sessionError) {
            return { success: false, error: "Error creating upload session" };
          }

          const { uploadId, url, fields } = session;
          const blobData = dataUrlToBlob(imageSrc, mimeType);
          const formData = new FormData();
          Object.entries({ ...fields, file: blobData }).forEach(
            ([key, value]) => {
              formData.append(key, value as string);
            }
          );

          const [[predictionError, prediction], [uploadError]] =
            await Promise.all([
              await handleRequest("/api/predict", {
                method: "POST",
                body: imageSrc,
              }),
              await handleRequest(
                url,
                {
                  method: "POST",
                  body: formData,
                },
                { skipParse: true }
              ),
            ]);

          if (predictionError) {
            return { success: false, error: "Error creating prediction" };
          }
          if (uploadError) {
            return { success: false, error: "Error creating upload" };
          }

          return { success: true, data: { uploadId, prediction } };
        } catch (error) {
          console.error("Catch-all error inside handleUpload", error);
          return { success: false, error: "Something went wrong" };
        }
      }
    },
    []
  );

  return upload;
};
