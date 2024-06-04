"use client"
import Sidebar from "@/app/components/Sidebar"
import { useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from "@/app/context/AuthContext";
import API_BASE from "@/app/utils/api";

export default function MultiplayerPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [waitingRoomStatus, setWaitingRoomStatus] = useState<'idle' | 'searching' | 'paired'>('idle');
    const [pairedStudent, setPairedStudent] = useState<string | null>(null);
    const { Data } = useAuth()

    const joinWaitingRoom = () => {
        const newSocket = io('ws://127.0.0.1:8000/api/v1/users/multiplayer/ws', {
            extraHeaders: {
                'player-id': Data?.user?.uuid
            }
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setWaitingRoomStatus('searching');
            newSocket.emit('join_waiting_room');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        newSocket.on('start_game', (data) => {
            setWaitingRoomStatus('paired');
            setPairedStudent('Opponent');
        });
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