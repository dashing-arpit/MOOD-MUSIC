import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  margin: 20px;
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 5px;
  border: none;
  background-color: #1db954;
  color: white;
  cursor: pointer;
`;

const Image = styled.img`
  margin-top: 20px;
  max-width: 300px;
`;

const Mood = styled.h2`
  margin-top: 20px;
`;

const Video = styled.video`
  display: none;
`;

const Canvas = styled.canvas`
  display: none;
`;

const MoodDetection = () => {
  const [mood, setMood] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const handleStop = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;
  };

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    console.log(2);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    const base64Image = dataURL.split(',')[1];
    console.log(2);
    // Make API request to detect mood
    try {
      const response = await fetch('/face-api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: 'JEp21XF-GJ5HDrYY7uuFtztlwEsX_5Dx',
          api_secret: '0wq6TI71m6CFzbZd0BkkgAMxFewia5qW',
          image_base64: base64Image,
          return_attributes: 'emotion',
        }),
      });
      console.log(response);

      // Parse response JSON
      const responseData = await response.json();
      
      // Check if mood detected
      if (responseData.faces.length > 0) {
        const emotions = responseData.faces[0].attributes.emotion;
        const detectedMood = Object.keys(emotions).reduce((a, b) => (emotions[a] > emotions[b] ? a : b));
        setMood(detectedMood);
      } else {
        setMood('Mood not detected');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <Container>
      <Button onClick={handleStart}>Start Camera</Button>
      <Button onClick={handleStop}>Stop Camera</Button>
      <br />
      <br />
      <Video ref={videoRef} width={400} height={300} autoPlay />
      <br />
      <br />
      <Button onClick={handleCapture}>Detect Mood</Button>
      <br />
      <br />
      <Canvas ref={canvasRef} width={400} height={300} />
      <br />
      <br />
      {mood && <Mood>Detected Mood: {mood}</Mood>}
    </Container>
  );
};

export default MoodDetection;
