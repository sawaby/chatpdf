'use client'
import { uploadToS3 } from '@/lib/s3';
import { Inbox } from 'lucide-react';
import React from 'react'
import { useDropzone } from 'react-dropzone';

type Props = {}

const FileUpload = () => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles:1,
        onDrop: async (acceptedFiles) => {
            console.log(acceptedFiles);
            const file = acceptedFiles[0]
            if(file.size > 10 * 1024 * 1024){
                //bigger than 10mb
                alert('please upload a smaller file!');
                return
            }

            try{
                const data = await uploadToS3(file);
                console.log('data', data)
            }catch(error){
                console.log(error)
            }
            
        }
    });

  return (
    <div className='p-2 bg-slate-200 rounded-xl'>
        <div {...getRootProps()}
            className='border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
            >
            <input {...getInputProps()}/>
            <>
                <Inbox className='w-10 h-10 text-slate-600' />
                <p className='mt-2 text-sm text-slate-400'>
                    Drop PDF here
                </p>
            </>
        </div>
    </div>
  )
}

export default FileUpload