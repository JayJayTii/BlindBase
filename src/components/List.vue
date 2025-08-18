<script setup>
    const props = defineProps({
        data: Array,
        selectedIndex: Number,
    })
    const emit = defineEmits(['onItemClick'])
</script>

<template>
    <!--Add a non-breaking space if the label is empty so that it still appears-->
    <div v-for="(label, index) in data"
         :class="['ListItem', selectedIndex === index ? 'ListItemSelected' : 'ListItemUnselected']"
         @click="emit('onItemClick',index)">
        {{label != "" ? label : "&nbsp;"}}
    </div>
</template>

<style>
    .ListItem {
        background-color: var(--grey-600);
        border: 1px solid var(--panel-color);
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        justify-content:center;
        text-align:center;
        font-size: 1rem;
        text-overflow: ellipsis;
    }
        .ListItem:hover {
            background-color: var(--grey-500);
        }


    .ListItemSelected {
        background-color: var(--grey-100);
        color: var(--grey-900);
        font-weight: bold;
    }
        .ListItemSelected:hover {
            background-color: var(--grey-100);
        }
</style>