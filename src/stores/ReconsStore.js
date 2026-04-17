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

        getPseudoswap() {
            if (!this.pseudoswap || this.pseudoswap.length < 2)
                this.pseudoswap = [2, 1]
            return this.pseudoswap
        },
        setPseudoswap1(value) {
            this.pseudoswap[0] = value
            this.saveState()
        },
        setPseudoswap2(value) {
            this.pseudoswap[1] = value
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
        saveState() {
            localStorage.setItem(
                'reconsStore',
                JSON.stringify({
                    recons: this.recons,
                    pseudoswap: this.pseudoswap
                }),
            )
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('reconsStore'))
                this.recons = data.recons
                this.algsheets = data.algsheets
                this.pseudoswap = data.pseudoswap || [2, 1]
            } catch { }
        },
    },
    getters: {},
})
