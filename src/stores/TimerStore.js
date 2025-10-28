import { defineStore } from 'pinia'
import { getSumOfTimes, getSolveTimes, calculateBestMon, calculateMean, calculateAvg, calculateBestAon, formatTime } from '@/helpers/timer.js'

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
            this.getSession(sessionID).solves.push(solve)
            this.saveState();
        },
        deleteSolve(sessionID, solveIndex) {
            this.sessions[this.getSessionIndexWithID(sessionID)].solves.splice(solveIndex, 1)
            this.saveState();
        },

        getDnfCount(sessionID) {
            let dnfs = 0
            for (const solve of this.getSession(sessionID).solves) {
                if (solve.status == 1)
                    dnfs++
            }
            return dnfs
        },

        //Mean of N
        moN(sessionID, n) {
            if (this.getSession(sessionID).solves.length < n)
                return [[-1, true], [-1, true], [-1, true]]
            const solves = this.getSession(sessionID).solves.slice(-n)
            const means = [calculateMean(solves, 1), calculateMean(solves, 2), calculateMean(solves, 3)]
            return means
        },
        bestMon(sessionID, mappedSolves, n) {
            const session = this.getSession(sessionID)
            /*
            if (!session.hasOwnProperty("bests"))
                session.bests = {}
            if (!session.bests.hasOwnProperty("mo" + n.toString())) {
                session.bests["mo" + n.toString()] = [-1,-1,-1]
            }
            session.bests["mo" + n.toString()] = this.recalculateBestMon(sessionID, n)
            
            return session.bests["mo" + n.toString()]
            */
            return calculateBestMon(mappedSolves, n)
        },

        //Average of N
        aoN(sessionID, n) {
            if (this.getSession(sessionID).solves.length < n)
                return [[-1, true], [-1, true], [-1, true]]
            const solves = this.getSession(sessionID).solves.slice(-n)
            return [calculateAvg(solves, 1), calculateAvg(solves, 2), calculateAvg(solves, 3)]
        },
        bestAon(sessionID, mappedSolves, n) {
            const session = this.getSession(sessionID)
            //Solves are mapped to their reduced counterpart once beforehand to avoid doing that many times in this function
            return calculateBestAon(mappedSolves, n)
        },

        getSessionStatistics(id) {
            const solves = this.getSession(id).solves.map(solve => ({
                solveTime: solve.solveTime,
                memoTime: solve.memoTime,
                status: solve.status,
            }))
            const out = [
                ["single",  this.moN(id, 1)  , this.bestMon(id, solves, 1)],
                ["mo3",     this.moN(id, 3)  , this.bestMon(id, solves, 3)],
                ["ao5",     this.aoN(id, 5)  , this.bestAon(id, solves, 5)],
                ["ao12",    this.aoN(id, 12) , this.bestAon(id, solves, 12)],
                ["ao25",    this.aoN(id, 25) , this.bestAon(id, solves, 25)],
                ["ao50",    this.aoN(id, 50) , this.bestAon(id, solves, 50)],
                ["ao100",   this.aoN(id, 100), this.bestAon(id, solves, 100)],
            ]
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
