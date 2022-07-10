const debounceFuncMap = new Map();

function randomIntInRange(low, high) {
    return Math.floor((Math.random() * (high-low)) + low);
}

function debounce(func, delay, argsCopyFn) {
    function debouncedFn() {
        const selfArgs = argsCopyFn(...arguments);
        if (debounceFuncMap.has(func)) {
            clearInterval(debounceFuncMap.get(func));
        }
        debounceFuncMap.set(func, setTimeout(() => func(...selfArgs), delay));
    }

    return debouncedFn;
}

export default { randomIntInRange, debounce };
