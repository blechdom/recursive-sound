import React, {useCallback, useEffect, useState} from "react";
import Select from "react-select";
import io, {Socket} from "socket.io-client";
import styled from "styled-components";

let socket: Socket;

const PerformOSC: React.FC = () => {

  useEffect(() => {
    socketInitializer().then(() => console.log('socket initialized'));
  }, []);

  /*useEffect(() => {
    socket?.emit("volume", volume);
  }, [volume]);

  useEffect(() => {
    //sendMandelbrot(matrixData)
  }, [matrixData]);*/


  const socketInitializer = async () => {
    await fetch("/recursive-sound/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
    });
  };

  /*const sendMandelbrot = useCallback((performMatrix: number[][]) => {
    performMatrix.forEach((row: number[], index: number) => {
      setTimeout(function () {
        socket?.emit("fractalMandelbrotRow", row);
      }, msBetweenRows * index);
    });
  }, [msBetweenRows]);*/

  return (
    <>
      <StyledHead>OSC: Coming Soon</StyledHead>
      <ul>
        <li>Download OSC Server to your local machine (with link and instructions)</li>
        <li>Form with IP address + Port input, and ability to assign parameters</li>
      </ul>
    </>
  );
}

const StyledHead = styled.h2`
  margin: 1.5rem 0 0 0;
`;

export default PerformOSC;