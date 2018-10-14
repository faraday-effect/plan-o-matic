<template>
    <div>
        <div id="round-stuff"></div>

        <h3>Outline</h3>
        <ol>
            <OutlineNode v-bind:node="schedule.outline.root"></OutlineNode>
        </ol>

        <h3>Calendar</h3>
        <h4>
            Course days {{ schedule.calendar.totalCourseDays() }},
            Class days {{ schedule.calendar.totalClassDays() }}
        </h4>
        <table border="1">
            <tr>
                <th>W</th>
                <th>D</th>
                <th>%</th>
                <th>Date</th>
                <th>Topic</th>
                <th>Homework Due</th>
                <th>To Do</th>
            </tr>
            <tr v-for="(day, idx) of schedule.calendar.days"
                v-bind:key="idx"
                v-bind:class="{ fixedDate: !day.isClassDay }">
                <td>{{ day.week }}</td>
                <td>
                    D{{ day.nthClassDay}} C{{ day.nthCourseDay }} R{{ remainingClassDays(day) }}
                </td>
                <td>
                    {{ percentComplete(day) }}%
                </td>
                <td>{{ day.date | moment }}</td>
                <td>{{ day.topics.join(',') }}</td>
                <multi-line-table-datum v-bind:lines="day.assignments"></multi-line-table-datum>
                <multi-line-table-datum v-bind:lines="day.todos"></multi-line-table-datum>
            </tr>
        </table>
    </div>
</template>

<script>
    import SVG from 'svg.js';
    import {getTheSchedule} from '../Schedule';
    import OutlineNode from "./OutlineNode";
    import MultiLineTableDatum from "./MultiLineTableDatum";

    export default {
        name: "Plan",
        components: {MultiLineTableDatum, OutlineNode},
        data: function () {
            return {
                schedule: getTheSchedule(),
            };
        },
        methods: {
            percentComplete(day) {
                let pc = day.nthClassDay / this.schedule.calendar.totalClassDays() * 100.0;
                return pc.toFixed(0);
            },
            remainingClassDays(day) {
                return this.schedule.calendar.totalClassDays() - day.nthClassDay + 1;
            }
        }
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
    .fixedDate {
        background-color: #97c4ff;
    }
</style>
