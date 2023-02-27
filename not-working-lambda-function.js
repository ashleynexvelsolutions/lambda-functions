require("dotenv").config({
  path: ".env",
});

const {
  S3Client,
  HeadObjectCommand,
  UploadCommand,
} = require("@aws-sdk/client-s3");
const parser = require("lambda-multipart-parser");

const credentials = {
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY,
    secretAccessKey: process.env.MY_AWS_SECRET_KEY,
  },
};
const s3Client = new S3Client(credentials);

exports.handler = async (event) => {
  const parserResult = await parser.parse(event);

  // Upload files to s3 bucket
  const { files } = parserResult; // parserResult.files exists

  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: JSON.stringify({ message: "Successfully uploaded file(s) to S3" }),
  };

  const results = await Promise.all(
    files.map(async (file) => {
      let fileKey = file.filename;
      let fileExists = true;
      let fileNumber = 0;

      while (fileExists) {
        try {
          // Check if the file already exists in the bucket
          // eslint-disable-next-line no-await-in-loop
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.S3_BUCKET,
              Key: fileKey,
            })
          );
          fileNumber += 1;
          fileKey = file.filename.replace(
            /(\.[\w\d_-]+)$/i,
            `-${fileNumber}$1`
          );
        } catch (err) {
          if (err.name === "NoSuchKey") {
            console.log(`No such key: ${err}`);
            fileExists = false;
          } else {
            console.log(`failed upload 1: ${err}`);
            response.body = JSON.stringify({
              message: "File failed to upload 1",
              errorMessage: err.message,
            });
            response.statusCode = 500;
            return response;
          }
        }
      }

      const s3Params = {
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
        Body: file.content,
        ContentType: file.contentType,
      };

      try {
        const url = `${process.env.BUCKET_URL}${fileKey}`;
        await s3Client.send(new UploadCommand(s3Params));
        return url;
      } catch (err) {
        console.log(`failed upload 1: ${err}`);
        response.body = JSON.stringify({
          message: "File failed to upload 2",
          errorMessage: err.message,
        });
        response.statusCode = 500;
        return response;
      }
    })
  );

  if (response.statusCode === 500) {
    console.log(`Failed to upload file(s) to S3: ${response.body}`);
  } else {
    console.log(
      `Successfully uploaded file(s) to S3: ${JSON.stringify(results)}`
    );
    response.body = JSON.stringify({
      message: `Successfully uploaded file(s) to S3`,
      results,
    });
  }

  return response;
};
