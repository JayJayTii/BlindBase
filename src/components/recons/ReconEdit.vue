<script setup>
    import { computed } from 'vue'
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
</script>

<template>
    <div style="display: flex; flex-direction: column; gap: 10px; width: 40%; transform: translate(10px, 5px); ">
        <input v-model="reconName" id="reconNameInput" />
        <textarea v-model="reconBody"
                  id="reconBodyInput" />
    </div>
    <button @click="reconsStore.deleteRecon(reconIndex);ExitEdit()">DELETE</button>

    <img src="@/assets/arrow-right-long.svg"
         class="NextButton"
         @click="ExitEdit()" />
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