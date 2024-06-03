
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
        if (socket) {
            // Send a request to join the waiting room
            socket.emit('joinWaitingRoom', Data?.uuid);
            setWaitingRoomStatus('searching');
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('connect', () => {
                console.log('Connected to server');
            });

            socket.on('waitingRoomJoined', () => {
                console.log('Joined the waiting room');
                setWaitingRoomStatus('searching');
            });

            socket.on('pairedWithStudent', (studentName) => {
                console.log(`Paired with ${studentName}`);
                setPairedStudent(studentName);
                setWaitingRoomStatus('paired');
            });
        }
    }, [socket]);

    useEffect((): any => {
        // Connect to the Socket.IO server
        const newSocket = io('http://localhost:8000/ws'); // Update the URL to include '/ws'
        setSocket(newSocket);
        socketRef.current = newSocket;

        // Clean up the socket connection on component unmount
        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (socket) {
            // Listen for events from the server
            socket.on('connect', () => {
                console.log('Connected to server');
            });

            socket.on('message', (data) => {
                console.log('Received message:', data);
            });
        }
    }, [socket]);

    const sendMessage = () => {
        if (socket) {
            // Send a message to the server
            socket.emit('message', 'Hello, server!');
        }
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