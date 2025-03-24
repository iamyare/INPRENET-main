async function measureAsyncExecutionTime<T>(func: () => Promise<T>): Promise<{ data: T; time: number }> {
    const start = performance.now();
    const data = await func();
    const end = performance.now();
    return { data, time: end - start };
}

export { measureAsyncExecutionTime }
