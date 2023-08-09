import FractalPlayer from '@/components/FractalPlayer';
import styled from "styled-components";
import {useState} from "react";

export default function FractalPlayheads() {
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);
  return (
    <Page>
      <FractalPlayer fractal={"mandelbrot"} setCx={setCx} setCy={setCy}/>
      <FractalPlayer fractal={"julia"} cx={cx} cy={cy} setCx={setCx} setCy={setCy}/>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-family: "Roboto", sans-serif;
  font-size: 0.5rem;
`;
