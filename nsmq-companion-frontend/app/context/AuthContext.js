"use client";

import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Cookies from "js-cookie";

import API_BASE from "@/app/utils/api";

const AuthContext = createContext();

const fetcher = (url) => {
    const token = Cookies.get("access_token");
    return fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [verifyEmail, setVerifyEmail] = useState("");

    const login = async (email, password, account_type) => {
        setError(null);
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE}/login`, {
                email_address: email,
                password: password,
                account_type: account_type
            });

            const userInfo = response.data;
            // console.log(userInfo);

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
                (userInfo.user.role === "customer"
                    ? "/dashboard/onboarding"
                    : "/authentication/login");
            router.replace(redirectUrl);

            const token = Cookies.get("access_token");
            if (token) {
                router.replace(redirectUrl);
            }

            // router.push(redirectPath);
        } catch (error) {
            const { response } = error;
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
        router.replace("/authentication/login");
    };

    const fetchUserData = async (url) => {
        const response = await fetch(url);
        const { data } = await response.json();
        return data;
    };

    const token = Cookies.get("access_token");
    const uuid = Cookies.get("uuid");
    const decodedToken = token ? jwt.decode(token) : null;

    const { data, isLoading } = useSWR(
        `${API_BASE}/facilitator/${uuid}`,
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
        if (data) {
            // console.log(data);
            setUserData(data?.data);
        }
    }, [data]);

    const value = {
        isLoggedIn,
        userData,
        error,
        loading,
        data,
        login,
        logout,
        verifyEmail,
        handleEmailVerification,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
