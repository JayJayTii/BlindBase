<script setup>
    import { ref } from 'vue'

    const visible = ref(false)
    const message = ref('')
    let resolveFn

    function open(msg) {
        message.value = msg
        visible.value = true
        return new Promise((resolve) => {
            resolveFn = resolve
        })
    }

    function confirm() {
        visible.value = false
        resolveFn(true)
    }

    function cancel() {
        visible.value = false
        resolveFn(false)
    }

    defineExpose({
        open
    })
</script>

<template>
    <div v-if="visible">
        <div id="confirmationBoxBackdrop"></div>
        <div class="ConfirmationBox">
            {{ message }}
            <div class="ConfirmationButtonRow">
                <button @click="confirm()">Yes</button>
                <button @click="cancel()">No</button>
            </div>
        </div>
    </div>
</template>

<style>
.ConfirmationBox {
    display: flex;
    flex-direction: column;
    position: fixed;
    justify-self: center;
    left: 50%;
    top: 50%;
    max-width: 20vw;
    transform: translate(-50%, -50%);
    padding: 10px;
    border-radius: 5px;
    z-index: 100;
    background-color: var(--brand-100);
}

.ConfirmationButtonRow {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

#confirmationBoxBackdrop {
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    width: 100vw;
    height: 93vh;
    background: rgba(256, 256, 256, 0.1);
    z-index: 99;
}
</style>
