import {ButtonText, ControlButton} from "@/components/FractalPlayer";
import {DataContainer} from "@/pages/dataTuner";
import dynamic from "next/dynamic";
import React, {useEffect, useRef, useState} from "react";
import ContourCanvas from "@/components/ContourCanvas";

const Button = dynamic(() => import("el-vis-audio").then((mod) => mod.Button), {ssr: false});
const Modal = dynamic(() => import("el-vis-audio").then((mod) => mod.Modal), {ssr: false});
const Knob = dynamic(() => import("el-vis-audio").then((mod) => mod.KnobParamLabel),
  {ssr: false}
)

type ContourDataProps = {
  title: string;
  matrixData: number[] | number[][];
  cx: number;
  cy: number;
  color?: string;
}

const ContourData: React.FC<ContourDataProps> = ({title, matrixData, cx, cy, color}) => {

  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(0);

  useEffect(() => {
    if (!showDataModal) setTolerance(0);
    return () => {
      setTolerance(0);
    }
  }, [showDataModal]);
  
  return (
    <>
      <ControlButton onClick={() => setShowDataModal(true)} selected={showDataModal} width={"16rem"} height={"2rem"}
                     color={color ?? '#0066FF'}>
        <ButtonText>{title}</ButtonText>
      </ControlButton>
      <Modal
        active={showDataModal}
        hideModal={() => setShowDataModal(false)}
        title={title}
        footer={
          <Button
            onClick={() => setShowDataModal(false)}
            label="Close"
          />
        }
      >
        <h2>
          cx: {cx}<br/>
          cy: {cy}<br/>
          size: {matrixData.length}<br/><br/>
          <Knob
            id={`tolerance`}
            label={"tolerance"}
            diameter={30}
            labelWidth={30}
            fontSize={11}
            tooltip={"tolerance of contour smoothing"}
            knobValue={tolerance}
            step={0.01}
            min={0}
            max={1}
            onKnobInput={setTolerance}
          /><br/><br/>
          <a id="download_link">download link</a>
        </h2>
        <DataContainer>
          <ContourCanvas matrixData={matrixData} tolerance={tolerance} cx={cx} cy={cy}/>
        </DataContainer>
      </Modal>
    </>);
}

export default ContourData;