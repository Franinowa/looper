export function getFrequencyByKey(key) {
    return 440 * Math.pow(Math.pow(2, 1/12), key - 58);
}