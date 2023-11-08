import AWS from 'aws-sdk'

import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";
import { resolve } from 'path';

export async function uploadToS3(file: File): Promise<{ file_key: string; file_name: string }> {
    return new Promise((resolve, reject) => {
        try {
            const s3 = new S3({
                region: 'us-west-1',
                credentials: {
                    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!
                },
                
            });
            
            const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ', '-');

            const params = {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
                Key: file_key,
                Body: file
            };

            s3.putObject(
                params,
                (err: any, data: PutObjectCommandOutput | undefined) => {
                  return resolve({
                    file_key,
                    file_name: file.name,
                  });
                }
            );  
  
    
        // JS SDK v3 does not support global configuration.
        // Codemod has attempted to pass values to each service client in this file.
        // You may need to update clients outside of this file, if they use global config.
        // AWS.config.update({
        //     accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
        //     secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        // });
        
        

        
        // const upload = s3.putObject(params).on('httpUploadProgress', event => {
        //     console.log("uploading to s3...", parseInt(((event.loaded * 100) / event.total).toString())) + "%"
        // }).promise()

        // await upload.then(data => {
        //     console.log('successfully uploaded to s3!', file_key)
        // })

        // await Promise.resolve({
        //     file_key,
        //     file_name: file.name
        // })
    } catch (error) {
        reject(error);
    }
});
}

export function getS3Url(file_key: string) {
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
    return url;
}