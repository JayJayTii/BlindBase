<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const newScramble = ref("")
    function createRecon() {
        //Needed to actually reload the page, otherwise nothing happens
        router.push(`/reconCreate`).then(() => {
            router.push(`/recons/${newScramble.value}`)
        })
    }
</script>

<template>
    <div class="ReconSelect">
        <input v-model="newScramble" />
        <button @click="createRecon">Create</button>
    </div>
</template>

<style>
    .ReconSelect{
        display:flex;
    }
</style>