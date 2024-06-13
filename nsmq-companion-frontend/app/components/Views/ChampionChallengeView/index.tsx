"use client"
import React from 'react';
import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import winner_2021 from "../../../../public/images/prempeh.png";
import winner_2020 from "../../../../public/images/presec.png";
import prempeh_logo from "../../../../public/images/prempeh.jpg";
import presec_logo from "../../../../public/images/presec.jpg";
import trophyicon from "../../../../public/icons/trop.png";

interface StarRatingProps {
    rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    const totalStars = 2;
    const stars = Array.from({ length: totalStars }, (_, i) => {
        return i < Math.floor(rating) ? 'full' : i === Math.floor(rating) && rating % 1 !== 0 ? 'half' : 'empty';
    });

    return (
        <div className="flex">
            {stars.map((star, index) => (
                <span key={index} className={`text-yellow-400 text-5xl ${star === 'full' ? 'text-yellow-400' : star === 'half' ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {star === 'full' ? '★' : star === 'half' ? '★' : '☆'}
                </span>
            ))}
        </div>
    );
};

interface ChampionCardProps {
    year: number;
    school: string;
    imageSource: any;
    schoolLogo: any;
    rating: number;
    color: string;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ year, school, imageSource, schoolLogo, rating, color }) => {
    const getBackgroundGradient = () => {
        if (school === "Presec Legon") {
            return "bg-gradient-to-r from-indigo-500 to-blue-500";
        } else if (school === "Prempeh College") {
            return "bg-gradient-to-r from-teal-200 to-teal-500";
        } else {
            return "bg-gradient-to-r from-violet-600 to-indigo-600";
        }
    };
    const getImageWidth = () => {
        return school === "Presec Legon" ? "w-[12%]" : "w-[15%]";
    };

    return (
        <div>
            <div className="bg-white dark:bg-darkBgDeep shadow">
                <div className={`${getBackgroundGradient()} p-2 shadow relative overflow-hidden group`}>
                    <Image
                        src={imageSource}
                        alt="image"
                        className={`${getImageWidth()} mb-[-10px] rounded-t-xl transition-transform duration-300 transform group-hover:scale-110`}
                    />
                </div>
                <div className="flex items-center ">
                    <Image src={schoolLogo} alt='image' className='w-[10%]' />
                    <div className=' w-full mx-2'>
                        <p className="font-bold text-xl">{year}</p>
                        <p className="font-semibold">{school}</p>
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="absolute top-[200px] right-0 md:right-[100px]">
                    <StarRating rating={rating} />
                </div>

                <div className="flex flex-col items-center justify-center mt-10 gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <button
                                className={`${color} ${i === 0 ? 'bg-opacity-100' : 'bg-opacity-50'} ${i === 0 ? 'border-opacity-100' : 'border-opacity-50'} p-6 sm:p-10 ${i === 1 ? 'mr-[-70px]' : ''} ${i === 2 ? 'mr-[-10px]' : ''} ${i === 3 ? 'ml-[-50px]' : ''} border-b-4 rounded-full`}
                            >
                                <FaStar size={25} className="text-white font-semibold" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function ChampionChallengeView() {
    const champions = [
        {
            year: 2021,
            school: "Prempeh College",
            imageSource: winner_2021,
            schoolLogo: prempeh_logo,
            rating: 0,
            color: "bg-green-500 border-green-800"
        },
        {
            year: 2020,
            school: "Presec Legon",
            imageSource: winner_2020,
            schoolLogo: presec_logo,
            rating: 0,
            color: "bg-blue-500 border-blue-800"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-gray-200 dark:bg-gray-700">
            {champions.map((champion, index) => (
                <ChampionCard
                    key={index}
                    year={champion.year}
                    school={champion.school}
                    imageSource={champion.imageSource}
                    schoolLogo={champion.schoolLogo}
                    rating={champion.rating}
                    color={champion.color}
                />
            ))}
            <div className='bg-white dark:bg-darkBgDeep shadow flex items-center justify-center p-4'>
                <Image src={trophyicon} alt='image' width={100} height={100} />
            </div>
        </div>
    );
}