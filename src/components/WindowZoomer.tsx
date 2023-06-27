import React from "react";
import styled from "styled-components";
import {FractalPlane} from "@/utils/fractal";

type WindowZoomerProps = {
  name: string;
  window: FractalPlane;
  defaultWindow: FractalPlane;
  setWindow: (window: FractalPlane) => void;
}

const WindowZoomer: React.FC<WindowZoomerProps> = ({name, window, defaultWindow, setWindow}) => {

  const zoom = (action: string) => () => {
    if (action === 'reset') {
      window = defaultWindow;
    } else if (action === 'ul') {
      window.x_max = window.x_max * 0.75;
      window.y_max = window.y_max * 0.75;
    } else if (action === 'l') {
      window.x_max = window.x_max * 0.75;
      window.y_max = window.y_max * 0.885;
      window.y_min = window.y_min * 0.885;
    } else if (action === 'r') {
      window.x_min = window.x_min * 0.75;
      window.y_max = window.y_max * 0.885;
      window.y_min = window.y_min * 0.885;
    } else if (action === 'ur') {
      window.x_min = window.x_min * 0.75;
      window.y_max = window.y_max * 0.75;
    } else if (action === 'll') {
      window.x_max = window.x_max * 0.75;
      window.y_min = window.y_min * 0.75;
    } else if (action === 'lr') {
      window.x_min = window.x_min * 0.75;
      window.y_min = window.y_min * 0.75;
    } else if (action === 'up') {
      window.y_max = window.y_max * 0.75;
      window.x_max = window.x_max * 0.885;
      window.x_min = window.x_min * 0.885;
    } else if (action === 'd') {
      window.y_min = window.y_min * 0.75;
      window.x_max = window.x_max * 0.885;
      window.x_min = window.x_min * 0.885;
    } else if (action === 'in') {
      window.x_min = window.x_min * 0.92;
      window.y_min = window.y_min * 0.92;
      window.x_max = window.x_max * 0.92;
      window.y_max = window.y_max * 0.92;
    }
    setWindow({...window});
  }
  return (
    <ButtonColumn>
      <ButtonRow>
        <StyledLabel>Zoom {name}</StyledLabel>
        <StyledButton onClick={zoom('reset')}>RESET</StyledButton>
      </ButtonRow>
      <ButtonRow>
        <StyledButton onClick={zoom('ul')}>Upper-Left</StyledButton>
        <StyledButton onClick={zoom('up')}>Up</StyledButton>
        <StyledButton onClick={zoom('ur')}>Upper-Right</StyledButton>
      </ButtonRow>
      <ButtonRow>
        <StyledButton onClick={zoom('l')}>Left</StyledButton>
        <StyledButton onClick={zoom('in')}>In</StyledButton>
        <StyledButton onClick={zoom('r')}>Right</StyledButton>
      </ButtonRow>
      <ButtonRow>
        <StyledButton onClick={zoom('ll')}>Lower-Left</StyledButton>
        <StyledButton onClick={zoom('d')}>Down</StyledButton>
        <StyledButton onClick={zoom('lr')}>Lower-Right</StyledButton>
      </ButtonRow>
    </ButtonColumn>
  );
};

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ButtonColumn = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledButton = styled.button`
  font-size: 0.7rem;
  width: 80px;
  min-height: 22px;
`;

const StyledLabel = styled.label`
  font-size: 1rem;
  width: 160px;
  min-height: 22px;
`;

export default WindowZoomer;