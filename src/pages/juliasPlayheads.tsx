import React, {useEffect} from "react";
import Router from 'next/router'

export default function JuliasPlayheads() {
  useEffect(() => {
    const {pathname} = Router
    if (pathname == '/') {
      Router.push('/fractalPlayheads')
    }
  });
}

