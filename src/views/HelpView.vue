<script setup>
    const emit = defineEmits(['closeHelp'])

    function closeHelp() {
        emit("closeHelp")
    }
</script>

<template>
    <div class="Help">
        <div style="font-size: 4rem; font-weight: bold; color:var(--grey-100);">
            Welcome to BlindBase!
        </div>
        This is a website that helps you learn the 3-Style method for the Rubik's Cube blindfolded.
        <br />
        There are 6 tools which interact with each other to improve your 3-Style journey.
        <br />
        <div style="align-self:center; justify-content:center; display: grid; grid-template-columns: repeat(3, 33.333%); width: 90%; column-gap: 10px;">
            <h1>Sheets:</h1>
            <h1>Cards:</h1>
            <h1>Memo:</h1>
            <div class="helpToolDesc">Create algsheets for Edges, Corners, and Images. You will get recommendations from <a href="https://bestsiteever.net/colpi/">coLPI</a> and <a href="https://v2.blddb.net">BLDDB</a> to quickly fill your sheets.</div>
            <div class="helpToolDesc">Create flashcards for each algorithm in your algsheets. Uses spaced repetition and a daily new card limit inspired by <a href="https://apps.ankiweb.net/">Anki</a>.</div>
            <div class="helpToolDesc">Memorise a string of letter pairs. You can be given letter pairs that are only in your Images sheet to target them better. Inspired by Willian Pessoa's <a href="https://willian-pessoa.github.io/bld-trainer/">Memo Trainer</a>.</div>

            <h1>Exec:</h1>
            <h1>Timer:</h1>
            <h1>Recons:</h1>
            <div class="helpToolDesc">Practice specific algorithms, or be given corner/edge-only scrambles. You can practice from a specific algsheet or card-deck.</div>
            <div class="helpToolDesc">Time your solves, built with shortcuts and quick access to the reconstruction tool. Inspired (of course) by <a href="https://cstimer.net/">csTimer</a>.</div>
            <div class="helpToolDesc">Reconstruct your 3-Style solves quickly, with whole cycles finished for you and algorithms taken from your algsheets automatically.</div>
        </div>
        <br />
        To see this menu again, click the ? on the top-right of the screen!
        <br />
        <br />
        <button id="closeButton" @click="closeHelp" style="align-self:center; width: 100px;font-size: 1.6rem;">Got it!</button>
        <br />
    </div>
</template>

<style>
    .Help {
        width: 80vw;
        background-color: var(--grey-800);
        border: 4px solid var(--brand-700);
        border-radius: 10px;
        z-index: 100;
        color: var(--text-color);
        display:flex;
        flex-direction:column;
        padding: 4px;
        overflow-y: auto;
        text-align: center;
        font-size: 1.2rem;
    }

    .helpToolDesc{
        background-color: var(--brand-800);
        border: 4px solid var(--brand-600);
        border-radius: 4px;
        padding: 5px;
    }

</style>
