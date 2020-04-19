import { useEffect, useRef } from "react";

function usePrevious<T = unknown>(value: T) {
    const ref = useRef<T>();
    const prevValue = ref.current;

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return prevValue;
}

export {
    usePrevious,
}