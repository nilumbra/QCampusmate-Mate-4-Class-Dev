import Vue from 'vue';
import Vuex from 'vuex';
import ExampleDgreeRequirement from '@/Testdata/degree_requirements.json';
import gpaData from '@/Testdata/example_course_data_half_size.json';

Vue.use(Vuex);
// gpaData.course_grades = gpaData.course_grades;
// gpaData.categories = gpaData.categories;

export default new Vuex.Store({
  state: {
    name: 'Chen HuaXiao',
    degReq: ExampleDgreeRequirement,
    /* access gpaData in components using this.$store.state.gpaData,
    since this data is not expected to be changed, we don't need to
    wrap it in a computed property.
    */
    gpaData,
    plannerTable: {}, 
    drc: [], 
    i: 0,
  },
  getters: {
    len: state => { 
      return state.drc.length
    },
    summary: state => (year, quarter) => {
      return state.plannerTable[year][quarter].length
    }
  },
  mutations: {
    addCourses(state,  {year, quarter, courses}) {
      // console.log('addCourses mutations called')
      for (const cour of courses) {
        // Add courses to PT
        if (!(year in state.plannerTable)) {
          state.plannerTable[year] = [[], []]; 
        } 
        state.plannerTable[year][quarter].push(cour);
        state.drc.push(cour);       

        // Add courses to DRC
      }
    }
  },
  actions: {
    addCourses({ commit }, addOptions) {
      // console.log('addCourses action called')
      commit('addCourses', addOptions);
    },
  },
  modules: {
  },
});
