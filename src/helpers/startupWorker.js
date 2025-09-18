import { GenerateCornOriPrune, GenerateCornPermPrune, GenerateEdgeOriPrune} from './kociemba/PruningTable.js'
import { GenerateCornOriMove, GenerateCornPermMove, GenerateEdgeOriMove } from './kociemba/MoveTable.js'

//Run in a separate thread on application start-up

// startupWorker.js
self.onmessage = async (e) => {
    await GenerateCornOriPrune()
    await GenerateCornPermPrune()
    await GenerateEdgeOriPrune()
    await GenerateCornOriMove()
    await GenerateCornPermMove()
    await GenerateEdgeOriMove()
    self.postMessage('complete')
};

//parentPort.postMessage("Finished generating prune and move tables")