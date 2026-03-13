function updateClock(){

let now = new Date()

let h = String(now.getHours()).padStart(2,'0')
let m = String(now.getMinutes()).padStart(2,'0')
let s = String(now.getSeconds()).padStart(2,'0')

document.getElementById("clock").innerHTML = h + ":" + m + ":" + s

}

setInterval(updateClock,1000)
updateClock()


function updateDate(){

let now = new Date()

let date = now.toLocaleDateString("he-IL")

document.getElementById("date").innerHTML = date

}

updateDate()


function updateHebrewDate(){

let now = new Date()

let hebrew = new Intl.DateTimeFormat('he-u-ca-hebrew', {
day: 'numeric',
month: 'long',
year: 'numeric'
}).format(now)

document.getElementById("date").innerHTML += "<br>" + hebrew

}

updateHebrewDate()


async function loadZmanim(){

let response = await fetch("https://www.hebcal.com/zmanim?cfg=json&geonameid=281184&sec=1")

let data = await response.json()

let sunrise = data.times.sunrise
let sunset = data.times.sunset

document.getElementById("zmanim").innerHTML =
"זריחה: " + sunrise +
"<br>שקיעה: " + sunset

}

loadZmanim()


let netzTime = new Date(sunrise)

function checkTimer(){

let now = new Date()

let diff = netzTime - now

if(diff < 300000){

let seconds = Math.floor(diff/1000)

document.getElementById("clock").innerHTML = seconds

}

}

setInterval(checkTimer,1000)
