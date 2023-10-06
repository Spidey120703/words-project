export const debounce = (func: Function, ms: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            return func.apply(this, args);
        }, ms);
    };
}

export const throttle = (func: Function, ms: number) => {
    let last: number = new Date().getTime();
    return (...args: any) => {
        let now: number = new Date().getTime();
        if (now - last >= ms) {
            last = now;
            return func.apply(this, args);
        }
    }
}