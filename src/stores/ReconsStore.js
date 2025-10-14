import { defineStore } from 'pinia'
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

        GetReconWithScramble(scramble) {
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
                }),
            )
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('reconsStore'))
                this.recons = data.recons
            } catch { }
        },
    },
    getters: {},
})
