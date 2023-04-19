import { useCallback } from "react";
import { dataUrlToBlob } from "../utils";

export const useUploadSession = () => {
  const uploadFile = useCallback(
    async (
      imageSrc: string,
      mimeType: string
    ): Promise<PromiseSettledResult<string>> => {
      {
        try {
          if (!imageSrc) {
            return { status: "rejected", reason: "No image" };
          }

          const [uploadSession] = await Promise.allSettled([
            fetch("/api/upload", {
              method: "POST",
              body: JSON.stringify({ fileType: mimeType }),
            }),
          ]);
          if (uploadSession.status === "rejected") return uploadSession;
          if (uploadSession.value.status !== 201) {
            const errorMessage = await uploadSession.value.text();
            return { status: "rejected", reason: errorMessage };
          }

          const sessionFields = await uploadSession.value.json();
          const { uploadId, url, fields } = sessionFields;
          const blobData = dataUrlToBlob(imageSrc, mimeType);
          const formData = new FormData();
          Object.entries({ ...fields, file: blobData }).forEach(
            ([key, value]) => {
              formData.append(key, value as string);
            }
          );

          const [s3Upload] = await Promise.allSettled([
            fetch(url, {
              method: "POST",
              body: formData,
            }),
          ]);
          if (s3Upload.status === "rejected") return s3Upload;
          if (uploadSession.value.status !== 201) {
            return { status: "rejected", reason: "Error during s3 upload" };
          }

          return { status: "fulfilled", value: uploadId };
        } catch (error) {
          console.error("Error occurred during upload", error);
          return { status: "rejected", reason: "Something went wrong" };
        }
      }
    },
    []
  );

  const complete = useCallback(
    async (
      uploadId: string,
      name: string
    ): Promise<PromiseSettledResult<"Ok">> => {
      const [completedUpload] = await Promise.allSettled([
        fetch(`/api/upload/${uploadId}/complete`, {
          method: "POST",
          body: JSON.stringify({
            name,
          }),
        }),
      ]);
      if (completedUpload.status === "rejected") return completedUpload;
      if (completedUpload.value.status !== 200) {
        const errorMessage = await completedUpload.value.text();
        return { status: "rejected", reason: errorMessage };
      }
      return { status: "fulfilled", value: "Ok" };
    },
    []
  );

  return { uploadFile, complete };
};
