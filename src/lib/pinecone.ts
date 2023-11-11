import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
// read from filesystem and give back a text of pdf file
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter';
import { getEmbeddings } from "./embeddings";
import md5 from "md5";

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
}
type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {pageNumber:number}
    }
}
export async function loadS3IntoPinecone(fileKey: string){
    //1. obtain pdf -> download and read from pdf
    console.log("downloading s3 into file system.");
    const file_name = await downloadFromS3(fileKey);
    if(!file_name){
        throw new Error("could not download from S3");
    }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];
    
   
    const document = await Promise.all(pages.map(prepareDocument))
    
}

// vectorize and embed individual document
async function embedDocument(doc: Document) {
    try{
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent);
// return the vector type coming from pinecone
    return {
        id: hash,
        values: embeddings,
        metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
        },
    } as PineconeRecord;


    
    }catch(error){
        console.log("error embedding document", error)
        throw error
    }
}


export const truncateStringByByte = ( str: string, bytes: number ) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}
 //2. split and segment the pdf
 async function prepareDocument(page: PDFPage){
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/g, '');
    // split the code
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByByte(pageContent, 36000)
            }
        })
    ])
    return docs
 }