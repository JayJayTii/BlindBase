

//Used for calculating how long the user sequence inputboxes should be
export function GetLongestStringLength(arr) {
    return Math.max(...arr.map((str) => str.length));
}

export function GeneratePairSequence(possiblePairs, length) {
    var newSequence = ''
    for (var key = 0; key < length; key++) {
        const nextKey =
            possiblePairs[Math.floor(Math.random() * possiblePairs.length)]
        newSequence += nextKey + ' '
    }
    newSequence = newSequence.trim()    
    return newSequence
}

//Takes one string, not an array of sequences
export function FormatPairSequence(sequence) { 
    //https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
    const scrubbed = sequence.split(' ').join('').toUpperCase()
    if (scrubbed.match(/.{1,2}/g)) { //Group into pairs of letters
        const formatted = scrubbed.match(/.{1,2}/g).join(' ')
        return formatted
    }
    //If it can't be grouped (i.e. if there is only 1 pair), just use scrubbed
    return scrubbed
}

export function getCorrect(testSequences, userSequences) {
    var correctCubes = 0
    for (var i = 0; i < userSequences.length; i++) {
        const user = userSequences[i].split(' ').join('').toLowerCase()
        const test = testSequences[i].split(' ').join('').toLowerCase()
        if (user === test) {
            correctCubes += 1
        }
    }
    return correctCubes
}

export function getScore(testSequences, userSequences) {
    return 2 * getCorrect(testSequences, userSequences) - testSequences.length
}