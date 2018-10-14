<template>
    <td>
        <span v-for="(line, idx) in lines"
              v-bind:key="idx">
            {{ line }}<br/>
        </span>
    </td>
</template>

<script>
    export default {
        name: "MultiLineTableDatum",
        props: ['lines']
    }
</script>

<style scoped>
</style>