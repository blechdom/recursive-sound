import {DataContainer, ScrollDiv, Scroller, StyledProcessButton} from "@/pages/dataTuner";
import dynamic from "next/dynamic";
import React, {useState} from "react";

const Button = dynamic(() => import("el-vis-audio").then((mod) => mod.Button), {ssr: false});
const Modal = dynamic(() => import("el-vis-audio").then((mod) => mod.Modal), {ssr: false});

type DataModalProps = {
  title: string;
  matrixData: number[] | number[][];
}

const DataModal: React.FC<DataModalProps> = ({title, matrixData}) => {

  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  return (
    <>
      <StyledProcessButton onClick={() => setShowDataModal(true)}>{title}</StyledProcessButton>
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
        </DataContainer>
      </Modal>
    </>);
}

export default DataModal;