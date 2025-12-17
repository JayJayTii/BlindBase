import { defineStore } from 'pinia'
import { useSheetStore } from './SheetStore'
import { Sequence } from '@/helpers/sequence.js'

export function getReconsStore() {
    return useReconsStore()
}

export const useReconsStore = defineStore('reconsStore', {
    state: () => {
        return {
            recons: [],
            algsheets: {corners: -1, edges: -1}, //Algsheets to take recommendations from
        }
    },
    actions: {
        createRecon(newRecon) {
            this.recons.push(newRecon)
            this.saveState()
            return this.recons.length - 1 //Returns index of new recon
        },
        updateReconBody(reconIndex, newValue) {
            this.recons[reconIndex].body = newValue
            this.saveState()
        },
        updateReconName(reconIndex, newValue) {
            this.recons[reconIndex].name = newValue
            this.saveState()
        },
        deleteRecon(index) {
            this.recons.splice(index, 1)
            this.saveState()
        },

        GetReconWithScramble(scramble) {
            //Just a linear search
            for (var i = 0; i < this.recons.length; i++) {
                if (this.recons[i].scramble == scramble) {
                    return i
                }
            }
            return -1
        },
        GetCornerAlgsheet() {
            //The recon tool saves which spreadsheet to take algorithms from, this function fetches that
            if (!this.algsheets)
                this.algsheets = { corners: -1, edges: -1 }

            //If the sheet doesn't exist or is of the wrong type, override it
            if (useSheetStore().getType(this.algsheets.corners) != 1) {
                const cornerSheets = useSheetStore().getSheetsOfType(1)
                this.algsheets.corners = (cornerSheets.length > 0) ? cornerSheets[0].id : -1
            }
            this.saveState()
            return this.algsheets.corners
        },
        GetEdgeAlgsheet() {
            if (!this.algsheets)
                this.algsheets = { corners: -1, edges: -1 }

            //If the sheet doesn't exist or is of the wrong type, override it
            if (useSheetStore().getType(this.algsheets.edges) != 2) {
                const edgeSheets = useSheetStore().getSheetsOfType(2)
                this.algsheets.edges = (edgeSheets.length > 0) ? edgeSheets[0].id : -1
            }
            this.saveState()
            return this.algsheets.edges
        },
        saveState() {
            localStorage.setItem(
                'reconsStore',
                JSON.stringify({
                    recons: this.recons,
                    algsheets: this.algsheets,
                }),
            )
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('reconsStore'))
                this.recons = data.recons
                this.algsheets = data.algsheets
            } catch { }
        },
    },
    getters: {},
})
