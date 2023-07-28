import PlayheadFractal from '@/components/PlayheadFractal';
import styled from "styled-components";
import {useState} from "react";

export default function FractalPlayheads() {
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);
  return (
    <Page>
      <PlayheadFractal fractal={"mandelbrot"} setCx={setCx} setCy={setCy}/>
      <PlayheadFractal fractal={"julia"} cx={cx} cy={cy}/>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: row;
  font-family: "Roboto", sans-serif;
  font-size: 0.5rem;
`;