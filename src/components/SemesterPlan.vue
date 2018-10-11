<template>
    <div>
        <h3>Hello, Circle!</h3>
        <div id="round-stuff"></div>

        <ol>
            <OutlineNode v-bind:node="schedule.outline"></OutlineNode>
        </ol>
    </div>
</template>

<script>
    import SVG from 'svg.js';
    import { getTheSchedule } from '../Scheduler';
    import OutlineNode from "./OutlineNode";

    export default {
        name: "Plan",
        components: {OutlineNode},
        data: function () {
            return {
                schedule: getTheSchedule(),
            };
        },
        mounted: function () {
            let draw = SVG('round-stuff').size(300, 300);
            draw.rect(100, 100).attr({fill: '#f00'});
            draw.circle(42).attr({fill: '#97c4ff'});

            let thingy = draw.group();
            thingy.rect(150, 150).x(70).y(70)
                .radius(10)
                .fill('none')
                .stroke({color: '#88f', width: 6});
            thingy.text('Th/04-Oct').move(50, 50);
        }
    }

</script>

<style scoped>

</style>