import { GenerateCornOriPrune, GenerateCornPermPrune, GenerateEdgeOriPrune} from './kociemba/PruningTable.js'
import { GenerateCornOriMove, GenerateCornPermMove, GenerateEdgeOriMove, GenerateFUSMove } from './kociemba/MoveTable.js'
import { GenerateFUSClassToRepresentant } from './kociemba/ClassToRepresentant.js'

//Run in a separate thread on application start-up

// startupWorker.js
self.onmessage = async (e) => {
    await GenerateFUSClassToRepresentant()
    await GenerateCornOriPrune()
    await GenerateCornPermPrune()
    await GenerateEdgeOriPrune()
    await GenerateCornOriMove()
    await GenerateCornPermMove()
    await GenerateEdgeOriMove()
    await GenerateFUSMove()
    self.postMessage('complete')
};

//parentPort.postMessage("Finished generating prune and move tables")