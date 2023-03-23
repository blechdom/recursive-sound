import React, { FC, useMemo, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import styled, { css } from "styled-components";
import { useDrag } from "@use-gesture/react";

export interface SphereProps {
  diameter?: string;
  perspective?: string;
  backgroundColor?: string;
  fillColor?: string;
}


export const Sphere: FC<SphereProps> = ({
  diameter = "30px",
  perspective = "10px",
  backgroundColor = "#000",
  fillColor = "#666666",
}: SphereProps) => {
  return (
    <Ball
      fillColor={fillColor}
      backgroundColor={backgroundColor}
      diameter={diameter}
      perspective={perspective}
    />
  );
};

const Ball = styled.figure<Partial<SphereProps>>`
  caret-color: transparent;
  display: block;
  background: ${(props) => props.fillColor};
  margin: 0;
  border-radius: 50%;
  height: ${(props) => props.diameter};
  width: ${(props) => props.diameter};
  background: radial-gradient(
    circle at ${(props) => props.perspective} ${(props) => props.perspective},
    ${(props) => props.fillColor},
    ${(props) => props.backgroundColor}
  );
`;

interface XYSpringProps {
  width?: number;
  height?: number;
  offset?: number;
  currentX?: (x: number) => void;
  currentY?: (y: number) => void;
}

const XY: FC<XYSpringProps> = ({
  width = 286,
  height = 286,
  offset = 30,
  currentX,
  currentY,
}) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [clientX, setClientX] = useState<number>(0);
  const [clientY, setClientY] = useState<number>(0);

  const outlineRef = useRef<HTMLDivElement>(null);

  const adjustedX = useMemo(() => {
    if(outlineRef.current) {
      const {offsetLeft} = outlineRef?.current;
      const minX = (offset / 2) + offsetLeft;
      const maxX = width + offsetLeft - (offset / 2);
      const x = Math.floor(Math.min(Math.max(mouseX, minX), maxX) - minX);
      currentX && currentX(x);
      return x;
    }
  }, [mouseX, offset, width]);

  const adjustedY = useMemo(() => {
    if(outlineRef.current) {
      const {offsetTop} = outlineRef.current;
      const minY = (offset / 2) + offsetTop;
      const maxY = height + offsetTop - (offset / 2);
      const y = Math.floor(Math.min(Math.max(mouseY, minY), maxY) - minY);
      currentY && currentY(y);
      return y;
    }
  }, [mouseY, offset, height]);

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const bind = useDrag(
    ({ down, offset: [ox, oy], xy: [x, y] }) => {
      setMouseX(x);
      setMouseY(y);
      api.start({ x: ox, y: oy, immediate: down });
    },
    {
      bounds: {
        left: 0,
        right: width - offset,
        top: 0,
        bottom: height - offset,
      },
    }
  );

  return (
    <>
      <Outline width={width} height={height} ref={outlineRef}>
        <animated.div {...bind()} style={{ x, y }}>
          <Sphere />
        </animated.div>
      </Outline>
      [ x: {adjustedX}, y: {adjustedY} ]
    </>
  );
};

const Outline = styled.div<Partial<XYSpringProps>>`
  touch-action: none;
  width: ${(props) => props.width + "px"};
  height: ${(props) => props.height + "px"};
  border: 1px solid #000;
`;

export default XY;