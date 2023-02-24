This is a lambda function that takes what's uploaded in a form's <input type="file" name="img1"> and stores the files, which will be images, in s3. There are several file upload fields. I check if the file name exists in the s3 bucket. If it exists, using a while loop I increment the file name until it doesn't exist.

The function runs in a Node.js environment.

The working lambda function works, but it's on aws-sdk for JavaScript v2. The non-working one attempts to convert to aws-sdk for JavaScript v3.

This is the error I'm getting:
NotFound: UnknownError
at deserializeAws_restXmlNotFoundResponse (/Users/Ashley/Documents/economy-drain-cleaning-plumbing/node_modules/@aws-sdk/client-s3/dist-cjs/protocols/Aws_restXml.js:6173:23)
at deserializeAws_restXmlHeadObjectCommandError (/Users/Ashley/Documents/economy-drain-cleaning-plumbing/node_modules/@aws-sdk/client-s3/dist-cjs/protocols/Aws_restXml.js:4742:25)
at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
at async /Users/Ashley/Documents/economy-drain-cleaning-plumbing/node_modules/@aws-sdk/middleware-serde/dist-cjs/deserializerMiddleware.js:7:24
at async /Users/Ashley/Documents/economy-drain-cleaning-plumbing/node_modules/@aws-sdk/middleware-signing/dist-cjs/middleware.js:14:20
at async /Users/Ashley/Documents/economy-drain-cleaning-plumbing/node_modules/@aws-sdk/middleware-retry/dist-cjs/retryMiddleware.js:27:46
at async /Users/Ashley/Documents/economy-drain-cleaning-plumbing/node_modules/@aws-sdk/middleware-logger/dist-cjs/loggerMiddleware.js:5:22
at async /Users/Ashley/Documents/economy-drain-cleaning-plumbing/netlify/functions/form-submission.js:46:11
at async Promise.all (index 0)
at async exports.handler (/Users/Ashley/Documents/economy-drain-cleaning-plumbing/netlify/functions/form-submission.js:36:19) {
'$fault': 'client',
  '$metadata': {
httpStatusCode: 404,
requestId: '5QHEJBCWM5D73PF9',
extendedRequestId: 'nyXDOP7hCcxadhx2R3/oknUPjHe1I3qtE+p7OEUITVlcc5JvtvMxZ6YdRpkschkFiO0PDp+zg04=',
cfId: undefined,
attempts: 1,
totalRetryDelay: 0
}
}
Failed to upload file(s) to S3: {"message":"File failed to upload","errorMessage":"UnknownError"}
