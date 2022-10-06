
SELECT DISTINCT major, subjectName FROM coursemetasraw;
SELECT COUNT(DISTINCT (major, subjectName)) FROM coursemetasraw;

SELECT DISTINCT (major, subjectName, quarter) FROM coursemetasraw WHERE subjectName LIKE '%造形Ⅰ%';

SELECT * FROM coursemetasraw;



SELECT DISTINCT (C.major, C.subjectName) FROM coursemetasraw AS C
    INNER JOIN majors AS M ON coursemetasraw.major=majors.major;



SELECT DISTINCT (C.major, C.subjectName), C.major, C.subjectName,M.id FROM coursemetasraw AS C
    INNER JOIN majors AS M 
    ON C.major=M.code;

SELECT DISTINCT major FROM coursemetasraw;


-- Partition
SELECT school, major, subjectName, COUNT(subjectName) OVER (PARTITION BY school, subjectName) FROM coursemetasraw;

SELECT * (SELECT school, major, subjectName, ROW_NUMBER() OVER (PARTITION BY school, subjectName) AS ver FROM coursemetasraw) WHERE ver=1;


-- 一学部のすべての'開講科目'を抽出する
WITH CTE1 AS (WITH coursemetaSName AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY school, subjectName) AS ver FROM coursemetasraw)
    SELECT id,school, subjectname, subjectcode, unit, category, target_year, eleccompul, quarter FROM coursemetaSName WHERE ver=1),

    CTE2 AS (SELECT CTE1.id AS id, S.id AS school_id FROM CTE1, schools as S WHERE CTE1.school = S.code)

INSERT INTO courseMetas
 (school_id, subjectname, subjectcode, unit, category, target_year, eleccompul) (SELECT 
  school_id, subjectname, subjectcode, unit, category, target_year, eleccompul FROM CTE2 JOIN CTE1 ON CTE1.id=CTE2.id);
-- id, school_id, school, subjectname,



    coursemetaSchoolID AS (SELECT S.id FROM coursemetasraw as C, schools as S WHERE C.school = S.code)

 SELECT COUNT(*) FROM CTE