require("dotenv").config({
  path: ".env",
});

const AWS = require("aws-sdk");
const parser = require("lambda-multipart-parser");

AWS.config.update({
  accessKeyId: process.env.MY_AWS_ACCESS_KEY,
  secretAccessKey: process.env.MY_AWS_SECRET_KEY,
  region: process.env.MY_AWS_REGION,
});
const s3 = new AWS.S3();

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
          await s3
            .headObject({ Bucket: process.env.S3_BUCKET, Key: fileKey })
            .promise();
          fileNumber += 1;
          fileKey = file.filename.replace(
            /(\.[\w\d_-]+)$/i,
            `-${fileNumber}$1`
          );
        } catch (err) {
          if (err.code === "NotFound") {
            fileExists = false;
          } else {
            console.log(err);
            response.body = JSON.stringify({
              message: "File failed to upload",
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
        s3.upload(s3Params).promise();
        return url;
      } catch (err) {
        console.log(err);
        response.body = JSON.stringify({
          message: "File failed to upload",
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
