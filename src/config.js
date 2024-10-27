export const config = {
    aws: {
        region: process.env.REACT_APP_AWS_REGION,
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
    s3: {
        bucketName: process.env.REACT_APP_S3_BUCKET,
    },
};