"use client"
import 'flowbite';
import Link from "next/link"
import { initFlowbite } from "flowbite";
import { useEffect } from 'react';
import ThemeSwitch from '../Theme/ThemeSwitch';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';


export default function PracticeNavBar() {
    const { logout, Data } = useAuth()

    useEffect(() => {
        initFlowbite();
    }, []);

    const getInitials = (name: string) => {
        const nameArray = name?.split(" ");
        const initials = nameArray
            ?.map((namePart: string) => namePart.charAt(0))
            ?.slice(0, 2)
            ?.join("")
            ?.toUpperCase();
        return initials;
    };

    const handleLogout = async () => {
        logout();
    };

    return (

        <nav className="fixed top-0 z-50 w-full bg-blue-800 border-b border-gray-200 dark:bg-darkBgDeep dark:border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                            </svg>
                        </button>
                        <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                            {/* <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="FlowBite Logo" /> */}
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white text-white">NSMQ Companion</span>
                        </a>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center ms-3">
                            <div className='mx-10'>
                                <ThemeSwitch />
                                
                            </div>
                            <div>
                                <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                    <div className="flex items-center justify-center rounded-full bg-primary border-2 border-blue-100 h-8 w-8">
                                        {!Data?.data.avatar_url ?
                                            <p className="text-white text-md">{getInitials(Data?.data?.first_name)}</p> :
                                            <Image
                                                src={Data?.data.avatar_url}
                                                alt="profile"
                                                width={34}
                                                height={34}
                                                priority
                                                className="rounded-full w-full h-full  object-cover"
                                            />
                                        }
                                    </div>
                                </button>
                            </div>
                            <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                                <div className="px-4 py-3" role="none">
                                    <p className="text-sm text-gray-900 dark:text-white" role="none">
                                        {`${Data?.data.first_name} ${Data?.data.last_name}`}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                                        {`${Data?.data.email_address}`}
                                    </p>
                                </div>
                                <div className="py-1" >
                                    <button onClick={handleLogout}>
                                        <p
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Sign out</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}