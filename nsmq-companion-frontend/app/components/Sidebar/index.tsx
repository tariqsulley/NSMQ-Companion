"use client"
import 'flowbite';
import { MdOutlineDashboard } from "react-icons/md";
import { PiStudentDuotone } from "react-icons/pi";
import { IoPeopleOutline } from "react-icons/io5";
import { IoAnalyticsOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { SlBookOpen } from "react-icons/sl";
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
// import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { initFlowbite } from "flowbite";
import { useEffect } from 'react';
import ThemeSwitch from '../Theme/ThemeSwitch';
import { LiaTrophySolid } from "react-icons/lia";
import { usePathname } from 'next/navigation';
import Image from "next/image"


const getInitials = (name: string) => {
    const nameArray = name?.split(" ");
    const initials = nameArray
        ?.map((namePart: string) => namePart.charAt(0))
        ?.slice(0, 2)
        ?.join("")
        ?.toUpperCase();
    return initials;
};

export default function Sidebar() {
    const { logout, Data } = useAuth()
    const router = useRouter();
    const currentPath = usePathname();


    useEffect(() => {
        initFlowbite();
    }, []);

    const isActive = (path: any) => {
        return currentPath === path
            ? "bg-blue-800 text-white"
            : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700";
    };

    const handleLogout = async () => {
        logout();
    };

    return (
        <div>
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-darkBgDeep dark:border-gray-700">
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
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">NSMQ Companion</span>
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
                                            {`${Data?.data?.first_name} ${Data?.data?.last_name}`}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                                            {`${Data?.data?.email_address}`}
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
            <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-darkBgDeep dark:border-gray-700" aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-darkBgDeep">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link href="/dashboard">
                                <div className={`sidebar-dashboard flex items-center p-2 rounded-lg group ${isActive("/dashboard")}`}>
                                    <MdOutlineDashboard size={25} />
                                    <span className="ms-3">Dashboard</span>
                                </div>
                            </Link>
                        </li>
                        {Data?.data?.account_type == "facilitator" ?
                            <li>
                                <Link href="/dashboard/students">
                                    <div className={`sidebar-students flex items-center p-2 rounded-lg group ${isActive("/dashboard/students")}`}>
                                        <PiStudentDuotone size={25} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Students</span>
                                    </div>
                                </Link>
                            </li> :
                            <li>
                                <Link href="/dashboard/practice">
                                    <div className={`sidebar-practice flex items-center p-2 rounded-lg group ${isActive("/dashboard/practice")}`}>
                                        <SlBookOpen size={25} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Practice</span>
                                    </div>
                                </Link>
                            </li>}
                        {Data?.data?.account_type == "student" ?
                            <li>
                                <Link href="/dashboard/champion-challenge">
                                    <div className={`sidebar-championchallenge flex items-center p-2 rounded-lg group ${isActive("/dashboard/champion-challenge")}`}>
                                        <LiaTrophySolid size={25} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Champion Challenge</span>
                                    </div>
                                </Link>
                            </li> :
                            null}
                        {Data?.data?.account_type == "facilitator" ?
                            <li>
                                <Link href="/dashboard/analytics">
                                    <div className={`sidebar-analytics flex items-center p-2 rounded-lg group ${isActive("/dashboard/analytics")}`}>
                                        <IoAnalyticsOutline size={25} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Analytics</span>
                                    </div>
                                </Link>
                            </li> : <li>
                                <Link href="/dashboard/multiplayer">
                                    <div className={`sidebar-multiplayer flex items-center p-2 rounded-lg group ${isActive("/dashboard/multiplayer")}`}>
                                        <IoPeopleOutline size={25} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Multiplayer</span>
                                    </div>
                                </Link>
                            </li>}
                        <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
                            <li>
                                <Link href="/dashboard/settings">
                                    <div className={`sidebar-settings flex items-center p-2 rounded-lg group ${isActive("/dashboard/settings")}`}>
                                        <IoSettingsOutline size={25} />
                                        <span className="flex-1 ms-3 whitespace-nowrap">Settings</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </ul>
                </div>
            </aside>
        </div>
    )
}