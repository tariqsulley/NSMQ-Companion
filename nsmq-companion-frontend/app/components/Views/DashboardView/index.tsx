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




const bar_data = [
    {
        name: 'Round 1',
        'Maths': 890,
        'Biology': 338,
        'Chemistry': 538,
        'Physics': 396,
    },
    {
        name: 'Round 2',
        'Maths': 289,
        'Biology': 233,
        'Chemistry': 253,
        'Physics': 333,
    },
    {
        name: 'Round 3',
        'Maths': 380,
        'Biology': 535,
        'Chemistry': 352,
        'Physics': 718,
    },
    {
        name: 'Round 4',
        'Maths': 90,
        'Biology': 98,
        'Chemistry': 28,
        'Physics': 33,
    },
];



const chartdata = [
    {
        date: 'Contest 1',
        'Round 1': 108,
        'Round 2': 36,
        'Round 3': 72,
        'Round 4': 20
    },
    {
        date: 'Contest 2',
        'Round 1': 67,
        'Round 2': 22,
        'Round 3': 43,
        'Round 4': 10
    },
    {
        date: 'Contest 3',
        'Round 1': 77,
        'Round 2': 34,
        'Round 3': 56,
        'Round 4': 13
    },
    {
        date: 'Contest 4',
        'Round 1': 99,
        'Round 2': 30,
        'Round 3': 58,
        'Round 4': 17
    },

]
export default function DashboardView() {
    const dataFormatter = (number: any) =>
        `$${Intl.NumberFormat('us').format(number).toString()}`;


    const { Data } = useAuth()
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xl font-semibold"> Good Evening, {Data?.data?.first_name}</p>
            <div className="flex items-center gap-3">
                <div>
                    <SearchSelect>
                        <SearchSelectItem value="1">2021</SearchSelectItem>
                        <SearchSelectItem value="2">2020</SearchSelectItem>
                    </SearchSelect>
                </div>
                <div></div>
                <SearchSelect>
                    <SearchSelectItem value="1">Contest 1</SearchSelectItem>
                    <SearchSelectItem value="2">Contest 2</SearchSelectItem>
                    <SearchSelectItem value="3">Contest 3</SearchSelectItem>
                </SearchSelect>
            </div>
            {/* <EmptyDashboardCard /> */}
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
                    data={chartdata}
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
                <p className="mx-10 text-xl font-semibold">Contest 1</p>
                <BarChart
                    className="mt-6"
                    data={bar_data}
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
        </div>
    )
}