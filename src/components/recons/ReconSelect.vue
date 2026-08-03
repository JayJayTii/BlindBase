<script setup>
	import { ref, computed } from 'vue'
	import { useRouter } from 'vue-router'
	const router = useRouter()
	import { ElMessage, ElMessageBox } from 'element-plus'
	import { Sequence } from '@/helpers/sequence.js'
	import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
	import { OpenReconInCubeDB, OpenReconInAlgCubingNet } from '@/helpers/reconstruct.js'
	import { useReconsStore } from "@/stores/ReconsStore"
	const reconsStore = useReconsStore()

	import FaceletCube3D from '@/components/FaceletCube3D.vue'

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


	const selectedRecon = ref(null)
	let reconPreviewCube = new FaceletCube()
	const ReconClicked = (val) => {
		if (val == null || val.index >= reconsStore.recons.length) {
			selectedRecon.value = null
			return
		}

		selectedRecon.value = val.index
		//Apply the recon's scramble to a cube and show to the user
		reconPreviewCube = new FaceletCube()
		const scramble = new Sequence()
		scramble.fromAlgorithmNotation(reconsStore.recons[val.index].scramble)
		reconPreviewCube.TurnSequence(scramble)
	}

	if (reconsStore.recons.length > 0)
		ReconClicked(data.value[0])

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
		ElMessage('Reconstruction copied to clipboard')
	}
	function DeleteRecon(index) {
		const newSelectedRow = { index: (reconsStore.recons.length > 1 ? index - 1 : -1) }
		ReconClicked(newSelectedRow)
		reconsStore.deleteRecon(index)
	}

	function confirmDelete(reconIndex) {
		ElMessageBox.confirm(
			'Are you sure you want to delete \'' + data.value[reconIndex].name + '\'?',
			'Delete sheet',
			{ confirmButtonText: 'Confirm', cancelButtonText: 'Cancel', type: 'warning', }
		).then(() => { DeleteRecon(reconIndex) }).catch(() => { })
	}
</script>

<template>
	<div style="width: 100%; display: grid; grid-template-columns: 2fr 3fr; gap: 10px;">
		<div style="display: flex; flex-direction: column; gap:10px;">
			<el-select v-model="selectedRecon" placeholder="Create a reconstruction" style="width: 100%;">
				<el-option v-for="recon in data" :value="recon.index" @click="ReconClicked(recon)" :label="recon.name">
					{{recon.name}}
				</el-option>
				
				<template #empty>Click the + to create a reconstruction</template>
				<template #footer>
					<div style="display: flex; justify-content: end;">
						<el-button @click="dialogVisible = true" style="justify-content: center; height: 35px; width: 35px;">
							<el-icon :size="20"><Plus /></el-icon>
						</el-button>
					</div>
				</template>
			</el-select>
			<div v-if="selectedRecon != null && selectedRecon < reconsStore.recons.length">
				<FaceletCube3D style="aspect-ratio: 4/3;"
							   :cube="reconPreviewCube"
							   :key="reconPreviewCube.corners.toString() + reconPreviewCube.edges.toString() + reconPreviewCube.centers.toString()" />
			</div>
		</div>
		
		<div v-if="selectedRecon != null" style="display: flex; flex-direction: column; gap:10px;">
			<div style="display: flex; flex-direction: row;">
				<el-button @click="router.push(`/recons/${reconsStore.recons[selectedRecon].scramble}`)">
					<el-icon style="margin-right: 3px;"><Edit /></el-icon>
					Edit
				</el-button>
				<el-button @click="CopyRecon">
					<el-icon style="margin-right: 3px;"><CopyDocument /></el-icon>
					Copy
				</el-button>
				<el-button @click="OpenReconInCubeDB(data[selectedRecon].recon)">
					<el-icon style="margin-right: 3px;"><Notebook /></el-icon>
					CubeDB
				</el-button>
				<el-button @click="OpenReconInAlgCubingNet(data[selectedRecon].recon)">
					<el-icon style="margin-right: 3px;"><Notebook /></el-icon>
					alg.cubing.net
				</el-button>
				<el-button @click="confirmDelete(selectedRecon)">
					<el-icon style="margin-right: 3px;"><Delete /></el-icon>
					Delete
				</el-button>
			</div>
			<div style="overflow-y: auto;">
				<h2 style="font-size:2rem;" id="reconPreview">{{reconsStore.recons[selectedRecon]?.name || "&nbsp"}}</h2>
				<pre style="font-size:1.3rem;line-height:1.5rem;" id="reconPreview">{{reconsStore.recons[selectedRecon]?.body || "&nbsp"}}</pre>
			</div>
		</div>
	</div>


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