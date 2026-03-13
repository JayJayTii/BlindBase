<script setup>
    import { nextTick, onMounted, onUnmounted, watch, toRefs } from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { renderCube } from '@/helpers/3D/FaceletCubeRenderer.js'
    
    const props = defineProps({
        cube: {
            type: FaceletCube,
            required: true
        }
    })
    const { cube } = toRefs(props);
    watch(cube, () => {
        renderCube(gl, canvas.width, canvas.height, xAngle, yAngle, props.cube) 
    });

    let canvas;
    let gl;
    let xAngle = -35.264
    let yAngle = 35.264

    nextTick(() => { 
        canvas = document.querySelector('canvas')
        window.onmousedown = mousedown
        window.onmouseup = mouseup
        window.onmousemove = mousemove
        gl = canvas.getContext('webgl')
        resize()
    })

    function resize() {
        canvas.width = parseInt(window.getComputedStyle(canvas).width)
        canvas.height = parseInt(window.getComputedStyle(canvas).height)
        gl.viewport(0, 0, canvas.width, canvas.height);
        renderCube(gl, canvas.width, canvas.height, xAngle, yAngle, props.cube) 
    }

    let dragging, lastMouseX, lastMouseY

    function mousedown() {
        const x = event.clientX
        const y = event.clientY
        var rect = canvas.getBoundingClientRect()
        if(rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            event.preventDefault() //Stop any text boxes being unselected
            dragging = true
            canvas.classList.add('dragging')
            canvas.classList.remove('notdragging')
            lastMouseX = x
            lastMouseY = y
        }
    }
    function mouseup() {
        dragging = false
        canvas.classList.remove('dragging')
        canvas.classList.add('notdragging')
    }
    function mousemove() {
        const x = event.clientX
        const y = event.clientY
        if(dragging) {
            const factor = 250 / canvas.height
            //y and x swapped because technically x rotation requires y mouse movement and vice versa
            xAngle -= factor * (y - lastMouseY)
            yAngle -= factor * (x - lastMouseX)
            if(xAngle > 90)       xAngle = 90
            else if(xAngle < -90) xAngle = -90
            
            renderCube(gl, canvas.width, canvas.height, xAngle, yAngle, props.cube)
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
    <div>
        <canvas id="faceletCubeCanvas" class="notdragging"></canvas>
    </div>
</template>

<style>
    #faceletCubeCanvas {
        width: 100%;
        height: 100%;
        background-color: var(--grey-700)
    }

    .notdragging {
        cursor: grab;
    }
    .dragging {
        cursor: grabbing;
    }
</style>