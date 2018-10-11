import moment from 'moment';

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ddmFormat = 'ddd/DD-MMM';

class Holiday {
    constructor(name, start, end = null) {
        this.name = name;
        this.start = moment(start);
        this.end = end ? moment(end) : start;
    }
}

class Semester {
    constructor(name, start, end, holidays) {
        this.name = name;
        this.start = moment(start);
        this.end = moment(end);
        this.holidays = holidays;
    }

    listHolidays() {
        let allHolidays = [];
        for (let holiday of this.holidays) {
            let dt = holiday.start;
            while (dt.isSameOrBefore(holiday.end)) {
                allHolidays.push(dt.clone());
                dt.add(1, 'day');
            }
        }
        return allHolidays;
    }
}

class Course {
    constructor(name, title, semester, days) {
        this.name = name;
        this.title = title;
        this.semester = semester;
        this.days = days;
    }

    static isInDateList(m, dateList) {
        for (let elt of dateList) {
            if (m.isSame(elt)) {
                return true;
            }
        }
        return false;
    }

    static inDayOfWeekList(dow, dowList) {
        return dowList.includes(dow);
    }

    listDates() {
        let dates = [];

        let instruction_start = this.semester.start;
        let instruction_end = this.semester.end;

        let m = instruction_start.clone();
        while (m.isSameOrBefore(instruction_end)) {
            if (Course.isInDateList(m, this.semester.listHolidays())) {
                // console.log(`Holiday ${m.format(ddmFormat)}`);
            } else if (!Course.inDayOfWeekList(daysOfWeek[m.day()], this.days)) {
                // console.log(`No class ${m.format(ddmFormat)}`);
            } else {
                dates.push(m.clone());
            }
            m.add(1, 'day');
        }

        return dates;
    }
}

class OutlineNode {
    constructor(type, props, children) {
        this.type = type;
        this.props = props || { };
        this.children = children;

        // Fix the title.
        if (this.type === 'org-data') {
            this.props.title = 'TOP LEVEL';
        } else {
            const m = this.props.title.match(/\[\[(.*?)\]\[(.*?)\]\]/);
            this.props.title = m ? m[2] : this.props.title;
        }
    }

    hasTag(tag) {
        return this.props.tags && this.props.tags.includes(tag);
    }

    indentedTitle() {
        return '|  '.repeat(this.props.level || 0) + this.props.title;
    }

    *traverse(node=this) {
        yield(node);
        for (let child of node.children) {
            yield* this.traverse(child);
        }
    }

    dump() {
        for (let node of this.traverse()) {
            console.log(node.indentedTitle());
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
                        console.log(node.indentedTitle(), `[${courseDates[classDay++].format(ddmFormat)}]`);
                    } else {
                        console.log(node.indentedTitle());
                    }
                    break;
                default:
                    console.error(`Unknown type ${node.type}`);
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

    let scheduler = new Scheduler(cos243Outline);

    // console.log("================ DUMP ================");
    scheduler.outline.dump();

    // console.log("================ SCHEDULE ================");
    scheduler.schedule(cos243);

    return scheduler;
}
