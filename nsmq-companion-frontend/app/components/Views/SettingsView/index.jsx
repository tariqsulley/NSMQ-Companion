"use client"
import ProfilePic from '@/public/images/avatar.svg';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';

export default function SettingsView() {
    const { Data } = useAuth()
    return (
        <div className='flex flex-col sm:flex-row w-full items-center justify-center m-5
        bg-white rounded-xl  md:min-h-[82vh] 2xl:min-h-[90vh] min-h-48'>
            <div className='flex flex-col items-center justify-center'>
                <Image src={ProfilePic} alt='profile img' />
                <button>
                    <p>Edit Profile Picture</p>
                </button>
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