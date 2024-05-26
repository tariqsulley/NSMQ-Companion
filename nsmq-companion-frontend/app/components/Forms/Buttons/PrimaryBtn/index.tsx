"use client";

import { CgSpinner } from "react-icons/cg";

interface PrimaryBtnProps {
    loading: boolean;
}

const PrimaryBtn: React.FC<PrimaryBtnProps> = ({ loading }) => {
    return (
        <button className="flex items-center justify-center mb-2 w-full 
        rounded-lg border bg-blue-500 p-2 hover:opacity-80">
            <p className="text-white font-semibold"> {loading ? <CgSpinner className="animate-spin" size={30} /> : "Sign Up"} </p>
        </button>
    );
};

export default PrimaryBtn;
