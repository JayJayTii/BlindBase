export function formatTime(ms) {
    const centiseconds = Math.round(ms / 10)

    const hours = (Math.floor(centiseconds / 100 / 60 / 60))
    const minutes = (Math.floor(centiseconds / 100 / 60) % 60)
    const seconds = (Math.floor(centiseconds / 100) % 60)
    const hundredths = (centiseconds % 100)

    let timeStr = ""
    if (hours > 0)
        timeStr += hours.toString() + ":" + (minutes < 10 ? "0" : "")
    if (minutes > 0)
        timeStr += minutes.toString() + ":" + (seconds < 10 ? "0" : "")
    timeStr += seconds.toString() + "."
    timeStr += (hundredths < 10 ? "0" : "") + hundredths.toString()

    return timeStr
}