"use client";
import Image from "next/image";
import nsmq_logo from '../../../../public/images/nsmq_logo.png';
import { useRouter } from "next/navigation";

interface PracticeCardProps {
    year: string;
    contest_nums: string;
}

export default function PracticeCard({ year, contest_nums }: PracticeCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/practice/${year}?nums=${contest_nums}`);
    }

    return (
        <div className="rounded-t-xl bg-white shadow cursor-pointer" onClick={handleClick}>
            <div className="relative overflow-hidden group">
                <Image src={nsmq_logo} alt="image"
                    className="rounded-t-xl transition-transform duration-300 transform group-hover:scale-110" />
            </div>
            <div className="bg-gray-200 p-2 w-full shadow">
                <div className="mx-4 mb-2">
                    <p>{year}</p>
                    <p>0/40 complete</p>
                </div>

                <div className="flex items-center justify-center">
                    <button onClick={handleClick} className="bg-blue-700 text-white w-[90%] py-2 rounded-lg shadow mb-2">
                        Practice
                    </button>
                </div>
            </div>
        </div>
    );
}
