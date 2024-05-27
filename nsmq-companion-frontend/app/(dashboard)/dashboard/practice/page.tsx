"use client"
import Sidebar from "@/app/components/Sidebar"
import PracticeCard from "@/app/components/Cards/PracticeCard"
import { useState } from "react"
import ContestData from "../../../utils/NSMQContests"

export default function PracticePage() {
    const totalCards = ContestData.length;

    const cardsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = ContestData.slice(indexOfFirstCard, indexOfLastCard).map((contest, index) => (
        <PracticeCard key={index} year={contest.year} />
    ));

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <p className="mt-[100px]">Test your understanding on NSMQ contests from the past</p>
                <div className="flex justify-evenly flex-wrap gap-5">
                    {currentCards}
                </div>
                <div className='pagination flex justify-center space-x-2 mt-4'>
                    <button className={`px-4 py-2 text-white rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 cursor-pointer'}`} onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                    {[...Array(Math.ceil(totalCards / cardsPerPage))].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`p-2 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black '}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button className={`px-4 py-2 text-white rounded ${currentPage === Math.ceil(totalCards / cardsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 cursor-pointer'}`} onClick={nextPage} disabled={currentPage === Math.ceil(totalCards / cardsPerPage)}>Next</button>
                </div>
            </div>
        </div>
    )
}
