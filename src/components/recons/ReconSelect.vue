<script setup>
    import { ref } from 'vue'
    import List from '@/components/List.vue'
    import { useRouter } from 'vue-router'
    const router = useRouter()
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    reconsStore.loadState()

    const newScramble = ref("")
    function createRecon() {
        //Needed to actually reload the page, otherwise nothing happens
        router.push(`/reconCreate`).then(() => {
            router.push(`/recons/${newScramble.value}`)
        })
    }

    function ReconClicked(index) {
        router.push(`/reconCreate`).then(() => {
            router.push(`/recons/${reconsStore.recons[index].scramble}`)
        })
    }
</script>

<template>
    <div class="ReconSelect">
        <div style="font-size:3rem;"><u><b>Reconstructions:</b></u></div>
        <div style="width:40%;font-size:2rem;">
            <List :data="reconsStore.recons.map((recon) => recon.name)"
                  :selectedIndex="-1"
                  @onItemClick="ReconClicked" />
        </div>
        <div>
            <input v-model="newScramble" />
            <button @click="createRecon">Create</button>
        </div>
    </div>
</template>

<style>
    .ReconSelect{
        display:flex;
        flex-direction: column;
        color: var(--grey-100);
        align-items: center;
    }

    .reconButton {
        width: 500px;
        font-size: 2rem;
        border-radius: 10px;
        cursor: pointer;
        background-color: var(--grey-600);
    }
    .reconButton:hover{
        background-color: var(--grey-500);
    }
</style>