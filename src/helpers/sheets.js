
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