import {useEffect, useLayoutEffect, useRef} from "react";

export default function useInterval(callback: () => void, delay: number | null) {
  const savedCallback: any = useRef();

  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay && delay !== 0) {
      return
    }

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)

  }, [delay]);
}