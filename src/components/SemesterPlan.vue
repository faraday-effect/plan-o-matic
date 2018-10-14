<template>
    <div>
        <div id="round-stuff"></div>

        <h3>Outline</h3>
        <ol>
            <OutlineNode v-bind:node="schedule.outline.root"></OutlineNode>
        </ol>

        <h3>Calendar</h3>
        <table border="1">
            <tr>
                <th>Week</th>
                <th>Date</th>
                <th>Topic</th>
                <th>Homework</th>
            </tr>
            <tr v-for="(day, idx) of schedule.calendar.days" v-bind:key="idx">
                <td></td>
                <td>{{ day.date | moment }}</td>
                <td>{{ day.topics.join(', ') }}</td>
                <td>{{ day.homework.join(', ') }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
    import SVG from 'svg.js';
    import {getTheSchedule} from '../Schedule';
    import OutlineNode from "./OutlineNode";

    export default {
        name: "Plan",
        components: {OutlineNode},
        data: function () {
            return {
                schedule: getTheSchedule(),
            };
        },
        // mounted: function () {
        //     let draw = SVG('round-stuff').size(300, 300);
        //     draw.rect(100, 100).attr({fill: '#f00'});
        //     draw.circle(42).attr({fill: '#97c4ff'});
        //
        //     let thingy = draw.group();
        //     thingy.rect(150, 150).x(70).y(70)
        //         .radius(10)
        //         .fill('none')
        //         .stroke({color: '#88f', width: 6});
        //     thingy.text('Th/04-Oct').move(50, 50);
        // }
    }

</script>

<style scoped>

</style>