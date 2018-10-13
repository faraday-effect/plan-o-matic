import moment from 'moment';

const ddmFormat = 'ddd/DD-MMM';

class Holiday {
    constructor(name, start, end = null) {
        this.name = name;
        this.start = moment(start);
        this.end = end ? moment(end) : start;
    }

    includes(m) {
        return m.isBetween(this.start, this.end, null, '[]');
    }
}

class Semester {
    constructor(name, start, end, holidays) {
        this.name = name;
        this.start = moment(start);
        this.end = moment(end);
        this.holidays = holidays;
    }

    isHoliday(m) {
        for (let holiday of this.holidays) {
            if (holiday.includes(m)) {
                return holiday;
            }
        }
        return null;
    }
}

class CalendarDay {
    constructor(m) {
        this.m = m;
    }

    hasContent () {
        throw new Error('Override in subclass!');
    }
}

class ClassDay extends CalendarDay {
    constructor(m) {
        super(m);
        this.content = [];
    }

    hasContent() {
        return true;
    }
}

class OffDay extends CalendarDay {
    constructor(m, reason) {
        super(m);
        this.reason = reason;
    }

    hasContent() {
        return false;
    }
}

class Course {
    static validDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    constructor(name, title, semester, daysOfWeek) {
        this.name = name;
        this.title = title;
        this.semester = semester;

        if (!daysOfWeek.every(day => Course.isValidDayName(day))) {
            throw new Error(`Invalid day of week in ${daysOfWeek}`);
        }
        this.daysOfWeek = daysOfWeek;
        this.calendar = this.makeCourseCalendar();
    }

    static isValidDayName(dayName) {
        return Course.validDayNames.includes(dayName);
    }

    isClassDay(dayName) {
        return this.daysOfWeek.includes(dayName);
    }

    makeCourseCalendar() {
        let instruction_start = this.semester.start;
        let instruction_end = this.semester.end;
        let calendar = [];

        let m = instruction_start.clone();
        while (m.isSameOrBefore(instruction_end)) {
            if (this.isClassDay(Course.validDayNames[m.day()])) {
                let maybeHoliday = this.semester.isHoliday(m);
                if (maybeHoliday) {
                    calendar.push(new OffDay(m.clone(), maybeHoliday.name));
                } else {
                    calendar.push(new ClassDay(m.clone()));
                }
            }
            m.add(1, 'd');
        }

        return calendar;
    }
}

class OutlineNode {
    static nextId = 0;

    constructor(type, props, children) {
        this.type = type;
        this.props = props || {};
        this.children = children;

        this.id = OutlineNode.nextId++;

        // Fix the title.
        if (this.type === 'org-data') {
            this.props.title = 'TOP LEVEL';
        } else {
            const m = this.props.title.match(/\[\[(.*?)]\[(.*?)]]/);
            this.props.title = m ? m[2] : this.props.title;
        }
    }

    hasTag(tag) {
        return this.props.tags && this.props.tags.includes(tag);
    }

    * traverse(node = this) {
        yield(node);
        for (let child of node.children) {
            yield* this.traverse(child);
        }
    }
}

class Scheduler {
    constructor(orgOutline) {
        this.outline = Scheduler.outlineCourse(orgOutline);
    }

    static outlineCourse(orgOutline) {
        let [type, props, ...children] = orgOutline;
        return new OutlineNode(type,
            props,
            children.map(child => Scheduler.outlineCourse(child)));
    }

    schedule(course) {
        let classDay = 0;
        let courseDates = course.listDates();

        for (let node of this.outline.traverse()) {
            switch (node.type) {
                case 'org-data':
                    break;
                case 'headline':
                    if (node.hasTag('topic')) {
                        node.scheduledDate = courseDates[classDay++].format(ddmFormat);
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
    const fall2018 = new Semester("Fall 2018", "2018-08-27", "2018-12-07", [
        new Holiday("First Day", "2018-08-27"),
        new Holiday("Labor Day", "2018-09-03"),
        new Holiday("Fall Break", "2018-10-19", "2018-10-22"),
        new Holiday("Thanksgiving", "2018-11-21", "2018-11-25")
    ]);

    const mwf = ["Mon", "Wed", "Fri"];

    const cos243 = new Course("COS 243", "Multi-Tier Web App Dev", fall2018, mwf);
    //    cos343: new Course("COS 343", "Advanced Database Concepts", fall2018, mwf)

    // console.log(cos243);

    let scheduler = new Scheduler(cos243Outline);
    scheduler.schedule(cos243);
    return scheduler;
}
