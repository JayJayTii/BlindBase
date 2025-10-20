<script setup>
    import { computed, ref, inject, onMounted, onUnmounted } from 'vue'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    const confirmDialog = inject('confirmDialog')
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
        router.push(`/recons`)
    }

    const recon = computed({
        get: () => reconsStore.recons[props.reconIndex],
    })

    const scramble = new Sequence()
    scramble.setAlgorithmNotation(recon.value.scramble)
    const cube = ref(new FaceletCube())
    cube.value.TurnSequence(scramble)

    async function Delete() {
        if (!await confirmDialog.value.open('Are you sure you want to delete this reconstruction?')) {
            return
        }
        reconsStore.deleteRecon(props.reconIndex)
        ExitEdit()
    }

    const copyText = ref('Copy to clipboard')
    function CopyRecon() {
        navigator.clipboard.writeText(bodyRef.value.value)
        copyText.value = "Copied!"
        setTimeout(() => { copyText.value = "Copy to clipboard" }, 3000)
    }

    function ExportRecon() {
        let alg = bodyRef.value.value.substring(bodyRef.value.value.indexOf('\n'))
        while (alg[0] == '\n') {
            alg = alg.slice(1)
        }
        let url = `https://cubedb.net/?title=${encodeURIComponent(recon.value.name)}`
        url += `&scramble=${encodeURIComponent(recon.value.scramble)}`
        url += `&alg=${encodeURIComponent(alg)}`
        if (recon.value.hasOwnProperty('solve'))
            url += `&time=${encodeURIComponent(Math.round(JSON.parse(recon.value.solve).solveTime / 10) / 100)}`
        window.open(url, "_blank");
    }

    let intervalID = null
    let curSelectionEnd = 0
    let selectedID = ""
    const bodyRef = ref(null)
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        intervalID = setInterval(() => {
            if (curSelectionEnd === document.activeElement.selectionEnd && selectedID == document.activeElement.id)
                return
            curSelectionEnd = document.activeElement.selectionEnd
            selectedID = document.activeElement.id
            if (curSelectionEnd == undefined || selectedID !== "reconBodyInput") {
                cube.value = new FaceletCube()
                cube.value.TurnSequence(scramble)
                return
            }
            const currentAlgorithm = new Sequence()
            let inputText = bodyRef.value.value
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
            currentAlgorithm.setAlgorithmNotation(inputText)

            cube.value = new FaceletCube()
            cube.value.TurnSequence(currentAlgorithm)
        }, 50)
    })
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
        if (event.code === 'Enter') {
            ExitEdit()
        }
    }
</script>

<template>
    <div id="ReconEditContainer" v-if="reconIndex < reconsStore.recons.length">
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <input v-model="reconName" maxlength="30" id="reconNameInput" />
            <textarea ref="bodyRef"
                      v-model="reconBody"
                      id="reconBodyInput" />
        </div>

        <div></div>
    </div>
    <div style="position:fixed;right: 5%; top: 10%; width:45%;display:flex;flex-direction:column;gap:10px;">
        <FaceletCubeVisual :cube="cube" />
        <div style="display: flex; flex-direction: row; justify-content:space-between; width:100%;">
            <img src="@/assets/delete-bin.svg" @click="Delete()" style="width:50px;" class="CustomButton" />
            <div class="CustomButton" style=" width: 100px; height: 50px;"
                 @click="CopyRecon()">
                {{copyText}}
            </div>
            <div class="CustomButton" style="width:100px;height:50px;"
                 @click="ExportRecon()">
                Export to CubeDB
            </div>
            <img src="@/assets/arrow-right-long.svg"
                 style="height:50px;width:80px;"
                 class="CustomButton"
                 @click="ExitEdit()"></img>
        </div>
    </div>
</template>

<style>
    #ReconEditContainer{
        display: grid;
        grid-template-columns: 50% 50%;
        gap: 10px;
        width: 90%;
        transform: translate(5%, 20px);
    }

    #reconBodyInput {
        field-sizing: content;
        resize: none;
        font-size: 1.2rem;
        min-height: 50vh;
    }

    #reconNameInput {
        font-size: 3rem;
    }
</style>