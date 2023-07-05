import React, { useState, useRef,useEffect } from 'react';
import styled from 'styled-components';
import Clarifai from 'clarifai';
import axios from 'axios';
import Compress from 'compress.js';
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";
import './button.css';
import { AiFillRightCircle } from 'react-icons/ai';
import { toHaveTextContent } from '@testing-library/jest-dom/dist/matchers';
const app = new Clarifai.App({
  apiKey: '0d1678228b2740cc985509c91e4d34eab'
});

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px 40px;
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
   const [{ token, playlists ,selectedPlaylist,selectedPlaylistId}, dispatch] = useStateProvider();
   const changeCurrentPlaylist = (selectedPlaylistId) => {
     dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId });
   };

   useEffect(() => {
    const getInitialPlaylist = async () => {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const selectedPlaylist = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description.startsWith("<a")
          ? ""
          : response.data.description,
        image: response.data.images[0].url,
        tracks: response.data.tracks.items.map(({ track }) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist) => artist.name),
          image: track.album.images[2].url,
          duration: track.duration_ms,
          album: track.album.name,
          context_uri: track.album.uri,
          track_number: track.track_number,
        })),
      };
      dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist,selectedPlaylistId });
    };
    getInitialPlaylist();
  }, [token, dispatch, selectedPlaylistId]);
   /**playlist change part end */

   /**selecting a random song on that particular playlist start*/

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
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
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
      dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    } else {
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    }
  };
   /**selecting a random song on that particular playlist end **/
   
   /**api call to detect mood start */

   const [mood, setMood] = useState('');
   const [isModelLoaded, setIsModelLoaded] = useState(false);
   const videoRef = useRef(null);
   const canvasRef = useRef(null);

  const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  //setting a random song on that playlist
  useEffect(() => {
    if (selectedPlaylistId && selectedPlaylist) {
      const playlists = selectedPlaylist.tracks.map(({ id, name, artists, image, duration, album, context_uri, track_number }) => ({
        id,
        name,
        artists,
        image,
        duration,
        album,
        context_uri,
        track_number,
      }));

      const randomIndex = Math.floor(Math.random() * playlists.length);
      const randomPlaylist = playlists[randomIndex];

      playTrack(
        randomPlaylist.id,
        randomPlaylist.name,
        randomPlaylist.artists,
        randomPlaylist.image,
        randomPlaylist.context_uri,
        randomPlaylist.track_number
      );
    }
  }, [selectedPlaylist]);

  const handleStop = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;

    /**changing the the selected playlist*/
       if(mood=='neutral')
       changeCurrentPlaylist('1u12mEkv7ejxpJVBizkh6Z');
       else if(mood=='happiness')
       changeCurrentPlaylist('5keMlwzTu5tjyO63G9F652');
       else if(mood=='sadness-contempt')
       changeCurrentPlaylist('4s1UiVao3r0o1tytaVxyCG');
       else if(mood=='anger')
       changeCurrentPlaylist('0AWfavfHcYpfV9dxEQEznr');
       else if(mood=='fear')
       changeCurrentPlaylist('0TVl34VKyfwDRP5Vz5i5RR');
       else if(mood=='surprise')
       changeCurrentPlaylist('5h40yaRd3e1ILdPuYrVXKd');
       else if(mood=='disgust')
       changeCurrentPlaylist('4bfu7xsAzHWh16Lolw3DRC');
       
    setMood('');
  };


  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Compress image data
    const compress = new Compress();
    console.log(canvas.toDataURL('image/png'));
    const blob = await fetch(canvas.toDataURL()).then((res) => res.blob());
    const resizedImage = await compress.compress([blob], {
      size: 8,
      quality: 1.00,
      maxWidth: 600,
      maxHeight: 400,
      resize: true,
    });
    const base64Image = resizedImage[0].data;
    console.log(base64Image.length);
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
      <button class="button-85" role="button" onClick={handleStart}>Start Camera</button>
      <button class="button-85" role="button" onClick={handleStop}>Stop Camera</button>
      <button class="button-85" role="button" onClick={handleCapture}>Detect Mood</button>
      <Video ref={videoRef} width={600} height={400} autoPlay />
      <Canvas ref={canvasRef} width={600} height={400}/>
      {mood && <h2>Detected Mood: {mood}</h2>}
    </Container>
  );
};

export default MoodDetection;
