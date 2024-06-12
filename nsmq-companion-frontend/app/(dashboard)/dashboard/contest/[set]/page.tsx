"use client"
import PracticeNavBar from "@/app/components/PracticeNavBar";
// import questions from "../../../../utils/Questions/NSMQ_2021/contest1/round1"
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
import { CgSpinner } from "react-icons/cg";

// const nums = [2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36]


export default function ContestPage({ params }: any) {

    const { set } = params;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setImportedQuestions] = useState<any>(null);
    // const currentQuestion = questions[currentQuestionIndex];
    const currentQuestion = questions?.length > 0 ? questions[currentQuestionIndex] : null;

    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const year = searchParams.get('year');

    const type = parseInt(searchParams.get("nums") ?? "0");
    const [selectedContest, setSelectedContest] = useState("");
    const [contestValue, setContestValue] = useState("");
    const router = useRouter();
    const [loading, setloading] = useState<boolean>(false)
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
    const [SimilarityScore, SetSimilarityScore] = useState(Array(questions?.length).fill(null));
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);


    // useEffect(() => {
    //     const importQuestions = async () => {
    //         const questionsData = await import(`../../../../utils/Questions/NSMQ_2021/${contestId}/round1`);
    //         setImportedQuestions(questionsData.default);
    //     };

    //     importQuestions();
    // }, []);
    const importQuestions = async (round = 'round1') => {
        try {
            const questionsData = await import(`../../../../utils/Questions/NSMQ_2021/${contestId}/${round}`);
            setImportedQuestions(questionsData.default);
        } catch (error) {
            console.error('Failed to load questions:', error);
            setImportedQuestions([]);  // Handle the error, maybe set to empty array or show error message
        }
    };

    useEffect(() => {
        importQuestions();  // You might pass a round variable here if it changes
    }, [contestId]);  // Add round to dependency array if it's a state/prop



    const [introStarted, setIntroStarted] = useState(false)
    const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);
    const [round_score, setRoundScore] = useState(0)
    const student_analytics = []
    const [timeRemainingPercentage, setTimeRemainingPercentage] = useState(Array(questions?.length).fill(null));
    const [quizEnded, setQuizEnded] = useState(false)

    const [totalRoundScore, setTotalRoundScore] = useState([{
        'Contest': 'Contest 1',
        'Round1': 0
    }])

    const [roundBreakDown, setRoundBreakDown] = useState([{
        'Year': '2021',
        'contest': 'Contest 1',
        'name': 'Round1',
        'Mathematics': 0,
        'Biology': 0,
        'Chemistry': 0,
        'Physics': 0
    }])

    const [studentStrength, setStudentStrength] = useState([0, 0, 0, 0])

    type Subject = 'Mathematics' | 'Biology' | 'Chemistry' | 'Physics';

    const updateRoundBreakDown = (subject: Subject, score: number) => {
        setRoundBreakDown((prevBreakDown) => {
            const newBreakDown = [...prevBreakDown];
            const subjectIndex = {
                'Mathematics': 0,
                'Biology': 1,
                'Chemistry': 2,
                'Physics': 3,
            };
            const index = subjectIndex[subject];
            newBreakDown[0][subject] += score;
            return newBreakDown;
        });
    };

    const handleTranscriptUpdate = () => {
        setTranscribedText(transcript);
        if (!listening) {
            setIsReadyToCalculate(true);
        }
    };

    const [timeLeft, setTimeLeft] = useState(
        currentQuestion?.["Subject"] === "Mathematics" ? 30 : 10
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
            if (audioInstance && audioInstance.currentTime > 0) {
                audioInstance.pause();
                audioInstance.currentTime = 0;
            }
            SpeechRecognition.startListening({ continuous: true });

            setTimeRemainingPercentage((prevPercentage) => {
                const newPercentage = [...prevPercentage];
                const currentQuestion = questions[currentQuestionIndex];
                const timeLimit = currentQuestion["Subject"] === "Mathematics" ? 30 : 10;
                const timeRemaining = timeLeft;
                newPercentage[currentQuestionIndex] = (timeRemaining / timeLimit) * 100; // Store the percentage of time remaining
                return newPercentage;
            });

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
                setTimeRemainingPercentage((prevPercentage) => {
                    const newPercentage = [...prevPercentage];
                    const currentQuestion = questions[currentQuestionIndex];
                    const timeLimit = currentQuestion["Subject"] === "Mathematics" ? 30 : 10;
                    const timeRemaining = timeLeft;
                    newPercentage[currentQuestionIndex] = (timeRemaining / timeLimit) * 100; // Store the percentage of time remaining
                    return newPercentage;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleCircleClick, isBellPlaying, currentQuestionIndex, timeLeft]);

    // useEffect(() => {
    //     const handleKeyDown = (event: KeyboardEvent) => {
    //         if (event.key.toLowerCase() === 'b' && !isBellPlaying) {
    //             handleCircleClick();
    //         }
    //     };

    //     window.addEventListener('keydown', handleKeyDown);

    //     return () => {
    //         window.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, [handleCircleClick, isBellPlaying]);

    const synthesizeText = async (text: string) => {
        try {
            setloading(true);
            const response = await axios.post(`${API_BASE}/language_services/synthesize/`, {
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
        const questionAudioUrl = `/Sounds/2021/Contest1/round1/q${questionIndex}.wav`;
        const preambleAudioUrl = `/Sounds/2021/Contest1/round1/preamble_q${questionIndex}.wav`;

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
                        setQuizEnded(true)
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
                setQuizEnded(true)
                return prevIndex;
            }
        });
    };

    const sendAudioToBackend = async (audioBlob: any) => {
        try {
            setTranscibingAudio(true)
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');

            const response = await axios.post(`${API_BASE}/language_services/get-transcript`, formData, {
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
            const response = await axios.post(`${API_BASE}/language_services/calculate-similarity`, {
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
                updateRoundBreakDown(currentQuestion["Subject"] as Subject, 3);
                setTimeout(() => {
                    handleNextQuestion();
                    setRoundScore(round_score + 3);
                }, 3000);
            } else {
                synthesizeText("I'm not accepting that")
                updateRoundBreakDown(currentQuestion["Subject"] as Subject, 0);
                setTimeout(() => {
                    handleNextQuestion();
                }, 3000);
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

    const handleGoToNextRound = () => {
        importQuestions('round2').then(() => {
            setCurrentQuestionIndex(0);  // Reset the question index
            setQuizEnded(false);  // Ensure quiz is not marked as ended if starting new round
        });
    };

    if (!questions) {
        return <div>Loading questions...</div>;
    }


    return (
        <div className="bg-bgMain dark:bg-darkBgDeep h-screen">
            <PracticeNavBar />
            <div className="mt-[100px] md:h-1/2 flex flex-col w-full items-center justify-center bg-white shadow rounded-b-xl 
             dark:bg-darkBgLight">
                <p>{year}</p>
                <p>{contestId}</p>
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

                {introskipped && !quizEnded &&
                    <div className="m-10  flex flex-col  w-full justify-center items-center">

                        <div>
                            <p className="shadow px-6 py-2 rounded-xl border-2 bg-gray-100 font-bold">Round 1</p>
                        </div>

                        <div className="flex w-full ">

                            <div className="flex items-center gap-1 p-2 w-full justify-start">
                                <p className="font-semibold text-2xl">Points: {round_score}</p>
                            </div>

                            {isAudioPlaying ? <div className="flex items-center gap-1 p-2 w-full justify-end">
                                <Image src={clock_icon} alt="clock icon" width={20} height={20} />
                                <p className="font-semibold text-2xl">Time left:</p>
                            </div> : <div className="flex items-center gap-1 p-2 w-full justify-end">
                                <Image src={clock_icon} alt="clock icon" width={20} height={20} />
                                <p className="font-semibold text-2xl">Time left: {timeLeft}s</p>
                            </div>
                            }
                        </div>

                        <div className="">
                            {/* <p> Question: {currentQuestion["S/N"]} </p> */}
                            <h2 className="font-bold">Subject: {currentQuestion["Subject"]}</h2>
                            {currentQuestion.Subject === "Mathematics" || currentQuestion.Subject === "Physics"
                                || currentQuestion.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Preamble:  {currentQuestion["Preamble Text"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2 className="font-semibold text-[#475569]">Preamble: {currentQuestion["Preamble Text"]}</h2>
                            }


                            {currentQuestion.Subject === "Mathematics" || currentQuestion.Subject === "Physics"
                                || currentQuestion.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        {currentQuestion["Question"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2 className="font-bold">Question: {currentQuestion["Question"]}</h2>
                            }

                            <div>
                                <h2 className="font-semibold">Transcribed Answer:</h2>
                                <p className="font-semibold text-[#475569]">{transcribedText}</p>
                            </div>
                            {currentQuestion.Subject === "Mathematics" || currentQuestion.Subject === "Physics"
                                || currentQuestion.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Answer: {currentQuestion["Answer"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2>Answer: {currentQuestion["Answer"]}</h2>
                            }
                        </div>
                        <div
                            className={`w-10 h-10 rounded-full ${isCircleGreen ? 'bg-green-500' : 'bg-gray-500'}`}
                            onClick={handleCircleClick}
                        />
                        <div className=" w-full justify-between flex gap-2 items-center mt-2">

                            <button
                                onClick={handleCalculateSimilarity}
                                disabled={!isReadyToCalculate}
                                className="bg-green-400 dar px-6 py-1 rounded-lg"
                            >
                                <p className="font-semibold text-white"> {checkingAnswer ? <CgSpinner size={25} className="animate-spin text-white" /> : "Submit Answer"} </p>
                            </button>

                            <div>
                                {!quizStarted ? (
                                    <button onClick={handleStartQuiz}
                                        className="bg-[#4a6cc3] px-6 py-1 rounded-lg">
                                        <p className="font-semibold text-white">Start Quiz</p></button>
                                ) : (
                                    <button onClick={handleNextQuestion}
                                        className="bg-[#4a6cc3] px-6 py-1 rounded-lg">
                                        <p className="font-semibold text-white">Next Question</p></button>
                                )}
                            </div>
                            <p>Similarity:{similarityScore}</p>
                        </div>
                    </div>}

                {quizEnded && (
                    <div className="mt-[100px] md:h-1/2  flex flex-col items-center justify-center bg-gray-100 w-full
                     shadow rounded-b-xl dark:bg-darkBgLight">
                        <h2 className="text-2xl font-bold">End of Round 1</h2>
                        <p className="text-lg mt-2">Total Points: {round_score}</p>
                        <div>
                            <button onClick={handleGoToNextRound}>Go To Next Round</button>
                        </div>
                    </div>
                )}

            </div>
            <div className="flex flex-wrap items-center justify-center mt-10 gap-4 m-2">
                {questions?.map((_: any, index: any) => (
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