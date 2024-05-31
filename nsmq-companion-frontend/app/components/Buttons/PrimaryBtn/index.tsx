"use client";

import { CgSpinner } from "react-icons/cg";

interface PrimaryBtnProps {
    loading: boolean;
    txt: string;
}

const PrimaryBtn: React.FC<PrimaryBtnProps> = ({ loading, txt }) => {
    return (
        <button className="flex items-center justify-center mb-2 w-full 
        rounded-lg border bg-blue-800 p-2 hover:opacity-80 dark:bg-darkBgBtn">
            <p className="text-white font-semibold"> {loading ? <CgSpinner className="animate-spin" size={30} /> : txt} </p>
        </button>
    );
};

export default PrimaryBtn;
