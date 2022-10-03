DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS majors;
DROP TABLE IF EXISTS courseMetasInMajors;
DROP TABLE IF EXISTS courseMetas;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS categories;


CREATE TABLE schools (
  id SMALLSERIAL PRIMARY KEY,
  code CHAR(6), 
  school VARCHAR(30) NOT NULL
);


CREATE TABLE majors (
  id SMALLSERIAL PRIMARY KEY,
  code CHAR(6), NOT NULL
  major VARCHAR(150) NOT NULL,
  major_en VARCHAR(150) NOT NULL,
  school_id SMALLSERIAL NOT NULL REFERENCES schools(id)
);


CREATE TABLE courseMetas (
  id SERIAL PRIMARY KEY,
  school_id SMALLSERIAL NOT NULL REFERENCES schools(id), -- "schools.id; NULL is not allowed"
  major_id SMALLSERIAL REFERENCES majors(id), --"majors.id; NULL is allowed;" 
  subjectName VARCHAR(300), --"e.g. インダストリアルデザイン基礎Ⅰ; NULL is not allowed;"
  subjectCode VARCHAR(20), --"e.g. 1111J in 'DES-IND1111J', NULL is allowed;"
  unit REAL, --"e.g. 1; NULL is not allowed;"
  category TEXT, --"e.g. コース基礎科目　Course Fundamental Subjects"
  target_year VARCHAR(150), --"e.g. 学部1年　Undergraduate first grade"
  elecCompul SMALLSERIAL, --"e.g. 選択必修　Required elective, 1=選択, 2=選択必修, 3=必修;"
);


CREATE TABLE courseMetasRaw (
  id SERIAL PRIMARY KEY,
  school VARCHAR(30), -- e.g. DES
  major VARCHAR(30) DEFAULT '', -- e.g. END "majors.code; NULL is allowed;" 
  subjectName VARCHAR(300) NOT NULL, --"e.g. インダストリアルデザイン基礎Ⅰ; NULL is not allowed;"
  subjectCode VARCHAR(20) DEFAULT '', --"e.g. 1111J in 'DES-IND1111J', NULL is allowed;"
  unit REAL, --"e.g. 1; NULL is not allowed;"
  category TEXT, --"e.g. コース基礎科目　Course Fundamental Subjects"
  target_year VARCHAR(150), --"e.g. 学部1年　Undergraduate first grade"
  elecCompul SMALLSERIAL, --"e.g. 選択必修　Required elective, 1=選択, 2=選択必修, 3=必修;"
  quarter VARCHAR(30) DEFAULT ''
);

CREATE TABLE courseMetasInMajors (
  id SERIAL PRIMARY KEY,
  major_id SMALLSERIAL NOT NULL REFERENCES majors(id), -- "majors.id"
  courseMeta_id SERIAL NOT NULL REFERENCES courseMetas(id)
);


CREATE TABLE courses (
  id SERIAL PRIMARY KEY, --"講義コード"
  courseMeta_id SERIAL NOT NULL REFERENCES courseMetas(id), --"ONE courseMeta has MANY courses"
  title TEXT, --""
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), --"e.g. 2021/05/25 22:18"
  instructors VARCHAR(90)[], --"e.g. ['秋田　直繁', '清須美　匡洋'...]"
  lang TEXT, --"e.g. 日本語（J)"
  year SMALLSERIAL, --"e.g. 2021"
  quarter VARCHAR(30) , --"e.g. 秋学期"
  day_time VARCHAR(30)[][] , --"e.g. [['火曜日', '3時限']]"
  classroom TEXT, --"e.g. 未定/　TBA"
  area VARCHAR(30), --"e.g. 伊都地区"
  more TEXT,
  
  syllabusOrCourseDetail jsonb, --"postgres doesn't care about the internal structure; the naming is for documentation consistency for now, there might be other formats of 'course details'"
  isCourseDetailFormat BOOLEAN, --"e.g. true"

  /* "Each course record will have either syllabus or courseDetail, with the other left to be NULL" */
)

\copy schools (id, code, school) FROM './cleaned/schools.csv' DELIMITER ',' CSV HEADER;

\copy majors (code, major, major_en, school_id) FROM './cleaned/course-database/majors.csv' DELIMITER ',' CSV HEADER;

