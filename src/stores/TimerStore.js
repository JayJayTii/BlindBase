import { defineStore } from 'pinia'
import { useSettingsStore } from './SettingsStore'
import { formatTime } from '@/helpers/timer.js'

export function getSettingsStore() {
    return useSettingsStore()
}

const DEFAULT_SESSION_TYPES = [
    { name: '3x3 Blindfolded', id: 0 },
]
const DEFAULT_SOLVE_STATUSES = [
    {name: "", id: 0},
    {name: "DNF", id: 1},
    {name: "+2", id: 2},
]

export const useTimerStore = defineStore('timerStore', {
    state: () => {
        return {
            sessionTypes: DEFAULT_SESSION_TYPES,
            solveStatuses: DEFAULT_SOLVE_STATUSES,
            sessions: [],
        }
    },
    actions: {
        getNewSessionID() {
            const existingIDs = new Set(this.sessions.map((s) => s.id))
            let newID = 1
            while (existingIDs.has(newID)) {
                newID++
            }
            return newID
        },

        newSession() {
            this.sessions.push({
                name: 'Untitled',
                id: this.getNewSessionID(),
                type: 0,
                solves: [],
            })

            this.saveState()
            this.loadState()
        },
        deleteSession(id) {
            //Should only be allowed to delete at current session
            this.sessions.splice(this.getSessionIndexWithID(id), 1)
            this.saveState()
            this.loadState()
        },
        isValidSessionID(id) {
            for (var i = 0; i < this.sessions.length; i++) {
                if (this.sessions[i].id === id) return true
            }
            return false
        },
        getSessionIndexWithID(id) {
            for (var i = 0; i < this.sessions.length; i++) {
                if (this.sessions[i].id === id) return i
            }
            return -1
        },
        getSession(id) {
            for (var i = 0; i < this.sessions.length; i++) {
                if (this.sessions[i].id === id) return this.sessions[i]
            }
            return null
        },
        addSolve(sessionID, solve) {
            this.sessions[this.getSessionIndexWithID(sessionID)].solves.push(solve)

            this.saveState();
        },

        getSolveTimeString(sessionID, solveIndex) {
            const solve = this.sessions[this.getSessionIndexWithID(sessionID)].solves[solveIndex]
            return this.getSolveTimeStringFromSolve(solve)
        },
        getSolveTimeStringFromSolve(solve) {
            const solveTime = formatTime(solve.solveTime + ((solve.status === 2) ? 2000 : 0)) //Account for +2
            const modifier = solve.status === 1 ? " (DNF)" : solve.status === 2 ? "+" : ""
            return solveTime + modifier
        },
        getSolveRatioString(sessionID, solveIndex) {
            const solve = this.sessions[this.getSessionIndexWithID(sessionID)].solves[solveIndex]
            return this.getSolveRatioStringFromSolve(solve)
        },
        getSolveRatioStringFromSolve(solve) {
            return solve.memoTime === 0 ? "" :
                (formatTime(solve.memoTime) + " memo : " + formatTime(solve.solveTime - solve.memoTime) + " exec")
        },

        saveState() {
            localStorage.setItem(
                'timerStore',
                JSON.stringify({
                    sessions: this.sessions,
                }),
            )
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('timerStore'))
                this.sessions = data.sessions
            } catch {
                this.sessions = []
            }
        },
    },
    getters: {
        getSessionTypes: (state) => state.sessionTypes,
        getSessionNames: (state) => state.sessions.map((session) => session.name),
    },
})
