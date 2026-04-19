<script setup>
    import { nextTick, onMounted, onUnmounted, watch, ref, toRefs } from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { renderCube } from '@/helpers/3D/FaceletCubeRenderer.js'
    
    const props = defineProps({
        cube: {
            type: FaceletCube,
            required: true
        }
    })
    const { cube } = toRefs(props)
    watch(cube, () => {
		renderCube(gl, canvasRef.value.width, canvasRef.value.height, xAngle, yAngle, cube.value) 
    });

	const canvasRef = ref(null)
    let gl;
    let xAngle = -35.264
    let yAngle = 35.264

    nextTick(() => { 
        window.onmousedown = mousedown
        window.onmouseup = mouseup
        window.onmousemove = mousemove
		gl = canvasRef.value.getContext('webgl')
        resize()
    })

    function resize() {
		canvasRef.value.width = parseInt(window.getComputedStyle(canvasRef.value).width)
		canvasRef.value.height = parseInt(window.getComputedStyle(canvasRef.value).height)
		gl.viewport(0, 0, canvasRef.value.width, canvasRef.value.height);
		renderCube(gl, canvasRef.value.width, canvasRef.value.height, xAngle, yAngle, props.cube) 
    }

    let dragging, lastMouseX, lastMouseY

    function mousedown() {
        if (!canvasRef.value)
            return
        const x = event.clientX
        const y = event.clientY
		var rect = canvasRef.value.getBoundingClientRect()
        if(rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            event.preventDefault() //Stop any text boxes being unselected
            dragging = true
			canvasRef.value.classList.add('dragging')
			canvasRef.value.classList.remove('notdragging')
            lastMouseX = x
            lastMouseY = y
        }
    }
    function mouseup() {
        dragging = false
        if (!canvasRef.value)
            return
		canvasRef.value.classList.remove('dragging')
		canvasRef.value.classList.add('notdragging')
    }
    function mousemove() {
        const x = event.clientX
        const y = event.clientY
        if(dragging) {
			const factor = 250 / canvasRef.value.height
            //y and x swapped because technically x rotation requires y mouse movement and vice versa
            xAngle -= factor * (y - lastMouseY)
            yAngle -= factor * (x - lastMouseX)
            if(xAngle > 90)       xAngle = 90
            else if(xAngle < -90) xAngle = -9
			renderCube(gl, canvasRef.value.width, canvasRef.value.height, xAngle, yAngle, props.cube)
        }
        lastMouseX = x
        lastMouseY = y
    }

    onMounted(() => {
        window.addEventListener('resize', resize);
    })
    onUnmounted(() => {
        window.removeEventListener('resize', resize);
    })
    
</script>


<template>
    <div style="width: auto; height: auto;">
        <canvas ref="canvasRef" id="faceletCubeCanvas" class="notdragging"></canvas>
    </div>
</template>

<style>
	#faceletCubeCanvas {
		border: 1px solid var(--el-border-color);
		border-radius: 4px;
		width: 100%;
		height: 100%;
		background-color: var(--el-fill-color-lighter);
	}

    .notdragging {
        cursor: grab;
    }
    .dragging {
        cursor: grabbing;
    }
</style>