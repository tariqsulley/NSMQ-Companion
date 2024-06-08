"use client"
import Sidebar from "@/app/components/Sidebar"
import { useState, useEffect } from 'react';
import { useAuth } from "@/app/context/AuthContext";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// @ts-ignore
import useSound from 'use-sound';
import API_BASE from "@/app/utils/api";
import axios from "axios";
import { CgSpinner } from "react-icons/cg";


const riddles: any = {
    "riddle_1": {
        "line_1": "I am a metal halide",
        "line_2": "My metal is in the oxidation state of three.",
        "line_3": "I usually crystallise out of water as a hydrated salt.",
        "line_4": "In my anhydrous state I dimerize to form a double molecule held by dative covalent bonds.",
        "line_5": "My metal has atomic number 13 while my halogens have atomic number\nWho am I?",
        "answer": "Aluminium chloride"
    }
};

export default function MultiplayerPage() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [waitingRoomStatus, setWaitingRoomStatus] = useState('idle');
    const [pairedStudent, setPairedStudent] = useState<string | null>(null);
    const [connecting, setConnecting] = useState("")
    const [riddleQuestion, setRiddleQuestion] = useState<string | null>(null);
    const { Data } = useAuth()
    const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);
    const [checkingAnswer, setCheckingAnswer] = useState<boolean>(false)
    const [similarityScore, setSimilarityScore] = useState()
    const [transcribedText, setTranscribedText] = useState('');
    const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [isCircleGreen, setIsCircleGreen] = useState(false);
    const [isBellPlaying, setIsBellPlaying] = useState(false);
    const [play] = useSound('/Sounds/bell.wav');
    const [isAudioPaused, setIsAudioPaused] = useState(false);

    // const handleCircleClick = () => {
    //     if (!isBellPlaying && browserSupportsSpeechRecognition) {
    //         setIsBellPlaying(true);
    //         setIsCircleGreen(true);
    //         play();

    //         SpeechRecognition.startListening({ continuous: true });

    //         setTimeout(() => {
    //             setIsCircleGreen(false);
    //             setIsBellPlaying(false);
    //             SpeechRecognition.stopListening();
    //         }, 10000);
    //     }
    // };
    const handleCircleClick = () => {
        if (!isBellPlaying && browserSupportsSpeechRecognition) {
            setIsBellPlaying(true);
            setIsCircleGreen(true);
            play();

            if (currentAudio) {
                currentAudio.pause();
                setIsAudioPaused(true);
                // Notify other client to pause audio
                socket?.send(JSON.stringify({ action: 'pause_audio' }));
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
            if (event.key.toLowerCase() === 'b' && !isBellPlaying) {
                handleCircleClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
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
        const newSocket = new WebSocket('ws://127.0.0.1:8000/api/v1/multiplayer/ws');
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
            setConnecting("searching")
            newSocket.send(JSON.stringify({ action: 'join_waiting_room', playerId: Data?.data?.uuid }));
        };

        newSocket.onmessage = (event) => {
            console.log("Server says: " + event.data);
            const data = JSON.parse(event.data);
            if (data.event === 'start_game') {
                setWaitingRoomStatus('paired');
                setPairedStudent(data.opponent_name);
                setRiddleQuestion(data.random_number);
                playRiddle(data.random_number);
            } else if (data.action === 'pause_audio') {
                if (currentAudio) {
                    currentAudio.pause();
                    setIsAudioPaused(true);
                }
            } else if (data.action === 'resume_audio') {
                setIsAudioPaused(false);
                playRiddle(1);
            }
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setWaitingRoomStatus("Disconnected from waiting room")
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    const disconnectFromQuiz = () => {
        if (socket) {
            socket.send(JSON.stringify({ action: 'disconnect_quiz' }));
            socket.close();
            setSocket(null);
            setWaitingRoomStatus('idle');
            setPairedStudent(null);
        }
    };

    const playAudio = (riddleNumber: any, lineNumber: any) => {
        const audioPath = `/Sounds/multiplayer_riddles/riddle_${riddleNumber}/line_${lineNumber}.wav`;
        const audio = new Audio(audioPath);
        audio.play();

        return audio;
    };


    // const playAudio = (riddleNumber: any, lineNumber: any) => {
    //     const audioPath = `/Sounds/multiplayer_riddles/riddle_${riddleNumber}/line_${lineNumber}.wav`;
    //     const audio = new Audio(audioPath);
    //     audio.play();

    //     // Return a promise that resolves when the audio finishes playing
    //     return new Promise((resolve) => {
    //         audio.onended = resolve;
    //     });
    // };

    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [currentLine, setCurrentLine] = useState(1);

    const playRiddle = async (riddleNumber: any) => {
        const riddleLines = riddles[`riddle_${riddleNumber}`];
        if (!riddleLines) return;

        for (let lineNumber = currentLine; lineNumber <= Object.keys(riddleLines).length; lineNumber++) {
            if (isAudioPaused) {
                setCurrentLine(lineNumber);
                break;
            }
            setRiddleQuestion(riddleLines[`line_${lineNumber}`]);
            const audio = playAudio(riddleNumber, lineNumber);
            setCurrentAudio(audio);
            await new Promise((resolve) => {
                audio.onended = resolve;
            });
        }
    };

    // const playRiddle = async (riddleNumber: any) => {
    //     const riddleLines = riddles[`riddle_${riddleNumber}`];
    //     if (!riddleLines) return;

    //     for (let lineNumber = 1; lineNumber <= Object.keys(riddleLines).length; lineNumber++) {
    //         setRiddleQuestion(riddleLines[`line_${lineNumber}`]);
    //         await playAudio(riddleNumber, lineNumber);
    //     }
    // };

    const handleCalculateSimilarity = async () => {
        try {
            setCheckingAnswer(true);
            const response = await axios.post(`${API_BASE}/language_services/calculate-similarity`, {
                question_answer: 'Aluminium chloride',
                student_answer: transcribedText,
            });
            const similarityScore = response.data.similarity;
            console.log(`Similarity Score: ${similarityScore}`);
            setSimilarityScore(similarityScore);
            if (similarityScore > 0.6) {
                console.log('right')
            } else {
                console.log('wrong');
                setIsAudioPaused(false);
                // Notify other client to resume audio
                socket?.send(JSON.stringify({ action: 'resume_audio' }));
                playRiddle(1);
            }
        } catch (error) {
            console.error('Error calculating similarity:', error);
        } finally {
            setCheckingAnswer(false);
            setIsReadyToCalculate(false);
        }
    };


    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <p className="mt-[100px]">Compete against friends in fast paced quizzes</p>
                <div>
                    <button onClick={joinWaitingRoom}>Join Waiting Room</button>
                    {connecting && (<div>{connecting}</div>)}
                    {/* {waitingRoomStatus === 'idle' && (
                    )} */}
                    {waitingRoomStatus === 'searching' && <p>Searching for an opponent...</p>}
                    {waitingRoomStatus === 'paired' && (
                        <>
                            <p>You have been paired with {pairedStudent}</p>
                            {riddleQuestion && (
                                <div>
                                    <h2>Riddle Question:</h2>
                                    <p>{riddleQuestion}</p>
                                </div>
                            )}
                        </>
                    )}
                    <button onClick={disconnectFromQuiz}>Disconnect</button>
                </div>
                <div
                    className={`w-10 h-10 rounded-full ${isCircleGreen ? 'bg-green-500' : 'bg-gray-500'}`}
                    onClick={handleCircleClick}
                />
                <div>
                    <h2 className="font-semibold">Transcribed Answer:</h2>
                    <p className="font-semibold text-[#475569]">{transcribedText}</p>
                </div>
                <button
                    onClick={handleCalculateSimilarity}
                    disabled={!isReadyToCalculate}
                    className="bg-green-400 dar px-6 py-1 rounded-lg"
                >
                    <p className="font-semibold text-white"> {checkingAnswer ? <CgSpinner size={25} className="animate-spin text-white" /> : "Submit Answer"} </p>
                </button>
            </div>
        </div>
    );
}