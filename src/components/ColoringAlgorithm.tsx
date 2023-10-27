import {ControlRow, ButtonText} from "@/components/FractalPlayer";
import {ControlButton} from "@/components/FractalPlayer";
import React from "react";
import styled from "styled-components";

type TransportProps = {
  coloringAlgorithm: string;
  color: string;
  colorScheme: string;
  height?: string;
  setColoringAlgorithm: (coloringAlgorithm: string) => void;
  setColorScheme: (colorScheme: string) => void;
}

const ColoringAlgorithm: React.FC<TransportProps> = ({
                                                       coloringAlgorithm,
                                                       color,
                                                       colorScheme,
                                                       height = '4rem',
                                                       setColoringAlgorithm,
                                                       setColorScheme
                                                     }) => {
  return (
    <>
      <ControlRow>
        <ColorControlButton onClick={() => setColorScheme(colorScheme === 'color' ? 'grayscale' : 'color')}
                            bottom={true} height={height} backgroundColor={'#000'} color={'#fff'}>
          <ButtonText>{colorScheme}</ButtonText>
        </ColorControlButton>
        <ControlButton onClick={() => setColoringAlgorithm('modulo')} selected={coloringAlgorithm === 'modulo'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>modulo</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setColoringAlgorithm('outline')} selected={coloringAlgorithm === 'outline'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>outline</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setColoringAlgorithm('outlines')} selected={coloringAlgorithm === 'outlines'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>outlines</ButtonText>
        </ControlButton>
      </ControlRow>
      <ControlRow>
        <ControlButton onClick={() => setColoringAlgorithm('raw')} selected={coloringAlgorithm === 'raw'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>raw</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setColoringAlgorithm('difference')} selected={coloringAlgorithm === 'difference'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>difference</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setColoringAlgorithm('decomp1')} selected={coloringAlgorithm === 'decomp1'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>decomp 1</ButtonText>
        </ControlButton>
        <ControlButton onClick={() => setColoringAlgorithm('decomp2')} selected={coloringAlgorithm === 'decomp2'}
                       color={color}
                       bottom={true} height={height}>
          <ButtonText>decomp 2</ButtonText>
        </ControlButton>
      </ControlRow>
    </>
  );
};
export const ColorControlButton = styled.div<{
  onClick: () => void;
  selected?: boolean;
  bottom?: boolean;
  width?: string;
  height?: string;
  backgroundColor?: string;
  color?: string;
}>`
  background-color: ${props => props.backgroundColor ? props.backgroundColor : '#EEE'};
  color: ${props => props.color ? props.color : '#FF0000'};
  outline: 1px solid #000;
  font-size: 1.5rem;
  width: ${props => props.width ?? '4rem'};
  height: ${props => props.height ?? '4rem'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${prop => prop.bottom && `border-top: none`};

  :not(:last-child) {
    border-right: none;
  }

  :after {
    content: "";
    clear: both;
    display: table;
  }

  :hover {
    background-color: ${props => props.color ? props.color : '#FF0000'};
    color: ${props => props.backgroundColor ? props.backgroundColor : '#EEE'};
  }
`;


export default ColoringAlgorithm;