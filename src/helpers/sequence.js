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

    reverse() {
        const oldTurns = this.turns
        this.turns = []
        for (var i = oldTurns.length - 1; i >= 0; i--) {
            const oldTurn = oldTurns[i]
            this.turns.push([oldTurn[0], 4 - oldTurn[1]])
        }
    }

    //Each move is 0->17
    setKociembaMoves(arr) {
        const faces = ['U','R','F','D','L','B']
        const turns = ["","2",'\'']
        this.turns = arr.map((move) => {
            return [faces[Math.floor(move / 3)], move % 3 + 1]
        })
    }
    setAlgorithmNotation(str) {
        const turnArr = str.split(/[ \n]/)
        this.turns = []
        for (var i = 0; i < turnArr.length; i++) {
            let turn = turnArr[i]
            if (turn == '')
                continue
            if (turn.includes('w')) { //All "Lw" turned into "l" e.g
                turn = turn[0].toLowerCase() + turn.substring(2)
            }
            let turnType = 0
            if (turn.length === 1)
                turnType = 1
            else if (turn[1] === '2')
                turnType = 2
            else if (turn[1] === '\'')
                turnType = 3

            this.turns.push([turn[0], turnType])
        }
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