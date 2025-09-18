import { GenerateCornOriPrune, GenerateCornPermPrune, GenerateEdgeOriPrune } from './kociemba/PruningTable.js'
import { GenerateCornOriMove, GenerateCornPermMove, GenerateEdgeOriMove } from './kociemba/MoveTable.js'

export function GenerateSolverTables() {
    console.time("GenerateSolverTables")
    const worker = new Worker(new URL('@/helpers/startupWorker.js', import.meta.url), {
        type: 'module'
    })

    worker.onmessage = (e) => {
        if (e.data === 'complete') {
            //Load back from IndexedDB since the arrays are not shared between threads
            GenerateCornOriPrune()
            GenerateCornPermPrune()
            GenerateEdgeOriPrune()
            GenerateCornOriMove()
            GenerateCornPermMove()
            GenerateEdgeOriMove()
            console.timeEnd("GenerateSolverTables")
        }
    }

    worker.postMessage('start')
}