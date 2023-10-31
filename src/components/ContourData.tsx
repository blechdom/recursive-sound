import {ButtonText, ControlButton} from "@/components/FractalPlayer";
import {DataContainer} from "@/pages/dataTuner";
import dynamic from "next/dynamic";
import React, {useEffect, useRef, useState} from "react";
import ContourCanvas from "@/components/ContourCanvas";

const Button = dynamic(() => import("el-vis-audio").then((mod) => mod.Button), {ssr: false});
const Modal = dynamic(() => import("el-vis-audio").then((mod) => mod.Modal), {ssr: false});

type ContourDataProps = {
  title: string;
  matrixData: number[] | number[][];
  color?: string;
}

const ContourData: React.FC<ContourDataProps> = ({title, matrixData, color}) => {

  const [showDataModal, setShowDataModal] = useState<boolean>(false);
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
        <h3><a id="download_link">download link</a></h3><br/>
        <DataContainer>
          <ContourCanvas matrixData={matrixData}/>
        </DataContainer>
      </Modal>
    </>);
}

export default ContourData;