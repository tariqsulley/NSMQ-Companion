
"use client"
import Sidebar from "@/app/components/Sidebar"

import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from "@/app/context/AuthContext";

export default function MultiplayerPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [waitingRoomStatus, setWaitingRoomStatus] = useState<'idle' | 'searching' | 'paired'>('idle');
    const [pairedStudent, setPairedStudent] = useState<string | null>(null);
    const { Data } = useAuth()
    const joinWaitingRoom = () => {

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