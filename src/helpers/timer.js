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
        else
            timeSum += (solves[i].solveTime - solves[i].memoTime)

        if (solves[i].status == 1)
            dnfs++
    }
    const mean = timeSum / solves.length
    const dnf = (section == 1 && dnfs > 0)
    return [mean, dnf]
}
export function calculateBestMon(solves, n) {
    //console.time("calculating mo" + n.toString())
    let best = [-1, -1, -1]
    for (var start = 0; start < solves.length - n + 1; start++) {
        for (var section = 1; section < 4; section++) {
            let timeSum = 0
            let dnfs = 0
            for (var j = 0; j < n; j++) {
                if (section == 1)
                    timeSum += (solves[start + j].solveTime + (solves[start + j].status == 2 ? 2000 : 0))
                else if (section == 2)
                    timeSum += solves[start + j].memoTime
                else
                    timeSum += (solves[start + j].solveTime - solves[start + j].memoTime)

                if (solves[start + j].status == 1)
                    dnfs++
            }
            const mean = timeSum / n
            const dnf = (section == 1 && dnfs > 0)
            if (dnf || mean == -1)
                continue
            if (mean < best[section - 1] || best[section - 1] == -1)
                best[section - 1] = mean
        }
    }
    //console.timeEnd("calculating mo" + n.toString())
    return best
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
        else
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

export function calculateBestAon(solves, n) {
    console.time("calculating ao" + n.toString())
    let best = [-1, -1, -1]
    for (var first = 0; first < solves.length - n + 1; first++) {
        for (var section = 1; section < 4; section++) {
            const dnfs = []
            let timeSum = 0
            let minTime = 999999999
            let maxTime = 0
            for (var j = 0; j < n; j++) {
                if (solves[first + j].status == 1)
                    dnfs.push(solves[first + j].solveTime)

                let solveTime = -1
                if (section == 1)
                    solveTime = solves[first + j].solveTime + (solves[first + j].status == 2 ? 2000 : 0)
                else if (section == 2)
                    solveTime = solves[first + j].memoTime
                else //section == 3
                    solveTime = solves[first + j].solveTime - solves[first + j].memoTime

                if (solveTime < minTime)
                    minTime = solveTime
                else if (solveTime > maxTime)
                    maxTime = solveTime

                timeSum += solveTime
            }
            if (section == 1 && dnfs.length == 1)
                maxTime = dnfs[0]

            const avg = (timeSum - maxTime - minTime) / (n - 2)
            const dnf = (section == 1 && dnfs.length > 1)

            if (dnf || avg == -1)
                continue
            if (avg < best[section - 1] || best[section - 1] == -1)
                best[section - 1] = avg
        }
    }
    console.timeEnd("calculating ao" + n.toString())
    return best
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