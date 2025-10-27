import { defineStore } from 'pinia'
import { getSumOfTimes, getSolveTimes, calculateMean, calculateAvg, formatTime } from '@/helpers/timer.js'

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
                bests: {},
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
        moN(sessionID, n) {
            if (this.getSession(sessionID).solves.length < n)
                return [[-1, true], [-1, true], [-1, true]]
            const solves = this.getSession(sessionID).solves.slice(-n)
            const means = [calculateMean(solves, 1), calculateMean(solves, 2), calculateMean(solves, 3)]
            return means
        },
        recalculateBestMon(sessionID, n) {
            console.log("recalculating " + n.toString())
            const session = this.getSession(sessionID)
            let best = [-1, -1, -1]
            for (var i = 0; i < session.solves.length - n + 1; i++) {
                const solves = session.solves.slice(i, i + n)
                const means = [calculateMean(solves, 1), calculateMean(solves, 2), calculateMean(solves, 3)]
                for (var section = 0; section < 3; section++) {
                    if (means[section][1] || means[section][0] == -1)
                        continue
                    if (means[section][0] < best[section] || best[section] == -1)
                        best[section] = means[section][0]
                }
            }
            return best
        },
        bestMon(sessionID, n) {
            /*
            const session = this.getSession(sessionID)
            if (!session.hasOwnProperty("bests"))
                session.bests = {}
            if (!session.bests.hasOwnProperty("mo" + n.toString())) {
                session.bests["mo" + n.toString()] = [-1,-1,-1]
            }
            session.bests["mo" + n.toString()] = this.recalculateBestMon(sessionID, n)
            
            return session.bests["mo" + n.toString()]
            */
            return this.recalculateBestMon(sessionID, n)
        },

        //Average of N
        aoN(sessionID, n) {
            if (this.getSession(sessionID).solves.length < n)
                return [[-1, true], [-1, true], [-1, true]]
            const solves = this.getSession(sessionID).solves.slice(-n)
            return [calculateAvg(solves, 1), calculateAvg(solves, 2), calculateAvg(solves, 3)]
        },
        recalculateBestAon(sessionID, n) {
            const session = this.getSession(sessionID)
            let best = [-1, -1, -1]
            for (var i = 0; i < session.solves.length - n + 1; i++) {
                const solves = session.solves.slice(i, i + n)
                const avgs = [calculateAvg(solves, 1), calculateAvg(solves, 2), calculateAvg(solves, 3)]
                for (var section = 0; section < 3; section++) {
                    if (avgs[section][1] || avgs[section][0] == -1)
                        continue
                    if (avgs[section][0] < best[section] || best[section] == -1)
                        best[section] = avgs[section][0]
                }
            }
            return best
        },
        bestAon(sessionID, n) {
            return this.recalculateBestAon(sessionID, n)
        },

        getSessionStatistics(id) {
            console.time("statsgen")
            const out = [
                ["single",  this.moN(id, 1)  , this.bestMon(id, 1)],
                ["mo3",     this.moN(id, 3)  , this.bestMon(id, 3)],
                ["ao5",     this.aoN(id, 5)  , this.bestAon(id, 5)],
                ["ao12",    this.aoN(id, 12) , this.bestAon(id, 12)],
                ["ao25",    this.aoN(id, 25) , this.bestAon(id, 25)],
                ["ao50",    this.aoN(id, 50) , this.bestAon(id, 50)],
                ["ao100",   this.aoN(id, 100), this.bestAon(id, 100)],
            ]
            console.timeEnd("statsgen")
            return out
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
