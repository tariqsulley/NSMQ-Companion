"use client"
import PracticeNavBar from "@/app/components/PracticeNavBar";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams, usePathname } from "next/navigation";
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



export default function ContestPage({ params }: any) {

    const { set } = params;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setImportedQuestions] = useState<any>(null);
    const currentQuestion = questions?.length > 0 ? questions[currentQuestionIndex] : null;
    const pathname = usePathname();
    const year = pathname.split('/')[3];
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
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
    const [currentRound, setCurrentRound] = useState(1);
    const [playedPreambles, setPlayedPreambles] = useState(new Set());
    const [introStarted, setIntroStarted] = useState(false)
    const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);
    const [round_score, setRoundScore] = useState(0)
    const student_analytics = []
    const [timeRemainingPercentage, setTimeRemainingPercentage] = useState(Array(questions?.length).fill(null));
    const [quizEnded, setQuizEnded] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentClueIndex, setCurrentClueIndex] = useState(0);
    const [currentClueText, setCurrentClueText] = useState('');
    const timerRef = useRef<any>(null);
    const [stopCluePlayback, setStopCluePlayback] = useState(false);
    const [cluestopped, setClueStopped] = useState("play")
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

    const [clueTexts, setClueTexts] = useState<string[]>([]);
    const [isCluePlayingNow, setIsCluePlayingNow] = useState(false);

    const addClueText = (newText: string) => {
        setClueTexts(prevTexts => [...prevTexts, newText]);
    };

    const importQuestions = async (round: any) => {
        try {
            const questionsData = await import(`../../../../utils/Questions/NSMQ_2021/${contestId}/round${round}`);
            setImportedQuestions(questionsData.default);
        } catch (error) {
            console.error('Failed to load questions:', error);
            setImportedQuestions([]);
        }
    };

    useEffect(() => {
        importQuestions(currentRound);
    }, [contestId, currentRound]);


    const getScoreForClueIndex = (clueIndex: any) => {
        switch (clueIndex) {
            case 0:
                return 5;
            case 1:
                return 4;
            default:
                return 3;
        }
    };


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

    const handleStartQuiz = () => {
        setQuizStarted(true);
        setCurrentClueIndex(0);
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
            setClueStopped("stop")
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
                newPercentage[currentQuestionIndex] = (timeRemaining / timeLimit) * 100;
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
                    newPercentage[currentQuestionIndex] = (timeRemaining / timeLimit) * 100;
                    return newPercentage;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleCircleClick, isBellPlaying, currentQuestionIndex, timeLeft]);



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
        const questionAudioUrl = `/Sounds/${year}/${contestId}/round${currentRound}/q${questionIndex}.wav`;
        const preambleAudioUrl = `/Sounds/${year}/${contestId}/round${currentRound}/preamble_q${questionIndex}.wav`;

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
                // startTimer();
            };
        };

        const onQuestionEnded = () => {
            const timeLimit = questions[questionIndex - 1]["calculations present"] === "Yes" ? 30 : 10;
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

        const question = questions[questionIndex - 1];
        const preambleText = question["Preamble Text"];

        if (currentRound === 4) {
            // Round 4, handle preamble and clues
            if (cluestopped !== "stop") {
                playCluesByOne();
            } else {
                console.log("no clues")
                // playCluesByOne();
            }
        } else {
            // Other rounds, handle preamble and full question
            if (preambleText && !playedPreambles.has(preambleText)) {
                setPlayedPreambles(new Set(playedPreambles).add(preambleText));
                playAudio(preambleAudioUrl, () => {
                    playAudio(questionAudioUrl, onQuestionEnded);
                    startTimer();
                });
            } else {
                playAudio(questionAudioUrl, onQuestionEnded);
                startTimer();
            }
        }

    };


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
            // startTimer();
        };
    };

    const clearClues = () => {
        setClueTexts([]);
    };

    const playNextClue = (clueIndex: any) => {
        if (cluestopped === "stop") {
            console.log('Clues stopped');
            return;
        }

        const clueAudioUrl = `/Sounds/${year}/${contestId}/round${currentRound}/q${currentQuestionIndex + 1}_clue${clueIndex + 1}.wav`;
        addClueText(questions[currentQuestionIndex][`clue${clueIndex + 1}`]);

        setIsCluePlayingNow(true);

        playAudio(clueAudioUrl, () => {
            setIsCluePlayingNow(false);
            if ((clueIndex < questions[currentQuestionIndex]["clue_nums"] - 1) && cluestopped !== "stop") {
                setTimeout(() => {
                    setCurrentClueIndex(clueIndex + 1);
                }, 2000);
            } else {
                // onQuestionEnded();
            }
        });
    };

    useEffect(() => {
        if (currentClueIndex > 0) {
            playNextClue(currentClueIndex);
        }
    }, [currentClueIndex, cluestopped]);


    const playCluesByOne = () => {
        setCurrentClueIndex(0);
        clearClues();
        playNextClue(0);
    };


    const startTimer = () => {
        clearInterval(timerRef.current);
        const timeLimit = currentQuestion["calculations present"] === "Yes" ? 30 : 10;
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
        resetTranscript(); // Clear any existing transcripts
        setClueStopped("play")
        // Update the question index
        setCurrentQuestionIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            if (newIndex < questions.length) {
                // Call to play the next question audio is moved to useEffect to ensure the index is updated
                return newIndex;
            } else {
                // End the quiz if there are no more questions
                setQuizStarted(false);
                setQuizEnded(true);
                return prevIndex; // Return the current index if no more questions
            }
        });
    };

    useEffect(() => {
        if (quizStarted && currentQuestionIndex < questions?.length && cluestopped != "stop") {
            playQuestionAudio(currentQuestionIndex + 1);
        }
    }, [currentQuestionIndex]);


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
                const scoreToAdd = currentRound === 4 ? getScoreForClueIndex(currentClueIndex - 1) : 3;
                updateRoundBreakDown(currentQuestion["Subject"] as Subject, scoreToAdd);
                setRoundScore(round_score + scoreToAdd);

                if (currentRound === 4) {
                    switch (scoreToAdd) {
                        case 5:
                            synthesizeText("I was reading the first clue, 5 points");
                            break;
                        case 4:
                            synthesizeText("I was reading the second clue, 4 points");
                            break;
                        default:
                            synthesizeText("yes you are right");
                            break;
                    }
                } else {
                    synthesizeText("yes you are right");
                }

                setTimeout(() => {
                    handleNextQuestion();
                }, 5000);
            } else {
                synthesizeText("I'm not accepting that");
                updateRoundBreakDown(currentQuestion["Subject"] as Subject, 0);
                setTimeout(() => {
                    handleNextQuestion();
                }, 3000);
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
        if (currentRound <= 3) {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            setRoundScore(0);
            SetSimilarityScore(Array(questions?.length).fill(null));
            importQuestions(nextRound).then(() => {
                setCurrentQuestionIndex(0);
                setQuizEnded(false);
            });
        } else {
            console.log("Quiz has ended");
        }
    };

    if (!questions) {
        return <div>Loading questions...</div>;
    }

    return (
        <div className="bg-bgMain dark:bg-darkBgDeep h-screen">
            <PracticeNavBar />
            <div className="mt-[100px]  flex flex-col w-full items-center justify-center bg-white shadow rounded-b-xl 
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
                            <p className="shadow px-6 py-2 rounded-xl border-2 bg-gray-100 font-bold dark:bg-blue-800 ">Round {currentRound}</p>
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
                            <h2 className="font-bold">Subject: {currentQuestion?.["Subject"]}</h2>
                            {currentQuestion?.Subject === "Mathematics" || currentQuestion?.Subject === "Physics"
                                || currentQuestion?.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Preamble:  {currentQuestion?.["Preamble Text"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2 className="font-semibold text-[#475569]">Preamble: {currentQuestion?.["Preamble Text"]}</h2>
                            }


                            <div>
                                {currentRound === 4 ? (
                                    <div>
                                        <h2 className="font-bold">Clues:</h2>
                                        {clueTexts.map((text, index) => (
                                            <p key={index}>{text}</p>  // Display each clue text
                                        ))}
                                    </div>
                                )
                                    : (
                                        currentQuestion?.["calculations present"] ? (
                                            <MathJaxContext config={config}>
                                                <MathJax key={currentQuestionIndex}>
                                                    {currentQuestion?.["Question"]}
                                                </MathJax>
                                            </MathJaxContext>) : <h2 className="font-bold">Question: {currentQuestion?.["Question"]} </h2>
                                    )
                                }
                            </div>


                            <div>
                                <h2 className="font-semibold">Transcribed Answer:</h2>
                                <p className="font-semibold text-[#475569]">{transcribedText}</p>
                            </div>
                            {currentQuestion?.Subject === "Mathematics" || currentQuestion?.Subject === "Physics"
                                || currentQuestion?.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        Answer: {currentQuestion?.["Answer"]}
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2>Answer: {currentQuestion?.["Answer"]}</h2>
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
                        <h2 className="text-2xl font-bold">End of Round {currentRound}</h2>
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