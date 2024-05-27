"use client"
import Image from "next/image"
import nsmq_logo from '../../../../public/images/nsmq_logo.png'

interface PracticeCardProps {
    year: string;
}

export default function PracticeCard({ year }: PracticeCardProps) {
    return (
        <div className="rounded-t-xl bg-white shadow ">
            <Image src={nsmq_logo} alt="image" className="rounded-t-xl" />
            <div className="bg-gray-400 w-full shadow">
                <div className="mx-4 mb-2">
                    <p>{year}</p>
                    <p>0/40 complete</p>
                </div>

                <div className="flex items-center justify-center">
                    <button className="bg-blue-700 text-white w-[90%] py-2 rounded-lg shadow mb-2">
                        Practice
                    </button>
                </div>
            </div>
        </div>
    )
}