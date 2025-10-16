<script setup>
    import { computed, inject } from 'vue'
    import { useReconsStore } from "@/stores/ReconsStore"
    const confirmDialog = inject('confirmDialog')
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

    async function Delete() {
        if (!await confirmDialog.value.open('Are you sure you want to delete this reconstruction?')) {
            return
        }
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
            <img src="@/assets/delete-bin.svg" @click="Delete()" style="width:50px;" class="DeleteButton" />
        </div>

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
    }

    .DeleteButton{
        height:50px;
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor:pointer;
    }
    .DeleteButton:hover{
        background-color: var(--brand-500);
    }
</style>