"use client"
import { useState, FC } from "react";
import PracticeCard from "../../Cards/PracticeCard";
import ContestData from "@/app/utils/NSMQContests";
import { TextInput } from '@tremor/react';
import { CiSearch } from "react-icons/ci";
import {
    SearchSelect,
    SearchSelectItem,
    Select,
    SelectItem,
} from '@tremor/react';

type Contest = {
    year: string;
    file: string;
    contest_nums: string;
}

const years = [
    { value: "2021", title: "2021" },
    { value: "2020", title: "2020" },
    { value: "2019", title: "2019" }
];

const PracticeCardView: FC = () => {
    const [year, setYear] = useState<string>("")
    const filteredData = year ? ContestData.filter(contest => contest.year === year) : ContestData;
    const totalCards = filteredData.length;

    const cardsPerPage = 3;
    const [currentPage, setCurrentPage] = useState<number>(1);

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;

    const currentCards = filteredData.slice(indexOfFirstCard, indexOfLastCard).map((contest: Contest, index: number) => (
        <PracticeCard key={index} year={contest.year} contest_nums={contest.contest_nums} />
    ));

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < Math.ceil(totalCards / cardsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>

            <div className="flex flex-col items-center sm:flex-row justify-evenly flex-wrap gap-5">
                {currentCards}
            </div>
            <div className='flex justify-center space-x-2 mt-4'>
                <button className={`px-4 py-2 text-white rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-800 cursor-pointer'}`} onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                {[...Array(Math.ceil(totalCards / cardsPerPage))].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-blue-800 text-white' : 'bg-gray-200 text-black'}`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button className={`px-4 py-2 text-white rounded ${currentPage === Math.ceil(totalCards / cardsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-800 cursor-pointer'}`} onClick={nextPage} disabled={currentPage === Math.ceil(totalCards / cardsPerPage)}>Next</button>
            </div>
        </div>
    );
}

export default PracticeCardView;
