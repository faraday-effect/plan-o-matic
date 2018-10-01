<template>
    <div>
        <p>Hello, Circle!</p>
        <div id="round-stuff"></div>
    </div>
</template>

<script>
    import SVG from 'svg.js';

    export default {
        name: "MyCircle",
        mounted: function () {
            let draw = SVG('round-stuff').size(300, 300);
            draw.rect(300, 300).attr({ fill: null, stroke: '#f06'});
            draw.rect(100, 100).attr({ fill: '#f06' });
            draw.circle(42).attr({fill: '#97c4ff'});
        }
    }
</script>

<style scoped>

</style>