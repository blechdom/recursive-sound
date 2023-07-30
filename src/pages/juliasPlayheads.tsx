import PlayheadFractal from '@/components/PlayheadFractal';
import styled from "styled-components";
import {useState} from "react";

export default function JuliasPlayheads() {
  const [cx, setCx] = useState<number>(-0.7);
  const [cy, setCy] = useState<number>(0.27015);
  return (
    <Page>
      <PlayheadFractal fractal={"mandelbrot"} setCx={setCx} setCy={setCy}/>
      <FlexColumn>
        <PlayheadFractal fractal={"julia"} cx={cx} cy={cy}/>
        <Label>cx
          <ComplexInput
            type="number"
            value={cx}
            min={-2.0}
            max={2.0}
            onChange={(value) => setCx && setCx(value.target.valueAsNumber)}
          /></Label>
        <Label>cy
          <ComplexInput
            type="number"
            value={cy}
            min={-2.0}
            max={2.0}
            onChange={(value) => setCy && setCy(value.target.valueAsNumber)}
          />
        </Label>
      </FlexColumn>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: row;
  font-family: "Roboto", sans-serif;
  font-size: 0.5rem;
`;

export const Label = styled.label`
  display: flex;
  flex-direction: row;
  font-size: .85rem;
  padding: .5rem;
  height: 100%;
  align-items: center;
`;

export const Input = styled.input`
  min-height: 30px;
  padding: 0.5rem;
  margin-left: .5rem;
  font-size: 0.85rem;
  transition: all 100ms;
  background-color: hsl(0, 0%, 100%);
  border-color: hsl(0, 0%, 80%);
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  box-sizing: border-box;

  &:focus {
    border: 2px solid dodgerblue;
    transition: border-color 0.3s ease-in-out;
    outline: 0;
  }
`;

const ComplexInput = styled(Input)`
  width: 200px;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;