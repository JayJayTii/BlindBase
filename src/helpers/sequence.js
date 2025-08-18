
function StringToSequence(str) {

}

//Just a turn sequence, not an algorithm because that implies a goal
export class Sequence { 
    turns = []

    constructor() {
        this.turns = []
    }

    collapse() {
        if (this.turns.length < 2) {
            return
        }

        //Run through and collapse turns until we cannot collapse any more
        let collapsed = true
        while (collapsed) { 
            collapsed = false
            for (var i = this.turns.length - 1; i > 0; i--) {
                if ((this.turns[i - 1][0] === "U" && this.turns[i][0] === "D")
                    || (this.turns[i - 1][0] === "R" && this.turns[i][0] === "L")
                    || (this.turns[i - 1][0] === "F" && this.turns[i][0] === "B")) {
                    //Bubble sort opposite faces to allow for collapsing 
                    //e.g. F B F' => B F F' => B
                    const temp = this.turns[i - 1]
                    this.turns[i - 1] = this.turns[i]
                    this.turns[i] = temp
                }

                //Collapse same face in a row
                //e.g. D D2 => D'
                if (this.turns[i][0] === this.turns[i - 1][0]) { //Same face as previous
                    this.turns[i - 1][1] = (this.turns[i][1] + this.turns[i - 1][1]) % 4
                    this.turns.splice(i, 1)
                    collapsed = true
                }
            }

            //Remove any turns with magnitude of 0 (from previous collapsing steps)
            //e.g.  => 
            let index = 0
            while (index < this.turns.length) {
                if (this.turns[index][1] === 0) {
                    this.turns.splice(index, 1)
                    collapsed = true
                }
                index++
            }
        }
    }

    add(turn) {
        this.turns.push(turn)
        this.collapse()
    }

    toString() {
        this.collapse()
        let out = ""
        for (var i = 0; i < this.turns.length; i++) {
            out += this.turns[i][0]
            if (this.turns[i][1] === 2)
                out += "2"
            else if (this.turns[i][1] === 3)
                out += "'"

            if (i < this.turns.length - 1)
                out += " "
        }
        return out
    }
}