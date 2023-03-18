import S3 from "aws-sdk/clients/s3";

const BUCKET_NAME = "gta-characters";

export const createPresignedUpload = async (
  fileName: string,
  fileType: string
) => {
  const s3 = new S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    apiVersion: "2006-03-01",
  });

  return await s3.createPresignedPost({
    Bucket: BUCKET_NAME,
    Fields: {
      key: fileName,
      "Content-Type": fileType,
    },
    Expires: 60 * 5, // 5 minutes
  });
};
