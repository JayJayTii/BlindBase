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
        const face = Math.floor(move / 3)
        const turn = move % 3
        //(A*B)(x).c=A(B(x).c).c
        //(A*B)(x).o=A(B(x).c).o+B(x).o
        for (var j = 0; j <= turn; j++) {
            var newCorns = []
            for (var i = 0; i < 8; i++) {
                newCorns.push([this.corners[cornerCubieMove[face][i][0]][0], (this.corners[cornerCubieMove[face][i][0]][1] + cornerCubieMove[face][i][1])%3])
            }
            var newEdges = []
            for (var i = 0; i < 12; i++) {
                newEdges.push([this.edges[edgeCubieMove[face][i][0]][0], (this.edges[edgeCubieMove[face][i][0]][1] + edgeCubieMove[face][i][1])%2])
            }
            this.corners = newCorns
            this.edges = newEdges
        }
    }

    //Corner Orientation Coordinate
    CornOriCoord() { //0 => 2,186 (3^7 - 1)
        let sum = 0
        for (var i = 0; i < 7; i++) { //Last one is deterministic so ignore
            sum = sum * 3 + this.corners[i][1]
        }
        return sum
    }
    //Edge Orientation Coordinate
    EdgeOriCoord() { //0 => 2,047 (2^11 - 1)
        let sum = 0
        for (var i = 0; i < 11; i++) {
            sum = sum * 2 + this.edges[i][1]
        }
        return sum
    }
    //Corner Permutation Coordinate
    CornPermCoord() { //0 => 40,319 (8! - 1)
        var x = 0
        for (var i = 7; i >= 1; i--) {
            let s = 0
            for (var j = i - 1; j >= 0; j--) {
                if (this.corners[j][0] > this.corners[i][0]) {
                    s += 1
                }
            }
            x = (x + s) * i
        }
        return x
    }
    //Edge Permutation Coordinate
    EdgePermCoord() { //0 => 479,001,599 (12! - 1)
        var x = 0
        for (var i = 11; i >= 1; i--) {
            let s = 0
            for (var j = i - 1; j >= 0; j--) {
                if (this.edges[j][0] > this.edges[i][0]) {
                    s += 1
                }
            }
            x = (x + s) * i
        }
        return x
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