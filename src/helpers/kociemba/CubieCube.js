import {cornerCubieMove, edgeCubieMove} from '@/helpers/kociemba/CubieMove'

//Cubie cube because it works at the cubie level
export class CubieCube {
    //Corner order:  (each is stored as a tuple of cubie and orientation)
    // URF <=  UFL  <=  ULB  <=  UBR  <=  DFR  <= DLF  <=  DBL  <=  DRB
    corners = [[0, 0], [1, 0], [2, 0], [3, 0],
               [4, 0], [5, 0], [6, 0], [7, 0]];

    //Edge order:
    // UR  <=  UF  <=  UL  <=  UB  <=  DR  <=  DF  <=  DL  <=  DB  <=  FR  <=  FL  <=  BL  <=  BR
    edges = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0],  [5, 0],
             [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0]]

    Turn(move) {
        this.Multiply({ corners: cornerCubieMove[move], edges: edgeCubieMove[move] })
    }
    TurnCorners(move) {
        this.MultiplyCorners(cornerCubieMove[move])
    }
    TurnEdges(move) {
        this.MultiplyEdges(edgeCubieMove[move])
    }

    Multiply(other) {
        //(A*B)(x).c=A(B(x).c).c
        //(A*B)(x).o=A(B(x).c).o+B(x).o
        this.MultiplyCorners(other.corners)
        this.MultiplyEdges(other.edges)
    }
    MultiplyCorners(otherCorners) {
        var newCorns = []
        for (var i = 0; i < 8; i++) {
            let newCorn = [this.corners[otherCorners[i][0]][0]]
            const ori_a = this.corners[otherCorners[i][0]][1]
            const ori_b = otherCorners[i][1]
            if (ori_a < 3 && ori_b < 3) { //Neither is mirrored
                //Result is not mirrored
                newCorn.push((ori_a + ori_b) % 3)
            }
            else if (ori_a < 3 && ori_b >= 3) { //Other is mirrored
                let ori = ori_a + ori_b
                //Result is mirrored
                newCorn.push(ori >= 6 ? (ori - 3) : ori)
            }
            else if (ori_a >= 3 && ori_b < 3) { //This is mirrored
                let ori = ori_a - ori_b
                //Result is mirrored
                newCorn.push(ori < 3 ? (ori + 3) : ori)
            }
            else if (ori_a >= 3 && ori_b >= 3) { //Both mirrored
                let ori = ori_a - ori_b
                //Result is not mirrored
                newCorn.push(ori < 0 ? (ori + 3) : ori)
            }
            newCorns.push(newCorn)
        }
        this.corners = newCorns
    }
    MultiplyEdges(otherEdges) {
        var newEdges = []
        for (var i = 0; i < 12; i++) {
            let newEdge = [this.edges[otherEdges[i][0]][0]]
            newEdge.push((otherEdges[i][1] + this.edges[otherEdges[i][0]][1]) % 2)
            newEdges.push(newEdge)
        }
        this.edges = newEdges
    }

    //Edges and corners have the same parity on a solved cube
    //mod 2, number of swaps needed to solve
    EdgeParity() {
        let sum = 0
        for (var i = 11; i >= 0; i--) {
            for (var j = i - 1; j >= 0; j--) {
                if (this.edges[j][0] > this.edges[i][0]) {
                    sum += 1
                }
            }
        }
        return sum % 2
    }
    CornerParity() {
        let sum = 0
        for (var i = 7; i >= 0; i--) {
            for (var j = i - 1; j >= 0; j--) {
                if (this.corners[j][0] > this.corners[i][0]) {
                    sum += 1
                }
            }
        }
        return sum % 2
    }
    //Corner Orientation Coordinate
    CornOriCoord() { //0 => 2,186 (3^7 - 1)
        let sum = 0
        for (var i = 0; i < 7; i++) { //Last one is deterministic so ignore
            sum = sum * 3 + this.corners[i][1]
        }
        return sum
    }
    SetCornOriCoord(CornOri) {
        let sum = 0
        let remaining = CornOri
        for (var i = 6; i >= 0; i--) {
            sum += remaining % 3
            this.corners[i][1] = remaining % 3
            remaining = Math.floor(remaining / 3)
        }
        this.corners[7][1] = (-sum + 30) % 3 //Last corner is deterministic
    }
    //Edge Orientation Coordinate
    EdgeOriCoord() { //0 => 2,047 (2^11 - 1)
        let sum = 0
        for (var i = 0; i < 11; i++) {
            sum = sum * 2 + this.edges[i][1]
        }
        return sum
    }
    SetEdgeOriCoord(EdgeOri) {
        let sum = 0
        let remaining = EdgeOri
        for (var i = 10; i >= 0; i--) {
            sum += remaining % 2
            this.edges[i][1] = remaining % 2
            remaining = Math.floor(remaining / 2)
        }
        this.edges[11][1] = (-sum + 40) % 2 //Last edge is deterministic
    }
    //Corner Permutation Coordinate
    CornPermCoord() { //0 => 40,319 (8! - 1)
        let corns = [...this.corners]
        let b = 0
        for (var j = 7; j >= 0; j--) {
            let k = 0
            while (corns[j][0] != j) {
                corns = RotateLeft(corns, 0, j)
                k += 1
            }
            b = (j + 1) * b + k
        }
        return b
    }
    SetCornPermCoord(CornPerm) {
        let perm = []
        for (var i = 0; i < 8; i++) {
            perm.push(i)
        }

        let idx = CornPerm
        for (var j = 0; j < 8; j++) {
            let k = idx % (j + 1)
            idx = Math.floor(idx / (j + 1))
            while (k > 0) {
                perm = RotateRight(perm, 0, j)
                k -= 1
            }
        }

        for (var i = 0; i < 8; i++) {
            this.corners[i][0] = perm[i]
        }
    }
    //Edge Permutation Coordinate
    EdgePermCoord() { //0 => 479,001,599 (12! - 1)
        let edges = [...this.edges]
        let b = 0
        for (var j = 11; j >= 0; j--) {
            let k = 0
            while (edges[j][0] != j) {
                edges = RotateLeft(edges, 0, j)
                k += 1
            }
            b = (j + 1) * b + k
        }
        return b
    }
    SetEdgePermCoord(EdgePerm) {
        let perm = []
        for (var i = 0; i < 12; i++) {
            perm.push(i)
        }

        let idx = EdgePerm
        for (var j = 0; j < 12; j++) {
            let k = idx % (j + 1)
            idx = Math.floor(idx / (j + 1))
            while (k > 0) {
                perm = RotateRight(perm, 0, j)
                k -= 1
            }
        }

        for (var i = 0; i < 12; i++) {
            this.edges[i][0] = perm[i]
        }
    }
    //Phase 1 UD-Slice Coordinate (0 when UD-edges are in UD-Slice)
    P1UDSliceCoord() { //0 => 494 (12C4 - 1)
        var k = 3
        var i = 11
        var sum = 0
        while (k >= 0) {
            if (this.edges[i][0] >= 8) //Occupied with UD-edge
                k -= 1
            else
                sum += choose(i, k)

            i -= 1
        }
        return sum
    }
    //Flip UD-Slice Coordinate (0 when Edges Oriented and UD-edges in UD-slice)
    FlipUDSliceCoord() { //0 => 1,013,759 (2048 * 495 – 1)
        return this.EdgeOriCoord() * 495 + this.P1UDSliceCoord()
    }
    //Phase 2 Edge Orientation Coordinate (Exclude UD-slice edges)
    P2EdgePermCoord() { //0 => 40,319 (8! - 1)
        var x = 0
        let nonUDedges = this.edges.filter((edge) => edge[0] < 8)
        for (var i = 7; i >= 1; i--) {
            let s = 0
            for (var j = i - 1; j >= 0; j--) {
                if (nonUDedges[j][0] > nonUDedges[i][0]) {
                    s += 1
                }
            }
            x = (x + s) * i
        }
        return x
    }
    //Phase 2 UD-Slice Coordinate (Permutation of UD-edges within UD-Slice)
    P2UDSliceCoord() { //0 => 23 (4! - 1)
        var x = 0
        let UDedges = this.edges.filter((edge) => edge[0] >= 8)
        for (var i = 3; i >= 1; i--) {
            let s = 0
            for (var j = i - 1; j >= 0; j--) {
                if (UDedges[j][0] > UDedges[i][0]) {
                    s += 1
                }
            }
            x = (x + s) * i
        }
        return x
    }

    Matches(other) {
        return MatchesCorners(other) && MatchesEdges(other)
    }
    MatchesCorners(other) {
        for (var i = 0; i < 8; i++) {
            if (this.corners[i][0] !== other.corners[i][0])
                return false
            if (this.corners[i][1] !== other.corners[i][1])
                return false
        }
        return true
    }
    MatchesEdges(other) {
        for (var i = 0; i < 12; i++) {
            if (this.edges[i][0] !== other.edges[i][0])
                return false
            if (this.edges[i][1] !== other.edges[i][1])
                return false
        }
        return true
    }

    Randomise() {
        const epIndex = Math.floor(Math.random() * 479001600); //Random EP
        this.SetEdgePermCoord(epIndex)
        const edgeParity = this.EdgeParity()

        //Edge and corner parity must be the same to be solvable
        do {
            const cpIndex = Math.floor(Math.random() * 40320)
            this.SetCornPermCoord(cpIndex)
        } while (edgeParity != this.CornerParity())

        this.RandomiseEO()
        this.RandomiseCO()
    }
    RandomiseEdges() {
        do {
            const epIndex = Math.floor(Math.random() * 479001600)
            this.SetEdgePermCoord(epIndex)
        } while (this.EdgeParity() != this.CornerParity())

        this.RandomiseEO()
    }
    RandomiseCorners() {
        do {
            const cpIndex = Math.floor(Math.random() * 40320)
            this.SetCornPermCoord(cpIndex)
        } while (this.EdgeParity() != this.CornerParity())

        this.RandomiseCO()
    }
    RandomiseCO() {
        const coIndex = Math.floor(Math.random() * 2187)
        this.SetCornOriCoord(coIndex)
    }
    RandomiseEO() {
        const eoIndex = Math.floor(Math.random() * 2048)
        this.SetEdgeOriCoord(eoIndex)
    }
}

function RotateLeft(arr, start, end) {
    const temp = arr[start]
    for (var i = start; i < end; i++) {
        arr[i] = arr[i + 1]
    }
    arr[end] = temp
    return arr
}
function RotateRight(arr, start, end) {
    const temp = arr[end]
    for (var i = end; i > start; i--) {
        arr[i] = arr[i - 1]
    }
    arr[start] = temp
    return arr
}

function choose(n, k) {
    //https://www.geeksforgeeks.org/javascript/how-to-evaluate-binomial-coefficient-of-two-integers-n-and-k-in-javascript/
    if (k < 0 || k > n) {
        return 0
    }
    if (k === 0 || k === n) {
        return 1
    }
    if (k === 1 || k === n - 1) {
        return n
    }

    let res = n;
    for (let i = 2; i <= k; i++) {
        res *= (n - i + 1) / i;
    }

    return Math.round(res);
}

function factorial(n) {
    return (n === 0 || n === 1) ? 1 : n * factorial(n-1)
}