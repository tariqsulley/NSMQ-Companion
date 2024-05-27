"use client"
import React, { useEffect } from 'react';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import API_BASE from '@/app/utils/api';
import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';

interface SWROptions {
    revalidateIfStale: boolean;
    revalidateOnFocus: boolean;
    revalidateOnReconnect: boolean;
}


interface TableHeader {
    label: string;
    className?: string;
}

interface StudentData {
    firstName: string;
    lastName: string;
    year: string;
    email: string;
    status: string;
    dateCreated: string;
}

interface TableProps {
    filter: string;
}

const Table: React.FC<TableProps> = ({ filter }) => {
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
    const { Data } = useAuth()
    const openModal = (student: StudentData) => {
        setSelectedStudent(student);
    };

    const closeModal = () => {
        setSelectedStudent(null);
    };

    const tableHeaders: TableHeader[] = [
        { label: 'First Name', className: 'rounded-tl-xl' },
        { label: 'Last Name' },
        { label: 'Year' },
        { label: 'Email' },
        // { label: 'Status' },
        // { label: 'Date Created' },
        { label: 'Action' },
        { label: '', className: 'rounded-tr-xl' },
    ];

    // const fetcher = async (url: any) => {
    //     const response = await axios.get(url);
    //     return response;
    // };

    const fetcher = (url: string) => {
        return fetch(url, {
            method: "GET",
        }).then((res) => res.json());
    };


    // const { allStudents, error, isLoading } = useSWR(
    //     `${API_BASE}/facilitators/students/65e56afe-2a6a-49e8-9ecb-dd78aebba52c`,
    //     fetcher,
    //     {
    //         revalidateIfStale: true,
    //         revalidateOnFocus: true,
    //         revalidateOnReconnect: true,
    //         refreshInterval: 1000
    //     } as SWROptions
    // );

    const { data, error, isLoading } = useSWR(
        `${API_BASE}/facilitators/students/${Data?.uuid}`,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        } as SWROptions
    );

    // const students = allStudents;

    // const request = async () => {
    //     try {
    //         const response = await axios.get(`${API_BASE}/facilitators/students/${data?.uuid}`)
    //         console.log("res", response.data)
    //     } catch (e) {
    //         console.log("error", e)
    //     }
    // }

    // useEffect(() => {
    //     request()
    // }, [])

    const dummyData: StudentData[] = [
        {
            firstName: 'Prince',
            lastName: 'Debrah',
            year: '3',
            email: 'debrah@gmail.com',
            status: "active",
            dateCreated: '2023-05-01',
        },
        {
            firstName: 'Percy',
            lastName: 'Amoani',
            year: '3',
            email: 'percy@gmail.com',
            status: "active",
            dateCreated: '2023-05-01',
        },
        {
            firstName: 'Henry',
            lastName: 'Otumfuor',
            year: '3',
            email: 'henry@gmail.com',
            status: "active",
            dateCreated: '2023-05-01',
        },
    ];

    // const filteredData = students?.filter(student =>
    //     student.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    //     student.lastName.toLowerCase().includes(filter.toLowerCase()) ||
    //     student.year.toLowerCase().includes(filter.toLowerCase()) ||
    //     student.email.toLowerCase().includes(filter.toLowerCase()) ||
    //     student.status.toLowerCase().includes(filter.toLowerCase()) ||
    //     student.dateCreated.includes(filter)
    // );

    const filteredData = useMemo(() => {
        if (!isLoading && data) {
            return data?.filter((item: any) => {
                const isfirstNameMatch = item?.first_name
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                const islastNameMatch = item?.last_name
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                // const isYearMatch = item?.year
                //     .toLowerCase()
                //     .includes(filter.toLowerCase());
                const isemailMatch = item?.email_address
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                return (
                    isfirstNameMatch ||
                    islastNameMatch ||
                    isemailMatch
                );
            });
        }
        return [];
    }, [isLoading, Data, filter]);



    if (error) {
        return <div>Error loading data</div>;
    }


    if (isLoading) {
        return (
            <div>
                Loading
            </div>
        )
    }

    return (
        <div className="mt-3 overflow-x-auto rounded-xl">
            <table className="min-w-full text-left shadow">
                <thead className="sticky top-0 bg-white rounded-t-xl">
                    <tr>
                        {tableHeaders.map((header, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 md:py-4 text-[#3B3B3B] text-xs md:text-sm ${header.className || ''}`}
                            >
                                {header.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredData?.map((student, index) => (
                        <tr key={index} className='hover:bg-gray-100 bg-white border-t-[1px] border-t-[#edeef0]'>
                            <td className="px-6 py-4">{student.first_name}</td>
                            <td className="px-6 py-4">{student.last_name}</td>
                            <td className="px-6 py-4">{student.year}</td>
                            <td className="px-6 py-4">{student.email_address}</td>
                            {/* <td className="flex items-center justify-center px-6 py-4 text-[#05b60b] ">
                                <p className='bg-[#edfaf1] rounded-lg px-3'>{student.status}</p>
                            </td> */}
                            {/* <td className="px-6 py-4">{student.dateCreated}</td> */}
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => openModal(student)}
                                    className="w-[74px] h-7 px-3.5 py-1 bg-white rounded-lg border border-zinc-300 justify-center items-center text-xs md:text-sm "
                                >
                                    View
                                </button>
                            </td>
                            <td className="px-6 py-4"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;