import { GenerateCornOriPrune, GenerateCornPermPrune, GenerateEdgeOriPrune } from './kociemba/PruningTable.js'
import { GenerateCornOriMove, GenerateCornPermMove, GenerateEdgeOriMove, GenerateFUSMove } from './kociemba/MoveTable.js'
import { GenerateFUSClassToRepresentant } from './kociemba/ClassToRepresentant.js'

export function GenerateSolverTables() {
    console.time("GenerateSolverTables")
    const worker = new Worker(new URL('@/helpers/startupWorker.js', import.meta.url), {
        type: 'module'
    })

    worker.onmessage = (e) => {
        if (e.data === 'complete') {
            //Load back from IndexedDB since the arrays are not shared between threads
            GenerateFUSClassToRepresentant()
            GenerateCornOriPrune()
            GenerateCornPermPrune()
            GenerateEdgeOriPrune()
            GenerateCornOriMove()
            GenerateCornPermMove()
            GenerateEdgeOriMove()
            GenerateFUSMove()
            console.timeEnd("GenerateSolverTables")
        }
    }

    worker.postMessage('start')
}