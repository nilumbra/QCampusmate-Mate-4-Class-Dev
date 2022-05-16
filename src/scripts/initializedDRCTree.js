/* eslint-disable no-unused-vars */
/**
 * Assume at the invokation, the function will be provided
 * with a context <this> whose `meta` and `data` properties are expected to be initialized the way this function will do
 * @params {Object} degree_requirement - see degree_requirement.js
 * @returns void
 */
 function initializeRequirementTree(degree_requirement) {

  /**
   * This function determines the state(passed/retakable(i.e. letter_evalution <= 'D')/failed/etc..) of a single courseRecord <gradeRecoard> and set the leaf of current DRC tree node <curr_node> according
   * @params {Object} course_record - gpaData.course_records (DELETE this param upon next refactoring)
   * @params {number} index - index of course_records in gpaData.course_records 
   * @params {Object} curr_node - assume to be a leaf node in `degree_requirement`` data structure
   * @returns void
   */
  function setDRCTreeNode(course_record, index, curr_node) {
    let course_node = {};
            
    course_node['label'] = course_record.subject;
    course_node['unit'] = parseFloat(course_record.unit)

    // Passed/Not passed detection
    if (course_record.letter_evaluation.charCodeAt(0) - 65248 === 70) { // If 'F', don't increment the passed unit
      course_node['failed'] = true;
      course_node['retakable'] = true; 
    } else if ([65, 66, 67, 68, 82].includes(course_record.letter_evaluation.charCodeAt(0) - 65248)) { // 'A', 'B', 'C', 'D', 'R'
      if (course_record.letter_evaluation.charCodeAt(0) - 65248 === 68) { // Mark 'D' courses as retakable;
        course_node['retakable'] = true; 
      }
      course_node['passed'] = true;
      curr_node['passed_units'] += course_node['unit']; // If 'A', 'B', 'C', 'D', 'R', count the course's unit towards acquired units
      // console.log(`------------${curr_node.label} PASSED; Acquired ${curr_node['passed_units']} unit----------`);
    } else { // W 
      // console.log("------------Withdrown or ...----------");
      // console.log(curr);
      // curr.letter_evaluation.charCodeAt(0) - 65248 === 87
      course_node['withdraw'] = true;
    } 
      curr_node.children.push(course_node);
      seen.add(index);
    }
  
  // Solve the Subset Sum problem using Dynamic programming
  // This function should only be called by <getSubsetOfCoursesThatHasTheMinimumPartialSumOfUnitAboveRequirement>
  function getMinPartialSumSubset_5(arr, target) {
    const [m, n] = [arr.length + 1, (target - 1) / .5 + 3],
               d = [],
       dp_subset = [];

    for (let i = 0; i < m; i++) {
      d.push(new Array(n).fill(false));
      dp_subset.push(new Array(n).fill(null));
    }

    for (let i = 0; i < m; i++){
      d[i][0] = true;
      dp_subset[i][0] = new Set(); 
    }

    for (let j = 1; j < n; j++){
      d[0][j] = false;
    }

    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        if (arr[i - 1][1] * 2 > j) { // arr = [[index, unit], ...]
          d[i][j] = d[i - 1][j];
          dp_subset[i][j] = dp_subset[i - 1][j];
        } else {
          // d[i][j] = d[i - 1][j] || d[i - 1][j - arr[i - 1] * 2];
          if (d[i - 1][j]) {
            d[i][j] = d[i - 1][j];
            dp_subset[i][j] = dp_subset[i - 1][j];
          } else if (d[i - 1][j - arr[i - 1][1] * 2]) {
            d[i][j] = d[i - 1][j - arr[i - 1][1] * 2];
            dp_subset[i][j] = new Set(dp_subset[i - 1][j - arr[i - 1][1] * 2]);
            dp_subset[i][j].add(arr[i - 1][0]);
            // Found an optimal subset
            if (j / 2 === target) { // unscale j to the original target
              return [true, Array.from(dp_subset[i][j])];
            }
          } 
        }
      }
    }
    return [false, null];
  }

  /**
   * Before entering the for-loop that adds elective courses to the tree, <
   * minPartialSumOfUnit> should be called to get the subset of the indices of 
   * the courses that sum to a value as barely greater than the category 
   * requirement as possible.
   * @params {Array<[number, Object]>}- coursesInCategory: [[index, CourseRecordObject], ...]
   * @returns {Array<number>} - return an array of `index`(`index` refers to the index in `course_grades`) 
   */
  function getSubsetOfCoursesThatHasTheMinimumPartialSumOfUnitAboveRequirement(coursesInCategory, required_unit) {
    var unit_sum  = 0;
    const index_unit_arr = [];

    for (let index of coursesInCategory) {
      let unit = course_grades[index]['unit'];
      unit_sum += unit;
      index_unit_arr.push([index, unit]);
    }

    if (unit_sum <= required_unit) {
      return coursesInCategory;
    } else {
      var [isSubsetSum, subset_indices] = getMinPartialSumSubset_5(index_unit_arr, required_unit);
        
      return isSubsetSum ? subset_indices : coursesInCategory;
    }
  }

  /** This function finds all elective courses that should fall under <curr_node>
   * @returns {Function} - a filter function expected by courser_grades.filter call. A call with this returned function will find all course that fall under this category
   *
   */
  function createCourseCategoryMatcher(curr_node) {
    const KIKAN = new Set(["基幹教育セミナー","課題協学科目","言語文化基礎科目","文系ディシプリン科目","理系ディシプリン科目","健康・スポーツ科目","総合科目","フロンティア科目","サイバーセキュリティ科目", "高年次基幹教育科目","その他"]);
    const nodeIsKikan = curr_node.grpKey && (KIKAN.has(curr_node.label) || curr_node.grpKey.includes("KED")); // All Kikan course has a grpKey
    const UPPER = ["現代史入門"];


    /* TEMPORARY HEURISTICS FOR MATCHING KIKAN COURSESE */
    // I don't have the list of all 総合科目 yet, hence we use this temporary heursitc so that the matcher will process 総合科目 correctly
    var isSouGou = curr_node.label === "総合科目",
        isUpper = curr_node.label === "高年次基幹教育科目",
        isOthers = curr_node.label === "その他" // その他

    /////////////////////////////////////////////////////

    /* TEMPORARY HEURISTICS FOR MATCHING MAJOR COURSESE */
    var isCourseCommons = curr_node.label === "コース共通科目",
        isFreeElective = curr_node.label === "自由選択科目",
        isThesis = curr_node.label === "卒業論文";

    /////////////////////////////////////////////////////
    return function(course_record, index) {
      
      // The course is a kikan course only if its category is in KIKAN
      // Or it is listed as a 高年次基幹教育科目(by subject name)
      const courseIsUpperKikan = UPPER.some(key=> course_record.subject.includes(key)); 
      const courseIsKikan = KIKAN.has(course_record.category) || courseIsUpperKikan;

      // We add the course to the DRC tree node, only if both course and node belongs either KIKAN or MAJOR
      const doesCategoryMatch = !(courseIsKikan ^ nodeIsKikan);  

      // MATCH KIKAN COURSES USING HEURISTICS //
      const SouGouMatch = isSouGou && course_record.subject_number.includes(curr_node.grpKey),
            OthersMatch = isOthers && KIKAN.has(course_record.category), // Note this will make the checker's correctness dependent on the index position of その他 node in the 基幹教育.children[]: the matcher is only expected to work correctly if その他 is the last element of 基幹教育.children[].
        UpperKikanMatch = isUpper && courseIsUpperKikan;
      /////////////////////////////////////////

      if (curr_node.label === "高年次基幹教育科目" && course_record.subject.includes("現代史入門")) {
        console.log(`UpperKikanMatch: ${UpperKikanMatch} \n courseIsUpperKikan: ${courseIsUpperKikan}\n courseIsKikan: ${courseIsKikan} \n doesCategoryMatch: ${doesCategoryMatch} \n
         `)
      }
      // MATCH MAJOR COURSES USING HEURISTICS //
      /////////////////////////////////////////

      return !seen.has(index) &&
             doesCategoryMatch && 
             (SouGouMatch /* Add to tree node if first condition matches and the course is a 総合科目. Otherwise, use the latter rules to match*/
              || UpperKikanMatch || OthersMatch /* If encountering その他 node and there are still KIKAN courses left, add them all to the node*/ || curr_node.courseKeys.some(key => course_record.subject.includes(key)) && course_record.subject_number.includes(curr_node.grpKey) ||
              isCourseCommons && curr_node.courseKeys.some(key => course_record.subject.includes(key)) || course_record.subject === '卒業論文' && isThesis ||isFreeElective /* This operation assumes '自由選択科目' is the last element in 専攻教育科目.children[] */
              )
    }
  }

  /** This function recursively initializes the DRC tree's view-model data structure.
   * 
   * @params {Object} - At the initial invokation of this function, curr_node should either has a label called "基幹教育" or "専攻教育科目" (See degree_requirement.js);
   * @returns void - This function initialized part of the DRC's view-model, nothing to return
   */
  function initializeNode(curr_node) {
    /* Given a node representing the course structures, 
     * 1. fill in the course data for view-model
     * 2. calculate and add the <passed_unit> property to each node appropriately
     */
     // console.log(curr_node.label);
    if (!curr_node.children) { // BASE CASE
      // console.log(curr_node.label + " doesn't have a children!")
      curr_node['children'] = [];
      curr_node['passed_units'] = 0;
      // console.log(JSON.stringify(curr_node, null, "\t"));

      if (!curr_node.elective) { // If course category is not elective, scan <course_grades> until every course in <courseKeys> have been found
        // console.log(`${curr_node.label} is not an elective!`);
        const req = new Set(curr_node.courseKeys); // Assume courseKeys has at least one element in this case, but it shouldn't cause a problem even if there is none.
        // console.log(self.gpaData.course_grades ? "ok" : "ERR");
        for (let i = 0; i < course_grades.length; ++i){ 
          let curr = course_grades[i]; 
          if (req.has(curr.subject)) { // Matched by subject name, add the course to view-model
              if (seen.has(i)) {
                throw Error(`Error: compulsory course gets cross-listed! When processing node: ${curr_node.label}`)
              }

              setDRCTreeNode(curr, i, curr_node);
              req.delete(course_grades[i]); // This course has been checked, delete it
          }

          if (req.size === 0) break; // All requirements of this compulsory category have been met
        }
        console.log(JSON.stringify(curr_node, null, "\t"));
      } else { 
        // This node is an elective category,
        const courseMatcher = createCourseCategoryMatcher(curr_node);

        // Get courses that match the curr_node
        var coursesInCategory = []; // [[index, CourseRecordObject], ...]
        for (let i = 0; i < course_grades.length; ++i) { // ~ O(n)
          let curr = course_grades[i];
          if (courseMatcher(curr, i)) {
            coursesInCategory.push(i);
          }
        }

        // Figure out the optimized subset of courses to add, and then
        // add elements of the subset to <curr_node>
        // Running time: O(curr_node.unit * coursesInCategory.length
        // This should be the bottle neck for initializng a tree node
        getSubsetOfCoursesThatHasTheMinimumPartialSumOfUnitAboveRequirement(coursesInCategory, curr_node.units).forEach(index => {
            setDRCTreeNode(course_grades[index], index, curr_node)
          }
        ) 

        console.log(JSON.stringify(curr_node, null, "\t"));
      }
    } else { // Recursive count passed_unit;
        for (let childNode of curr_node.children) { // Initialized every child
          initializeNode(childNode);  
        }
        // all children or curr_node has passed units
        let count = 0;
        // console.log(`--------------Current node: ${curr_node.label} has children: ${curr_node.children.reduce((prev, curr)=>{prev.label+','+curr.label} ,'')} -----------------------`)
        for (let childNode of curr_node.children) {
          // console.log(`${childNode.label}.passed_units = ${childNode.passed_units}`)
          // console.log(`${childNode.label} is a child of ${curr_node.label}`)
          count += childNode.passed_units;
      }
        curr_node['passed_units'] = count;
        console.log(curr_node);
    }
  }  

  
  // Copy the tree structure from degree_requirement.json
  this.meta = degree_requirement.meta;
  
  // Copy the value of degree_requirement
  // Changing properties of data[0] won't effect the prototype
  const j = JSON.stringify(degree_requirement),
        clone = JSON.parse(j);
  this.data[0] = clone.requirements['基幹教育']; 

  // major
  this.data[1] = clone.requirements['専攻教育科目'];

  //Initialized tree values
  var seen = new Set();
  const course_grades = this.gpaData.course_grades.slice();
  initializeNode(this.data[0]);
  initializeNode(this.data[1]);
}