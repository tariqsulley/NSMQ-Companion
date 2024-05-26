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
import API_BASE from "../../../utils/api"
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { CgSpinner } from "react-icons/cg";

export default function RegisterForm() {
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [emailAddress, setEmailAddress] = useState<string>("")
    const [schoolName, setSchoolName] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [emailError, setEmailError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()

    const isValidEmail = (email: string): boolean => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleContinue = (): boolean => {
        if (!isValidEmail(emailAddress)) {
            toast.error("Please enter a valid email address", {
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
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Slide,
            });
            return false;
        }

        return true;
    };

    const handleSignUp = async (e: any): Promise<void> => {
        e.preventDefault();
        if (!handleContinue()) return;

        try {
            setLoading(true)
            const response = await axios.post(`${API_BASE}/facilitators/create`, {
                first_name: firstName,
                last_name: lastName,
                school: schoolName,
                email_address: emailAddress,
                password: password,
                account_type: "facilitator"
            });
            console.log(response.data);
            router.push("/dashboard")
        } catch (error: any) {
            console.error("An error occurred during registration:", error);
            toast.error("Registration failed", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Slide,
            });
        } finally {
            setLoading(false)
        }
    };


    return (
        <div className="flex bg-white z-0 sm:w-[90%] h-[95%] rounded-lg shadow-xl overflow-y-scroll ">
            <ToastContainer />
            <form onSubmit={handleSignUp} className="md:w-1/2 z-0 flex flex-col  items-center justify-center">
                <div className="p-10 w-full flex flex-col gap-2">
                    <p className="text-3xl font-bold">Sign Up As A Facilitator</p>
                    <div className="flex w-full justify-between items-center">
                        <div className="flex flex-col w-[45%]">
                            <p>First Name</p>
                            <TextInput
                                value={firstName}
                                onValueChange={(value: string) => setFirstName(value)}
                                className="w-full "
                                placeholder="Enter first name"
                                required />
                        </div>

                        <div className="flex flex-col w-[45%]">
                            <p>Last Name</p>
                            <TextInput
                                value={lastName}
                                onValueChange={(value: string) => setLastName(value)}
                                placeholder="Enter last name" required />
                        </div>
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
                    <div>
                        <p>Password</p>
                        <TextInput
                            value={password}
                            type="password"
                            onValueChange={(value: string) => setPassword(value)}
                            placeholder="Enter password" required />
                    </div>
                    <div>
                        <p>Confirm Password</p>
                        <TextInput
                            value={confirmPassword}
                            type="password"
                            onValueChange={(value: string) => setConfirmPassword(value)}
                            placeholder="Confirm password" required />
                    </div>
                    <div className="flex items-center justify-center mt-2">
                        <PrimaryBtn txt="Sign Up" loading={loading} />
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
                            <Link href={"/auth/login"} className="text-blue-500 font-semibold hover:underline mx-1">Sign In</Link></p>
                    </div>
                </div>
            </form>

            <div className="hidden md:block w-1/2 relative">
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