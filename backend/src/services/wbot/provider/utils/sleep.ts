const timeout = (ms: number) => { return new Promise(resolve => setTimeout(resolve, ms)) }
export const sleep = async (time: number) => { await timeout(time) }