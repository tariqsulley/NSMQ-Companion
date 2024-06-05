"use client"
import Sidebar from "@/app/components/Sidebar"
import { useState } from 'react';
import { useAuth } from "@/app/context/AuthContext";

export default function MultiplayerPage() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [waitingRoomStatus, setWaitingRoomStatus] = useState<'idle' | 'searching' | 'paired'>('idle');
    const [pairedStudent, setPairedStudent] = useState<string | null>(null);
    const { Data } = useAuth()

    const joinWaitingRoom = () => {
        const newSocket = new WebSocket('ws://127.0.0.1:8000/api/v1/multiplayer/ws');
        setSocket(newSocket);

        newSocket.onopen = () => {
            newSocket.send("Hello, WebSocket Server!");
            console.log('Connected to WebSocket server');
            setWaitingRoomStatus('searching');
            newSocket.send(JSON.stringify({ action: 'join_waiting_room', playerId: Data?.data?.uuid }));
        };

        newSocket.onmessage = (event) => {
            console.log("Server says: " + event.data);
            const data = JSON.parse(event.data);
            if (data.action === 'start_game') {
                setWaitingRoomStatus('paired');
                setPairedStudent('Opponent'); // Update this part according to the data received.
            }
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <p className="mt-[100px]">Compete against friends in fast paced quizzes</p>
                <div>
                    {waitingRoomStatus === 'idle' && (
                        <button onClick={joinWaitingRoom}>Join Waiting Room</button>
                    )}
                    {waitingRoomStatus === 'searching' && <p>Searching for an opponent...</p>}
                    {waitingRoomStatus === 'paired' && (
                        <p>You have been paired with {pairedStudent}</p>
                    )}
                </div>
            </div>
        </div>
    );
}