export function getSumOfTimes(solves, section) {
    const plus2count = solves.reduce((count, solve) => count + (solve.status == 2 ? 1 : 0), 0)
    let sumTime = 0
    switch (section) {
        case 1: //Memo AND exec
            sumTime = solves.reduce((sum, solve) => sum + solve.solveTime, 0)
            sumTime += 2000 * plus2count
            break
        case 2: //Memo
            sumTime = solves.reduce((sum, solve) => sum + solve.memoTime, 0)
            break
        case 3: //Exec
            sumTime = solves.reduce((sum, solve) => sum + (solve.solveTime - solve.memoTime), 0)
            break
    }
    return sumTime
}

export function getSolveTimes(solves, section){
    switch (section) {
        case 1: //Memo AND exec
            return solves.map(solve => solve.solveTime + (solve.status == 2 ? 2000 : 0))
        case 2: //Memo
            return solves.map(solve => solve.memoTime)
        case 3: //Exec
            return solves.map(solve => solve.solveTime - solve.memoTime)
    }
}

export function calculateMean(solves, section) {
    let timeSum = 0
    let dnfs = 0
    for (var i = 0; i < solves.length; i++) {
        if (section == 1)
            timeSum += (solves[i].solveTime + (solves[i].status == 2 ? 2000 : 0))
        else if (section == 2)
            timeSum += solves[i].memoTime
        else (section == 3)
        timeSum += (solves[i].solveTime - solves[i].memoTime)

        if (solves[i].status == 1)
            dnfs++
    }
    const mean = timeSum / solves.length
    const dnf = (section == 1 && dnfs > 0)
    return [mean, dnf]
}

export function calculateAvg(solves, section) {
    const dnfIndices = []
    const solveTimes = new Array(solves.length)
    let timeSum = 0
    let minTime = 999999999
    let maxTime = 0
    for (var i = 0; i < solves.length; i++) {
        if (solves[i].status == 1)
            dnfIndices.push(i)

        if (section == 1)
            solveTimes[i] = solves[i].solveTime + (solves[i].status == 2 ? 2000 : 0)
        else if (section == 2)
            solveTimes[i] = solves[i].memoTime
        else (section == 3)
            solveTimes[i] = solves[i].solveTime - solves[i].memoTime

        if (solveTimes[i] < minTime)
            minTime = solveTimes[i]
        else if (solveTimes[i] > maxTime)
            maxTime = solveTimes[i]

        timeSum += solveTimes[i]
    }

    if (section == 1 && dnfIndices.length == 1)
        timeSum -= solves[dnfIndices[0]].solveTime
    else
        timeSum -= maxTime
    timeSum -= minTime
    const avg = timeSum / (solves.length - 2)
    const dnf = (section == 1 && dnfIndices.length > 1)
    return [avg, dnf]
}

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