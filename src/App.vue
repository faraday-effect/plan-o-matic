<template>
    <div id="app">
        <Plan/>
    </div>
</template>

<script>
    import Plan from './components/SemesterPlan.vue';

    export default {
        name: 'app',
        components: {
            Plan
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
