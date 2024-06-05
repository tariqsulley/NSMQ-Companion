"use client"
import Sidebar from "@/app/components/Sidebar"
import { useState } from 'react';
import { useAuth } from "@/app/context/AuthContext";

export default function MultiplayerPage() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [waitingRoomStatus, setWaitingRoomStatus] = useState('idle');
    const [pairedStudent, setPairedStudent] = useState<string | null>(null);
    const [connecting, setConnecting] = useState("")
    const { Data } = useAuth()

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
                        </>
                    )}
                    <button onClick={disconnectFromQuiz}>Disconnect</button>
                </div>
            </div>
        </div>
    );
}