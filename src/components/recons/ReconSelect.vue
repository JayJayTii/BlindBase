<script setup>
    import { ref } from 'vue'
    import List from '@/components/List.vue'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
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
    let reconPreviewCube = new FaceletCube()
    function ReconClicked(index) {
        if (index == selectedRecon.value) { //Edit this recon
            router.push(`/reconCreate`).then(() => {
                router.push(`/recons/${reconsStore.recons[index].scramble}`)
            })
            return
        }
        selectedRecon.value = index
        reconPreviewCube = new FaceletCube()
        const scramble = new Sequence()
        scramble.setAlgorithmNotation(reconsStore.recons[index].scramble)
        reconPreviewCube.TurnSequence(scramble)
    }
</script>

<template>
    <div class="ReconSelect">
        <div />
        <div style="font-size: 3rem; text-align: center; text-decoration: underline;">
            Reconstructions:
        </div>
        <div />

        <div id="COLUMN1">
            <div v-if="selectedRecon != -1" id="reconPreviewBody">
                <h1 style="font-size:2rem;" id="reconPreview"><u>{{reconsStore.recons[selectedRecon].name}}</u></h1>
                <pre style="font-size:1.3rem;line-height:1.5rem;" id="reconPreview">{{reconsStore.recons[selectedRecon].body}}</pre>
            </div>
            <div style="height:4rem" />
        </div>
        <div id="COLUMN2">
            <div style="width:100%;font-size:1.5rem;">
                <List :data="reconsStore.recons.map((recon, i) => i == selectedRecon ? 'Edit \'' + recon.name + '\'?' : recon.name)"
                      :selectedIndex="selectedRecon"
                      @onItemClick="ReconClicked" />
            </div>
            <div id="newReconRow">
                <label>Scramble:</label>
                <input style="flex-grow: 1;" v-model="newScramble" />
                <button @click="createRecon">+</button>
            </div>
        </div>
        <div id="COLUMN3" v-if="selectedRecon != -1">
            <FaceletCubeVisual style="width: 90%;position:relative;left:5%;border:3px solid white;padding:10px;"
                               :cube="reconPreviewCube"
                               :key="reconPreviewCube.corners.toString() + reconPreviewCube.edges.toString() + reconPreviewCube.centers.toString()" />
        </div>
    </div>
</template>

<style>
    .ReconSelect {
        display: grid;
        grid-template-columns: 35% 30% 35%;
        grid-template-rows: auto 1fr;
        color: var(--grey-100);
        height: 93vh;
    }

    #reconPreviewBody {
        width: 90%;
        border-inline: 3px solid white;
        border-block: 3px solid white;
        transform: translate(5%, 0%);
        padding-inline: 10px;
    }

    #reconPreview {
        text-wrap: pretty;
        word-break: break-word;
        transform: translate(0px, -5px);
    }

    #COLUMN2{
        display:flex;
        flex-direction: column;
        align-items: center;
    }

    #newReconRow{
        width: 100%;
        display:flex;
        gap: 5px;
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