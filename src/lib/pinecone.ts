import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
// read from filesystem and give back a text of pdf file
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
}

export async function loadS3IntoPinecone(fileKey: string){
    //1. obtain pdf -> download and read from pdf
    console.log("downloading s3 into file system.");
    const file_name = await downloadFromS3(fileKey);
    if(!file_name){
        throw new Error("could not download from S3");
    }
    const loader = new PDFLoader(file_name);
    const pages = await loader.load();
    return pages;
}