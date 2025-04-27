import { RefObject, useEffect, useState} from "react";

export const debounce = (func: any, delay: number) => {
    let timeoutId: any;

    return (...args: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    }
}

export const deepMerge = (target: any, source: any) => {

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && typeof target[key] === 'object') {
                target[key] = deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    return target;
}

// use ResizeObserver, upon resize the given element size is updated
export const useResize = (element: RefObject<HTMLElement | null>) => {

    const [size, setSize] = useState({innerWidth: 0, innerHeight: 0});

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries && entries.length > 0) {
                const entry = entries[0];
                setSize({innerWidth: entry.contentRect.width, innerHeight: entry.contentRect.height});

                console.log(entry.contentRect.width, entry.contentRect.height);
            }
        });

        if (!element.current) return;

        console.log(element.current.className);

        // else
        resizeObserver.observe(element.current);

        return () => {
            resizeObserver.disconnect();
        }
    }, [element.current]);

    return size;
}