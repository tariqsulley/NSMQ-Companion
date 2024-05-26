"use client"
import winner from "../../../../public/images/winner.png"
import bg_img from "../../../../public/images/bg.png"
import Image from "next/image"
import { TextInput } from '@tremor/react';
import GoogleBtn from "../Buttons/GoogleBtn";
import PrimaryBtn from "../Buttons/PrimaryBtn";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";


export default function RegisterForm() {
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [emailAddress, setEmailAddress] = useState<string>("")
    const [schoolName, setSchoolName] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")

    const handleSignUp = async (e) => {
        e.preventDefault()
        // const ressponse = await axios.post({

        // })
    }

    return (
        <div className="flex bg-white sm:w-[90%] h-[90%] rounded-lg shadow-xl ">

            <form onSubmit={handleSignUp} className="sm:w-1/2 flex flex-col  items-center justify-center">
                <div className="p-10 w-full flex flex-col gap-4">
                    <p className="text-3xl font-bold">Sign Up As A Facilitator</p>
                    <div className=" w-full">
                        <p>First Name</p>
                        <TextInput
                            value={firstName}
                            onValueChange={(value: string) => setFirstName(value)}
                            className="w-full "
                            placeholder="Enter first name"
                            required />
                    </div>

                    <div>
                        <p>Last Name</p>
                        <TextInput
                            value={lastName}
                            onValueChange={(value: string) => setLastName(value)}
                            placeholder="Enter last name" required />
                    </div>
                    <div>
                        <p>Email Address</p>
                        <TextInput
                            value={emailAddress}
                            onValueChange={(value: string) => setEmailAddress(value)}
                            placeholder="Enter email address" required />
                    </div>
                    <div>
                        <p>School Name</p>
                        <TextInput
                            value={schoolName}
                            onValueChange={(value: string) => setSchoolName(value)}
                            placeholder="Enter name of affiliated school" required />
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
                    <div className="w-full text-center ">
                        <p className="text-[#6A6E73] font-semibold">Already have an account?
                            <Link href={"#"} className="text-blue-500 font-semibold hover:underline mx-1">Sign In</Link></p>
                    </div>
                </div>
            </form>

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