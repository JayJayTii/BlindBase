<script setup>
    import { ref } from 'vue'
    import { useTimerStore } from "@/stores/TimerStore"
    const timerStore = useTimerStore()
    import List from "@/components/List.vue"

    const props = defineProps({
        sessionID: Number,
    })
    const emit = defineEmits(['updateSessionID'])

    function SessionClicked(index) {
        emit('updateSessionID', index)
    }
    const selectedIndex = ref(timerStore.getSessionIndexWithID(props.sessionID))
</script>

<template>
    <div class="Panel">
        <div class="PanelHeader"> Select Session:</div>
        <div>
            <div v-for="(label, index) in timerStore.getSessionNames"
                 :class="['ListItem', selectedIndex === index ? 'ListItemSelected' : 'ListItemUnselected']"
                 @click="SessionClicked(index)">
                <span v-if="label">{{label}}</span>
                <span v-else>&nbsp</span>
            </div>

            <div style="display: flex;flex-direction: row; justify-content: space-between; width: 100%; ">
                <div></div>
                <img title="Create an empty session"
                     @click="timerStore.newSession(); emit('updateSessionID',timerStore.sessions.length-1);"
                     class="CustomButton" src="@/assets/add.svg" style="height:40px;" />
            </div>
        </div>
    </div>
</template>