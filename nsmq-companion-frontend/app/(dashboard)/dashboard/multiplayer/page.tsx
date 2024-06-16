"use client";
import 'regenerator-runtime/runtime'

import Sidebar from "@/app/components/Sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
// @ts-ignore
import useSound from "use-sound";
import API_BASE from "@/app/utils/api";
import axios from "axios";
import { CgSpinner } from "react-icons/cg";
import Image from "next/image";
import img1 from "../../../../public/images/2018-winner.png";
import img2 from "../../../../public/images/2021-winner.png";
import ProfilePic from "../../../../public/images/avatar.svg";
import multiplayericon from "../../../../public/images/mult.jpg"

const riddles: any = {
    riddle_1: {
        line_1: "I am a metal halide",
        line_2: "My metal is in the oxidation state of three.",
        line_3: "I usually crystallise out of water as a hydrated salt.",
        line_4:
            "In my anhydrous state I dimerize to form a double molecule held by dative covalent bonds.",
        line_5:
            "My metal has atomic number 13 while my halogens have atomic number\nWho am I?",
        answer: "Aluminium chloride",
    },
};

export default function MultiplayerPage() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [waitingRoomStatus, setWaitingRoomStatus] = useState("idle");
    const [pairedStudent, setPairedStudent] = useState<string | null>(null);
    const [connecting, setConnecting] = useState("");
    const [riddleQuestion, setRiddleQuestion] = useState<string | null>(null);
    const { Data } = useAuth();
    const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);
    const [checkingAnswer, setCheckingAnswer] = useState<boolean>(false);
    const [similarityScore, setSimilarityScore] = useState();
    const [transcribedText, setTranscribedText] = useState("");
    const {
        transcript,
        resetTranscript,
        listening,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();
    const [isCircleGreen, setIsCircleGreen] = useState(false);
    const [isBellPlaying, setIsBellPlaying] = useState(false);
    const [play] = useSound("/Sounds/bell.wav");
    const [isAudioPaused, setIsAudioPaused] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [opponentImage, setOpponentImage] = useState("");
    const [currentAudio, setCurrentAudio] = useState<AudioBufferSourceNode | null>(null);
    const audioCtx = new (window.AudioContext)();

    const [countdown, setCountdown] = useState(3); // Initialize countdown to 3 seconds
    const startCountdown = () => {
        const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(countdownInterval);
                    setQuizStarted(true); // Start the quiz immediately when countdown reaches 0
                    playRiddle(1); // Start the riddle
                    return 0; // Return 0 to prevent going into negative values
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };


    const handleCircleClick = () => {
        if (!isBellPlaying && browserSupportsSpeechRecognition) {
            setIsBellPlaying(true);
            setIsCircleGreen(true);
            play();

            if (audioCtx.state === "running") {
                audioCtx.suspend().then(() => {
                    // Notify other client to suspend audio
                    socket?.send(JSON.stringify({ action: "suspend_audio" }));
                });
            }

            SpeechRecognition.startListening({ continuous: true });

            setTimeout(() => {
                setIsCircleGreen(false);
                setIsBellPlaying(false);
                SpeechRecognition.stopListening();
            }, 10000);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "b" && !isBellPlaying) {
                handleCircleClick();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleCircleClick, isBellPlaying]);

    const handleTranscriptUpdate = () => {
        setTranscribedText(transcript);
        if (!listening) {
            setIsReadyToCalculate(true);
        }
    };
    useEffect(() => {
        handleTranscriptUpdate();
    }, [transcript, listening]);

    const joinWaitingRoom = () => {
        const newSocket = new WebSocket(
            "ws://51.20.43.5/api/v1/multiplayer/ws"
        );
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log("Connected to WebSocket server");
            setWaitingRoomStatus("searching");
            newSocket.send(
                JSON.stringify({
                    action: "join_waiting_room",
                    playerId: Data?.data?.uuid,
                })
            );
        };

        newSocket.onmessage = (event) => {
            console.log("Server says: " + event.data);
            const data = JSON.parse(event.data);
            if (data.event === "start_game") {
                setWaitingRoomStatus("paired");
                setPairedStudent(data.opponent_name);
                setRiddleQuestion(data.random_number);
                setOpponentImage(data.opponent_image);
                startCountdown();
            } else if (data.action === "pause_audio") {
                if (currentAudio) {
                    setIsAudioPaused(true);
                }
            } else if (data.action === "resume_audio") {
                setIsAudioPaused(false);
                playRiddle(1);
            }
        };

        newSocket.onclose = () => {
            console.log("Disconnected from WebSocket server");
            setWaitingRoomStatus("Disconnected from waiting room");
        };

        newSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    };

    const disconnectFromQuiz = () => {
        if (socket) {
            socket.send(JSON.stringify({ action: "disconnect_quiz" }));
            socket.close();
            setSocket(null);
            setWaitingRoomStatus("");
            setPairedStudent(null);
            setQuizStarted(false);
            setOpponentImage("");
        }

    };

    async function loadAudio(url: any) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return audioCtx.decodeAudioData(arrayBuffer);
    }

    async function playAudio(riddleNumber: any, lineNumber: any) {
        const audioPath = `/Sounds/multiplayer_riddles/riddle_${riddleNumber}/line_${lineNumber}.wav`;
        const audioBuffer = await loadAudio(audioPath);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        setCurrentAudio(source);

        return new Promise((resolve) => {
            source.onended = resolve;
        });
    }


    const [currentLine, setCurrentLine] = useState(1);


    const playRiddle = async (riddleNumber: any) => {
        const riddleLines = riddles[`riddle_${riddleNumber}`];
        if (!riddleLines) {
            console.error(`No riddle found for riddle_${riddleNumber}`);
            return;
        }

        console.log('Playing riddle:', riddleNumber);

        for (let lineNumber = currentLine; lineNumber <= Object.keys(riddleLines).length; lineNumber++) {
            if (audioCtx.state === "suspended") {
                setCurrentLine(lineNumber);
                break;
            }
            setRiddleQuestion(riddleLines[`line_${lineNumber}`]);
            await playAudio(riddleNumber, lineNumber);
        }
    };



    const handleCalculateSimilarity = async () => {
        try {
            setCheckingAnswer(true);
            const response = await axios.post(
                `${API_BASE}/language_services/calculate-similarity`,
                {
                    question_answer: "Aluminium chloride",
                    student_answer: transcribedText,
                }
            );
            const similarityScore = response.data.similarity;
            console.log(`Similarity Score: ${similarityScore}`);
            setSimilarityScore(similarityScore);
            if (similarityScore > 0.6) {
                console.log("right");
                if (currentAudio) {
                    currentAudio.stop(0);
                    setCurrentAudio(null);
                }
                socket?.send(JSON.stringify({ action: "stop_audio" }));
            } else {
                console.log("wrong");
                setIsAudioPaused(false);
                // Notify other client to resume audio
                audioCtx.resume().then(() => {
                    playRiddle(1);
                });
                socket?.send(JSON.stringify({ action: "resume_audio" }));
            }
        } catch (error) {
            console.error("Error calculating similarity:", error);
        } finally {
            setCheckingAnswer(false);
            setIsReadyToCalculate(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex justify-center bg-bgMain dark:bg-darkBgLight sm:ml-[256px] w-full">
                {/* <p className="mt-[100px]">Compete against friends in fast paced quizzes</p> */}
                <div className="bg-white border-4 dark:bg-darkBgDeep relative mb-2 rounded-xl w-11/12 shadow-xl mt-[80px] ">
                    {!quizStarted ? (
                        <div>
                            {waitingRoomStatus === "searching" ? (
                                <p>Searching for an opponent...</p>
                            ) : waitingRoomStatus === "paired" ? (
                                <p>Quiz starts in {countdown} seconds...</p>
                            ) : (
                                <div className="flex flex-col gap-2 items-center justify-center  h-screen">
                                    <div>
                                        <Image src={multiplayericon} width={200} height={200} alt="image" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={joinWaitingRoom}
                                            className="bg-blue-800 text-white rounded-lg px-5 py-2"
                                        >
                                            Join Waiting Room
                                        </button>
                                        <div>
                                            <button className="bg-blue-800 text-white rounded-lg px-5 py-2">
                                                View LeaderBoard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-evenly bg-[#3b65d9] shadow p-3 rounded-b-3xl">
                                <div className="flex items-center justify-evenly w-[90%] bg-gray-100 rounded-xl shadow">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white sm:w-24 sm:h-24  rounded-full m-auto flex items-center justify-center p-2 shadow-sm">
                                            <Image
                                                src={Data?.data.avatar_url}
                                                width={64}
                                                height={64}
                                                alt="Preview"
                                                className="rounded-full sm:w-full sm:h-full  object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <p>
                                                {Data?.data.first_name} {Data?.data.last_name}
                                            </p>
                                            <p>Points: 0</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <p className="sm:text-3xl">VS</p>
                                    </div>

                                    <div className="flex items-center sm:gap-2">
                                        <div className="flex flex-col">
                                            <p>{pairedStudent}</p>
                                            <p>Points: 0</p>
                                        </div>
                                        <div className="bg-white sm:w-24 sm:h-24  rounded-full m-auto flex items-center justify-center p-2 shadow-sm">
                                            <Image
                                                src={opponentImage}
                                                width={64}
                                                height={64}
                                                alt="Preview"
                                                className="rounded-full sm:w-full sm:h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center justify-between bg-[#3b65d9] w-1/2 rounded-lg py-2 p-2 mt-10 ">
                                    <p className="text-white">Question</p>
                                    <p className="text-white">3/5</p>
                                </div>
                                {riddleQuestion && <p className="text-xl">{riddleQuestion}</p>}
                                <div>
                                    <h2 className="font-semibold">Transcribed Answer</h2>
                                    <p className="font-semibold text-black">{transcribedText}</p>
                                </div>
                            </div>

                            <div className="flex absolute bottom-0 w-full flex-col items-center h-[50%] shadow mt-[100px] bg-[#3b65d9] rounded-t-3xl justify-center">
                                <div
                                    className={`w-10 h-10 rounded-full ${isCircleGreen ? "bg-green-500" : "bg-gray-500"
                                        }`}
                                    onClick={handleCircleClick}
                                />
                                <div>
                                    <div>
                                        {connecting && <div>{connecting}</div>}
                                        <button onClick={disconnectFromQuiz}>Disconnect</button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCalculateSimilarity}
                                    disabled={!isReadyToCalculate}
                                    className="bg-white  px-6 py-2 rounded-lg w-1/2 shadow"
                                >
                                    <p className="font-semibold text-black">
                                        {" "}
                                        {checkingAnswer ? (
                                            <CgSpinner
                                                size={25}
                                                className="animate-spin text-white"
                                            />
                                        ) : (
                                            "Submit Answer"
                                        )}{" "}
                                    </p>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
