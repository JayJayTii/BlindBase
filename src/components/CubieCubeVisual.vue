<script setup>
    import { CubieCube } from '@/helpers/kociemba/CubieCube'

    const props = defineProps({
        cube: {
            type: CubieCube,
            required: true
        }
    })

    const faceColours = [
        "#FFFFFF",
        "#FF0000",
        "#00FF00",
        "#FFFF00",
        "#FF8000",
        "#0000FF"
    ]

    //Face order: U R F D L B
    const cornerCubies = [
        [0, 1, 2], //URF
        [0, 2, 4], //UFL
        [0, 4, 5], //ULB
        [0, 5, 1], //UBR
        [3, 2, 1], //DFR
        [3, 4, 2], //DLF
        [3, 5, 4], //DBL
        [3, 1, 5], //DRB
    ]
    const edgeCubies = [
        [0, 1], //UR
        [0, 2], //UF
        [0, 4], //UL
        [0, 5], //UB
        [3, 1], //DR
        [3, 2], //DF
        [3, 4], //DL
        [3, 5], //DB
        [2, 1], //FR
        [2, 4], //FL
        [5, 4], //BL
        [5, 1], //BR
    ]

    function mirrored() {
        for (var i = 0; i < 8; i++) {
            if (props.cube.corners[i][1] >= 3) {
                return true
            }
        }
        return false
    }

    function getCornerCubieSticker(cubie, sticker) {
        let stickerIndex = ((sticker * (mirrored() ? -1 : 1)) + 9 - props.cube.corners[cubie][1]) % 3
        return faceColours[cornerCubies[props.cube.corners[cubie][0]][stickerIndex]]
    }
    function getEdgeCubieSticker(cubie, sticker) {
        return faceColours[edgeCubies[props.cube.edges[cubie][0]][(sticker + 2 - props.cube.edges[cubie][1]) % 2]]
    }
</script>

<template>
    <div class="CubieCubeVis">
        <div />
        <!--WHITE-->
        <div class="CubieCubeVisSide">
            <div :style="{ backgroundColor: getCornerCubieSticker(2, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(3, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(3, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(2, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: faceColours[0]}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(0, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(1, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(1, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(0, 0)}" class="CubieVisFacelet"/>
        </div>
        <div />
        <div />
        <!--ORANGE-->
        <div class="CubieCubeVisSide">
            <div :style="{ backgroundColor: getCornerCubieSticker(2, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(2, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(1, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(10, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: faceColours[4]}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(9, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(6, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(6, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(5, 1)}" class="CubieVisFacelet"/>
        </div>
        <!--GREEN-->
        <div class="CubieCubeVisSide">
            <div :style="{ backgroundColor: getCornerCubieSticker(1, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(1, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(0, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(9, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: faceColours[2]}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(8, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(5, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(5, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(4, 1)}" class="CubieVisFacelet"/>
        </div>
        <!--RED-->
        <div class="CubieCubeVisSide">
            <div :style="{ backgroundColor: getCornerCubieSticker(0, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(0, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(3, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(8, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: faceColours[1]}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(11, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(4, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(4, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(7, 1)}" class="CubieVisFacelet"/>
        </div>
        <!--BLUE-->
        <div class="CubieCubeVisSide">
            <div :style="{ backgroundColor: getCornerCubieSticker(3, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(3, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(2, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(11, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: faceColours[5]}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(10, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(7, 2)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(7, 1)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(6, 1)}" class="CubieVisFacelet"/>
        </div>
        <div />
        <!--YELLOW-->
        <div class="CubieCubeVisSide">
            <div :style="{ backgroundColor: getCornerCubieSticker(5, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(5, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(4, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(6, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: faceColours[3]}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(4, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(6, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getEdgeCubieSticker(7, 0)}" class="CubieVisFacelet"/>
            <div :style="{ backgroundColor: getCornerCubieSticker(7, 0)}" class="CubieVisFacelet"/>
        </div>
    </div>
</template>

<style>
    .CubieCubeVis{
        display:grid;
        grid-template-columns: 150px 150px 150px 150px;
    }
    .CubieCubeVisSide{
        display: grid;
        grid-template-columns: 50px 50px 50px;
        grid-template-rows: 50px 50px 50px;
        background-color: black;
        border-radius: 3px;
    }
    .CubieVisFacelet{
        border-radius: 3px;
        margin: 2px;
    }
</style>