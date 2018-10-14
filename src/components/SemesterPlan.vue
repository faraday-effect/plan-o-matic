<template>
    <div>
        <div id="round-stuff"></div>

        <h1 class="title">Outline</h1>
        <div class="content">
            <ol>
                <OutlineNode v-bind:node="schedule.outline.root"></OutlineNode>
            </ol>
        </div>

        <h1 class="title">Calendar</h1>
        <p>
            Course days {{ schedule.calendar.totalCourseDays() }},
            Class days {{ schedule.calendar.totalClassDays() }},
            Depth {{ schedule.outline.deepestLevel() }}
        </p>
        <table class="table is-narrow is-striped is-hoverable">
            <thead>
            <tr>
                <th>Wk</th>
                <th>Day</th>
                <th>%</th>
                <th>Date</th>
                <!--<th v-for="level in schedule.outline.deepestLevel() - 1">{{ level }}</th>-->
                <th>Topic</th>
                <th>Homework Due</th>
                <th>To Do</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(day, idx) of schedule.calendar.days"
                v-bind:key="idx"
                v-bind:class="{ 'has-background-grey-lighter': !day.isClassDay, nearestDay : day.nearestToToday, firstDayOfWeek: day.firstDayOfWeek }">
                <td>{{ day.firstDayOfWeek ? day.week : '' }}</td>
                <td>
                    <span v-if="day.isClassDay">D{{ day.nthCourseDay }} C{{ day.nthClassDay}}
                        R{{ remainingClassDays(day) }}</span>
                    <span v-else>D{{ day.nthCourseDay }}</span>
                </td>
                <td>{{ percentComplete(day) }}%</td>
                <td>{{ day.date | moment }}</td>
                <td>{{ day.topics.join(',') }}</td>
                <multi-line-table-datum v-bind:lines="day.assignments"></multi-line-table-datum>
                <multi-line-table-datum v-bind:lines="day.todos"></multi-line-table-datum>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    // import SVG from 'svg.js';
    import {getTheSchedule} from '../Schedule';
    import OutlineNode from "./OutlineNode";
    import MultiLineTableDatum from "./MultiLineTableDatum";

    export default {
        name: "Plan",
        components: {MultiLineTableDatum, OutlineNode},
        data: function () {
            return {
                schedule: getTheSchedule()
            };
        },
        methods: {
            percentComplete: function (day) {
                let pc = day.nthClassDay / this.schedule.calendar.totalClassDays() * 100.0;
                return pc.toFixed(0);
            },
            remainingClassDays: function (day) {
                return this.schedule.calendar.totalClassDays() - day.nthClassDay;
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
    .firstDayOfWeek {
        border-top-style: solid;
        border-top-color: #42b983;
        border-top-width: 2pt;
    }
    .nearestDay {
        border-color: #993300;
        border-style: solid;
        border-width: 2pt;
    }
</style>
