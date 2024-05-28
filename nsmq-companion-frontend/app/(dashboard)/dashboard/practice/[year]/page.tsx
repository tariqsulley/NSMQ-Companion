"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import PracticeNavBar from "@/app/components/PracticeNavBar";
import { useSearchParams } from "next/navigation";
import ContestCard from "@/app/components/Cards/ContestCard";
import ContestData from "@/app/utils/NSMQContests";

interface PracticeYearProps {
    params: {
        year: string;
    };
}

export default function PracticeYear({ params }: PracticeYearProps) {
    const { year } = params;
    const searchParams = useSearchParams();
    const type = parseInt(searchParams.get("nums") ?? "0");
    const [selectedContest, setSelectedContest] = useState("");
    const [contestValue, setContestValue] = useState("");
    const router = useRouter();

    const contests = useMemo(() => {
        const contestExists = ContestData.some(cd => cd.year === year && cd.contest_nums === type.toString());
        if (!contestExists) {
            return null;
        }
        return Array.from({ length: type }, (_, index) => `Contest ${index + 1}`);
    }, [year, type]);

    const handleContestClick = (contest: any) => {
        setSelectedContest(contest);
        router.push(`/dashboard/practice/${year}?nums=${type}`);
    }


    if (!contests) {
        return (
            <div className="bg-bgMain h-screen">
                <PracticeNavBar />
                <div className="text-center mt-20">
                    <div>Unavailable contest on the page</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-bgMain h-screen">
            <PracticeNavBar />
            <h1 className="text-2xl font-semibold text-center mt-6">
                Practice for Year: {year} - Number of Contests: {type}  {selectedContest}
            </h1>
            <div className="h-screen bg-white fixed left-0 top-0 overflow-y-scroll w-[50%] sm:w-[20%] mt-[57px] border-r-2 pb-10">
                {contests.map(contest => (
                    <ContestCard
                        key={contest}
                        contest_name={contest}
                        bg_color="bg-gray-200"
                        is_active={selectedContest === contest}
                        onClick={() => handleContestClick(contest)}
                    />
                ))}
            </div>
        </div>
    );
}