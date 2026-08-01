import { scheme } from '@/stores/SettingsStore'
import { SchemeToSpeffzIndex } from '@/helpers/lettering_scheme.js'

//Connects a corner sticker to all stickers on the piece that it is on (in clockwise direction)
export function adjacentCornerStickers(letter) {
    const speffzIndex = SchemeToSpeffzIndex(letter, false)
    return [
        [0, 4, 17], [1, 16, 13], [2, 12, 9], [3, 8, 5],
        [4, 17, 0], [5, 3, 8], [6, 11, 20], [7, 23, 18],
        [8, 5, 3], [9, 2, 12], [10, 15, 21], [11, 20, 6],
        [12, 9, 2], [13, 1, 16], [14, 19, 22], [15, 21, 10],
        [16, 13, 1], [17, 0, 4], [18, 7, 23], [19, 22, 14],
        [20, 6, 11], [21, 10, 15], [22, 14, 19], [23, 18, 7]][speffzIndex].map(adjSpeffzIndex => scheme()[adjSpeffzIndex])
}
export const adjacentCornerIndices = [
    [0, 4, 17],
    [1, 16, 13],
    [2, 12, 9],
    [3, 8, 5],
    [4, 17, 0],
    [5, 3, 8],
    [6, 11, 20],
    [7, 23, 18],
    [8, 5, 3],
    [9, 2, 12],
    [10, 15, 21],
    [11, 20, 6],
    [12, 9, 2],
    [13, 1, 16],
    [14, 19, 22],
    [15, 21, 10],
    [16, 13, 1],
    [17, 0, 4],
    [18, 7, 23],
    [19, 22, 14],
    [20, 6, 11],
    [21, 10, 15],
    [22, 14, 19],
    [23, 18, 7],
]

//Connects an edge sticker to all stickers on the piece that it is on
export function adjacentEdgeStickers(letter) {
    const speffzIndex = SchemeToSpeffzIndex(letter, true)
    return [
        [0, 16], [1, 12], [2, 8], [3, 4],
        [4, 3], [5, 11], [6, 23], [7, 17],
        [8, 2], [9, 15], [10, 20], [11, 5],
        [12, 1], [13, 19], [14, 21], [15, 9],
        [16, 0], [17, 7], [18, 22], [19, 13],
        [20, 10], [21, 14], [22, 18], [23, 6],][speffzIndex].map(adjSpeffzIndex => scheme()[24 + adjSpeffzIndex])
}
export const adjacentEdgeIndices = [
    [0, 16],
    [1, 12],
    [2, 8],
    [3, 4],
    [4, 3],
    [5, 11],
    [6, 23],
    [7, 17],
    [8, 2],
    [9, 15],
    [10, 20],
    [11, 5],
    [12, 1],
    [13, 19],
    [14, 21],
    [15, 9],
    [16, 0],
    [17, 7],
    [18, 22],
    [19, 13],
    [20, 10],
    [21, 14],
    [22, 18],
    [23, 6],
]