import boto3
from smart_open import open


class S3Client:
    def __init__(self, aws_access_key: str, aws_secret_key: str, bucket_name: str):
        self.session = boto3.Session(
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
        )
        self.client = self.session.client("s3")
        self.bucket_name = bucket_name

    async def upload_file(
        self, file_name: str, file_content: bytes, content_type: str
    ) -> str:
        with open(
            f"s3://{self.bucket_name}/{file_name}",
            "wb",
            transport_params={
                "session": self.session,
            },
        ) as f:
            f.write(file_content)

        # set the content type for the file
        self.client.copy_object(
            Bucket=self.bucket_name,
            Key=file_name,
            CopySource={"Bucket": self.bucket_name, "Key": file_name},
            MetadataDirective="REPLACE",
            ContentType=content_type,
        )

        return f"https://{self.bucket_name}.s3.amazonaws.com/{file_name}"