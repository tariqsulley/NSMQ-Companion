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


ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

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

interface Student {
    uuid: string;
    first_name: string;
    last_name: string;
    [key: string]: any;
}

export default function AnalyticsView() {
    const { Data } = useAuth()
    const [year, setYear] = useState('2021');
    const [contestId, setContestId] = useState('1');
    const [student_uuid, setStudentUuid] = useState("")
    const [selectedStudentUuid, setSelectedStudentUuid] = useState("");
    const [studentMap, setStudentMap] = useState({});
    const [selectedStudent, setSelectedStudent] = useState<any>(null);


    const fetcher = async (url: any) => {
        const response = await axios.get(url);
        return response?.data;
    };

    const { data: studentAccuracies, error: studenterror } = useSWR(
        `${API_BASE}/accuracies/by-student/${selectedStudent}`,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            refreshInterval: 1000
        },
    );

    const [radarchartData, setRadarChartData] = useState({
        labels: ['Maths', 'Biology', 'Chemistry', 'Physics'],
        datasets: [
            {
                label: 'Strength Graph',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 3,
            },
        ],
    });


    useEffect(() => {
        if (studentAccuracies && studentAccuracies.data) {
            const roundedData = studentAccuracies.data.length ? studentAccuracies.data[0].map((score: number) => Math.round(score)) : [];
            setRadarChartData(prevData => ({
                ...prevData,
                datasets: [{
                    ...prevData.datasets[0],
                    data: roundedData
                }]
            }));
        }
    }, [studentAccuracies]);

    const { data: students, error: studentsError, isLoading: studentsLoading } =
        useSWR(`${API_BASE}/users/students/${Data?.data.uuid}`, fetcher);

    useEffect(() => {
        if (students) {
            const map: Record<string, string> = {};
            students?.data.forEach((student: Student) => {
                map[student.uuid] = `${student.first_name} ${student.last_name}`;
            });
            setStudentMap(map);
        }
    }, [students]);


    const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR(
        selectedStudentUuid ? `${API_BASE}/questions/contest-rounds?student_uuid=${selectedStudent}&year=${year}` : null,
        fetcher
    );

    const { data: barData, error: barError, isLoading: barLoading } = useSWR(
        selectedStudentUuid ? `${API_BASE}/questions/student-rounds?student_uuid=${selectedStudent}&year=${year}&contest_id=${contestId}` : null,
        fetcher
    );

    if (studentsLoading) return <p>Loading students...</p>;

    const handleStudentChange = (uuid: any) => {
        setSelectedStudentUuid(uuid);
    };


    if (!selectedStudentUuid) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-xl font-semibold">Good Evening, {Data?.data?.first_name}</p>
                <div>
                    <p>Select Student</p>
                    <SearchSelect value={selectedStudentUuid} onValueChange={handleStudentChange}>
                        {students?.data.map((student: Student) => (
                            <SearchSelectItem
                                key={student.uuid}
                                value={student.uuid}
                            >
                                {`${student.first_name} ${student.last_name}`}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                </div>
            </div>
        );
    }

    return (
        <div className="w-11/12 ">
            <div className="flex flex-col gap-5">
                <SearchSelect
                    value={selectedStudent}
                    onValueChange={(value) => setSelectedStudent(value)}
                >
                    {students?.data.map((student: Student) => (
                        <SearchSelectItem
                            key={student.uuid}
                            value={student.uuid}
                        >
                            {`${student.first_name} ${student.last_name}`}
                        </SearchSelectItem>
                    ))}
                </SearchSelect>
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
                            <p className="font-bold text-xl">384</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[#40C4AA] font-semibold">Correct Answers</p>
                            <p className="font-bold text-xl">250</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[#E44283] font-semibold">Wrong Answers</p>
                            <p className="font-bold text-xl">124</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[#889096] font-semibold">Unanswered Questions</p>
                            <p className="font-bold text-xl">10</p>
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
                    <Radar data={radarchartData} options={options} />

                </div>

            </div>

        </div>
    )
}