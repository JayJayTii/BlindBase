export function formatTime(ms) {
    const centiseconds = Math.round(ms / 10) //All times only go to 2 decimal places

    const hours = (Math.floor(centiseconds / 100 / 60 / 60))
    const minutes = (Math.floor(centiseconds / 100 / 60) % 60)
    const seconds = (Math.floor(centiseconds / 100) % 60)
    const hundredths = (centiseconds % 100)

    let timeStr = ""
    if (hours > 0) //Don't add hours if there are none
        timeStr += hours.toString() + ":" + (minutes < 10 ? "0" : "")
    if (minutes > 0) //Don't add minutes if there are none
        timeStr += minutes.toString() + ":" + (seconds < 10 ? "0" : "")
    timeStr += seconds.toString() + "." //Always have seconds and hundredths
    timeStr += (hundredths < 10 ? "0" : "") + hundredths.toString()

    return timeStr
}

export function getSolveTimeString(solve) {
    const solveTime = formatTime(solve.solveTime + ((solve.status === 2) ? 2000 : 0)) //Account for +2
    const modifier = solve.status === 1 ? " (DNF)" : solve.status === 2 ? "+" : ""
    //For no penalty: 25.32
    //For DNF: 25.32 (DNF)
    //For +2: 27.32+
    return solveTime + modifier
}
export function getSolveRatioString(solve) {
    //Ratio of memo to exec does not take any penalties into account
    //E.g: (12.11 memo : 13.21 exec)
    return (solve.memoTime === 0 || !solve.hasOwnProperty('memoTime')) ? "" :
        (formatTime(solve.memoTime) + " memo : " + formatTime(solve.solveTime - solve.memoTime) + " exec")
}