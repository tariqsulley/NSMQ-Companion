"use client"
import { useAuth } from "@/app/context/AuthContext"
import EmptyDashboardCard from "@/app/components/Cards/EmptyCard/Dashboard"
import { AreaChart } from '@tremor/react';
import { BarChart } from '@tremor/react';
import { SearchSelect, SearchSelectItem } from '@tremor/react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import useSWR from "swr";
import API_BASE from "@/app/utils/api";
import axios from "axios"
import { useState, useEffect } from 'react';
import ReactJoyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import Joyride from 'react-joyride';
import Image from "next/image"
import kauffman from "../../../../public/images/kauffman.jpg"
import champion from "../../../../public/images/champion.jpg"
import prac1 from "../../../../public/images/practice.png"
import prac2 from "../../../../public/images/prac.jpg"


const StepOneContent = () => (
    <div className="flex flex-col justify-center items-center">
        <div>
            <Image src={kauffman} alt="image" className=" rounded-lg shadow" />
            <p>Welcome to your NSMQ Companion dashboard! Here you can track your progress,
                and analyze your performance in different subjects.</p>
        </div>
    </div>
);



const StepFiveContent = () => (
    <div className="flex flex-col items-center justify-center">
        <div>
            <Image src={prac1} alt="image" className=" rounded-lg shadow" />
            <p>Sharpen your skills with timed practice tests that mimic the NSMQ format</p>
        </div>
    </div>
);

const StepSixContent = () => (
    <div className="flex flex-col justify-center items-center">
        <div>
            <Image src={champion} alt="image" className=" rounded-lg shadow" />
            <p>Do you have what it takes to take on the conquerors of the NSMQ?
                This challenge is for you!
            </p>
        </div>
    </div>
);

const StepSevenContent = () => (
    <div className="flex flex-col justify-center items-center">
        <div>
            <Image src={prac2} alt="image" className=" rounded-lg shadow" />
            <p>Join Multiplayer sessions to compete with fellow students across the Nation</p>
        </div>
    </div>
);


ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export const data = {
    labels: ['Maths', 'Biology', 'Physics', 'Chemistry'],
    datasets: [
        {
            label: 'Strength Graph',
            data: [84, 72, 65, 78],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
        },
    ],
};

const options = {
    scales: {
        r: {
            angleLines: {
                display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
        }
    }
};


const fetcher3 = async (url: any) => {
    const response = await axios.get(url);
    return response?.data;
};

interface Student {
    uuid: string;
    first_name: string;
    last_name: string;
    [key: string]: any;
}

interface RecommendationData {
    data: {
        similar_students: { student_id: string; student_name: string }[];
        topic_scores: { topic: string; average_score: number }[];
    }
}


export default function DashboardView() {
    const { Data } = useAuth()
    const [year, setYear] = useState('2021');
    const [contestId, setContestId] = useState('1');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentMap, setStudentMap] = useState({});

    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<any>([
        {
            target: '.sidebar-dashboard',
            content: <StepOneContent />,
            placement: 'right',
        },
        {
            target: '.sidebar-practice',
            content: <StepFiveContent />,
            placement: 'right',
        },
        {
            target: '.sidebar-championchallenge',
            content: <StepSixContent />,
            placement: 'right',
        },
        {
            target: '.sidebar-multiplayer',
            content: <StepSevenContent />,
            placement: 'right',
        }
    ]);


    const mobileBreakpoint = 768;

    useEffect(() => {
        if (window.innerWidth > mobileBreakpoint) {
            setRun(true);
        } else {
            setRun(false);
        }

        const handleResize = () => {
            if (window.innerWidth > mobileBreakpoint) {
                setRun(true);
            } else {
                setRun(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleJoyrideCallback = (data: any) => {
        const { action, index, status, type } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRun(false);
        } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        }
    };

    const dataFormatter = (number: any) =>
        `$${Intl.NumberFormat('us').format(number).toString()}`;

    const fetcher = async (url: any) => {
        const response = await axios.get(url);
        return response?.data;
    };

    const {
        data: chartData,
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

    const {
        data: barData,
        error,
        isLoading
    } = useSWR(
        `${API_BASE}/questions/student-rounds?student_uuid=${Data?.data.uuid}&year=${year}&contest_id=${contestId}`,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 1000
        },
    );

    const {
        data: studentsData,
        error: studentsError,
        isLoading: isStudentsLoading,
    } = useSWR(`${API_BASE}/users/students/${Data?.data.uuid}`, fetcher);


    const {
        data: recommendationData,
        error: recommendationError,
        isLoading: isRecommendationLoading,
    } = useSWR(
        selectedStudent
            ? `${API_BASE}/performance/recommendations/${selectedStudent}`
            : null,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 1000,
        }
    );




    useEffect(() => {
        if (studentsData) {
            const map: Record<string, string> = {};
            studentsData.data.forEach((student: Student) => {
                map[student.uuid] = `${student.first_name} ${student.last_name}`;
            });
            setStudentMap(map);
        }
    }, [studentsData]);


    const locale = {
        next: 'Next',
        back: 'Previous',
        last: 'Finish'
    };

    useEffect(() => {
        setRun(true);
        return () => setRun(false);
    }, []);



    if (isLoading || isRecommendationLoading) {
        return (
            <div className="flex flex-col gap-4">
                <Joyride
                    run={run}
                    steps={steps}
                    disableScrolling={true}
                    continuous={true}
                    scrollToFirstStep={true}
                    showProgress={true}
                    showSkipButton={true}
                    locale={{
                        next: 'Next',
                        back: 'Previous',
                        last: 'Finish'
                    }}
                    callback={handleJoyrideCallback}
                    styles={{
                        options: {
                            arrowColor: '#181d36',
                            backgroundColor: '#077af9',
                            primaryColor: '#181d36',
                            textColor: '#fff',
                            zIndex: 1000,
                        }
                    }}
                />
                <p className="text-xl font-semibold"> Good Evening, {Data?.data?.first_name}</p>
                {Data?.data.account_type !== "facilitator" ?
                    <div className="flex items-center gap-3">
                        <div>
                            <SearchSelect value={year} onValueChange={(value) => setYear(value)}>
                                <SearchSelectItem value="2021">2021</SearchSelectItem>
                                <SearchSelectItem value="2020">2020</SearchSelectItem>
                            </SearchSelect>

                        </div>
                        <div></div>
                        <SearchSelect value={contestId} onValueChange={(value) => setContestId(value)}>
                            <SearchSelectItem value="1">Contest 1</SearchSelectItem>
                            <SearchSelectItem value="2">Contest 2</SearchSelectItem>
                            <SearchSelectItem value="3">Contest 3</SearchSelectItem>
                        </SearchSelect>
                    </div> : ""}
                <div className=" flex items-center justify-center">
                    <p>Loading </p>
                </div>
            </div>
        )
    }


    return (
        <div className="flex flex-col gap-4">
            <Joyride
                run={run}
                steps={steps}
                disableScrolling={true}
                continuous={true}
                scrollToFirstStep={true}
                showProgress={true}
                showSkipButton={true}
                locale={{
                    next: 'Next',
                    back: 'Previous',
                    last: 'Finish'
                }}
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        arrowColor: '#181d36',
                        backgroundColor: '#077af9',
                        primaryColor: '#181d36',
                        textColor: '#fff',
                        zIndex: 1000,
                    }
                }}
            />
            <p className="text-xl font-semibold"> Good Evening, {Data?.data?.first_name}</p>
            {Data?.data.account_type == "facilitator" ?
                <SearchSelect
                    value={selectedStudent}
                    onValueChange={(value) => setSelectedStudent(value)}
                >
                    {studentsData?.data.map((student: Student) => (
                        <SearchSelectItem
                            key={student.uuid}
                            value={student.uuid}
                        >
                            {`${student.first_name} ${student.last_name}`}
                        </SearchSelectItem>
                    ))}
                </SearchSelect> : ""}


            {Data?.data.account_type === "facilitator" && (
                <>
                    <div className="bg-white p-4 dark:bg-darkBgDeep rounded-xl shadow">
                        <p className="mx-10 text-xl font-semibold">Recommended Topics Average Scores</p>
                        <BarChart
                            className="mt-6"
                            data={recommendationData?.data?.topic_scores.map((score: any) => ({
                                topic: score.topic,
                                'Average Score': score.average_score,
                            }))}
                            index="topic"
                            categories={['Average Score']}
                            colors={['blue']}
                            yAxisWidth={48}
                            showAnimation={true}
                        />
                    </div>
                    {recommendationData?.data?.similar_students.length > 0 && (
                        <div className="bg-white p-4 dark:bg-darkBgDeep rounded-xl shadow overflow-y-scroll">
                            <p className="text-xl font-semibold mb-4">Similar Students</p>
                            <ul>
                                {recommendationData.data.similar_students.map((student: { student_id: string; student_name: string }) => (
                                    <li key={student.student_id} className="py-2">
                                        {student.student_name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
            {Data?.data.account_type !== "facilitator" ?
                <>
                    <div className="flex items-center gap-3">
                        <div>
                            <SearchSelect value={year} onValueChange={(value) => setYear(value)}>
                                <SearchSelectItem value="2021">2021</SearchSelectItem>
                                <SearchSelectItem value="2020">2020</SearchSelectItem>
                            </SearchSelect>

                        </div>
                        <div></div>
                        <SearchSelect value={contestId} onValueChange={(value) => setContestId(value)}>
                            <SearchSelectItem value="1">Contest 1</SearchSelectItem>
                            <SearchSelectItem value="2">Contest 2</SearchSelectItem>
                            <SearchSelectItem value="3">Contest 3</SearchSelectItem>
                        </SearchSelect>
                    </div>

                    <div className="bg-white p-4 dark:bg-darkBgDeep rounded-xl shadow">
                        <p className="mx-10 text-xl font-semibold">2021</p>
                        <div className="flex flex-col sm:flex-row items-center gap-10 mx-10 mt-2">
                            <div className="flex flex-col gap-2">
                                <p className="text-[#889096] font-semibold">Total Questions</p>
                                <p className="font-bold text-xl">9440</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-[#40C4AA] font-semibold">Correct Answers</p>
                                <p className="font-bold text-xl">5223</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-[#E44283] font-semibold">Wrong Answers</p>
                                <p className="font-bold text-xl">2667</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-[#889096] font-semibold">Unanswered Questions</p>
                                <p className="font-bold text-xl">1550</p>
                            </div>
                        </div>
                        <AreaChart
                            className="h-80"
                            data={chartData}
                            index="date"
                            curveType="monotone"
                            yAxisWidth={30}
                            categories={['Round 1', 'Round 2', 'Round 3', 'Round 4']}
                            colors={['indigo', 'rose', 'green', 'orange']}
                            onValueChange={(v) => console.log(v)}
                            showAnimation={true}

                        />
                    </div>
                    <div className="bg-white p-4 dark:bg-darkBgDeep rounded-xl shadow">
                        <p className="mx-10 text-xl font-semibold">Contest {contestId}</p>
                        <BarChart
                            className="mt-6"
                            data={barData}
                            index="name"
                            categories={[
                                'Maths',
                                'Biology',
                                'Chemistry',
                                'Physics',
                            ]}
                            colors={['blue', 'teal', 'amber', 'rose', 'indigo', 'emerald']}
                            yAxisWidth={48}
                            showAnimation={true}
                        />
                    </div>
                    <div className="bg-white dark:bg-darkBgDeep rounded-xl shadow flex items-center justify-center" style={{ height: '400px' }}>
                        <Radar data={data} options={options} />
                    </div>
                </> :
                ""}
        </div>
    )
}