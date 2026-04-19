<script setup>
    import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
    import FaceletCube3D from '@/components/FaceletCube3D.vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
    reconsStore.loadState()
    import { useRouter } from 'vue-router'
    const router = useRouter()

    //Only able to edit a recon that is already saved and stored
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
        router.push(`/recons`)
    }

    const recon = computed({
        get: () => reconsStore.recons[props.reconIndex],
    })

    const scramble = new Sequence()
    scramble.fromAlgorithmNotation(recon.value.scramble)
    const cube = ref(new FaceletCube())
    cube.value.TurnSequence(scramble) //Apply the scramble to the cube visualisation by default

    let intervalID = null
    let curSelectionEnd = 0
    let selectedID = ""
    const bodyRef = ref(null)
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        intervalID = setInterval(() => {
            if (curSelectionEnd === document.activeElement.selectionEnd && selectedID == document.activeElement.id)
                return
            //Update the cube visualisation to match the place in the reconstuction where the typing caret is at
            curSelectionEnd = document.activeElement.selectionEnd
            selectedID = document.activeElement.id
            if (curSelectionEnd == undefined || selectedID !== "reconBodyInput") {
                cube.value = new FaceletCube()
                cube.value.TurnSequence(scramble)
                return
            }
            const currentAlgorithm = new Sequence()
            let inputText = reconBody.value
            let sampleIndex = curSelectionEnd
            while (!(inputText[sampleIndex - 1] == ' ' || inputText[sampleIndex - 1] == '\n'
                || inputText[sampleIndex] == ' ' || inputText[sampleIndex] == '\n'
                || sampleIndex == 0 || sampleIndex >= inputText.length)) {
                sampleIndex++
            }
            if (inputText[sampleIndex] === '/' && inputText[sampleIndex - 1] !== '/')
                sampleIndex--

            inputText = inputText.substring(0, sampleIndex)
            let inputTextLines = inputText.split('\n')
            inputText = ""
            for (var i = 0; i < inputTextLines.length; i++) {
                const commentIndex = inputTextLines[i].indexOf('//')
                inputText += (commentIndex == -1 ? inputTextLines[i] : inputTextLines[i].substring(0, commentIndex)) + " "
            }
            currentAlgorithm.fromAlgorithmNotation(inputText)

            cube.value = new FaceletCube()
            cube.value.TurnSequence(currentAlgorithm)
        }, 50)
    })

    function cubeVisClicked() {
        if(document.activeElement === bodyRef.value)
            bodyRef.value.focus()
    }

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
        if (intervalID !== null) {
            clearInterval(intervalID)
        }
    })

    function handleKeydown(event) {
        const el = document.activeElement
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
            return
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            ExitEdit()
        }
    }
</script>

<template>
    <div style="display: flex; flex-direction: row; padding: 20px; gap: 20px;">
        <div id="ReconEditContainer" v-if="reconIndex < reconsStore.recons.length">
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <el-input size="large" title="Name" v-model="reconName" maxlength="50" id="reconNameInput" />
                <el-input ref="bodyRef" 
                          v-model="reconBody"
                          id="reconBodyInput"
                          type="textarea"
                          autosize
                          maxlength="4000" />
            </div>

            <div></div>
        </div>
        <div style="position: sticky; top: 20px; width: 40%; align-self: flex-start; display: flex; flex-direction: column; gap: 10px; ">
            <div style="width: 100%; aspect-ratio: 4/3; max-height: 70vh;">
                <FaceletCube3D :cube="cube" style="height: 100%;" />
            </div>
            <el-button style="width: 80px; height: 30px; align-self: end;" type="success"
                       @click="ExitEdit()">
                Confirm
            </el-button>
        </div>
    </div>
</template>

<style>
    #ReconEditContainer{
        gap: 10px;
        width: 60%;
    }

    #reconBodyInput {
        resize: none;
        font-size: 1.2rem;
    }

    #reconNameInput {
        font-size: 1.5rem;
    }
</style>