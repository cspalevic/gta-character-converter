import S3 from "aws-sdk/clients/s3";

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET } =
  process.env;

const s3 = new S3({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  apiVersion: "2006-03-01",
});

export const createPresignedUpload = async (
  fileName: string,
  fileType: string
) =>
  s3.createPresignedPost({
    Bucket: AWS_BUCKET,
    Fields: {
      key: fileName,
      "Content-Type": fileType,
    },
    Expires: 60 * 5, // 5 minutes
  });

export const getPresignedUrl = async (fileName: string) =>
  s3.getSignedUrlPromise("getObject", {
    Bucket: AWS_BUCKET,
    Key: fileName,
    Expires: 60 * 15, // 15 minutes
  });
