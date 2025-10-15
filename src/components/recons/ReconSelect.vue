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

    const selectedRecon = ref(-1)
    function ReconClicked(index) {
        selectedRecon.value = index
        /*router.push(`/reconCreate`).then(() => {
            router.push(`/recons/${reconsStore.recons[index].scramble}`)
        })*/
    }
</script>

<template>
    <div class="ReconSelect">
        <div id="COLUMN1">
            <div v-if="selectedRecon != -1">
                <pre id="reconBodyPreview">{{reconsStore.recons[selectedRecon].body}}</pre>
            </div>
        </div>
        <div id="COLUMN2">
            <div style="font-size:3rem;"><u><b>Reconstructions:</b></u></div>
            <div style="width:100%;font-size:1.5rem;">
                <List :data="reconsStore.recons.map((recon) => recon.name)"
                      :selectedIndex="selectedRecon"
                      @onItemClick="ReconClicked" />
            </div>
            <div>
                <input v-model="newScramble" />
                <button @click="createRecon">Create</button>
            </div>
            <div id="COLUMN3">

            </div>
        </div>
    </div>
</template>

<style>
    .ReconSelect{
        display:grid;
        grid-template-columns: 35% 30% 35%;
        color: var(--grey-100);
        height: 93vh;
    }

    #reconBodyPreview {
        font-size: 1.5rem;
        width: 100%;
        text-wrap: pretty;
    }

    #COLUMN2{
        display:flex;
        flex-direction: column;
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