"use client"
import PracticeNavBar from "@/app/components/PracticeNavBar";
import questions from "../../../../utils/Questions/NSMQ_2021/contest40/round1"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
// @ts-ignore
import useSound from 'use-sound';
import API_BASE from "@/app/utils/api";
import axios from "axios";
import { FaMicrophoneAlt } from "react-icons/fa";
import clock_icon from "../../../../../public/icons/clock.svg"
import Image from "next/image";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import ContestData from "@/app/utils/NSMQContests";
import contest_40_1 from "../../../../utils/Questions/NSMQ_2021/contest40/round1";

export default function ContestPage({ params }: any) {

    const { set } = params;
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
    const [introskipped, setIntroSkipper] = useState(false)
    const [playIntro, { stop: stopIntro }] = useSound('/Sounds/remarks/round1_intro.wav');
    const [SimilarityScore, SetSimilarityScore] = useState(Array(contest_40_1.length).fill(null));
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);


    const [introStarted, setIntroStarted] = useState(false)
    const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);
    const [round_score, setRoundScore] = useState(0)
    const student_analytics = []


    const handleTranscriptUpdate = () => {
        setTranscribedText(transcript);
        if (!listening) {
            setIsReadyToCalculate(true);
        }
    };

    const [timeLeft, setTimeLeft] = useState(
        currentQuestion["Subject"] === "Mathematics" ? 30 : 10
    );

    const timerRef = useRef<any>(null);


    const handleStartQuiz = () => {
        setQuizStarted(true);
        playQuestionAudio(1);
    };

    const handleStartIntro = () => {
        playIntro();
        setIntroStarted(true)
    };

    const handleSkipIntro = () => {
        stopIntro();
        setIntroSkipper(true);
    };

    const handleCircleClick = () => {
        if (!isBellPlaying && browserSupportsSpeechRecognition) {
            setIsBellPlaying(true);
            setIsCircleGreen(true);
            play();
            SpeechRecognition.startListening({ continuous: true });

            setTimeout(() => {
                setIsCircleGreen(false);
                setIsBellPlaying(false);
                SpeechRecognition.stopListening();
            }, 10000);
        }
    };

    useEffect(() => {
        handleTranscriptUpdate();
    }, [transcript, listening]);

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

    let audioInstance: any;

    const playQuestionAudio = (questionIndex: any) => {
        const questionAudioUrl = `/Sounds/2021/Contest40/q${questionIndex}.wav`;
        const preambleAudioUrl = `/Sounds/2021/Contest40/preamble_q${questionIndex}.wav`;

        const playAudio = (url: any, onEnded: any) => {
            if (!audioInstance) {
                audioInstance = new Audio(url);
            } else {
                audioInstance.src = url;
            }
            setIsAudioPlaying(true);
            audioInstance.play();
            audioInstance.onended = () => {
                onEnded();
                setIsAudioPlaying(false);
                startTimer(questions[questionIndex - 1]["Subject"]);
            };
        };

        const onQuestionEnded = () => {
            const subject = questions[questionIndex - 1]["Subject"];
            const timeLimit = subject === "Mathematics" ? 30 : 10;
            clearInterval(timerRef.current);
            setTimeLeft(timeLimit);
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTimeLeft) => {
                    const newTimeLeft = prevTimeLeft - 1;
                    if (newTimeLeft < 0) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return newTimeLeft;
                });
            }, 1000);
        };

        if (questions[questionIndex - 1]?.["Preamble Text"] && questions[questionIndex - 1]?.["S/N"] === 1) {
            playAudio(preambleAudioUrl, () => {
                playAudio(questionAudioUrl, onQuestionEnded);
            });
        } else {
            playAudio(questionAudioUrl, onQuestionEnded);
        }
    };


    const startTimer = (subject: any) => {
        clearInterval(timerRef.current);
        const timeLimit = subject === "Mathematics" ? 30 : 10;
        setTimeLeft(timeLimit);
        timerRef.current = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                const newTimeLeft = prevTimeLeft - 1;
                if (newTimeLeft < 0) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return newTimeLeft;
            });
        }, 1000);
    };


    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
        };
    }, [quizStarted]);


    const handleNextQuestion = () => {
        resetTranscript();
        setCurrentQuestionIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            if (newIndex < questions.length) {
                playQuestionAudio(newIndex + 1);
                return newIndex;
            } else {
                setQuizStarted(false);
                return prevIndex;
            }
        });
    };
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
            }, 10000);
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
            SetSimilarityScore((prevScores) => {
                const newScores = [...prevScores];
                newScores[currentQuestionIndex] = similarityScore;
                return newScores;
            });
            setSimilarityScore(similarityScore);

            if (similarityScore > 0.6) {
                synthesizeText("yes you are right");
                setRoundScore(round_score + 3)
            } else {
                synthesizeText("I'm not accepting that")
                // synthesizeText("The right answer I was looking for is")
            }
        } catch (error) {
            console.error('Error calculating similarity:', error);
        } finally {
            setCheckingAnswer(false);
            setIsReadyToCalculate(false);
        }
    };


    const config = {
        loader: { load: ['input/tex', 'output/svg'] },
        tex: {
            inlineMath: [['$', '$']],
            displayMath: [['$$', '$$']]
        }
    };

    return (
        <div className="bg-bgMain h-screen">
            <PracticeNavBar />
            <div className="mt-[100px] md:h-1/2 flex flex-col w-full items-center justify-center bg-white shadow rounded-b-xl 
             dark:bg-darkBgLight">

                {!introskipped ?
                    <p className="font-semibold m-2">Welcome to round number 1. This round is the round for fundamental concepts.
                        The questions are simple and direct so I'm expecting simple and direct answers from you.
                        For questions which require calculation, you have 30 seconds to present your answer and if there
                        are no calculations you have 10 seconds to do so. All questions are to be attempted once only.
                        Best wishes to you
                    </p> : ""}
                {!introStarted ?
                    <button onClick={handleStartIntro}>
                        Start Intro
                    </button> :
                    <button onClick={handleSkipIntro}>
                        Skip Intro
                    </button>}

                <div className="flex w-full">

                    <div className="flex items-center gap-1 p-2 w-full justify-start">
                        <p className="font-semibold">Points: {round_score}</p>
                    </div>

                    {isAudioPlaying ? <div className="flex items-center gap-1 p-2 w-full justify-end">
                        <Image src={clock_icon} alt="clock icon" width={20} height={20} />
                        <p className="font-semibold">Time left:</p>
                    </div> : <div className="flex items-center gap-1 p-2 w-full justify-end">
                        <Image src={clock_icon} alt="clock icon" width={20} height={20} />
                        <p className="font-semibold">Time left: {timeLeft}s</p>
                    </div>
                    }
                </div>

                {introskipped &&
                    <div className="m-10">
                        <div className="">
                            <p> Question: {currentQuestion["S/N"]} </p>
                            <h2>Subject: {currentQuestion["Subject"]}</h2>
                            {currentQuestion.Subject === "Mathematics" || currentQuestion.Subject === "Physics"
                                || currentQuestion.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Preamble:  {currentQuestion["Preamble Text"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2>Preamble: {currentQuestion["Preamble Text"]}</h2>
                            }


                            {currentQuestion.Subject === "Mathematics" || currentQuestion.Subject === "Physics"
                                || currentQuestion.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Question:  {currentQuestion["Question"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2>Question: {currentQuestion["Question"]}</h2>
                            }


                            {/* {currentQuestion.Subject === "Mathematics" || currentQuestion.Subject === "Physics"
                                || currentQuestion.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Answer: {currentQuestion["Answer"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2>Answer: {currentQuestion["Answer"]}</h2>
                            } */}
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
                        <button
                            onClick={handleCalculateSimilarity}
                            disabled={!isReadyToCalculate}
                        >
                            Calculate Similarity
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
                    </div>}
            </div>
            <div className="flex flex-wrap items-center justify-center mt-10 gap-4 m-2">
                {contest_40_1.map((_, index) => (
                    <p
                        key={index}
                        className={`rounded-full text-white w-[30px] h-[30px] text-center flex items-center justify-center ${index === currentQuestionIndex
                            ? 'bg-blue-800'
                            : index < currentQuestionIndex
                                ? SimilarityScore && SimilarityScore[index] > 0.6
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                : 'bg-gray-400'
                            }`}
                    >
                        {index + 1}
                    </p>
                ))}
            </div>
        </div>
    )
}