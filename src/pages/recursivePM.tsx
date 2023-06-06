import RecursivePMAudio from "@/components/RecursivePMAudio";
import React from "react";
import Image from 'next/image';

export default function RecursivePM() {

  return (
    <>
      <h1>Recursive Phase Modulation</h1>
      <RecursivePMAudio/>
      <br/>
      <br/>
      <img src="/images/recursivePM.png" alt="Recursive Phase Modulation Algorithm Flowchart" width="100%"/>
    </>
  );
}