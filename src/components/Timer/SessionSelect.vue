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
</script>

<template>
    <div class="Panel">
        <div class="PanelHeader"> Select Session:</div>

        <List :data="timerStore.getSessionNames" :selectedIndex="timerStore.getSessionIndexWithID(props.sessionID)"
              @onItemClick="SessionClicked" />

        <div style="display: flex;flex-direction: row; justify-content: space-between; width: 100%; ">
            <div></div>
            <img @click="timerStore.newSession(); emit('updateSessionID',timerStore.sessions.length-1);"
                 class="CustomButton" src="@/assets/add.svg" style="height:40px;" />
        </div>
    </div>
</template>