import { cornerFaceletMove, edgeFaceletMove, centerFaceletMove } from '@/helpers/FaceletCube/FaceletMove.js'

export class FaceletCube {
    corners = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    edges = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    centers = [0, 1, 2, 3, 4, 5]


    Turn(move) { //Expect an internal representation of a move e.g. ['R', 2]
        const faces = ['U', 'R', 'F', 'D', 'L', 'B']
        const moveIndex = faces.indexOf(move[0])

        for(var i = 0; i < move[1]; i++) {
            this.Multiply({ corners: cornerFaceletMove[moveIndex], edges: edgeFaceletMove[moveIndex], centers: centerFaceletMove[moveIndex] })
        }
    }


    Multiply(other) {
        this.MultiplyCorners(other.corners)
        this.MultiplyEdges(other.edges)
        this.MultiplyCenters(other.centers)
    }

    MultiplyCorners(otherCorners) {
        var newCorns = []
        for (var i = 0; i < 24; i++) {
            let newCorn = this.corners[otherCorners[i]]
            newCorns.push(newCorn)
        }
        this.corners = newCorns
    }
    MultiplyEdges(otherEdges) {
        var newEdges = []
        for (var i = 0; i < 24; i++) {
            let newEdge = this.edges[otherEdges[i]]
            newEdges.push(newEdge)
        }
        this.edges = newEdges
    }
    MultiplyCenters(otherCenters) {
        var newCenters = []
        for (var i = 0; i < 6; i++) {
            let newCenter = this.centers[otherCenters[i]]
            newCenters.push(newCenter)
        }
        this.centers = newCenters
    }
}