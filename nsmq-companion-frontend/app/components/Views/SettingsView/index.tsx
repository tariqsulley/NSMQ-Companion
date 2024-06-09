"use client"
import ProfilePic from '@/public/images/avatar.svg';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import AWS from "aws-sdk";
import { useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import API_BASE from '@/app/utils/api';
import axios from 'axios';
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSWR from 'swr';

interface UploadProgressEvent {
    loaded: number;
    total: number;
}

export default function SettingsView() {
    const { Data, mutate } = useAuth()
    const [uploadProgress, setUploadProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userName, setUserImageName] = useState<string | null>(null);
    const [userImage, setUserImage] = useState<any>(null);

    const uploadImageFile = async (selectedFile: File): Promise<void> => {
        const S3_BUCKET = 'nsmqcompanion';
        const REGION = 'eu-north-1';
        try {
            setUploading(true);
            AWS.config.update({
                accessKeyId: 'AKIAXYKJRC2AJRQ3RA7E',
                secretAccessKey: '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',
                region: REGION,
            });
            const s3 = new AWS.S3();
            const params = {
                Bucket: S3_BUCKET,
                Key: selectedFile.name,
                Body: selectedFile,
            };
            const upload = s3.upload(params);
            upload.on('httpUploadProgress', (evt: UploadProgressEvent) => {
                const progress = Math.round((evt.loaded * 100) / evt.total);
                setUploadProgress(progress);
            });
            const result = await upload.promise();

            const uploadedImageUrl = result.Location;
            setUserImage(uploadedImageUrl);
            setUserImageName(selectedFile.name);
            submitImageUrlToDatabase(uploadedImageUrl);
        } catch (error) {
            alert('Error uploading file.');
        } finally {
            setUploadProgress(0);
            setUploading(false);
        }
    };

    const handleFileChange = async (e: any) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const maxSize = 5 * 1024 * 1024;

            if (!selectedFile.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            if (selectedFile.size > maxSize) {
                alert(`Image size exceeds the allowed limit (5 MB).`);
                return;
            }

            if (
                file &&
                file.name === selectedFile.name &&
                file.size === selectedFile.size
            ) {
                return;
            }

            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (event: any) => {
                setUserImage(event.target.result);
            };
            reader.readAsDataURL(selectedFile);

            await uploadImageFile(selectedFile);
        } else {
            setFile(null);
            setUserImage(null);
        }
    };

    const submitImageUrlToDatabase = async (imageUrl: any) => {
        try {
            setUploading(true);
            const prefix = Data?.data.account_type == "student" ?
                `users/avatar/student/${Data?.data.uuid}` : `users/avatar/facilitator/${Data?.data.uuid}`
            const res = await axios.put(
                `${API_BASE}/${prefix}`,
                {
                    avatar_url: imageUrl,
                }
            );
            toast.success("Profile Picture Changed Successfully", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Slide,
            });
            console.log("Image URL submitted to database:", imageUrl);
            mutate();
        } catch (error) {
            console.log(error);
            toast.error("Error", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Slide,
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className='flex flex-col sm:flex-row w-full items-center justify-center m-5
        bg-white rounded-xl  md:min-h-[82vh] 2xl:min-h-[90vh] min-h-48'>
            <div className='flex flex-col items-center justify-center'>
                <div className="mt-4 text-center">
                    <div className="bg-white w-24 h-24  rounded-full m-auto flex items-center justify-center p-2 shadow-sm">
                        {!Data?.data.avatar_url ? (
                            <Image
                                src={ProfilePic}
                                width={64}
                                height={64}
                                alt="Preview"
                                className="rounded-full w-full h-full  object-cover"
                            />
                        ) : (
                            <Image
                                src={Data?.data.avatar_url}
                                alt="profile"
                                width={64}
                                height={64}
                                priority
                                className="rounded-full w-full h-full  object-cover"
                            />
                        )}
                    </div>

                    {uploading && (
                        <div className="flex gap-3 items-center">
                            <CgSpinner className="animate-spin text-primaryBlue" />
                            <div className="text-lg font-semibold text-primaryBlue">{`${uploadProgress}%`}</div>
                        </div>
                    )}

                    <label htmlFor="imageInput" className="cursor-pointer">
                        <span className="text-center pt-2 text-[#00458D]">Edit</span>
                        <input
                            type="file"
                            id="imageInput"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>                </div>

            </div>
            <div className='w-full mx-10 '>
                <div className=' sm:w-1/2' >
                    <p>Name</p>
                    <p className='rounded-xl border-2  p-2'>{Data?.data.first_name} {Data?.data.last_name}</p>
                </div>
                <div className=' sm:w-1/2' >
                    <p>Email</p>
                    <p className='rounded-xl border-2  p-2'>{Data?.data.email_address} </p>
                </div>
                <div className='mt-5'>
                    <button className='rounded-lg bg-blue-800 p-2 mb-2'>
                        <p className='text-white'>Change Password</p>
                    </button>
                </div>
            </div>
        </div>
    )
}