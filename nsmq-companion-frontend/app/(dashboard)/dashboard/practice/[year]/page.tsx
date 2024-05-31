"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PracticeNavBar from "@/app/components/PracticeNavBar";
import { useSearchParams } from "next/navigation";
import ContestCard from "@/app/components/Cards/ContestCard";
import ContestData from "@/app/utils/NSMQContests";
import questions from "../../../../utils/Questions/NSMQ_2021/contest40/round1"
import API_BASE from "@/app/utils/api";
// @ts-ignore
import useSound from 'use-sound';
import { FaMicrophoneAlt } from "react-icons/fa";

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
    const [transcribedText, setTranscribedText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isBellPlaying, setIsBellPlaying] = useState(false);
    const [transcribingAudio, setTranscibingAudio] = useState<boolean>(false)
    const [checkingAnswer, setCheckingAnswer] = useState<boolean>(false)
    const [similarityScore, setSimilarityScore] = useState()
    const [quizStarted, setQuizStarted] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [sidebarWidth, setSidebarWidth] = useState(0);
    const cardsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;

    useEffect(() => {
        if (sidebarRef.current) {
            const width = sidebarRef.current.offsetWidth;
            setSidebarWidth(width);
        }
    }, [])

    const handleStartQuiz = () => {
        setQuizStarted(true);
        playQuestionAudio(1);
    };

    const handleCircleClick = () => {
        if (!isBellPlaying) {
            setIsBellPlaying(true);
            setIsCircleGreen(true);
            play();
            handleRecordAudio()

            setTimeout(() => {
                setIsCircleGreen(false);
                setIsBellPlaying(false);
            }, 2000);
        }
    };


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'b' && !isBellPlaying) {
                handleCircleClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleCircleClick, isBellPlaying]);

    const contests = useMemo(() => {
        const contestExists = ContestData.some(cd => cd.year === year && cd.contest_nums === type.toString());
        if (!contestExists) {
            return null;
        }
        return Array.from({ length: type }, (_, index) => `Contest ${index + 1}`);
    }, [year, type]);

    const currentContests = contests?.slice(indexOfFirstCard, indexOfLastCard);


    const handleContestClick = (contest: any) => {
        setSelectedContest(contest);
        router.push(`/dashboard/practice/${year}?nums=${type}`);
        setSelectedContest(contest);
        setContestValue(contest);
    }

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



    // const handleNextQuestion = () => {
    //     setCurrentQuestionIndex((prevIndex) => {
    //         const newIndex = prevIndex + 1;
    //         playQuestionAudio(newIndex);
    //         return newIndex;
    //     });
    // };

    // const playQuestionAudio = (questionIndex: any) => {
    //     const audioUrl = `/Sounds/2021/Contest40/q1_set${questionIndex}.wav`;
    //     const audio = new Audio(audioUrl);
    //     audio.play();
    // };

    const playQuestionAudio = (questionIndex: any) => {
        const questionAudioUrl = `/Sounds/2021/Contest40/q1_set${questionIndex}.wav`;
        const preambleAudioUrl = `/Sounds/2021/Contest40/preamble_q${questionIndex}.wav`;

        const playAudio = (url: any) => {
            const audio = new Audio(url);
            audio.play();
            return audio;
        };

        if (currentQuestion["Preamble Text"]) {
            const preambleAudio = playAudio(preambleAudioUrl);
            preambleAudio.onended = () => {
                playAudio(questionAudioUrl);
            };
        } else {
            playAudio(questionAudioUrl);
        }
    };

    // const handleNextQuestion = () => {
    //     setCurrentQuestionIndex((prevIndex) => {
    //         const newIndex = prevIndex + 1;
    //         if (newIndex < questions.length) {
    //             playQuestionAudio(newIndex);
    //             return newIndex;
    //         }
    //         return prevIndex; 
    //     });
    // };

    const handleNextQuestion = () => {
        setCurrentQuestionIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            if (newIndex < questions.length) {
                playQuestionAudio(newIndex);
                return newIndex;
            } else {
                setQuizStarted(false);
                return prevIndex;
            }
        });
    };

    // useEffect(() => {
    //     if (currentQuestionIndex === 0) {
    //         playQuestionAudio(1);
    //     }
    // }, [selectedContest]);



    const sendAudioToBackend = async (audioBlob: any) => {
        try {
            setTranscibingAudio(true)
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');

            const response = await axios.post(`${API_BASE}/questions/get-transcript`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Transcript:', response.data.transcript);
            setTranscribedText(response.data.transcript);
        } catch (error) {
            console.error('Error sending audio to backend:', error);
        } finally {
            setTranscibingAudio(false)
        }
    };

    const handleRecordAudio = async () => {
        try {
            setIsRecording(true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: any = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                chunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                setIsRecording(false);
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                sendAudioToBackend(audioBlob);
            });

            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, 10000); // Stop recording after 5 seconds
        } catch (error) {
            console.error('Error recording audio:', error);
        }
    };

    const handleCalculateSimilarity = async () => {
        try {
            setCheckingAnswer(true);
            const response = await axios.post(`${API_BASE}/questions/calculate-similarity`, {
                question_answer: currentQuestion["Answer"],
                student_answer: transcribedText,
            });

            const similarityScore = response.data.similarity;
            console.log(`Similarity Score: ${similarityScore}`);
            setSimilarityScore(similarityScore);

            if (similarityScore > 0.6) {
                synthesizeText("yes you are right");
            } else {
                synthesizeText("I'm not accepting that")
            }
        } catch (error) {
            console.error('Error calculating similarity:', error);
        } finally {
            setCheckingAnswer(false);
        }
    };

    useEffect(() => {
        if (transcribedText) {
            handleCalculateSimilarity();
        }
    }, [transcribedText]);

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
                Year: {year} - Number of Contests: {type}  {selectedContest}
            </h1>
            <div className="flex justify-between  ">
                {/* <div className="h-screen hidden bg-white md:block sm:fixed sm:left-0 
            top-0 overflow-y-scroll w-[50%] sm:w-[20%] mt-[57px] border-r-2 sm:pb-10" ref={sidebarRef}>
                    {contests.map(contest => (
                        <ContestCard
                            key={contest}
                            contest_name={contest}
                            bg_color="bg-gray-200"
                            is_active={selectedContest === contest}
                            onClick={() => handleContestClick(contest)}
                        />
                    ))}
                </div> */}
                <div className="w-full flex flex-col items-center  justify-center">
                    {/* {currentContests?.map(contest => (
                        <>
                            <ContestCard
                                key={contest}
                                contest_name={contest}
                                bg_color="bg-gray-200"
                                is_active={selectedContest === contest}
                                onClick={() => handleContestClick(contest)}
                            />
                            <div>Percentage Completed:</div>
                        </>
                    ))} */}
                    {currentContests?.map((contest) => (
                        <div key={contest} className="w-3/4 flex flex-col items-center justify-center">

                            <ContestCard
                                key={contest}
                                contest_name={contest}
                                bg_color="bg-gray-200"
                                is_active={selectedContest === contest}
                                onClick={() => handleContestClick(contest)}
                            />
                            {selectedContest === contest && (
                                <>
                                    <div>Percentage Completed:</div>
                                </>
                            )}
                        </div>
                    ))}

                    <div className="flex  justify-center my-4">
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-l"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-800"
                            disabled
                        >
                            {currentPage}
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-r"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={indexOfLastCard >= contests.length}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* <div className="md:ml-[400px]">
                    <div className="bg-red-100">
                        <p> Question: {currentQuestionIndex} </p>
                        <h2>Subject: {currentQuestion["Subject"]}</h2>
                    <p> Preamble: {currentQuestion["Preamble Text"] || ""}</p>
                        <h2>Question: {currentQuestion["Question"]}</h2>
                        <p>Answer: {currentQuestion["Answer"]}</p>
                    </div>
                    <div>
                        <h2>Transcribed Text:</h2>
                        <p>{transcribedText}</p>
                    </div>
                    <div
                        className={`w-10 h-10 rounded-full ${isCircleGreen ? 'bg-green-500' : 'bg-gray-500'}`}
                        onClick={handleCircleClick}
                    />
                  
                    <div>
                        {!quizStarted ? (
                            <button onClick={handleStartQuiz}>Start Quiz</button>
                        ) : (
                            <button onClick={handleNextQuestion}>Next Question</button>
                        )}
                    </div>
                    <button onClick={play}>
                        play
                    </button>
                    <button>
                        {transcribingAudio ? "Transcribing" : "Done"}
                    </button>
                    <button onClick={handleRecordAudio}>
                        {isRecording ? <div>
                            <p>Recording</p>
                            <FaMicrophoneAlt className="text-red-500" size={25} />
                        </div> :
                            <FaMicrophoneAlt size={25} />}
                    </button>
                    <p> {checkingAnswer ? "Checking" : "Done checking"}</p>
                    <p>Similarity:{similarityScore}</p>
                </div> */}
            </div>
        </div>
    );
}