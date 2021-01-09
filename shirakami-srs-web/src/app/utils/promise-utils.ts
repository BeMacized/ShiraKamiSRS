export const minPromiseDuration = <T>(
    promise: Promise<T>,
    milliseconds: number
): Promise<T> => {
    return Promise.all([
        promise,
        new Promise((res, rej) => setTimeout(() => res(), milliseconds)),
    ]).then((res) => res[0]);
};
