<script setup>
    import { computed, nextTick } from 'vue'
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    reconsStore.loadState()
    import { useRouter } from 'vue-router'
    const router = useRouter()


    const props = defineProps({
        reconIndex: Number,
    })

    const reconBody = computed({
        get: () => reconsStore.recons[props.reconIndex].body,
        set: (newValue) => {
            reconsStore.updateReconBody(props.reconIndex, newValue)
        },
    })
    const reconName = computed({
        get: () => reconsStore.recons[props.reconIndex].name,
        set: (newValue) => {
            reconsStore.updateReconName(props.reconIndex, newValue)
        },
    })

    function ExitEdit() {
        router.push(`/reconCreate`).then(() => {
            router.push(`/recons`)
        })
    }

    function Delete() {
        reconsStore.deleteRecon(props.reconIndex)
        ExitEdit()
    }
</script>

<template>
    <div v-if="reconIndex < reconsStore.recons.length">
        <div style="display: flex; flex-direction: column; gap: 10px; width: 40%; transform: translate(10px, 5px); ">
            <input v-model="reconName" maxlength="30" id="reconNameInput" />
            <textarea v-model="reconBody"
                      id="reconBodyInput" />
        </div>
        <button @click="Delete()">DELETE</button>

        <div style="font-size: 1.5rem;"
             class="NextButton"
             @click="ExitEdit()">DONE</div>
    </div>
</template>

<style>
    #reconBodyInput {
        field-sizing: content;
        resize: none;
        font-size: 1.2rem;
        min-height: 50vh;
    }

    #reconNameInput {
        font-size: 3rem;
        border-block-end: 4px solid white;
       
    }
</style>