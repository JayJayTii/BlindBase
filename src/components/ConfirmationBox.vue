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
    width: 300px;
    transform: translate(-50%, -50%);
    padding: 10px;
    border-radius: 5px;
    z-index: 100;
    background-color: var(--error-200);
    color: var(--grey-800);
    font-weight: 600;
    text-align: center;
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
    background: rgba(0, 0, 0, 0.7);
    z-index: 99;
}
</style>
