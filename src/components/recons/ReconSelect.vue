<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
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
        if (newScramble.value == "") {
            alert("Please enter a scramble")
            return
        }

        //Done to avoid invalid scrambles in URL allowing for duplicate of the same real scramble
        const scrambleSequence = new Sequence()
        scrambleSequence.setAlgorithmNotation(newScramble.value)
        console.log(newScramble.value + "  " + scrambleSequence.toString())
        router.push(`/recons/${scrambleSequence.toString()}`)
    }

    const selectedRecon = ref(-1)
    let reconPreviewCube = new FaceletCube()
    function ReconClicked(index) {
        if (index == -1)
            return

        if (index == selectedRecon.value) { //Edit this recon
            router.push(`/recons/${reconsStore.recons[index].scramble}`)
            return
        }
        selectedRecon.value = index
        reconPreviewCube = new FaceletCube()
        const scramble = new Sequence()
        scramble.setAlgorithmNotation(reconsStore.recons[index].scramble)
        reconPreviewCube.TurnSequence(scramble)
    }

    function handleKeydown(event) {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
            ReconClicked(selectedRecon.value)
            return
        }
        if (event.code === "ArrowUp" || event.code === "ArrowLeft") {
            ReconClicked((selectedRecon.value == -1) ? (reconsStore.recons.length - 1) : ((selectedRecon.value - 1 + reconsStore.recons.length) % reconsStore.recons.length))
        }
        else if (event.code === "ArrowDown" || event.code === "ArrowRight") {
            ReconClicked((selectedRecon.value == -1) ? 0 : (selectedRecon.value + 1) % reconsStore.recons.length)
        }
    }
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <div style="display:flex;flex-direction:column;">
        <div class="ReconSelect">
            <div />
            <div style="align-content:center;">
                <div class="PanelHeader" style="font-size: min(2.5rem,3vw); height: min(3.5rem,5vw);">
                    Reconstructions:
                </div>
            </div>
            <div />

            <div id="COLUMN1">
                <div v-if="selectedRecon != -1" id="reconPreviewBody">
                    <h1 style="font-size:2rem;" id="reconPreview"><u>{{reconsStore.recons[selectedRecon].name || "&nbsp"}}</u></h1>
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
                    <button title="Create reconstruction with this scramble" @click="createRecon">+</button>
                </div>
            </div>
            <div id="COLUMN3" v-if="selectedRecon != -1">
                <FaceletCubeVisual style="width: 90%; position: relative; left: 5%; border: 3px solid var(--grey-100); padding: 10px; border-radius: 5px;"
                                   :cube="reconPreviewCube"
                                   :key="reconPreviewCube.corners.toString() + reconPreviewCube.edges.toString() + reconPreviewCube.centers.toString()" />
            </div>
        </div>
        <div style="height:100px;"></div>
    </div>
</template>

<style>
    .ReconSelect {
        display: grid;
        grid-template-columns: 35% 30% 35%;
        grid-template-rows: calc(min(3.5rem,5vw) + 15px) 1fr;
        color: var(--grey-100);
    }

    #reconPreviewBody {
        width: 90%;
        border-inline: 3px solid var(--grey-100);
        border-block: 3px solid var(--grey-100);
        border-radius: 5px;
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
        gap: 5px;
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