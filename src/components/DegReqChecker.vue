<template>
<el-tree
  :indent="6"
  :data='data'
  :props="defaultProps"
  :render-content="renderContent"
  >
</el-tree>
</template>

<script>
import { initializeRequirementTree } from '@/utils/initializedDRCTree.js' 

export default {
  created(){
    // console.log(this.degreeRequirement);
    this.initTree(this.degreeRequirement);
  },

  data() {
    return {
      data: [
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      }
    }
  },

  computed: {
    degreeRequirement () {
      // console.log(this.$store.state.degReq.requirements);
      return this.$store.state.degReq;
    },
    course_grades() {
      return this.$store.state.gpaData.course_grades; 
    }
  },

  methods: {
    // eslint-disable-next-line no-unused-vars
    renderContent(h, {node, data, store}) {
      // console.log(`${data.label} has children ${data.children}`);
      return (this.generateTreeNodeView(h, data))
    },

    /**
     * Set style/add visual aids for a DRC node based on the node's state
     * 
     * @params {Object} treenode - a treenode set by setRTCTreeNode
     * @params {Function} h - render function h
     * @returns {Function} render function h - 
     */
    generateTreeNodeView(h, treenode) {
      var labelSpan, 
          labelTag,
          labelOpt;
       
      const childNodes = [];
      labelTag = treenode.label;
      labelOpt = {};

      if (typeof treenode.status !== 'undefined') { // A leaf course node
        // const letterTag = h('span', {style: {color: "#67C23A ", position: "absolute", left:"-10px", "align-items": "center"}}, treenode.children ? "" : "A");
        //
        // h('el-tag', {class:"grade", effect: "dark", size: "mini", props: {type: 'success'}, style: {"border-style": "none"}}, "A"),
        // h(`el-badge`, {props:{value: "A" } }, [])

        switch (treenode.status) {
          case -2:
            labelOpt['style'] = {color: "#F56C6C"}; //danger = failed
            break;
          case -1:
            labelTag = [h('s', {}, labelTag)];
            labelOpt['style'] = {color: "#909399"}; // withdraw
            break;
          case 0:
            labelOpt['style'] = {color: "#409EFF"}; // ongoing == undecided
            break;
          // case 1:
          //   labelOpt['style'] = {color: "orange"}; 
          //   break;
          case 2:
            labelOpt['style'] = {color: "#67C23A"}; //success = passed
            break;
          default:
            labelOpt['style'] = {color: "#67C23A"}; //success = passed
            break;
        }
      } else {
        childNodes.unshift(h('span', {}, `${treenode.passed_units}/${treenode.units}`));
      }

      // Common parts
      labelSpan = h('span', labelOpt, labelTag);
      childNodes.unshift(labelSpan);
      
      return (h('div', {style: { position: "relative" }}, childNodes));
    },

    handleNodeClick(data) {
      console.log(data);
    },

    initTree: initializeRequirementTree
  },
};
</script>
