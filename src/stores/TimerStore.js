import { defineStore } from 'pinia'
import { formatTime } from '@/helpers/timer.js'

const DEFAULT_SESSION_TYPES = [
    { name: '3x3 Blindfolded', id: 0 },
    { name: '3x3 Edges', id: 1 },
    { name: '3x3 Corners', id: 2 },
]
const DEFAULT_SOLVE_STATUSES = [
    {name: "Success", id: 0},
    {name: "DNF", id: 1},
    {name: "+2", id: 2},
]

const SOLVE_SECTIONS = {
    total: 1,
    memo: 2,
    exec: 3
}

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
            //Unique ID so sessions can have the same name
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
        deleteSolve(sessionID, solveIndex) {
            this.sessions[this.getSessionIndexWithID(sessionID)].solves.splice(solveIndex, 1)
            this.saveState();
        },

        //Mean of N
        moN(sessionID, n, section) {
            const index = this.getSessionIndexWithID(sessionID)
            const solves = this.sessions[index].solves.slice(-n)
            if (solves.length < n)
                return "---"
            let times = []
            let dnfAverage = false
            if (section === SOLVE_SECTIONS.total) {
                const dnfCount = solves.filter((solve) => solve.status === 1).length
                //Ignore DNFs if it is a DNF mean, just to give a hypothetical
                dnfAverage = (dnfCount > 0)
                times = solves.map((solve) => solve.solveTime + (solve.status === 2 ? 2000 : 0))
            }
            else if (section === SOLVE_SECTIONS.memo) {
                times = solves.map((solve) => solve.memoTime)
            }
            else if (section === SOLVE_SECTIONS.exec) {
                times = solves.map((solve) => solve.solveTime - solve.memoTime)
            }
            const mean = times.reduce((acc, time) => acc + time, 0) / times.length

            if (dnfAverage) {
                return "DNF (" + formatTime(mean) + ")"
            } else {
                return formatTime(mean)
            }
        },
        //Average of N
        aoN(sessionID, n, section) {
            const sessionIndex = this.getSessionIndexWithID(sessionID)
            //Get the last n solves
            const solves = this.sessions[sessionIndex].solves.slice(-n)
            if (solves.length < n) //If there haven't been n solves, then there isn't an average of n
                return "---"

            let times = []
            let dnfAverage = false
            //DNFs aren't counted for parts of solves
            if (section === SOLVE_SECTIONS.total) { 
                const dnfCount = solves.filter((solve) => solve.status === 1).length
                //Ignore DNFs if it is a dnf average, just to give a hypothetical
                dnfAverage = (dnfCount > 1)
                //If there is 0 or 1 DNFs, add lots of time to a DNF to filter it out
                times = solves.map((solve) => solve.solveTime + (solve.status === 2 ? 2000 : 0) + (!dnfAverage && solve.status === 1 ? 99999999999999 : 0))
            }
            else if (section === SOLVE_SECTIONS.memo) {
                times = solves.map((solve) => solve.memoTime)
            }
            else if (section === SOLVE_SECTIONS.exec) {
                times = solves.map((solve) => solve.solveTime - solve.memoTime)
            }
            //Sort times to remove fastest and slowest (or dnf)
            times.sort(function (a, b) {
                return a - b;
            });
            times = times.slice(1, n - 1) //Only take middle values
            const mean = times.reduce((acc, time) => acc + time, 0) / times.length

            if (dnfAverage) {
                return "DNF (" + formatTime(mean) + ")"
            } else {
                return formatTime(mean)
            }
        },

        getSessionStatistics(id) {
            return [
                ["single", this.moN(id, 1, SOLVE_SECTIONS.total), this.moN(id, 1, SOLVE_SECTIONS.memo), this.moN(id, 1, SOLVE_SECTIONS.exec)],
                ["mo3", this.moN(id, 3, SOLVE_SECTIONS.total), this.moN(id, 3, SOLVE_SECTIONS.memo), this.moN(id, 3, SOLVE_SECTIONS.exec)],
                ["ao5", this.aoN(id, 5, SOLVE_SECTIONS.total), this.aoN(id, 5, SOLVE_SECTIONS.memo), this.aoN(id, 5, SOLVE_SECTIONS.exec)],
                ["ao12", this.aoN(id, 12, SOLVE_SECTIONS.total), this.aoN(id, 12, SOLVE_SECTIONS.memo), this.aoN(id, 12, SOLVE_SECTIONS.exec)],
                ["ao25", this.aoN(id, 25, SOLVE_SECTIONS.total), this.aoN(id, 25, SOLVE_SECTIONS.memo), this.aoN(id, 25, SOLVE_SECTIONS.exec)],
                ["ao50", this.aoN(id, 50, SOLVE_SECTIONS.total), this.aoN(id, 50, SOLVE_SECTIONS.memo), this.aoN(id, 50, SOLVE_SECTIONS.exec)],
                ["ao100", this.aoN(id, 100, SOLVE_SECTIONS.total), this.aoN(id, 100, SOLVE_SECTIONS.memo), this.aoN(id, 100, SOLVE_SECTIONS.exec)],
            ]
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
