<script setup>
    import { ref, computed, inject, nextTick,watch } from 'vue'
    import { useTimerStore } from "../stores/TimerStore";
    import Timer from "@/components/Timer.vue";
    import { formatTime } from '../helpers/timer.js';
    const confirmDialog = inject('confirmDialog')
    const timerStore = useTimerStore();
    timerStore.loadState();

    const sessionID = ref(-1);
    const reloadTimer = ref(0);
    const isSessionSelected = computed({
        get: () => timerStore.isValidSessionID(sessionID.value)
    })
    const solveIndex = ref(-1);
    const isSolveSelected = computed({
        get: () => solveIndex.value > -1 && solveIndex.value < (timerStore.getSession(sessionID.value)?.solves?.length || 0)
    })
    const selectedSolve = computed({
        get: () => isSolveSelected ? timerStore.getSession(sessionID.value).solves[solveIndex.value] : null
    })
    const selectedSolvePlus2 = computed({
        get: () => timerStore.getSession(sessionID.value).solves[solveIndex.value].status === 2,
        set: (newVal) => {
            timerStore.getSession(sessionID.value).solves[solveIndex.value].status = newVal ? 2 : 0
            timerStore.saveState()
        },
    })
    const selectedSolveDNF = computed({
        get: () => timerStore.getSession(sessionID.value).solves[solveIndex.value].status === 1,
        set: (newVal) => {
            timerStore.getSession(sessionID.value).solves[solveIndex.value].status = newVal ? 1 : 0
            timerStore.saveState()
        },
    })

    const currentSessionName = computed({
        get: () => timerStore.getSession(sessionID.value)?.name || '',
        set: (newName) => {
            if (timerStore.isValidSessionID(sessionID.value)) {
                timerStore.sessions[timerStore.getSessionIndexWithID(sessionID.value)].name = newName;
                timerStore.saveState()
            }
        }
    });
    const currentSessionType = computed({
        get: () => timerStore.getSession(sessionID.value).type,
        set: (newType) => {
            if (timerStore.isValidSessionID(sessionID.value)) {
                timerStore.sessions[timerStore.getSessionIndexWithID(sessionID.value)].type = newType;
                timerStore.saveState();
            }
        }
    });
    async function DeleteSession() {
        if (await confirmDialog.value.open('Are you sure you want to delete this session?')) {
            timerStore.deleteSession(sessionID.value)
        }
    }
    async function DeleteSolve() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this solve?'))) {
            return
        }
        timerStore.sessions[timerStore.getSessionIndexWithID(sessionID.value)].solves.splice(solveIndex.value, 1)
        solveIndex.value = -1
        reloadTimer.value++
        timerStore.saveState()
    }

    const solveListRef = ref(null)
    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
        solveIndex.value = timerStore.getSession(sessionID.value).solves.length - 1
    }

    watch(
        () => timerStore.getSession(sessionID.value)?.solves.length,
        async () => {
            await nextTick()
            if (solveListRef.value) {
                solveListRef.value.scrollTop = solveListRef.value.scrollHeight
            }
        }
    )

</script>

<template>
    <div class="TimerView">
        <div class="SideColumn">
            <div class="SessionSelect">
                <div class="header-row">
                    <h3>Select Session:</h3>
                </div>
                <div v-for="(sessionName, index) in timerStore.getSessionNames"
                     :class="['ListItem', sessionID === timerStore.sessions[index].id ? 'ListItemSelected' : 'ListItemUnselected']"
                     @click="
                 if(sessionID != timerStore.sessions[index].id) {
                            sessionID = timerStore.sessions[index].id;
                         }">
                    {{ sessionName != "" ? sessionName : "&nbsp;" }}
                </div>
                <button @click="timerStore.newSession(); sessionID = timerStore.sessions[timerStore.sessions.length - 1].id;"
                        style="justify-content:center;">
                    +
                </button>
            </div>
            <div class="SessionSettings" v-if="isSessionSelected">
                <div class="header-row">
                    <h3>Session Settings:</h3>
                </div>
                <div class="SessionEditingRow">
                    <input v-model="currentSessionName"
                           maxlength="20"
                           style="white-space:nowrap;font-weight:bold;font-size:2rem;width:100%;" />
                </div>
                <div class="SessionEditingRow">
                    Type: <select v-model="currentSessionType" style="width: 100%; ">
                        <option v-for="(type,index) in timerStore.getSessionTypes"
                                :key="index"
                                :value="index">
                            {{type.name}}
                        </option>
                    </select>
                </div>
                <div class="SessionEditingRow">
                    <button @click="DeleteSession()">
                        Delete
                    </button>
                </div>
            </div>
            <div v-else class="SessionSettings">
                <div class="header-row">
                    <h3>Session settings:</h3>
                </div>
                <div style="color:var(--info-200)">
                    Select a session to get started
                </div>
            </div>
        </div>

        <div style="width: 60vw; height: 93vh;">
            <Timer v-if="isSessionSelected"
                   :sessionID="sessionID"
                   @update:solve-complete="onSolveComplete" 
                   :key="sessionID + reloadTimer"/>
        </div>

        <div class="SideColumn" v-if="isSessionSelected">
            <div class="SessionDetails">
                <div class="header-row"> <h3>Session Details:</h3>  </div>
            </div>

            <div class="SolvePanel">
                <div class="SolveDetails" v-if="isSolveSelected">
                    <div class="header-row"> <h3>Solve {{solveIndex + 1}}:</h3>  </div>
                    <div>{{selectedSolve.scramble}}</div>
                    <h2>{{timerStore.getSolveTimeString(sessionID, solveIndex)}}</h2>
                    <h3>{{timerStore.getSolveRatioString(sessionID, solveIndex)}}</h3>
                    <div>DNF: <input type="checkbox" v-model="selectedSolveDNF" /></div>
                    <div>+2: <input type="checkbox" v-model="selectedSolvePlus2" /></div>
                    <button @click="solveIndex = -1" style="width:30%;">back</button>
                    <RouterLink to="/recons" class="header-row">
                            RECONSTRUCT
                    </RouterLink>
                    <button @click="DeleteSolve()" style="width:30%;">delete</button>
                </div>
                <div class="SolveList">
                    <div class="header-row"> <h3>Solves:</h3>  </div>
                    <div style="overflow:auto;"
                         ref="solveListRef">
                        <div v-for="(solve, index) in timerStore.getSession(sessionID).solves"
                             class="ListItem"
                             @click="solveIndex = index">
                            <div style="display:flex; flex-direction:row;width:100%;gap:20px;">
                                <div>{{index + 1}}</div>
                                <div>{{ timerStore.getSolveTimeStringFromSolve(solve) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div v-else class="SideColumn">
            <div style="color:var(--info-200)">
                Select a session to get started
            </div>
        </div>
    </div>

</template>

<style>
    .TimerView {
        display: flex;
        flex-direction: row;
    }

    .SessionEditingRow {
        display: flex;
        flex-direction: row;
        padding: 2px;
        gap: 5px;
        width: 100%;
    }

    .SideColumn {
        display: flex;
        flex-direction: column;
        width: 20vw;
        height:93vh;
        color: var(--text-color);
        border: 3px solid var(--border-color);
    }
    .SessionSelect {
        height: 33%;
        padding: 2px;
        border-block-end: 3px solid var(--border-color);
        background-color: var(--panel-color);
        overflow-x: hidden;
        overflow-y: auto;
    }
    .SessionSettings {
        height: 67%;
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
    }

    .SessionDetails {
        height: 50%;
        padding: 2px;
        border-block-end: 3px solid var(--border-color);
        background-color: var(--panel-color);
        overflow-x: hidden;
        overflow-y: auto;
    }
    .SolvePanel{
        position:relative;
        height:50%;
    }
    .SolveDetails {
        position:absolute;
        height: 100%;
        width: 100%;
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
        z-index: 10;
    }
    .SolveList {
        position: absolute;
        height: 100%;
        width: 100%;
        border-block-start: 3px solid var(--panel-color);
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
    }


</style>
