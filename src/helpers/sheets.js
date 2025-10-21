import { useSheetStore } from '@/stores/SheetStore.js'
import { useSettingsStore } from '@/stores/SettingsStore.js'

function splitCSVline(str) {
    //Split at a comma, but ignore if inside double quotes
    let result = []
    let temp = ""
    let inQuotes = false
    for (var i = 0; i < str.length; i++) {
        if (str[i] === '\"') {
            inQuotes = !inQuotes
        } else if (str[i] === ',' && !inQuotes) {
            result.push(temp.replace('\"', ''))
            temp = ""
        }
        else {
            temp += str[i]
        }
    }
    return result
}

export async function CreateSheetFromFile(file) {
    const content = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = e => resolve(e.target.result)
        reader.onerror = reject
    })
    
    //Need to do checking for validity
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Invalid file type, we only support .csv files. Please "Save as" / "Download" your spreadsheet as a .csv file from your spreadsheet editor.')
        return
    }

    let csvGrid = content.split('\n').filter(line => line.length > 0) //Filter random 0-length end lines
    for (var i = 0; i < csvGrid.length; i++) {
        csvGrid[i] = splitCSVline(csvGrid[i])
    }

    let xHeadingsStart = null
    for (var i = 0; i < csvGrid.length; i++) {
        for (var j = 0; j < csvGrid[0].length - 1; j++) { //Start of xHeadings must have at least one cell to the right
            if (csvGrid[i][j] === 'A') {
                if (csvGrid[i][j + 1] === 'B') {
                    xHeadingsStart = { x: j, y: i }
                    break
                }
            }
        }
        if (xHeadingsStart != null)
            break
    }
    if (xHeadingsStart == null) {
        alert("File formatted incorrectly. The file must contain a horizontal row of letters in alphabetical order, starting with A.")
        return
    }
    if (csvGrid[xHeadingsStart.y + 1][xHeadingsStart.x - 1] !== 'A') {
        alert("File formatted incorrectly. The file must have a vertical column of letters in alphabetical order next to the column headings, starting with A.")
        return
    }
    const yHeadingsStart = { x: xHeadingsStart.x - 1, y: xHeadingsStart.y + 1 } 
    //console.log("found xheadings at " + JSON.stringify(xHeadingsStart))
    //console.log("found yheadings at " + JSON.stringify(yHeadingsStart))
    csvGrid = csvGrid.slice(xHeadingsStart.y).map(line => line.slice(yHeadingsStart.x))
    //Now xHeadingsStart is always 1,0
    //And yHeadingsStart is always 0,1
    let yHeadingsLength = 0
    let largestHeadingIndex = -1
    //Increments as long as the alphabet is followed, can skip letters
    while (true) {
        const curYHeading = yHeadingsLength + 1
        if (curYHeading >= csvGrid.length || csvGrid[curYHeading][0].length != 1)
            break
        const newHeadingIndex = csvGrid[curYHeading][0].charCodeAt(0) - 'A'.charCodeAt(0)
        if (newHeadingIndex <= largestHeadingIndex || newHeadingIndex > 23)
            break
        yHeadingsLength++
        largestHeadingIndex = newHeadingIndex
    }

    //console.log("yHeadings length: " + yHeadingsLength)
    csvGrid = csvGrid.slice(0, yHeadingsLength + 1)

    let xHeadingsLength = 0
    largestHeadingIndex = -1
    while (true) {
        const curXHeading = xHeadingsLength + 1
        if (curXHeading >= csvGrid[0].length || csvGrid[0][curXHeading].length != 1)
            break
        const newHeadingIndex = csvGrid[0][curXHeading].charCodeAt(0) - 'A'.charCodeAt(0)
        if (newHeadingIndex <= largestHeadingIndex || newHeadingIndex > 23)
            break
        xHeadingsLength++
        largestHeadingIndex = newHeadingIndex
    }
    //console.log("xHeadings length: " + xHeadingsLength)

    const yHeadings = csvGrid.map(line => line[0]).slice(1, 1 + yHeadingsLength).join('')
    //console.log("yHeadings: " + yHeadings)
    const xHeadings = csvGrid[0].slice(1, 1 + xHeadingsLength).join('')
    //console.log("xHeadings: " + xHeadings)

    csvGrid = csvGrid.map(line => line.slice(1, xHeadingsLength + 1)) //Cut off yHeadings
    csvGrid = csvGrid.slice(1) //Cut off xHeadings

    let sheetGrid = Array.from({ length: 24 }, () =>
        Array.from({ length: 24 }, () => ""),
    )
    const flipped = useSettingsStore().settings.sheets_pairorder === 1
    for (var i = 0; i < yHeadingsLength; i++) {
        for (var j = 0; j < xHeadingsLength; j++) {
            const y = yHeadings[i].charCodeAt(0) - 'A'.charCodeAt(0)
            const x = xHeadings[j].charCodeAt(0) - 'A'.charCodeAt(0)
            sheetGrid[flipped ? y : x][flipped ? x : y] = csvGrid[i][j]
        }
    }

    let name = file.name.slice(0, file.name.lastIndexOf('.')) //Remove file extension
    if (name.length > 20)
        name = name.substr(0,20)
    useSheetStore().sheets.push({
        name: name,
        id: useSheetStore().getNewSheetID(),
        type: 0,
        xHeadings: "ABCDEFGHIJKLMNOPQRSTUVWX",
        yHeadings: "ABCDEFGHIJKLMNOPQRSTUVWX",
        grid: sheetGrid,
    })
    useSheetStore().saveState()
    return useSheetStore().sheets.length - 1
}

export function isEmpty(sheet) {
    var empty = true
    for (var x = 0; x < 24; x++) {
        for (var y = 0; y < 24; y++) {
            if (sheet.grid[y][x] !== '') {
                empty = false
                break
            }
        }
        if (!empty) break
    }
    return empty
}

export function getXHeadings(sheet) {
    //Headings stay the same no matter the pair order
    return sheet.xHeadings.split('')
}
export function getYHeadings(sheet) {
    return sheet.yHeadings.split('')
}