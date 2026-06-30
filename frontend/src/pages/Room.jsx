// frontend/src/pages/Room.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import etherxLogo from '../assets/etherx_transparent.png';
import { fadeIn } from '../utils/animationVariants';
import { ROUTES } from '../utils/constants';
import apiClient from '../utils/apiClient';
import '../styles/room.css';

function getMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';
}

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [isEnding, setIsEnding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingRec, setUploadingRec] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordStartRef = useRef(null);

  const isHost = sessionStorage.getItem('etherx_host_room') === code;

  useEffect(() => {
    document.title = `Meeting · ${code}`;
  }, [code]);

  const uploadRecording = useCallback(async () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    chunksRef.current = [];
    const durationMin = recordStartRef.current
      ? Math.max(1, Math.round((Date.now() - recordStartRef.current) / 60000))
      : 1;
    const form = new FormData();
    form.append('file', blob, `${code}-${Date.now()}.webm`);
    form.append('roomCode', code);
    form.append('duration', String(durationMin));
    setUploadingRec(true);
    try {
      await apiClient.post('/api/recordings/upload', form);
    } catch {
      // upload failed silently — recording stays in memory for now
    } finally {
      setUploadingRec(false);
    }
  }, [code]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      const mimeType = getMimeType();
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = uploadRecording;
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setIsRecording(true);

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      });
    } catch {
      // user cancelled or permission denied
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleEndMeeting = async () => {
    if (isRecording) handleStopRecording();
    setIsEnding(true);
    sessionStorage.removeItem('etherx_host_room');
    sessionStorage.removeItem('etherx_meet_start');
    setIsEnding(false);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="etherx-room-wrap">
      {/* Logo overlay */}
      <motion.div
        className="etherx-room-logo"
        role="img"
        aria-label="EtherX Meet logo"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <img src={etherxLogo} alt="EtherX Meet" />
      </motion.div>

      {/* Host controls — top right */}
      {isHost && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, display: 'flex', gap: 8 }}>
          {/* Record button */}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={uploadingRec}
            style={{
              background: isRecording
                ? 'rgba(234,67,53,0.15)'
                : 'rgba(212,175,55,0.12)',
              border: isRecording
                ? '1px solid rgba(234,67,53,0.5)'
                : '1px solid rgba(212,175,55,0.35)',
              color: isRecording ? '#f87171' : '#d4af37',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: uploadingRec ? 'wait' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '-0.01em',
              transition: 'all 0.15s',
              opacity: uploadingRec ? 0.6 : 1,
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isRecording ? '#f87171' : '#d4af37',
              animation: isRecording ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }} />
            {uploadingRec ? 'Uploading…' : isRecording ? 'Stop Rec' : 'Record'}
          </button>

          {/* End Meeting button */}
          <button
            onClick={handleEndMeeting}
            disabled={isEnding}
            style={{
              background: isEnding ? 'rgba(234,67,53,0.7)' : '#ea4335',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: isEnding ? 'wait' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 16px rgba(234,67,53,0.45)',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
            }}
          >
            {isEnding ? 'Ending…' : 'End Meeting'}
          </button>
        </div>
      )}



      {/* Jitsi meeting iframe */}
      <iframe
        src={`https://8x8.vc/vpaas-magic-cookie-a390c03ef55e457ebeb88a41bdb4af08/${code}`}
        style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
