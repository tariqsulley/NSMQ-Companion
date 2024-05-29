"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import PracticeNavBar from "@/app/components/PracticeNavBar";
import { useSearchParams } from "next/navigation";
import ContestCard from "@/app/components/Cards/ContestCard";
import ContestData from "@/app/utils/NSMQContests";
import questions from "../../../../utils/Questions/NSMQ_2021/contest39/round1"
import API_BASE from "@/app/utils/api";
// @ts-ignore
import useSound from 'use-sound';

import axios from "axios";
interface PracticeYearProps {
    params: {
        year: string;
    };
}

export default function PracticeYear({ params }: PracticeYearProps) {
    const { year } = params;
    const searchParams = useSearchParams();
    const type = parseInt(searchParams.get("nums") ?? "0");
    const [selectedContest, setSelectedContest] = useState("");
    const [contestValue, setContestValue] = useState("");
    const router = useRouter();
    const [loading, setloading] = useState<boolean>(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = questions[currentQuestionIndex];
    const [color, setColor] = useState('red');
    const [audio] = useState(new Audio(''));
    const [isCircleGreen, setIsCircleGreen] = useState(false);
    const [play] = useSound('/Sounds/bell.wav');

    const handleCircleClick = () => {
        setIsCircleGreen(true);
        play();
        setTimeout(() => {
            setIsCircleGreen(false);
        }, 1000);
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'b') {
                handleCircleClick();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [handleCircleClick]);

    const contests = useMemo(() => {
        const contestExists = ContestData.some(cd => cd.year === year && cd.contest_nums === type.toString());
        if (!contestExists) {
            return null;
        }
        return Array.from({ length: type }, (_, index) => `Contest ${index + 1}`);
    }, [year, type]);

    const handleContestClick = (contest: any) => {
        setSelectedContest(contest);
        router.push(`/dashboard/practice/${year}?nums=${type}`);
    }

    // const handleNextQuestion = () => {
    //     setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    // };

    // const synthesizeText = async (text: string) => {
    //     try {
    //         setloading(true)
    //         // const response = await fetch(`${API_BASE}/synthesize/`, {
    //         //     method: 'POST',
    //         //     body: text
    //         // });
    //         const response = await axios.post(`${API_BASE}/questions/synthesize/`, {
    //             text: text
    //         })

    //         // if (!response.ok) {
    //         //     throw new Error('Failed to synthesize text');
    //         // }

    //         const audioBlob = await response.blob();
    //         const audioUrl = URL.createObjectURL(audioBlob);
    //         const audio = new Audio(audioUrl);
    //         audio.play();
    //     } catch (error) {
    //         console.error('Error synthesizing text:', error);
    //     } finally {
    //         setloading(false)
    //     }
    // };
    const synthesizeText = async (text: string) => {
        try {
            setloading(true);
            const response = await axios.post(`${API_BASE}/questions/synthesize/`, {
                text: text
            }, {
                responseType: 'arraybuffer'
            });

            const audioBlob = new Blob([response.data], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error('Error synthesizing text:', error);
        } finally {
            setloading(false);
        }
    };

    // useEffect(() => {
    //     const playAudioAndMoveToNextQuestion = () => {
    //         if (currentQuestion) {
    //             synthesizeText(currentQuestion["Question"]);
    //             console.log('synthesizing');

    //             // Wait for 5 seconds after the audio finishes playing
    //             setTimeout(() => {
    //                 setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    //             }, 20000);
    //         }
    //     };

    //     playAudioAndMoveToNextQuestion();
    // }, [currentQuestionIndex]);

    const handleNextQuestion = () => {
        synthesizeText(currentQuestion["Question"]);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    };

    const sendAudioToBackend = async (audioBlob: any) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');

            const response = await axios.post(`${API_BASE}/questions/get-transcript`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Transcript:', response.data.transcript);
        } catch (error) {
            console.error('Error sending audio to backend:', error);
        }
    };

    const handleRecordAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: any = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                chunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                sendAudioToBackend(audioBlob);
            });

            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, 5000); // Stop recording after 10 seconds
        } catch (error) {
            console.error('Error recording audio:', error);
        }
    };

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
        <div className="bg-bgMain h-screen">
            <PracticeNavBar />
            <h1 className="text-2xl font-semibold text-center mt-6">
                Practice for Year: {year} - Number of Contests: {type}  {selectedContest}

                <div>
                    {loading ? "loading" : "done"}
                </div>
            </h1>
            <div className="h-screen bg-white fixed left-0 top-0 overflow-y-scroll w-[50%] sm:w-[20%] mt-[57px] border-r-2 pb-10">
                {contests.map(contest => (
                    <ContestCard
                        key={contest}
                        contest_name={contest}
                        bg_color="bg-gray-200"
                        is_active={selectedContest === contest}
                        onClick={() => handleContestClick(contest)}
                    />
                ))}

            </div>
            <div className="ml-[400px]">
                <div>
                    <p> Question {currentQuestion["S/N"]} </p>
                    <h2>{currentQuestion["Subject"]}</h2>
                    <p> Preamble: {currentQuestion["Preamble Text"] || ""}</p>
                    <h2>{currentQuestion["Question"]}</h2>
                </div>
                <div
                    className={`w-10 h-10 rounded-full ${isCircleGreen ? 'bg-green-500' : 'bg-gray-500'}`}
                    onClick={handleCircleClick}
                />
                <button
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={handleNextQuestion}
                >
                    Next
                </button>
                <button onClick={play}>
                    play
                </button>
                <button onClick={handleRecordAudio}>Start Recording</button>

            </div>

        </div>
    );
}