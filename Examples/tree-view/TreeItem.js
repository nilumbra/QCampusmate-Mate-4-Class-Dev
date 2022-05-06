export default {
  name: "TreeItem",
  props: {
    model: Object 
  },  
  data(){
    return {
      isOpen: false
    }
  },  
  computed: {
    isFolder(){
      return this.model.children;
    }
  },
  methods: {
    toggle: function () {
      this.isOpen = !this.isOpen;
      console.log(this.isOpen);
  },
    changeType() {
      this.model.children = []
    },
    addChild() {

    }
  },
  template: /*html*/`
  <li class="no-decor">
    <div 
    :class="{bold: isFolder}" 
    @click="toggle"> 
    <span v-if="isFolder" style="font-size:0.7em;">{{isOpen ? '▼' : '►'}}</span> {{model.name}} 
    </div>
    <!-- render the children folder-->
    <ul v-show="isOpen" v-if="isFolder">
      <!-- Think as if the render function is calling itself, and a treenode is a list item-->
      <tree-item class="item" v-for="treeNode in model.children" :model="treeNode"></tree-item>
      <li class="add no-decor">+</li>
    </ul>
  </li>
  `
  }
