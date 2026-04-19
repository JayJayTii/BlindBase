<script setup>
	import { useRouter } from 'vue-router'
	const router = useRouter()
    import { useSettingsStore } from '.././stores/SettingsStore'
    
    const settingsStore = useSettingsStore()
    settingsStore.loadState()
</script>

<template>
    <div style="text-align:center; display: flex; flex-direction: column; gap: 20px;">
        <div style="height: 10dvh;" />
        <el-text style="font-size: 5rem; color: var(--el-text-color-primary); font-weight: 600;">
            BlindBase
        </el-text>
        <el-text style="font-size: 1.5rem; width: min(700px, 100%)">
            Blindbase.net is a website that helps you learn the 3-Style method for the Rubik's Cube blindfolded.
        </el-text>


        <div id="home-view-cards">
            <el-card shadow="always" body-style="padding: 0px;">
                <div slot="header" class="el-card__header">
                    Sheets <el-button @click="router.push('/sheets')" type="primary" :plain="true">></el-button>
                </div>
                <div class="home-card-body">
                    Create algsheets for edges, corners, and images. You are given recommendations from <el-link href="https://bestsiteever.net/colpi/" target="_blank" underline="always">coLPI</el-link> and <el-link href="https://v2.blddb.net" target="_blank" underline="always">BLDDB</el-link> to quickly find your favourites.
                </div>
            </el-card>

            <el-card shadow="always" body-style="padding: 0px;">
                <div slot="header" class="el-card__header">
                    Flashcards <el-button @click="router.push('/cards')" type="primary" :plain="true">></el-button>
                </div>
                <div class="home-card-body">
                    Create flashcards for your algsheets in one click and revise them using spaced repetition inspired by <el-link href="https://apps.ankiweb.net/" target="_blank" underline="always">Anki</el-link>.
                </div>
            </el-card>

            <el-card shadow="always" body-style="padding: 0px;">
                <div slot="header" class="el-card__header">
                    Memo <el-button @click="router.push('/memo')" type="primary" :plain="true">></el-button>
                </div>
                <div class="home-card-body">
                    Practice memorisation by remembering longer and longer strings of letter pairs. You can choose what letter pairs you're given to practice more effectively. Inspired by Willian Pessoa's <el-link href="https://willian-pessoa.github.io/bld-trainer/" target="_blank" underline="always">Memo Trainer</el-link>.
                </div>
            </el-card>

            <el-card shadow="always" body-style="padding: 0px;">
                <div slot="header" class="el-card__header">
                    Exec <el-button @click="router.push('/exec')" type="primary" :plain="true">></el-button>
                </div>
                <div class="home-card-body">
                    Practice sets of algorithms that you are learning or receive corner/edge-only scrambles.
                </div>
            </el-card>

            <el-card shadow="always" body-style="padding: 0px;">
                <div slot="header" class="el-card__header">
                    Timer <el-button @click="router.push('/timer')" type="primary" :plain="true">></el-button>
                </div>
                <div class="home-card-body">
                    Time your solves with quick access to the reconstruction tool in case you get a notable solve. Get statistics on each stage of the solve and find out what your averages <i>would</i> have been if you didn't DNF. Inspired (of course) by <el-link href="https://cstimer.net/" target="_blank" underline="always">csTimer</el-link>.
                </div>
            </el-card>

            <el-card shadow="always" body-style="padding: 0px;">
                <div slot="header" class="el-card__header">
                    Reconstructions <el-button @click="router.push('/recons')" type="primary" :plain="true">></el-button>
                </div>
                <div class="home-card-body">
                    Reconstruct your 3-Style solves <i>fast</i>, with cycles finished for you and algorithms taken from your algsheets automatically.
                </div>
            </el-card>
        </div>
    </div>
</template>

<style>
	#home-view-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));
		gap: 20px;
		padding: 20px;
        aspect-ratio: 3;
	}

	#home-view-cards .el-card .el-card__header {
		display: flex;
		justify-content: space-between;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.home-card-body {
		margin-top: 10px;
        padding: 10px;
	}
</style>