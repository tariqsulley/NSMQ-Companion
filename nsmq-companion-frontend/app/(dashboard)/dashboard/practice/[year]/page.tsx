"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PracticeNavBar from "@/app/components/PracticeNavBar";
import { useSearchParams } from "next/navigation";
import ContestCard from "@/app/components/Cards/ContestCard";
import ContestData from "@/app/utils/NSMQContests";
import API_BASE from "@/app/utils/api";
// @ts-ignore
import useSound from 'use-sound';
import { IoReturnUpBack } from "react-icons/io5";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";

interface PracticeYearProps {
    params: {
        year: string;
    };
}

type ContestRoundData = {
    date: string;
    [key: string]: string | number;
};


export default function PracticeYear({ params }: PracticeYearProps) {
    const { year } = params;
    const { Data } = useAuth()
    const searchParams = useSearchParams();
    const type = parseInt(searchParams.get("nums") ?? "0");
    const [selectedContest, setSelectedContest] = useState("");
    const [contestValue, setContestValue] = useState("");
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const sidebarRef = useRef<any>(null);
    const [sidebarWidth, setSidebarWidth] = useState(0);
    const cardsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const [completedRounds, setCompletedRounds] = useState<any>(null);
    const fetcher = async (url: any) => {
        const response = await axios.get(url);
        return response?.data;
    };

    const {
        data: completedData,
        error: Error,
        isLoading: IsLoaing
    } = useSWR(
        `${API_BASE}/questions/contest-rounds?student_uuid=${Data?.data.uuid}&year=${year}`,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 1000
        },
    );

    useEffect(() => {
        if (completedData) {
            setCompletedRounds(completedData);
        }
    }, [completedData]);



    const isRoundCompleted = (contestId: any, roundNumber: any) => {
        const contestData = completedRounds?.find((item: ContestRoundData) => item.date === `Contest ${contestId}`);
        return contestData ? !!contestData[`Round ${roundNumber}`] : false;
    };

    const [showReviewDropdown, setShowReviewDropdown] = useState(false);

    const handleReviewRound = (contest: any, roundNumber: any) => {
        const contestId = contest.split(' ')[1];
        router.push(`/dashboard/contest/${year}?id=${contestId}&startRound=${roundNumber}&mode=review`);
    };




    const contests = useMemo(() => {
        const contestExists = ContestData.some(cd => cd.year === year && cd.contest_nums === type.toString());
        if (!contestExists) {
            return null;
        }
        return Array.from({ length: type }, (_, index) => `Contest ${index + 1}`);
    }, [year, type]);

    const currentContests = contests?.slice(indexOfFirstCard, indexOfLastCard);

    const getStartingRound = (completedRoundsForContest: any) => {
        if (!completedRoundsForContest) return 1;
        for (let i = 1; i <= 4; i++) {
            if (!completedRoundsForContest[`Round ${i}`]) {
                return i;
            }
        }
        return 1;
    }


    const handleContestClick = (contest: any) => {
        setSelectedContest(contest);
        const contestId = contest.split(' ')[1];
        setContestValue(contest);
    }

    const handleStartContest = (contest: any) => {
        const contestId = contest.split(' ')[1];
        const completedRoundsForContest = completedRounds?.find((item: any) => item.date === `Contest ${contestId}`);
        const startingRound = getStartingRound(completedRoundsForContest);
        router.push(`/dashboard/contest/${year}?id=${contestId}&startRound=${startingRound}`);
    }

    const calculatePercentageCompleted = (contest: string) => {
        const completedRoundsForContest = completedRounds?.find((item: any) => item.date === contest);
        if (!completedRoundsForContest) return 0;

        let completedRoundsCount = 0;
        for (let i = 1; i <= 4; i++) {
            if (completedRoundsForContest[`Round ${i}`]) {
                completedRoundsCount++;
            }
        }

        return (completedRoundsCount / 4) * 100;
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
        <div className="bg-bgMain dark:bg-darkBgDeep h-screen">
            <PracticeNavBar />
            <div>

            </div>
            <div className="bg-white dark:bg-darkBgLight shadow rounded-b-xl mt-20">
                <Link href={"/dashboard/practice"} className="flex bg-white dark:bg-blue-800 sm:w-[15%] items-center justify-center gap-1 
                border-2 px-5 py-2 rounded-lg mx-10 mt-5 shadow">
                    <p className="font-semibold">Back to Dashboard </p>
                    <IoReturnUpBack size={20} />
                </Link>

                <h1 className="text-2xl font-semibold text-center mt-6">
                    Year: {year} - Number of Contests: {type}  {selectedContest}
                </h1>
                <div className="flex justify-between  ">
                    <div className="w-full flex flex-col items-center  justify-center">
                        {currentContests?.map((contest) => (
                            <div key={contest} className="w-[90%] sm:w-3/4 flex flex-col items-center justify-center">
                                <ContestCard
                                    key={contest}
                                    contest_name={contest}
                                    bg_color="bg-gray-200 dark:bg-blue-800"
                                    is_active={selectedContest === contest}
                                    onClick={() => handleContestClick(contest)}
                                />
                                {selectedContest === contest && (
                                    <>
                                        <div className="font-semibold">
                                            Percentage Completed: {calculatePercentageCompleted(contest).toFixed(0)}%
                                        </div>
                                        <div className="flex gap-4">
                                            {calculatePercentageCompleted(contest) < 100 && (
                                                <button
                                                    className="text-white rounded-lg shadow bg-blue-800 px-6 py-1 m-1"
                                                    onClick={() => handleStartContest(contest)}
                                                >
                                                    <p>
                                                        {calculatePercentageCompleted(contest) > 0
                                                            ? "Continue Contest"
                                                            : "Start Contest"}
                                                    </p>
                                                </button>
                                            )}
                                            {calculatePercentageCompleted(contest) > 0 && (
                                                <div className="relative">
                                                    <button
                                                        className="text-white rounded-lg shadow bg-green-600 px-6 py-1 m-1"
                                                        onClick={() => setShowReviewDropdown(prevState => !prevState)}
                                                    >
                                                        Review Contest
                                                    </button>
                                                    {showReviewDropdown && (
                                                        <div className="absolute z-10 bg-white border rounded-lg shadow-lg mt-1">
                                                            {[1, 2, 3, 4].map(roundNumber => (
                                                                isRoundCompleted(contest.split(' ')[1], roundNumber) && (
                                                                    <button
                                                                        key={roundNumber}
                                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                                        onClick={() => handleReviewRound(contest, roundNumber)}
                                                                    >
                                                                        Round {roundNumber}
                                                                    </button>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="flex  justify-center my-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-l"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800"
                                disabled
                            >
                                {currentPage}
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-r"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={indexOfLastCard >= contests.length}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}