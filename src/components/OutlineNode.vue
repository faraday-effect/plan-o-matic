<template>
    <li>
        {{ node.props.title }}
        <span v-for="tag in node.props.tags">[{{ tag }}]</span>
        <span>{{ node.scheduledDate }}</span>
        <ol>
            <outline-node v-for="child in node.children"
                          v-bind:node="child"
                          v-bind:key="child.id"/>
        </ol>
    </li>
</template>

<script>
    export default {
        name: "OutlineNode",
        props: ['node']
    }
</script>

<style scoped>
</style>