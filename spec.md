# QCampusmate Mate 4 Class

## Features
- **Grade Dashboard**
    - Simply and slightly restructure the information shown on `科目一覧を見る` page (only show GPA and total unit for **finished class**)
    - Collapsible by subject category
    - Able to sort by year, by grade, for each/all categories
    - Able to filter by grade 

- **Planner**
   - Restructure information on `GPAを見る` page to `Degree Requirement`
   - Able to add an ongoing/future course
   - Automatic aggregation of current/projected GPA and total unit
   - JSON/CSV export (**First implement this**)
   - (May not be available in version 1.0.0) Excel export 
   - (Not available in version 1.0.0) PDF export

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
