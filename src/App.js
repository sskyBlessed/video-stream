import React, { useEffect, useRef, useState } from 'react';

const VideoRecorder = () => {
  const videoLiveRef = useRef(null);
  const videoRecordedRef = useRef(null);
  const buttonStartRef = useRef(null);
  const buttonStopRef = useRef(null);
  const buttonSendRef = useRef(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);

  useEffect(() => {
    const videoLive = videoLiveRef.current;
    const videoRecorded = videoRecordedRef.current;
    const buttonStart = buttonStartRef.current;
    const buttonStop = buttonStopRef.current;
    const buttonSend = buttonSendRef.current;

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

      let blobs = [];

      buttonStart.addEventListener('click', () => {
        mediaRecorder.start();
        buttonStart.setAttribute('disabled', '');
        buttonStop.removeAttribute('disabled');
        buttonSend.setAttribute('disabled', ''); // Отключаем кнопку отправки во время записи
        blobs = []; // Очищаем массив blobs при начале новой записи
        setRecordedBlobs([]);
      });

      buttonStop.addEventListener('click', () => {
        mediaRecorder.stop();
        buttonStart.removeAttribute('disabled');
        buttonStop.setAttribute('disabled', '');
        buttonSend.removeAttribute('disabled'); // Включаем кнопку отправки после остановки записи
      });

      mediaRecorder.addEventListener('dataavailable', (event) => {
        blobs.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const videoBlob = new Blob(blobs, { type: 'video/webm' });
        setRecordedBlobs([videoBlob]); // Сохраняем blob в состоянии
        videoRecorded.src = URL.createObjectURL(videoBlob);
      });
    };

    startRecording();

    return () => {
      const stream = videoLive.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoLive.srcObject = null;
      }
    };
  }, []);

  // ОТПРАВКА НА СЕРВЕР
  const handleSendVideo = async () => {
    if (recordedBlobs.length === 0) {
      console.error('Нет записанного видео для отправки');
      return;
    }
debugger
    const formData = new FormData();
    formData.append('video', recordedBlobs[0], 'recorded_video.webm');

    try {
      const response = await fetch('https://your-backend-server.com/upload', { 
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Видео успешно отправлено!');
        // Дополнительные действия после успешной отправки
      } else {
        console.error('Ошибка при отправке видео:', response.status);
        // Обработка ошибок отправки
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      // Обработка ошибок сети или других непредвиденных ошибок
    }
  };

  return (
    <>
      <div>
        <button type="button" id="buttonStart" ref={buttonStartRef}>
          Start
        </button>
        <button type="button" id="buttonStop" disabled ref={buttonStopRef}>
          Stop
        </button>
        <button
          type="button"
          id="buttonSend"
          ref={buttonSendRef}
          onClick={handleSendVideo}
        >
          Send
        </button>
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