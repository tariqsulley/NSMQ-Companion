"use client";
import Image from "next/image";
import nsmq_logo from '../../../../public/images/nsmq_logo.png';
import { useRouter } from "next/navigation";
import { GiMaterialsScience } from "react-icons/gi";
import { LuArrowUpRightSquare } from "react-icons/lu";

interface PracticeCardProps {
    year: string;
    contest_nums: string;
    sub_text: string;
}

export default function PracticeCard({ year, contest_nums, sub_text }: PracticeCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/practice/${year}?nums=${contest_nums}`);
    }

    return (
        <div className="border  border-gray-100 hover:border-primary transition duration-300 rounded-md
         shadow-md shadow-slate-200 p-[17px] w-11/12  bg-white " onClick={handleClick}>
            <div className="relative overflow-hidden group">
                <Image src={nsmq_logo} alt="image"
                    className="rounded-t-xl transition-transform duration-300 transform group-hover:scale-110" />
            </div>
            <div className="bg-gray-100">
                <div className=" p-2 " >
                    <div className="bg-blue-800 rounded-lg  flex items-center justify-center w-[5%] p-2 left-0">
                        <GiMaterialsScience size={20} className="text-white" />
                    </div>
                </div>

                <div className="p-2">
                    <div>
                        <p className="font-bold text-lg">Competition Year: {year}</p>
                        <p className="text-[#475569] text-[15px]">{sub_text}</p>
                    </div>
                    <div>
                        <p className="font-semibold">  40 contests </p>
                    </div>
                    <div className=" ">
                        <p className="text-green-500 bg-green-600 font-semibold
                    bg-opacity-10 rounded-full px-2 mt-2 "> ● 2 complete </p>
                    </div>

                    <button className="flex shadow justify-center items-center px-6 py-2 gap-1 bg-gray-200 rounded-lg mt-5">
                        <p className="font-bold">View</p>
                        <LuArrowUpRightSquare size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
