/* eslint-disable no-unused-vars */
// Grade Dashboard Component table

// A Vue instance option defined for displaying university course grade records in table format
export default {
    props: {
        data: Object,
        columns: Array
    }, 
    data (){
        return {
            LETTER_TO_GPA: {65: 4, 66: 3, 67: 2, 68: 1, 70: 0},
            isCollapsed: false,
        }
    },
    computed: {
        
    },
    methods: {
        filteredData(category) {
            const subsetObjectProperties = ({ subject, unit, letter_evaluation, gpa, year, quarter, subject_number, course_id, prinstructor, last_updated }) => ({ subject, unit, letter_evaluation, gpa, year, quarter, subject_number, course_id, prinstructor, last_updated });
            return this.data.course_grades
                        .filter(e => typeof(category) === 'string' ? e['category'] === category : e => true)
                        .map(o => subsetObjectProperties(o))
                        // .reduce((arr, entry) => {
                        //     delete entry['category'];
                        //     arr.push(entry)
                        //     return arr }, [])
        }, 

        /* Function to calculate summary statistics from <GPA.course_grades>
         * @param {String} category  -- the category of the scope of summary
         * @param {String} year -- a string indicates the year the course is taken
         * @param {String} quarter -- a string indicates the quartor the course is taken (e.g. {'前', '前期集中', '後', '後期集中', '春学期', '夏学期', '秋学期', '冬学期', '通年'})
         * @returns {Array<number>} [passed_units, average gpa]
         */
        aggregate(category, year, quarter) {
            // - Select the specified <category>
            // - Not including withdrawn
            const course_grades = this.data.course_grades;
            const grade_statistics = course_grades
                .filter(e => [65, 66, 67, 68, 70].includes(e['letter_evaluation'].charCodeAt(0) - 65248))
                .filter(e => typeof(category) === 'string' ? e['category'] === category : true)
                .filter(e => typeof(year) === 'string' ? e['year'] === year : true)
                .filter(e => typeof(quarter) === 'string' ? e['quarter'] === quarter : true)
                .reduce((agg, e)=>{
                    const unit = parseFloat(e['unit']),
                        letter = e['letter_evaluation'].charCodeAt(0) - 65248,
                        gpa = parseFloat(e['gpa']);
                    if (e['subject'] == '基幹教育セミナー') {
                        // console.log(gpa === 0 && letter === 70);
                    }
                    if (letter === 82) { // == 'R'
                        agg[String.fromCharCode(letter)][0] += unit;
                        agg['passed_units'] += unit;
                    } else if(gpa === 0 && letter === 70){ // == 'F'
                        agg['total_gpa_units'] += unit;
                        agg['F'][0] += unit;
                        // console.log(e['subject'], e['letter_evaluation'])
                    } else if ([65, 66, 67, 68].includes(letter)){ // == 'A, B, C, D'
                        const gpa = unit * this.LETTER_TO_GPA[letter];
                        agg['total_gpa_units'] += unit;
                        agg['total_gpa'] += gpa;
                        agg['passed_units'] += unit;
                        agg[String.fromCharCode(letter)][0] += unit;
                        agg[String.fromCharCode(letter)][1] += gpa; 
                    }
                    // console.log(e['subject'], String.fromCharCode(letter), letter === 82 ? '-' : letter === 70 ? 0 : unit * letter_to_gpa[letter]);
                    // agg['passed_units'] += unit;
                    // agg['total_gpa'] += parseFloat(curr['gpa']) * unit;
                    return agg 
            }, {total_gpa_units: 0, passed_units: 0, total_gpa: 0, A: [0, 0], B: [0, 0], C: [0, 0], D: [0,0], F:[0,0], R:[0, 0]})

            const avgGPA = (grade_statistics['total_gpa'] / grade_statistics['total_gpa_units']).toFixed(2);
            // console.log(grade_statistics);
            return [grade_statistics['passed_units'], avgGPA]
        },

        toggle() {
            this.isCollapsed = !this.isCollapsed;
        },
        sortBy(key) {
           return 
        }
    }, 
    template: /*html*/`
        <table v-if="data.course_grades.length !== 0">
            <thead>
                <tr> 
                    <th v-for="key in data.tHeadNameMap">
                        <span>{{key}}</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <template v-for="category in data.categories">
                    <tr> 
                        <td class="category">{{category}}</td>
                        <td v-for="val in aggregate(category)">{{val}}</td>
                    </tr>
                    <tr v-for="entry in filteredData(category)">
                        <td v-for="col in entry">{{col}}</td>
                    </tr> 
                </template>
            </tbody>
        </table>
    `
}
