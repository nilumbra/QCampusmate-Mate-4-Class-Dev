// Go to 講義から検索 ページ on campusmate
Array.from(document.querySelectorAll('tr.column_odd, tr.column_even')).map((e) => {
    return parseInt(e.children[1].textContent);
});
