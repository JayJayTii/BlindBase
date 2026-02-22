//Used to get the length of the longest memo sequence for the Multi-Blind mode
//This will define the maximum length of the memo input boxes
export function GetLongestStringLength(arr) {
    return Math.max(...arr.map((str) => str.length));
}

//https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
export function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

//Creates a memo sequence of a certain length given the pairs it is allowed to use.
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

//A pair sequence should be a string of capitalised letters split into pairs with spaces.
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

//Counts if a user-entered memo sequence is identical to the sequence they were tested with
export function getCorrect(testSequences, userSequences) {
    var correctCubes = 0
    for (var i = 0; i < userSequences.length; i++) {
        //Normalise the formats of each sequence before comparing
        const user = userSequences[i].split(' ').join('').toLowerCase()
        const test = testSequences[i].split(' ').join('').toLowerCase()
        if (user === test) {
            correctCubes += 1
        }
    }
    return correctCubes
}

//Score is only used for the Multi-Blind mode.
//It is calculated by correct sequences - incorrect sequences, but it works out to this:
export function getScore(testSequences, userSequences) {
    return 2 * getCorrect(testSequences, userSequences) - testSequences.length
}