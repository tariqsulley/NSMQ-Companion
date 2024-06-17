"use client"
import Table from "./table";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import { AiOutlinePlus } from "react-icons/ai";



import { TextInput } from '@tremor/react';

export default function StudentsTable() {
    const [searchTerm, setSearchTerm] = useState<string>("");

    return (
        <div className=" w-[97%] mt-[100px]">
            <div className="flex items-center justify-between mt-4">
                <div>
                    <TextInput
                        icon={CiSearch}
                        placeholder="Search Students"
                        onValueChange={(value: string) => setSearchTerm(value)}
                    />
                </div>
                <div className="flex gap-2">

                    <Link
                        href={"/add-student"}
                        className="bg-primaryBtn text-white md:px-4 px-2 py-2 mr-2 rounded-lg flex items-center justify-center hover:opacity-80"
                    >
                        <p>Add Student</p>
                        <AiOutlinePlus size={20} />
                    </Link>
                </div>
            </div>
            <Table filter={searchTerm} />
        </div>
    );
}