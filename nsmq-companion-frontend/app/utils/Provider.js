"use client"
import { SessionProvider } from "next-auth/react";

const Provider = (props) => {
    return (
        <SessionProvider>
            {props.children}
        </SessionProvider>
    )
}

export default Provider