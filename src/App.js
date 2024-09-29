import React, { useEffect, useRef } from 'react';

const VideoRecorder = () => {
  const videoLiveRef = useRef(null);
  const videoRecordedRef = useRef(null);
  const buttonStartRef = useRef(null);
  const buttonStopRef = useRef(null);

  useEffect(() => {
    const videoLive = videoLiveRef.current;
    const videoRecorded = videoRecordedRef.current;
    const buttonStart = buttonStartRef.current;
    const buttonStop = buttonStopRef.current;

    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoLive.srcObject = stream;

      if (!MediaRecorder.isTypeSupported('video/webm')) {
        console.warn('video/webm is not supported');
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      buttonStart.addEventListener('click', () => {
        mediaRecorder.start();
        buttonStart.setAttribute('disabled', '');
        buttonStop.removeAttribute('disabled');
      });

      buttonStop.addEventListener('click', () => {
        mediaRecorder.stop(); 
        buttonStart.removeAttribute('disabled');
        buttonStop.setAttribute('disabled', '');
      });

      mediaRecorder.addEventListener('dataavailable', (event) => {
        videoRecorded.src = URL.createObjectURL(event.data); 
      });
    };

    startRecording();

    // Очистка ресурсов при размонтировании компонента
    return () => {
      const stream = videoLive.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoLive.srcObject = null;
      }
    };
  }, []); 

  return (
    <>
      <div>
        <button type="button" id="buttonStart" ref={buttonStartRef}>Start</button>
        <button type="button" id="buttonStop" disabled ref={buttonStopRef}>Stop</button>
      </div>
      <div>
        <video autoPlay muted playsInline id="videoLive" ref={videoLiveRef}></video>
      </div>
      <div>
        <video controls playsInline id="videoRecorded" ref={videoRecordedRef}></video>
      </div>
    </>
  );
};

export default VideoRecorder;