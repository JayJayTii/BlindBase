<script setup>
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'

    const props = defineProps({
        cube: {
            type: FaceletCube,
            required: true
        }
    })
</script>

<template>
    <div class="FaceletCubeVis">
        <div />
        <!--WHITE-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(0)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(0)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(1)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(3)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCenterFaceletSticker(0)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(1)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(3)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(2)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(2)} " class="FaceletVisFacelet" />
        </div>
        <div />
        <div />
        <!--ORANGE-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(4)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(4)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(5)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(7)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCenterFaceletSticker(1)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(5)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(7)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(6)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(6)} " class="FaceletVisFacelet" />
        </div>
        <!--GREEN-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(8)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(8)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(9)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(11)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCenterFaceletSticker(2)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(9)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(11)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(10)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(10)} " class="FaceletVisFacelet" />
        </div>
        <!--RED-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(12)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(12)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(13)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(15)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCenterFaceletSticker(3)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(13)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(15)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(14)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(14)} " class="FaceletVisFacelet" />
        </div>
        <!--BLUE-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(16)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(16)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(17)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(19)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCenterFaceletSticker(4)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(17)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(19)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(18)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(18)} " class="FaceletVisFacelet" />
        </div>
        <div />
        <!--YELLOW-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(20)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(20)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(21)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(23)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCenterFaceletSticker(5)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(21)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(23)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getEdgeFaceletSticker(22)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: cube.getCornerFaceletSticker(22)} " class="FaceletVisFacelet" />
        </div>
    </div>
</template>

<style>
    .FaceletCubeVis {
        aspect-ratio: 4/3;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }

    .FaceletCubeVisSide {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        background-color: black;
        border: 1px solid black;
        border-radius: 3px;
        aspect-ratio: 1;
    }

     .FaceletVisFacelet {
        border-radius: 5%;
        margin: 2px;
    }
</style>