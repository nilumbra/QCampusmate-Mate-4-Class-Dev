for i in ./course-database/*.csv;
  do mv "$i" "${i/Sheet 1-/}";
done