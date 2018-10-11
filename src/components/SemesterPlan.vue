<template>
    <div>
        <p>Hello, Circle!</p>
        <div id="round-stuff"></div>
        <ol>
            <li v-for="title in titles">
                {{ title }}
            </li>
        </ol>
    </div>
</template>

<script>
    import SVG from 'svg.js';
    import { getTheSchedule } from '../Scheduler';

    export default {
        name: "Plan",
        data: function () {
            let schedule = getTheSchedule();
            let titles = [];
            for (let node of schedule.outline.traverse()) {
                titles.push(node.props.title);
            }
            return {
                titles
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