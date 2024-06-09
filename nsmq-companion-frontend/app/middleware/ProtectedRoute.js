"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import API_BASE from "../utils/api";
import axios from "axios";


const WithAuth = ({ children }) => {
    const router = useRouter();
    const { data: nextAuthSession, status } = useSession();
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    async function verifyToken(token) {
        try {
            const response = await axios.post(`${API_BASE}/verify_token_frontend`, {
                Token: token
            });
            return response.status === 200;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    useEffect(() => {

        // Authentication will be in two parts
        // Sign up with google or the custom backend solution in FastAPI
        // Hence, I check if the user is authenticated via any of the two methods

        if (status === "loading") return;

        // Checking for NextAuth session first
        if (status !== "unauthenticated") {
            setIsAuthenticated(true);
            return;
        }

        // Checking for custom backend session
        const cookieRow = document.cookie.split('; ').find(row => row.startsWith('access_token'));
        const accessToken = cookieRow ? cookieRow.split('=')[1] : null;


        if (!accessToken) {
            console.log("No access token found");
            router.push('/auth/login');
        } else {
            // console.log("access", accessToken)
            // Verifying the token with backend
            verifyToken(accessToken).then(isValid => {
                if (isValid) {
                    setIsAuthenticated(true);
                    console.log("Token verified and authenticated via custom backend");
                } else {
                    console.log("valid", isValid)
                    console.log("Invalid or expired token");
                    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    router.push('/dashboard');
                }
            });
        }
    }, [status]);

    if (!isAuthenticated) return null;

    return children
};


export default WithAuth;