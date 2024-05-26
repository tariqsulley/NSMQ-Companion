"use client"
import winner from "../../../../public/images/winner.png"
import bg_img from "../../../../public/images/bg.png"
import Image from "next/image"
import { TextInput } from '@tremor/react';
import GoogleBtn from "../Buttons/GoogleBtn";
import PrimaryBtn from "../Buttons/PrimaryBtn";

export default function RegisterForm() {
    return (
        <div className="flex bg-white sm:w-[90%] h-[90%] rounded-lg shadow-xl ">

            <div className="sm:w-1/2 flex flex-col items-center justify-center">
                <div className="p-10 w-full flex flex-col gap-2">
                    <p className="text-xl font-bold">Sign Up As A Facilitator</p>
                    <div className=" w-full">
                        <p>First Name</p>
                        <TextInput placeholder="Enter first name" className="w-full" />
                    </div>

                    <div>
                        <p>Last Name</p>
                        <TextInput placeholder="Enter last name" />
                    </div>
                    <div>
                        <p>Email Address</p>
                        <TextInput placeholder="Enter email address" />
                    </div>
                    <div>
                        <p>School Name</p>
                        <TextInput placeholder="Enter name of affiliated school" />
                    </div>
                    <div className="flex items-center justify-center mt-2">
                        <PrimaryBtn />
                    </div>
                    <div>
                        <p className="flex justify-center text-center my-2">
                            <span className="hidden sm:inline-block text-gray-300">
                                ———————————
                            </span>
                            <span className="inline-block text-gray-300 sm:hidden">———————</span>
                            <span className="text-black mx-4">OR</span>
                            <span className="hidden sm:inline-block text-gray-300">
                                ———————————
                            </span>
                            <span className="inline-block text-gray-300 sm:hidden">———————</span>
                        </p>
                    </div>
                    <div>
                        <GoogleBtn />
                    </div>
                </div>
            </div>

            <div className="hidden sm:block w-1/2 relative">
                <Image
                    src={winner}
                    alt="image"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-tr-lg rounded-br-lg"
                />
            </div>

        </div>
    )
}