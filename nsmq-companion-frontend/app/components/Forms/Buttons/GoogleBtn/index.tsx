"use client"
import googlelogo from "../../../../../public/icons/google-logo.png"
import Image from "next/image";
// import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

function GoogleBtn() {
    const [isLoading, setIsLoading] = useState(false);
    const callbackUrl = "http://localhost:3000/dashboard/onboarding";

    //   async function googlesignin() {
    //     setIsLoading(true);
    //     signIn("google", { callbackUrl });
    //   }
    return (
        <button
            //   onClick={googlesignin}
            className="flex items-center justify-center mb-2 w-full 
    rounded-lg border border-gray-300 p-2 hover:opacity-80"
        >
            {isLoading ? (
                <FaSpinner className="animate-spin text-md mx-2" />
            ) : (
                <>
                    <Image src={googlelogo} width={20} height={45} alt="google logo" />
                    <p className=" mx-2">Sign Up With Google</p>
                </>
            )}
        </button>
    );
}

export default GoogleBtn;
