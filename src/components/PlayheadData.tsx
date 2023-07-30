import {ButtonText, ControlButton} from "@/components/FractalPlayer";
import {DataContainer, ScrollDiv, Scroller} from "@/pages/dataTuner";
import dynamic from "next/dynamic";
import React, {useState} from "react";

const Button = dynamic(() => import("el-vis-audio").then((mod) => mod.Button), {ssr: false});
const Modal = dynamic(() => import("el-vis-audio").then((mod) => mod.Modal), {ssr: false});

type PlayheadDataProps = {
  title: string;
  matrixData: number[] | number[][];
  color?: string;
}

const PlayheadData: React.FC<PlayheadDataProps> = ({title, matrixData, color}) => {

  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  return (
    <>
      <ControlButton onClick={() => setShowDataModal(true)} selected={showDataModal} color={color ?? '#0066FF'}>
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
        <DataContainer>
          <Scroller height={320}>
            <ScrollDiv>
              {Array.isArray(matrixData[0]) ?
                JSON.stringify((matrixData as number[][]).map(row => row.map(elem => Number(elem.toFixed(2))))) :
                JSON.stringify((matrixData as number[]).map(elem => Number(elem.toFixed(2))))
              }
            </ScrollDiv>
          </Scroller>
          width={matrixData.length} height={Array.isArray(matrixData[0]) && (matrixData[0] as number[]).length}
        </DataContainer>
      </Modal>
    </>);
}

export default PlayheadData;