import boto3
import os
from io import BytesIO

bucket_name = os.environ["AWS_BUCKET"]

s3_client = boto3.client("s3")

def get_image(reference_id: str):
    # Download image from S3
    image_data = BytesIO()
    s3_client.download_fileobj(bucket_name, reference_id, image_data)

     # Reset the read position of the BytesIO object
    image_data.seek(0)

    return image_data
    