<script setup>
	import { ref, computed, nextTick } from 'vue'
	import { ElMessage } from 'element-plus'
    import FaceletCube3D from '@/components/FaceletCube3D.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { useRouter } from 'vue-router'
    const router = useRouter()
    import { useReconsStore } from "@/stores/ReconsStore"
    const reconsStore = useReconsStore()
	reconsStore.loadState()

	const dialogVisible = ref(false)
    const newScramble = ref("")
    function createRecon() {
        //Done to avoid invalid scrambles in URL allowing for duplicate of the same real scramble
        const scrambleSequence = new Sequence()
        scrambleSequence.fromAlgorithmNotation(newScramble.value)
        router.push(`/recons/${scrambleSequence.toString()}`)
    }

	const data = computed({
		get: () => reconsStore.recons.map((recon, index) => ({
            index: index,
            name: recon.name,
            recon: recon,
		}))
	})

    const reconTableRef = ref(null)
    setTimeout(() => {
        if (data.value.length > 0 && reconTableRef.value) {
            reconTableRef.value.setCurrentRow(data.value[0])
        }
    }, 0)


    const selectedRecon = ref(-1)
	let reconPreviewCube = new FaceletCube()
    const ReconClicked = (val) => {
		if (!val || val.index == -1 || val.index >= reconsStore.recons.length)
            return

		selectedRecon.value = val.index
        //Apply the recon's scramble to a cube and show to the user
        reconPreviewCube = new FaceletCube()
        const scramble = new Sequence()
		scramble.fromAlgorithmNotation(reconsStore.recons[val.index].scramble)
        reconPreviewCube.TurnSequence(scramble)
    }

	const newScrambleInputRef = ref(null)
	function handleScrambleInputKeydown(event) {
        if ((event.code == 'Enter' || event.code == 'NumpadEnter') && newScramble.value.length > 0) {
            dialogVisible.value = false
            createRecon()
        }
    }

	const reconDropdownRef = ref(null)
	const triggerRefs = ref(Array(reconsStore.recons.length).fill(null))
    let reconDropdownOpen = false
    function optionsButtonClicked(row) {
		if (!reconDropdownOpen || row.index != selectedRecon.value) {
            reconDropdownRef.value.handleOpen()
        } else {
            reconDropdownRef.value.handleClose()
        }
        ReconClicked(row)
    }
    function visibleChange(isOpen) {
        reconDropdownOpen = isOpen
    }

	function CopyRecon() {
		navigator.clipboard.writeText(data.value[selectedRecon.value].recon.body)
		ElMessage('Reconstruction copied!')
	}
	function ExportRecon() {
		const recon = data.value[selectedRecon.value].recon
		let alg = recon.body.substring(recon.body.indexOf('\n'))
		while (alg[0] == '\n') {
			alg = alg.slice(1)
		}
		//CubeDB encodes a full reconstruction in the URL, so just cram it all in there
		let url = `https://cubedb.net/?title=${encodeURIComponent(recon.name)}`
		url += `&scramble=${encodeURIComponent(recon.scramble)}`
		url += `&alg=${encodeURIComponent(alg)}`
		if (recon.hasOwnProperty('solve'))
			url += `&time=${encodeURIComponent(Math.round(JSON.parse(recon.solve)[0] / 10) / 100)}`
        window.open(url, "_blank");
	}
	function DeleteRecon() {
        const deleteIndex = selectedRecon.value
		const newSelectedRow = { index: (reconsStore.recons.length > 1 ? selectedRecon.value - 1 : -1) }
		ReconClicked(newSelectedRow)
        reconsStore.deleteRecon(deleteIndex)
	}
</script>

<template>
    <el-splitter>
        <!-- left column (recon list) -->
        <el-splitter-panel size="22%" style="min-height: calc(100dvh - 190px);" :resizable="false">
            <!-- recon table -->
            <el-table :data="data" highlight-current-row ref="reconTableRef"
                      @current-change="ReconClicked"
                      row-class-name="table-row" header-row-class-name="recon-table-header"
                      style="border: 1px solid var(--el-border-color); border-radius: 4px;">
                <!-- recon name column -->
                <el-table-column prop="name" label="Reconstructions" />
                <!-- options button column -->
                <el-table-column label="" width="60" align="right">
                    <template #header>
                        <el-tooltip content="New" placement="right">
                            <el-button type="primary" :plain="true" @click="dialogVisible = true" style="width: 30px; height: 30px; margin-top: 5px;">
                                <el-icon :size="20"><Plus /></el-icon>
                            </el-button>
                        </el-tooltip>
                    </template>
                    <template #default="scope">
                        <el-button @click="optionsButtonClicked(scope.row)"
                                    :ref="el => triggerRefs[scope.row.index] = el"
                                   style="width: 20px; height: 20px; padding: 0px;" type="info" :plain="true">
                            <el-icon :size="15"><MoreFilled /></el-icon>
                        </el-button>
                    </template>
                </el-table-column>
                <template #empty>
                    &nbsp;
                </template>
            </el-table>
        </el-splitter-panel>
        <el-splitter-panel size="78%" :resizable="false">
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; width: 100%;">
                <!-- middle column (recon preview) -->
                <div v-if="selectedRecon != -1 && selectedRecon < reconsStore.recons.length" id="reconPreviewBody">
                    <h1 style="font-size:2rem;" id="reconPreview"><u>{{reconsStore.recons[selectedRecon]?.name || "&nbsp"}}</u></h1>
                    <pre style="font-size:1.3rem;line-height:1.5rem;" id="reconPreview">{{reconsStore.recons[selectedRecon]?.body || "&nbsp"}}</pre>
                </div>
                <!-- left column (cube vis) -->
                <div v-if="selectedRecon != -1 && selectedRecon < reconsStore.recons.length">
                    <FaceletCube3D style="width: 100%; aspect-ratio:1;"
                                   :cube="reconPreviewCube"
                                   :key="reconPreviewCube.corners.toString() + reconPreviewCube.edges.toString() + reconPreviewCube.centers.toString()" />
                </div>
            </div>
        </el-splitter-panel>
    </el-splitter>

    <!-- Dropdown when you click the options button -->
    <el-dropdown ref="reconDropdownRef" :virtual-ref="triggerRefs[selectedRecon]"
                 virtual-triggering @visibleChange="visibleChange"
                 trigger="contextmenu"
                 placement="bottom-start">
        <template #dropdown>
            <el-dropdown-menu style="height: 141px;">
                <el-dropdown-item icon="Edit" @click="router.push(`/recons/${reconsStore.recons[selectedRecon].scramble}`)">
                    Edit
                </el-dropdown-item>
                <el-dropdown-item icon="CopyDocument" @click="CopyRecon">
                    Copy to clipboard
                </el-dropdown-item>
                <el-dropdown-item icon="Notebook" @click="ExportRecon">
                    Open in CubeDB
                </el-dropdown-item>
                <el-popconfirm title="Are you sure?" @confirm="DeleteRecon">
                    <template #reference>
                        <el-button type="danger" :plain="true" style="position: absolute; right: 5px; bottom: 5px; height: 30px; width: 30px;">
                            <el-icon><Delete /></el-icon>
                        </el-button>
                    </template>
                </el-popconfirm>
                
            </el-dropdown-menu>
        </template>
    </el-dropdown>

    <!-- New recon dialog -->
    <el-dialog v-model="dialogVisible"
               title="Enter a scramble"
               width="500"
               @opened="newScrambleInputRef.focus()">
        <el-input v-model="newScramble" ref="newScrambleInputRef" @keydown="handleScrambleInputKeydown" :autofocus="true" />
        <template #footer>
            <div>
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" :disabled="newScramble.length == 0" @click="dialogVisible = false; createRecon()">Confirm</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style>
	#reconPreviewBody {
		padding: 10px;
	}

    #reconPreview {
        text-wrap: pretty;
        word-break: break-word;
    }

	.recon-table-header {
		font-size: 1.3rem;
	}

	.table-row {
		cursor: pointer;
	}

</style>