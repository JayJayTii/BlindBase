<script setup>
    import { ref, computed, inject } from 'vue'
    import { useTimerStore } from "../stores/TimerStore";
    import Timer from "@/components/Timer.vue";
    const confirmDialog = inject('confirmDialog')
    const timerStore = useTimerStore();
    timerStore.loadState();

    const sessionID = ref(-1);
    const isSessionSelected = computed({
        get: () => timerStore.isValidSessionID(sessionID.value)
    })
    const solveIndex = ref(-1);
    const isSolveSelected = computed({
        get: () => solveIndex > -1 && solveIndex < timerStore.getSession(sessionID).solves.length
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


    function onSolveComplete(newSolve) {
        timerStore.addSolve(sessionID.value, newSolve)
    }

</script>

<template>
    <div class="TimerView">
        <div class="SideColumn">
            <div class="SessionSelect">
                <div class="header-row">
                    <h3>Select Session:</h3>
                </div>
                <div v-for="(sessionName, index) in timerStore.getSessionNames"
                     :key="timerStore.sessions[index].id"
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
                   :lastSolve="timerStore.sessions[timerStore.getSessionIndexWithID(sessionID)].solves.at(-1)"
                   @update:solve-complete="onSolveComplete" 
                   :key="sessionID"/>
        </div>

        <div class="SideColumn" v-if="isSessionSelected">
            <div class="SessionDetails">
                <div class="header-row"> <h3>Session Details:</h3>  </div>
            </div>

            <div class="SolveDetails" v-if="isSolveSelected">
                <div class="header-row"> <h3>Solve X:</h3>  </div>
            </div>
            <div v-else class="SolveList">
                <div class="header-row"> <h3>Solves:</h3>  </div>
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
    .SolveDetails {
        height: 50%;
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
    }
    .SolveList {
        height: 50%;
        border-block-start: 3px solid var(--panel-color);
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
    }


</style>
