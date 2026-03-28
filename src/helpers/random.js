//Using this for seeded random number generation
export class Random {
    static seed = 0
    
    //https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    static mulberry32(a) {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    static setSeed(newSeed) {
        this.seed = newSeed
    }

    // Generate a random integer between 0 and 1
    static random() {
        return this.mulberry32(this.seed++)
    }
    
}