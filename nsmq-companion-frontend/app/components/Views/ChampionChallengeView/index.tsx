"use client"
import winner_2021 from "../../../../public/images/prempeh.jpg"
import winner_2020 from "../../../../public/images/presec.jpg"
import winner_2019 from "../../../../public/images/2019-winner.jpg"
import winner_2018 from "../../../../public/images/2018-winner.png"
import winner_2017 from "../../../../public/images/2017-winner.png"
import winner_2016 from "../../../../public/images/2016-winner.png"
import { FaStar } from "react-icons/fa6";

import Image from "next/image"
export default function ChampionChallengeView() {
    return (
        <div className="flex flex-col w-full bg-gray-200 dark:bg-gray-700 ">

            <div>
                <div className="bg-white dark:bg-darkBgDeep shadow">
                    <div className="bg p-2 shadow  relative overflow-hidden group">
                        <Image src={winner_2021} alt="image" className=" w-[20%] rounded-t-xl
                         transition-transform duration-300 transform group-hover:scale-110 " />
                    </div>
                    <div className="mx-2">
                        <p className="font-bold text-xl">2021</p>
                        <p className="font-semibold">Prempeh College</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center mt-10 gap-2">
                    <div>
                        <button className="bg-green-500 p-6 sm:p-10 ml-[0px] border-b-4 border-green-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                    <div>
                        <button className="bg-green-500 p-6 sm:p-10 mr-[70px] border-b-4 border-green-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                    <div>
                        <button className="bg-green-500 mr-[10px] p-6 sm:p-10 border-b-4 border-green-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                    <div>
                        <button className="bg-green-500 ml-[50px] p-6 sm:p-10 border-b-4 border-green-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div className="bg-white dark:bg-darkBgDeep shadow">
                    <div className="bg p-2 shadow  relative overflow-hidden group">
                        <Image src={winner_2020} alt="image" className="w-[15%] rounded-t-xl transition-transform duration-300 transform group-hover:scale-110 " />
                    </div>
                    <div className="mx-2">
                        <p className="font-bold text-xl">2020</p>
                        <p className="font-semibold">Presec Legon</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center mt-10 gap-2">
                    <div>
                        <button className="bg-blue-500 p-6 sm:p-10 ml-[0px] border-b-4 border-blue-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                    <div>
                        <button className="bg-blue-500 p-6 sm:p-10 mr-[-70px] border-b-4 border-blue-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                    <div>
                        <button className="bg-blue-500 mr-[-10px] p-6 sm:p-10 border-b-4 border-blue-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                    <div>
                        <button className="bg-blue-500 ml-[-50px] p-6 sm:p-10 border-b-4 border-blue-800 rounded-full">
                            <FaStar size={25} className="text-white font-semibold" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}