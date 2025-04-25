export const debounce = (func: any, delay: number) => {
    let timeoutId: any;

    return (...args: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    }
}