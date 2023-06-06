import RecursiveFMAudio from "@/components/RecursiveFMAudio";
import React from "react";

export default function RecursiveFM() {

  return (
    <>
      <h1>Recursive Frequency Modulation</h1>
      <RecursiveFMAudio/>
      <br/>
      <br/>
      <img src="/recursive-sound/images/recursiveFM.png" alt="Recursive Frequency Modulation Algorithm Flowchart"
           width="100%"/>
    </>
  );
}