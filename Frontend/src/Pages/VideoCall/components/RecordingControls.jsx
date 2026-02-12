import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import './RecordingControls.css';

const RecordingControls = ({ roomId }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const timerIntervalRef = useRef(null);

    const startRecording = async () => {
        try {
            // Request screen capture
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' },
                audio: true
            });

            // Combine with audio from microphone if available
            let audioStream;
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                console.log('No audio track available');
            }

            // Combine streams
            const tracks = [
                ...displayStream.getVideoTracks(),
                ...(audioStream ? audioStream.getAudioTracks() : [])
            ];

            const combinedStream = new MediaStream(tracks);

            // Create media recorder
            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                saveRecording();
                // Stop all tracks
                combinedStream.getTracks().forEach(track => track.stop());
            };

            //Handle user stop sharing
            displayStream.getVideoTracks()[0].onended = () => {
                stopRecording();
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            toast.success('Recording started!');
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Could not start recording. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerIntervalRef.current);
            toast.info('Recording stopped. Preparing download...');
        }
    };

    const saveRecording = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `session-recording-${roomId}-${new Date().toISOString().split('T')[0]}.webm`;
        document.body.appendChild(a);
        a.click();

        // Save metadata to localStorage
        const metadata = {
            roomId,
            date: new Date().toISOString(),
            duration: recordingTime,
            filename: a.download
        };

        const existingRecordings = JSON.parse(localStorage.getItem('session-recordings') || '[]');
        existingRecordings.push(metadata);
        localStorage.setItem('session-recordings', JSON.stringify(existingRecordings));

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Recording saved and download started!');
        }, 100);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="recording-controls">
            {!isRecording ? (
                <button className="record-btn start-recording" onClick={startRecording} title="Start Recording">
                    <span className="record-icon">⏺</span> Record
                </button>
            ) : (
                <div className="recording-active">
                    <button className="record-btn stop-recording" onClick={stopRecording} title="Stop Recording">
                        <span className="stop-icon">⏹</span> Stop
                    </button>
                    <div className="recording-indicator">
                        <span className="recording-dot"></span>
                        <span className="recording-time">{formatTime(recordingTime)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecordingControls;
