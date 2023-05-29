import React from "react";
import styled from "styled-components";
import { MdHomeFilled, MdSearch } from "react-icons/md";
import { IoLibrary } from "react-icons/io5";
import Playlists from "./Playlists";
export default function Sidebar() {
  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img
            src="data:image/png;base64,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"
            alt="spotify"
          />
        </div>
        <ul>
          <li>
            <MdHomeFilled />
            <span>Home</span>
          </li>
          <li>
            <MdSearch />
            <span>Search</span>
          </li>
          <li>
            <IoLibrary />
            <span>Your Library</span>
          </li>
        </ul>
      </div>
      <Playlists />
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
      text-align: center;
      margin: 1rem 0;
      img {
        max-inline-size: 80%;
        block-size: auto;
      }
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: white;
        }
      }
    }
  }
`;