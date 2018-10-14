import moment from 'moment';

class FixedDate {
    constructor(name, start, end = null) {
        this.name = name;
        this.start = moment(start);
        this.end = end ? moment(end) : start;
    }

    includes(date) {
        return date.isBetween(this.start, this.end, null, '[]');
    }
}

class Semester {
    constructor(details) {
        this.name = details.name;
        this.start = moment(details.start);
        this.end = moment(details.end);
        this.fixedDates = details.fixedDates;
    }
}

function validateDayNames(dayNames) {
    const validDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (!dayNames.every(name => validDayNames.includes(name))) {
        throw new Error(`Invalid day name in ${dayNames}`);
    }
}

class Course {
    constructor(details) {
        this.name = details.name;
        this.title = details.title;
        this.semester = details.semester;

        validateDayNames(details.daysOfWeek);
        this.daysOfWeek = details.daysOfWeek;

        this.fixedDates = details.fixedDates || [];
    }

    isClassDay(date) {
        return this.daysOfWeek.includes(date.format('ddd'));
    }

    isFixedDate(date) {
        for (let fixedDate of [...this.fixedDates, ...this.semester.fixedDates]) {
            if (fixedDate.includes(date)) {
                return fixedDate;
            }
        }
        return null;
    }
}

class OutlineNode {
    static nextId = 0;

    constructor(type, props, children) {
        this.id = OutlineNode.nextId++;
        this.type = type;
        this.props = {};
        this.children = children;

        if (type == 'org-data') {
            this.props.title = 'TOP LEVEL';
            this.props.tags = [];
        } else if (type == 'headline') {
            let m = props.title.match(/\[\[(.*?)]\[(.*?)]]/);
            this.props.title = m ? m[2] : props.title;
            this.props.tags = props.tags;
            this.props.level = props.level;
        } else {
            throw new Error(`Unhandled type ${type}`);
        }
    }

    hasTag(tag) {
        return this.props.tags && this.props.tags.includes(tag);
    }
}

class Outline {
    constructor(orgOutline) {
        this.orgOutline = orgOutline;
        this.root = Outline.convertOrgOutline(orgOutline);
    }

    static convertOrgOutline(orgOutline) {
        let [type, props, ...children] = orgOutline;
        return new OutlineNode(type, props, children.map(child => Outline.convertOrgOutline(child)));
    }

    * nodes(node = this.root) {
        yield(node);
        for (let child of node.children) {
            yield* this.nodes(child);
        }
    }
}

class CalendarDay {
    constructor(details) {
        this.date = details.date;
        this.week = details.week;       // Week within the semester
        this.nthCourseDay = details.nthCourseDay;       // Index of all course days
        this.nthClassDay = details.nthClassDay;       // Index of only class days
        this.isClassDay = details.isClassDay;   // Is this a class day (vs. a fixed ate)?
        this.topics = [];
        this.assignments = [];
        this.todos = [];
    }

    addTopic(topic) {
        this.topics.push(topic);
    }

    addAssignment(assignment) {
        this.assignments.push(assignment);
    }

    addTodo(todo) {
        this.todos.push(todo);
    }
}

class Calendar {
    constructor(course) {
        this.days = [];
        this.nextCourseDay = 1;
        this.nextClassDay = 1;

        let semester = course.semester;
        let instruction_start = semester.start;
        let instruction_end = semester.end;

        let date = instruction_start.clone();
        while (date.isSameOrBefore(instruction_end)) {
            if (course.isClassDay(date)) {
                let calDay = null;
                let calDayData = {
                    date: date.clone(),
                    week: this.weekOf(date),
                    nthCourseDay: this.nextCourseDay++
                };
                let maybeFixedDate = course.isFixedDate(date);
                if (maybeFixedDate) {
                    calDay = new CalendarDay({
                        ...calDayData,
                        isClassDay: false,
                        nthClassDay: this.nextClassDay
                    });
                    calDay.addTopic(maybeFixedDate.name);
                } else {
                    calDay = new CalendarDay({
                        ...calDayData,
                        isClassDay: true,
                        nthClassDay: this.nextClassDay++
                    });
                }
                this.days.push(calDay);
            }
            date.add(1, 'd');
        }
    }

    weekOf(date) {
        if (this.days.length === 0) {
            return 1;
        }
        return date.week() - this.days[0].date.week() + 1;
    }

    totalCourseDays() {
        return this.nextCourseDay - 1;
    }

    totalClassDays() {
        return this.nextClassDay - 1;
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max))
}

class ClassDayCursor {
    constructor(calendar) {
        this.classDays = calendar.days.filter(day => day.isClassDay);
        this.cursor = 0;
        this.pristine = true;
        this.lastIdx = this.classDays.length - 1;
    }

    current() {
        return this.classDays[this.cursor];
    }

    markDirty() {
        this.pristine = false
    }

    advance() {
        this.markDirty();
        this.cursor = clamp(this.cursor + 1, 0, this.lastIdx);
    }

    advanceUnlessPristine() {
        if (!this.pristine) {
            this.advance();
        }
    }

    offset(n) {
        const idx = clamp(this.cursor + n, 0, this.lastIdx);
        return this.classDays[idx];
    }
}

class Schedule {
    constructor(course, orgOutline) {
        this.course = course;
        this.outline = new Outline(orgOutline);
        this.calendar = new Calendar(course);

        const cursor = new ClassDayCursor(this.calendar);
        for (let node of this.outline.nodes()) {
            switch (node.type) {
                case 'org-data':
                    break;
                case 'headline':
                    if (node.hasTag('topic')) {
                        cursor.advanceUnlessPristine();
                        let classDay = cursor.current();
                        classDay.addTopic(node.props.title);
                        node.calendarDay = classDay;
                        cursor.markDirty();
                    } else if (node.hasTag('before')) {
                        cursor.offset(-2).addTodo(`Prep ${node.props.title}`);
                        cursor.offset(-1).addTodo(`Assign ${node.props.title}`);
                        cursor.offset(0).addAssignment(node.props.title);
                        cursor.offset(1).addTodo(`Grade ${node.props.title}`);
                    } else if (node.hasTag('after')) {
                        cursor.offset(-1).addTodo(`Prep ${node.props.title}`);
                        cursor.offset(0).addTodo(`Assign ${node.props.title}`);
                        cursor.offset(1).addAssignment(node.props.title);
                        cursor.offset(2).addTodo(`Grade ${node.props.title}`);
                    }
                    break;
                default:
                    throw new Error(`Unknown node type ${node.type}`);
            }
        }

    }
}

import cos243Outline from './sample-data';

export function getTheSchedule() {
    const fall2018 = new Semester({
        name: "Fall 2018",
        start: "2018-08-27",
        end: "2018-12-07",
        fixedDates: [
            new FixedDate("First Day", "2018-08-27"),
            new FixedDate("Labor Day", "2018-09-03"),
            new FixedDate("Senior/Freshmen Retreat", "2018-10-05"),
            new FixedDate("Fall Break", "2018-10-19", "2018-10-22"),
            new FixedDate("Thanksgiving", "2018-11-21", "2018-11-25"),
            new FixedDate("Exam 1", "2018-10-15")
        ]
    });

    const mwf = ["Mon", "Wed", "Fri"];

    const cos243 = new Course({
        name: "COS 243",
        title: "Multi-Tier Web App Dev",
        semester: fall2018,
        daysOfWeek: mwf,
        fixedDates: [
            new FixedDate("Speak in COS 104", "2018-09-24")
        ]
    });

    //    cos343: new Course("COS 343", "Advanced Database Concepts", fall2018, mwf)

    return new Schedule(cos243, cos243Outline);
}