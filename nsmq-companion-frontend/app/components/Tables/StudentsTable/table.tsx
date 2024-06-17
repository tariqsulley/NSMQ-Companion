"use client"
import React, { useEffect } from 'react';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import API_BASE from '@/app/utils/api';
import { useAuth } from '@/app/context/AuthContext';
import TableSkeleton from '../../Skeleton/TableSkeleton';

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
    first_name: string;
    last_name: string;
    year: string;
    email_address: string;

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
        { label: 'Action' },
        { label: '', className: 'rounded-tr-xl' },
    ];


    const fetcher = (url: string) => {
        return fetch(url, {
            method: "GET",
        }).then((res) => res.json());
    };

    const { data, error, isLoading } = useSWR(
        `${API_BASE}/users/students/${Data?.data?.uuid}/`,
        fetcher,
        {
            revalidateIfStale: true,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            // refreshInterval: 1000
        } as SWROptions
    );

    const filteredData = useMemo(() => {
        if (!isLoading && data) {
            return data?.data?.filter((item: any) => {
                const isfirstNameMatch = item?.first_name
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                const islastNameMatch = item?.last_name
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                const isYearMatch = String(item?.year)
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                const isemailMatch = item?.email_address
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                return (
                    isfirstNameMatch ||
                    isYearMatch ||
                    islastNameMatch ||
                    isemailMatch
                );
            });
        }
        return [];
    }, [isLoading, data, filter]);

    if (error) {
        return <div></div>;
    }

    if (isLoading) {
        return (
            <TableSkeleton />
        )
    }

    return (
        <div className="mt-3 overflow-x-auto rounded-xl">
            <table className="min-w-full text-left shadow">
                <thead className="sticky top-0 bg-white dark:bg-darkBgDeep rounded-t-xl">
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
                    {filteredData?.map((student: StudentData, index: number) => (
                        <tr key={index} className='hover:bg-gray-100 bg-white dark:bg-darkBgDeep  border-t-[1px] border-t-[#edeef0]'>
                            <td className="px-6 py-4">{student.first_name}</td>
                            <td className="px-6 py-4">{student.last_name}</td>
                            <td className="px-6 py-4">{student.year}</td>
                            <td className="px-6 py-4">{student.email_address}</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => openModal(student)}
                                    className="w-[74px] h-7 px-3.5 py-1 bg-white dark:bg-darkBgBtn dark:text-gray-700 rounded-lg border border-zinc-300 justify-center items-center text-xs md:text-sm "
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