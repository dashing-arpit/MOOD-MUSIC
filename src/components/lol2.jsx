import React, { useState, useRef,useEffect } from 'react';
import styled from 'styled-components';
import Clarifai from 'clarifai';
import axios from 'axios';
import Compress from 'compress.js';
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";

const app = new Clarifai.App({
  apiKey: '0d1678228b2740cc985509c91e4d34eab'
});

const Container = styled.div`
  display: flex;
  flex-direction: row;
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
  
   /**playlist change part start */
   const [{ token, playlists }, dispatch] = useStateProvider();

   const changeCurrentPlaylist = (selectedPlaylistId) => {
     dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId });
   };
 
   const [{ selectedPlaylist, selectedPlaylistId }, dispatchPlayer] = useStateProvider();
 
   const playTrack = async (
     id,
     name,
     artists,
     image,
     context_uri,
     track_number
   ) => {
     const response = await axios.put(
       `https://api.spotify.com/v1/me/player/play`,
       {
         context_uri,
         offset: {
           position: track_number - 1,
         },
         position_ms: 0,
       },
       {
         headers: {
           'Content-Type': 'application/json',
           Authorization: 'Bearer ' + token,
         },
       }
     );
     if (response.status === 204) {
       const currentPlaying = {
         id,
         name,
         artists,
         image,
       };
       dispatchPlayer({ type: reducerCases.SET_PLAYING, currentPlaying });
       dispatchPlayer({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
     } else {
       dispatchPlayer({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
     }
   };
 
   const [mood, setMood] = useState('');
   const [isModelLoaded, setIsModelLoaded] = useState(false);
   const videoRef = useRef(null);
   const canvasRef = useRef(null);
 
   const handleStart = async () => {
     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
     videoRef.current.srcObject = stream;
   };
 
   const handleStop = async () => {
     const stream = videoRef.current.srcObject;
     if (stream) {
       const tracks = stream.getTracks();
       tracks.forEach(track => track.stop());
     }
     videoRef.current.srcObject = null;
 
     // Changing the selected playlist
     changeCurrentPlaylist('41NHbQRs0HPjFwBAp7XEOW');
 
     // Choosing a random song on that playlist
     const playlist = playlists[0];
      const randomIndex = Math.floor(Math.random() * playlist.length);
      const randomPlaylist = playlists[randomIndex];
      console.log(playlist);
      console.log(randomPlaylist);
      playTrack(
      randomPlaylist.id,
      randomPlaylist.name,
      randomPlaylist.artists,
      randomPlaylist.image,
      randomPlaylist.context_uri,
      randomPlaylist.track_number
      )
    setMood('');
  };

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Compress image data
    const base64Image = canvas.toDataURL('image/png');
    // Make API request to detect mood
    try {
      const response = await axios.post(`https://api.clarifai.com/v2/models/face-sentiment-recognition/versions/a5d7776f0c064a41b48c3ce039049f65/outputs`, {
        "user_app_id": {
          "user_id": "clarifai",
          "app_id": "main"
        },  
        inputs: [
          {
            data: {
              image: {
                base64: base64Image
              }
            }
          }
        ]
      }, {
        headers: {
          Authorization: 'Key ' + 'c58b98e1b7c2460da43f334a63575119',
        },
      });

      // Parse response JSON
      const emotions = response.data.outputs[0].data.concepts[0].name;
      console.log(emotions);
      setMood(emotions);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  /**api call to detect mood end */
  return (
    <Container>
      <Button onClick={handleStart}>Start Camera</Button>
      <Button onClick={handleStop}>Stop Camera</Button>
      <Video ref={videoRef} width={400} height={300} autoPlay />
      <Button onClick={handleCapture}>Detect Mood</Button>
      <Canvas ref={canvasRef} width={40} height={30}/>
      {mood && <h2>Detected Mood: {mood}</h2>}
    </Container>
  );
};

export default MoodDetection;