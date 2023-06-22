import React from 'react';
import styled from "styled-components";
import "./button.css"
export default function Login() {
    const handleClick = async () => {
      const client_id = "8010c2b0298d46729fcc4f1a2c577fe7";
      const redirect_uri = "http://moody-music.netlify.app/";
      const api_uri = "http://accounts.spotify.com/authorize";
      const scope = [
      "user-read-private",
      "user-read-email",
      "user-modify-playback-state",
      "user-read-playback-state",
      "user-read-currently-playing",
      "user-read-recently-played",
      "user-top-read",
      ];
      window.location.href = `${api_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope.join(
        " "
      )}&response_type=token&show_dialog=true`;
    };
    return (
      <Container>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQehlC-KLBZSPimVhrJN99S9MckKTkRNJXTXA&usqp=CAU"
          alt="spotify"
        />
        <button class="button-85" role="button" onClick={handleClick} >Connect Mood-Music</button>
      </Container>
    );
  }
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color:black ;
  gap: 5rem;
  img {
    height: 30vh;
  }
  button {
    padding: 1rem 1rem;
    border-radius: 40rem;
    background-color: black;
    bordor-color: white;
    color: white;
    border: none;
    font-size: 1.7rem;
    cursor: pointer;
  }`;