"use client"
import 'regenerator-runtime/runtime'
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
import bolt from "../../../../../public/images/bolt.svg"
import arrow from "../../../../../public/images/arrow.svg"
import useSWR from "swr";
import { useAuth } from "@/app/context/AuthContext";
import Link from 'next/link';

export default function ContestPage({ params }: any) {
    const { Data } = useAuth()
    const { set } = params;
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const startRound = parseInt(searchParams.get('startRound') || '2');
    const mode = searchParams.get('mode');
    const isReviewMode = mode === 'review';

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setImportedQuestions] = useState<any>(null);
    const currentQuestion = questions?.length > 0 ? questions[currentQuestionIndex] : null;
    const pathname = usePathname();
    const year = pathname.split('/')[3];
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
    const [playRound2Intro, { stop: StopRound2Intro }] = useSound('/Sounds/remarks/round2_intro.wav')
    const [playRound3Intro, { stop: StopRound3Intro }] = useSound('/Sounds/remarks/round3_intro.wav')
    const [playRound4Intro, { stop: StopRound4Intro }] = useSound('/Sounds/remarks/round4_intro.wav')
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
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
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

    const round1Intro = `Welcome to round number 1. This round is the round for fundamental concepts.
    The questions are simple and direct so I'm expecting simple and direct answers from you.
    For questions which require calculation, you have 30 seconds to present your answer and if there
    are no calculations you have 10 seconds to do so. All questions are to be attempted once only.
    Best wishes to you`;

    const round3Intro = `In this round, I am going to be reading statements to you. When you receive a statement,
     please consider the statement carefully and let me know whether it is true or false, if you are right, 
     2 points, if you are incorrect you lose a precious point. Best wishes to you.`

    const round2Intro = `This is the round of speed. For an opportunity to answer a question you must ring the bell. 
    If you ring and answer correctly you get 3 points. But please be very careful because if you attempt to answer a 
    question and you are unsuccessful. unsuccessful. meaning you are unable to provide a correct answer.
     Or you are unable to provide an answer withing 3 seconds of ringing. You lose a precious point. Best wishes to you`

    const round4Intro = `Welcome to the round of riddles. In this round I am going to be reading out clues. 
    If you answer the riddle on the first clue, you get five points on the second clue you get 4 points,
     on the third or any other clue you get three points. Best wishes to you`

    const [playedRound1Intro, setPlayedRound1Intro] = useState(false);
    const [playedRound2Intro, setPlayedRound2Intro] = useState(false);
    const [playedRound3Intro, setPlayedRound3Intro] = useState(false);
    const [playedRound4Intro, setPlayedRound4Intro] = useState(false);

    const [round1ended, setRound1Ended] = useState(false)
    const [round2ended, setRound2Ended] = useState(false)
    const [round3ended, setRound3Ended] = useState(false)
    const [round4ended, setRound4Ended] = useState(false)

    const [round1started, setRound1Started] = useState(false)
    const [round2started, setRound2Started] = useState(false)
    const [round3started, setRound3Started] = useState(false)
    const [round4started, setRound4Started] = useState(false)

    const [goToNextRoundClicked, setGoToNextRoundClicked] = useState(false)

    const [showNextRoundIntro, setShowNextRoundIntro] = useState(false);

    const [round2skipped, setRound2Skipped] = useState(false)
    const [round3skipped, setRound3Skipped] = useState(false)
    const [round4skipped, setRound4Skipped] = useState(false)
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);

    const addClueText = (newText: string) => {
        setClueTexts(prevTexts => [...prevTexts, newText]);
    };

    // useEffect(() => {
    //     setCurrentRound(startRound);
    //     importQuestions(startRound);
    // }, [contestId, startRound]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                console.log(`Fetching questions for year ${year}, contest ${contestId}, round ${startRound}`);
                const questionsData = await import(`../../../../utils/Questions/NSMQ_${year}/Contest ${contestId}/round${startRound}`);
                console.log("Fetched questions:", questionsData.default);
                setImportedQuestions(questionsData.default);
            } catch (error) {
                console.error('Failed to load questions:', error);
                setImportedQuestions([]);
            }
        };

        fetchQuestions();
    }, [year, contestId, startRound]);


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
        importQuestions(startRound);
    }, [contestId, startRound]);


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
        setStartTime(new Date())
    };

    const handleStartIntro = () => {
        playIntro();
        setIntroStarted(true)
    };

    const handleSkipIntro = () => {
        stopIntro();
        setIntroSkipper(true);
        // setQuizStarted(true)
        handleStartQuiz()
        setRound1Started(true)
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
        const questionAudioUrl = `/Sounds/${year}/Contest ${contestId}/round${startRound}/q${questionIndex}.wav`;
        const preambleAudioUrl = `/Sounds/${year}/Contest ${contestId}/round${startRound}/preamble_q${questionIndex}.wav`;

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

        const question = questions?.[questionIndex - 1];
        const preambleText = question?.["Preamble Text"];

        if (startRound === 4) {
            if (cluestopped !== "stop") {
                playCluesByOne();
            } else {
                console.log("no clues")
                // playCluesByOne();
            }
        } else {
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
        if (cluestopped === "stop" || !round4started) {
            console.log('Clues stopped');
            return;
        }


        const clueAudioUrl = `/Sounds/${year}/Contest ${contestId}/Round${startRound}/q${currentQuestionIndex + 1}_clue${clueIndex + 1}.wav`;
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
        const timeLimit = currentQuestion?.["calculations present"] === "Yes" ? 30 : 10;
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

    useEffect(() => {
        if (quizEnded) {
            sendRoundDataToBackend();
        }
    }, [quizEnded]);

    const handleNextQuestion = () => {
        resetTranscript();
        setClueStopped("play");

        setCurrentQuestionIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            if (newIndex < questions.length) {
                return newIndex;
            } else {
                // sendRoundDataToBackend();
                switch (startRound) {
                    case 1:
                        setRound1Ended(true);
                        setRound1Started(false);
                        setEndTime(new Date());
                        break;
                    case 2:
                        setRound2Ended(true);
                        setRound2Started(false);
                        setRound1Started(false)
                        setEndTime(new Date());
                        break;
                    case 3:
                        setRound3Ended(true);
                        setRound3Started(false);
                        setRound2Started(false)
                        setEndTime(new Date());
                        break;
                    case 4:
                        setRound4Ended(true);
                        setRound3Started(false)
                        setRound4Started(false)
                        setQuizCompleted(true);
                        setEndTime(new Date());
                        break;
                    default:
                        break;
                }

                setQuizStarted(false);
                setQuizEnded(true);
                return prevIndex;
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
                const scoreToAdd = startRound === 4 ? getScoreForClueIndex(currentClueIndex - 1) : 3;
                updateRoundBreakDown(currentQuestion["Subject"] as Subject, scoreToAdd);
                setRoundScore(round_score + scoreToAdd);
                setNumCorrectAnswers(numCorrectAnswers + 1);

                if (startRound === 4) {
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


    const handleSkipRound2Intro = () => {
        setPlayedRound2Intro(true);
        StopRound2Intro();
        setIntroSkipper(true);
        setRound2Started(true);
        setShowNextRoundIntro(false);
        setRound2Skipped(true)
    };

    const handleSkipRound3Intro = () => {
        setPlayedRound3Intro(true);
        StopRound3Intro();
        setIntroSkipper(true);
        setRound3Started(true);
        setShowNextRoundIntro(false);
        setRound3Skipped(true)
    };

    const handleSkipRound4Intro = () => {
        setPlayedRound4Intro(true);
        StopRound4Intro();
        setIntroSkipper(true);
        setRound4Started(true)
        setShowNextRoundIntro(false);
        setRound4Skipped(true)
    };

    const handleNextReviewQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousReviewQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };


    const formatTimeDifference = (startTime: Date, endTime: Date) => {
        const timeDiff = endTime.getTime() - startTime.getTime();
        const minutes = Math.floor(timeDiff / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleGoToNextRound = () => {
        if (startRound <= 3) {
            const nextRound = startRound + 1;
            setCurrentRound(nextRound);
            setRoundScore(0);
            SetSimilarityScore(Array(questions?.length).fill(null));
            importQuestions(nextRound).then(() => {
                setCurrentQuestionIndex(0);
                setQuizEnded(false);
                setShowNextRoundIntro(true);

                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('startRound', nextRound.toString());
                const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
                window.history.replaceState(null, '', newUrl);
            });
        } else {
            console.log("Quiz has ended");
        }
    };


    const sendRoundDataToBackend = async () => {
        try {
            const response = await axios.post(`${API_BASE}/questions/round-score`, {
                Student_uuid: Data?.data.uuid,
                Year: parseInt(year),
                Contest_id: contestId,
                Round_id: startRound,
                Round_score: round_score,
                Maths: roundBreakDown[0]['Mathematics'] / 2,
                Biology: roundBreakDown[0]['Biology'] / 2,
                Chemistry: roundBreakDown[0]['Chemistry'] / 2,
                Physics: roundBreakDown[0]['Physics'] / 2
            });
            console.log('Round data sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending round data:', error);
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
                {isReviewMode ?
                    <div className="w-full">
                        Review Mode
                        <div className="flex flex-col  w-full items-center justify-center">
                            <p className="font-bold">Question: {currentQuestion?.["S/N"]}</p>
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
                                {
                                    currentQuestion?.["calculations present"] ? (
                                        <MathJaxContext config={config}>
                                            <MathJax key={currentQuestionIndex}>
                                                {currentQuestion?.["Question"]}
                                            </MathJax>
                                        </MathJaxContext>) : <h2 className="font-bold">Question: {currentQuestion?.["Question"]} </h2>
                                }
                            </div>

                            {currentQuestion?.Subject === "Mathematics" || currentQuestion?.Subject === "Physics"
                                || currentQuestion?.Subject === "Chemistry" ? (
                                <MathJaxContext config={config}>
                                    <MathJax key={currentQuestionIndex}>
                                        <p className="font-bold">Answer: {currentQuestion?.["Answer"]} </p>
                                    </MathJax>
                                </MathJaxContext>) :
                                <h2 className="font-bold">Answer: {currentQuestion?.["Answer"]}</h2>
                            }

                            <div className="mt-4 flex justify-between w-full">
                                <button
                                    onClick={handlePreviousReviewQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextReviewQuestion}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div> :
                    <>
                        <div>
                            {startRound == 2 && !quizEnded && !round2started && (
                                <div>
                                    <p>{round2Intro}</p>
                                    <button onClick={playRound2Intro}>Play Round 2 Intro</button>
                                    <button onClick={handleSkipRound2Intro}>Skip Intro</button>
                                </div>
                            )}

                            {startRound == 3 && !quizEnded && !round3started && (
                                <div>
                                    <p>{round3Intro}</p>
                                    <button onClick={playRound3Intro}>Play Round 3 Intro</button>
                                    <button onClick={handleSkipRound3Intro}>Skip Intro</button>
                                </div>
                            )}
                            {startRound == 4 && !quizEnded && !round4started && (
                                <div>
                                    <p>{round4Intro}</p>
                                    <button onClick={playRound4Intro}>Play Round 4 Intro</button>
                                    <button onClick={handleSkipRound4Intro}>Skip Intro</button>
                                </div>
                            )}
                        </div>


                        {currentRound === 1 && startRound === 1 && !quizStarted && !round1ended ? (
                            <div className="flex flex-col items-center justify-center">
                                <p className="font-semibold m-2">{round1Intro}</p>
                                {!introStarted && !quizStarted ? (
                                    <button onClick={handleStartIntro}>Start Intro</button>
                                ) : (
                                    <button onClick={handleSkipIntro}>Skip Intro</button>
                                )}
                            </div>
                        ) : null}


                        {(round1started) || (round2started) || (round3started) || (round4started) ?
                            <div className="m-10  flex flex-col  w-full justify-center items-center">

                                <div>
                                    <p className="shadow px-6 py-2 rounded-xl border-2 bg-gray-100 font-bold dark:bg-blue-800 ">Round {startRound}</p>
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
                                        {startRound === 4 ? (
                                            <div>
                                                <h2 className="font-bold">Clues:</h2>
                                                {clueTexts.map((text, index) => (
                                                    <p key={index}>{text}</p>
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
                            </div> : ""}

                        {quizEnded && (
                            <div className="mt-[100px] p-5  flex flex-col gap-5 items-center justify-center bg-gray-100 w-full
                     shadow rounded-b-xl dark:bg-darkBgLight">
                                <div className='flex flex-col items-center justify-center'>
                                    <h2 className="text-2xl font-bold">End of Round {startRound}</h2>
                                    <div className="flex items-center gap-4 mt-2 mb-2">
                                        <div className="bg-[#FFD700] p-2 rounded-lg">
                                            <p className="dark:text-darkBgLight">TOTAL POINTS</p>
                                            <div className="flex gap-1 items-center bg-gray-700 rounded-lg p-1  justify-center">
                                                <Image src={bolt} width={30} height={30} alt="image" />
                                                <p className="text-3xl text-[#FFD700] font-semibold ">
                                                    {round_score}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[#3888ff] p-2 rounded-lg">
                                            <p className="dark:text-darkBgLight text-center">BLAZING</p>
                                            <div className="flex gap-1 items-center bg-gray-700 rounded-lg p-1  justify-center">
                                                <Image src={clock_icon} width={30} height={30} alt="image" />
                                                <p className="text-3xl text-blue-400 font-semibold">
                                                    {endTime && startTime ? formatTimeDifference(startTime, endTime) : '0:00'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-green-400 p-2 rounded-lg">
                                            <p className="dark:text-darkBgLight text-center">
                                                {Math.round((numCorrectAnswers / questions.length) * 100) >= 90
                                                    ? 'EXCELLENT'
                                                    : Math.round((numCorrectAnswers / questions.length) * 100) >= 80
                                                        ? 'VERY GOOD'
                                                        : Math.round((numCorrectAnswers / questions.length) * 100) >= 70
                                                            ? 'GOOD'
                                                            : 'POOR'}
                                            </p>
                                            <div className="flex gap-1 items-center bg-gray-700 rounded-lg p-1  justify-center">
                                                <Image src={arrow} width={30} height={30} alt="image" />
                                                <p className="text-3xl text-green-400 font-semibold">
                                                    {Math.round((numCorrectAnswers / questions.length) * 100)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>

                                    {quizCompleted ? (

                                        <Link href="/dashboard/practice" className='bg-white border-2 px-6
                                         py-2 rounded-lg text-center dark:bg-blue-800 ' >
                                            Go to Practice Page
                                        </Link>
                                    ) : (
                                        <button onClick={handleGoToNextRound}>Go To Next Round</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>}
            </div>
            <div className="flex flex-wrap items-center justify-center mt-10 gap-4 m-2">
                {!isReviewMode ?
                    questions?.map((_: any, index: any) => (
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
                    )) : ""}
            </div>
        </div>
    )
}