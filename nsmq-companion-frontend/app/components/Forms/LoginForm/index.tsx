"use client"
import winner from "../../../../public/images/winner.png"
import Image from "next/image"
import { TextInput } from '@tremor/react';
import GoogleBtn from "../../Buttons/GoogleBtn";
import PrimaryBtn from "../../Buttons/PrimaryBtn";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import API_BASE from "../../../utils/api"
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectItem,
} from '@tremor/react';
import { useAuth } from "@/app/context/AuthContext";

export default function LoginForm() {
    const [emailAddress, setEmailAddress] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    // const [loading, setLoading] = useState<boolean>(false)
    const [accountType, setAccountType] = useState<string>("")
    const router = useRouter()
    const { login, error, loading } = useAuth();

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
        return true;
    };

    // const handleSignIn = async (e: any): Promise<void> => {
    //     e.preventDefault();
    //     if (!handleContinue()) return;

    //     try {
    //         setLoading(true)
    //         const response = await axios.post(`${API_BASE}/login`, {
    //             email_address: emailAddress,
    //             password: password,
    //             account_type: accountType
    //         });
    //         console.log(response.data);
    //         router.push("/dashboard")
    //     } catch (error: any) {
    //         console.error("An error occurred during registration:", error);
    // toast.error("Registration failed", {
    //     position: "top-center",
    //     autoClose: 5000,
    //     hideProgressBar: true,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: "colored",
    //     transition: Slide,
    // });
    //     } finally {
    //         setLoading(false)
    //     }
    // };

    const handleSignIn = async (e: any): Promise<void> => {
        e.preventDefault()
        if (!handleContinue()) return;
        await login(emailAddress, accountType, password);
    }

    return (
        <div className="flex bg-white sm:w-[90%] h-[95%] rounded-lg shadow-xl ">
            <ToastContainer />
            <form onSubmit={handleSignIn} className="sm:w-1/2 flex flex-col  items-center justify-center">
                <div className="p-10 w-full flex flex-col gap-4">
                    <p className="text-3xl font-bold">Login</p>
                    <div>
                        <p>Email Address</p>
                        <TextInput
                            value={emailAddress}
                            onValueChange={(value: string) => setEmailAddress(value)}
                            placeholder="Enter email address" required />
                    </div>
                    <div>
                        <p>Account Type</p>
                        <Select
                            value={accountType}
                            onValueChange={setAccountType}
                            defaultValue="0"
                            required
                        >
                            <SelectItem value="facilitator">Facilitator</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                        </Select>
                    </div>
                    <div>
                        <p>Password</p>
                        <TextInput
                            value={password}
                            type="password"
                            onValueChange={(value: string) => setPassword(value)}
                            placeholder="Enter password" required />
                    </div>

                    <div className="flex items-center justify-center mt-2">
                        <PrimaryBtn txt="Sign In" loading={loading} />
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
                        <p className="text-[#6A6E73] font-semibold">Don't have an account?
                            <Link href={"/auth/register"} className="text-blue-500 font-semibold hover:underline mx-1">Sign Up</Link></p>
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
                    priority={true}
                />
            </div>

        </div>
    )
}