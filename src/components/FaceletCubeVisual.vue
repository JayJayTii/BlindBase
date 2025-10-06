<script setup>
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'

    const props = defineProps({
        cube: {
            type: FaceletCube,
            required: true
        }
    })

    const faceColours = [
        "#FFFFFF",
        "#FF8000",
        "#00FF00",
        "#FF0000",
        "#0000FF",
        "#FFFF00",
    ]

    function getCornerFaceletSticker(index){
        return faceColours[Math.floor(props.cube.corners[index] / 4)]
    }
    function getEdgeFaceletSticker(index){
        return faceColours[Math.floor(props.cube.edges[index] / 4)]
    }
    function getCenterFaceletSticker(index){
        return faceColours[props.cube.centers[index]]
    }
</script>

<template>
    <div class="FaceletCubeVis">
        <div />
        <!--WHITE-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: getCornerFaceletSticker(0)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(0)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(1)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(3)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCenterFaceletSticker(0)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(1)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(3)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(2)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(2)} " class="FaceletVisFacelet" />
        </div>
        <div />
        <div />
        <!--ORANGE-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: getCornerFaceletSticker(4)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(4)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(5)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(7)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCenterFaceletSticker(1)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(5)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(7)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(6)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(6)} " class="FaceletVisFacelet" />
        </div>
        <!--GREEN-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: getCornerFaceletSticker(8)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(8)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(9)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(11)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCenterFaceletSticker(2)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(9)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(11)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(10)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(10)} " class="FaceletVisFacelet" />
        </div>
        <!--RED-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: getCornerFaceletSticker(12)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(12)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(13)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(15)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCenterFaceletSticker(3)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(13)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(15)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(14)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(14)} " class="FaceletVisFacelet" />
        </div>
        <!--BLUE-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: getCornerFaceletSticker(16)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(16)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(17)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(19)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCenterFaceletSticker(4)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(17)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(19)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(18)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(18)} " class="FaceletVisFacelet" />
        </div>
        <div />
        <!--YELLOW-->
        <div class="FaceletCubeVisSide">
            <div :style="{ backgroundColor: getCornerFaceletSticker(20)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(20)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(21)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(23)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCenterFaceletSticker(5)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(21)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(23)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getEdgeFaceletSticker(22)} " class="FaceletVisFacelet" />
            <div :style="{ backgroundColor: getCornerFaceletSticker(22)} " class="FaceletVisFacelet" />
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