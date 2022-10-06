// Mock user info
const li_studentID = document.querySelector('#login_inf > div.mid > ul.user > li:nth-child(2)');

const li_name = document.querySelector('#login_inf > div.mid > ul.user > li:nth-child(3)');

li_studentID.textContent = "1LT55669J";
li_name.textContent = "九大花子";

const login_date = document.querySelector("#login_inf > div.mid > ul.date > li:nth-child(2)");

const login_time = document.querySelector("#login_inf > div.mid > ul.date > li:nth-child(3)");

login_date.textContent = '2057年1月24日';
login_time.textContent = '12時00分';


// Mock first two courses info

// mock kisemi
const eval_kisemi = document.querySelector("#main > form > table.list > tbody > tr:nth-child(4) > td:nth-child(3) > span");
eval_kisemi.textContent = 'R';
eval_kisemi.style.color = 'black';

const year_kisemi = document.querySelector("#main > form > table.list > tbody > tr:nth-child(4) > td:nth-child(5)");
year_kisemi.textContent = '2055';

const cid_kisemi = document.querySelector("#main > form > table.list > tbody > tr:nth-child(4) > td:nth-child(8)");
cid_kisemi.textContent = '55532403'

const instructor_kisemi = document.querySelector("#main > form > table.list > tbody > tr:nth-child(4) > td:nth-child(9)");
instructor_kisemi.textContent = '宮台　鏡就';

const updated_kisemi = document.querySelector("#main > form > table.list > tbody > tr:nth-child(4) > td:nth-child(10)");
updated_kisemi.textContent = '2055/08/18';


// mock kakkyo
const year_kakkyo = document.querySelector("#main > form > table.list > tbody > tr:nth-child(7) > td:nth-child(5)");
year_kakkyo.textContent = '2055';

const cid_kakkyo = document.querySelector("#main > form > table.list > tbody > tr:nth-child(7) > td:nth-child(8)");
cid_kakkyo.textContent = '55531606';

const instructor_kakkyo = document.querySelector("#main > form > table.list > tbody > tr:nth-child(7) > td:nth-child(9)");
instructor_kakkyo.textContent = '星船　大丘'

const updated_kakkyo = document.querySelector("#main > form > table.list > tbody > tr:nth-child(7) > td:nth-child(10)");
updated_kakkyo.textContent = '2055/08/14';