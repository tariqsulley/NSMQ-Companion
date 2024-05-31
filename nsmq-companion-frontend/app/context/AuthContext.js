"use client";

import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Cookies from "js-cookie";

import API_BASE from "@/app/utils/api";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext();

const fetcher = async (url) => {
    const response = await axios.get(url, {
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`,
        //   },
    });
    return response?.data;
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [Error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [verifyEmail, setVerifyEmail] = useState("");

    const login = async (email, account_type, password,) => {
        setError(null);
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE}/login`, {
                email_address: email,
                password: password,
                account_type: account_type
            });

            const userInfo = response?.data;
            console.log("userinfo", userInfo);

            setIsLoggedIn(true);
            setUserData(userInfo);

            const tokenData = jwt.decode(userInfo.access_token);
            const expirationDate = new Date(tokenData.exp * 1000);
            Cookies.set("access_token", userInfo.access_token, {
                expires: expirationDate,
                path: "/",
                sameSite: "strict",
            });

            Cookies.set("uuid", userInfo?.user?.uuid, {
                expires: expirationDate,
                path: "/",
                sameSite: "strict",
            });

            const callbackUrl = new URL(window.location.href).searchParams.get(
                "callbackUrl"
            );

            const redirectUrl =
                callbackUrl ||
                (userInfo.user.account_type === "facilitator" || userInfo.user.account_type === "student"
                    ? "/dashboard"
                    : "/auth/login");

            router.replace(redirectUrl);

            const token = Cookies.get("access_token");
            if (token) {
                router.replace(redirectUrl);
            }

            // router.push(redirectPath);
        } catch (error) {
            const { response } = error;
            toast.error("Invalid login credentials", {
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
            if (response) {
                setError(response.data.userMsg || "An error occurred during login");
            } else {
                setError("An error occurred during login");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUserData(null);
        setIsLoggedIn(false);
        setLoading(false);
        Cookies.remove("access_token");
        Cookies.remove("uuid");
        localStorage.removeItem("isFirstTimeUser");
        router.push("/auth/login");
    };

    const fetchUserData = async (url) => {
        const response = await fetch(url);
        const { data } = await response.json();
        return data;
    };

    const token = Cookies.get("access_token");
    const uuid = Cookies.get("uuid");
    const decodedToken = token ? jwt.decode(token) : null;

    const { data: Data, error, isLoading } = useSWR(
        `${API_BASE}/facilitators/${uuid}/find`,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );


    const handleEmailVerification = (email) => {
        setVerifyEmail(email);
    };

    // console.log(data);

    useEffect(() => {
        if (Data) {
            // console.log(data);
            setUserData(Data?.data);
        }
    }, [Data]);

    const value = {
        isLoggedIn,
        userData,
        Error,
        loading,
        Data,
        login,
        logout,
        verifyEmail,
        handleEmailVerification,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
