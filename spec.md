# QCampusmate Mate 4 Class

## Features
- **Grade Dashboard**
    - Simply and slightly restructure the information shown on `科目一覧を見る` page (only show GPA and total unit for **finished class**)
    - Collapsible by subject category
    - Able to sort by year, by grade, for each/all categories
    - Able to filter by grade 

- **Planner**
   - **v1.0.0**
        - Restructure information on `GPAを見る` page to `Degree Requirement` ✅
   
        - Excel export ✅
   - **v1.0.1**
        - (JSON/CSV export)
        - (Not available in version 1.0.0) PDF export
        - Planner View
            - Able to add/delete/update a future course
            - Automatic aggregation of current/projected GPA and total unit✅
        - Tree View (For checking against degree requirement)
            - Able to add/delete/update a future course
            - **Data Structure:** Check `CourseTree.vue`
            - **Algorithm:** in `CourseTree.vue`

                ```js
                /* 
                 * @params {Object} - degree_requirement
                 *
                 * @return void 
                 */
                function initializedRequirementTree(degree_requirement: Object) {
                    /* 
                    `
                    Set tree data in `CourseTree.vue` as specified by `degree_requirement`, check vueComponentDoc.md for details 
                    */
                }
                ```
   
   
## Interaction Specification
**On page `成績照会>科目一覧を見る`**
- Click `Load` button (= invoking function `extract` in `getCourseResults.js` will load the course result data into `localStorage.GPADATA`

**On any page**
- Click `Export` button (= invoking function `export` in `export.js`) will read and parse `localStorage.GPADATA` into `.csv` and open a download dialog. Click `save` in the dialog window will down `<course_data | othername>.csv` to the client's local file system.

## Page structure
- View (Table view) 
    - Sort by year, by grade
    - Filter by grade

- Planner (L/R = 1:4)
    - Degree Requirements (Left) (Collapsible tree)
    - Dynamic Planner (Right) (Collapsible table) 


## Data Structure
### GPAData
```js
GPAData = 
{
    tHeadNameMap: Object
    categories: Array<String>,
    course_grades: Array<Object>,
}
```
```js
GPA_Letter = { 'A', 'B', 'C', 'D', 'F', 'R', 'W' }
```

### degree_requirement
```json
{
  "label": "言語文化基礎科目",
  "grpKey": null,
  "compulsory": true,
  "elective": true,
  "unit": 7,
  "children": [
    {
      "label": "英語",
      "grpKey": null,
      "compulsory": true,
      "elective": true,
      "courseKeys": ["学術英語", "Intensive English"],
      "unit": 5,
      "children": [
      ]
    },
    {
      "label": "韓国語",
      "grpKey": null,
      "compulsory": true,
      "elective": true,
      "courseKeys": ["韓国語Ⅰ", "韓国語Ⅱ", "韓国語Ⅲ","'韓国語フォーラム"],
      "unit": 7,
      "children": [
      ]
    }
  ]
}

```
