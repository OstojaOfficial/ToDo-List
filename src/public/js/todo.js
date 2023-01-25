let toggle = false;
let selected_id = "";
let selected_name = "";
let selected_expire = "";
let interval_arr = [];

let config = "";

fetch('./js/appconfig.json')
    .then((response) => response.json())
    .then((json) => config = json);

if(document.cookie.indexOf('token=') == -1) {
	window.location.replace(`${config.public_url}/index.html`);
}

$('#token').val(getCookie("token"));
updateList();

$(document).on('click', '.edit', (event) => {
	$("#addMenu").addClass("d-none");
	$("#addMenu *").removeClass("d-block").addClass("d-none");

	$("#optionsMenu").removeClass("d-none").addClass("d-inline");
	$("#optionsMenu *").removeClass("d-none").addClass("d-inline");

	selected_id = event.target.parentElement.attributes['data-id'].value;
	selected_name = event.target.parentElement.children[0].children[0].textContent;
	selected_expire = event.target.parentElement.children[0].children[2].attributes['expire'].value;

	$('#input-name').val(selected_name);
	let now = Math.floor(Date.now() / 1000);
	$('#input-d').val(Math.floor((parseInt(selected_expire) - now) / (60 * 60 * 24)));
	$('#input-h').val(Math.floor(((parseInt(selected_expire) - now) % (60 * 60 * 24)) / (60 * 60)));
	$('#input-m').val(Math.floor(((parseInt(selected_expire) - now) % (60 * 60)) / 60));
	$('#input-s').val(Math.floor((parseInt(selected_expire) - now) % 60));
});

function back() {
	$("#addMenu").removeClass("d-none");
	$("#addMenu *").removeClass("d-none").addClass("d-block");

	$("#optionsMenu").removeClass("d-inline").addClass("d-none");
	$("#optionsMenu *").removeClass("d-inline").addClass("d-none");

	$('#input-name').val("");
	$('#input-d').val("");
	$('#input-h').val("");
	$('#input-m').val("");
	$('#input-s').val("");
}

function logout() {
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	window.location.replace(`${config.public_url}/index.html`);
}

function reveal() {
	if(!toggle) {
		$('#token').attr('readonly', true);
		$('#token').attr('disabled', false);
		$('#token').attr("type", 'text');
		toggle = true;
	} else {
		$('#token').attr('readonly', false);
		$('#token').attr('disabled', true);
		$('#token').attr("type", 'password');
		toggle = false
	}
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
	  let c = ca[i];
	  while (c.charAt(0) == ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	  }
	}
	return "";
}

function addToList(id, title, expire){
	const li = document.createElement('li');
	li.className = 'list-group-item bg-dark text-white d-flex justify-content-between align-items-center';
	li.innerHTML = `<div><span id="title" class="text-break">${title}</span><br><span expire="${expire}" id="timer"></span></div><button class="btn badge btn-outline-light edit">X</button>`;
	li.setAttribute("data-id", id);
	$('#MainList').append(li);
	timer(id, expire);
}

function timer(id, expire) {
	let now = Math.floor(Date.now() / 1000);
	let distance = expire - now;
	  
	let days = Math.floor(distance / (60 * 60 * 24));
	let hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
	let minutes = Math.floor((distance % (60 * 60)) / 60);
	let seconds = Math.floor((distance % 60));
	  
	$(`[data-id="${id}"]`)[0].children[0].children[2].innerText = `${days}:${hours}:${minutes}:${seconds}`;
	interval_arr[`${id}`] = setInterval(() => {
		let now = Math.floor(Date.now() / 1000);
		let distance = expire - now;
	  
		let days = Math.floor(distance / (60 * 60 * 24));
		let hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
		let minutes = Math.floor((distance % (60 * 60)) / 60);
		let seconds = Math.floor(distance % 60);

		$(`[data-id="${id}"]`)[0].children[0].children[2].innerText = `${days}:${hours}:${minutes}:${seconds}`;

		if (distance < 0) {
		  clearInterval(interval_arr[`${id}`]);
		  $(`[data-id="${id}"]`)[0].children[0].children[2].innerText = "EXPIRED";
		}
	}, 1000, expire);
}

function addTask() {
	let expire = Math.floor(Date.now() / 1000) + convertToSec(parseInt($('#input-d').val()), parseInt($('#input-h').val()), parseInt($('#input-m').val()), parseInt($('#input-s').val()));
	callAPI(`${config.public_url}/api/add?`, {'title': `${$('#input-name').val()}`, 'token': `${getCookie("token")}`, 'expire': `${expire}`}, "POST")
	.then((data) => {
		clearInterval(interval_arr[`${selected_id}`]);
		updateList();
		back();
	});
}

function updateTask() {
	let expire = Math.floor(Date.now() / 1000) + convertToSec(parseInt($('#input-d').val()), parseInt($('#input-h').val()), parseInt($('#input-m').val()), parseInt($('#input-s').val()));
	callAPI(`${config.public_url}/api/update/${selected_id}?`, {'title': `${$('#input-name').val()}`, 'expire': `${expire}`}, "PATCH")
	.then((data) => {
		clearInterval(interval_arr[`${selected_id}`]);
		updateList();
		back();
	});
}

function deleteTask() {
	callAPI(`${config.public_url}/api/delete/${selected_id}`, {}, "DELETE")
	.then((data) => {
		clearInterval(interval_arr[`${selected_id}`]);
		updateList();
		back();
	});
}

function updateList() {
	let count = 0;
	$('#MainList').empty();
	callAPI(`${config.public_url}/api/list?`, {'token': `${getCookie("token")}`})
	.then((data) => {
		for(let key in interval_arr) {
			clearInterval(interval_arr[`${key}`]);
		}

		interval_arr = [];
	  	data.tasks.forEach(element => {
			addToList(element._id, element.title, element.expire);
		});

		for(let key in interval_arr) {
			count++;
		}
		$('#taskCounter').text(count);
	});
}

function deleteAllTasks() {
	for(let key in interval_arr) {
		callAPI(`${config.public_url}/api/delete/${key}`, {}, "DELETE");
	}
	clearInterval(interval_arr[`${selected_id}`]);
	updateList();
}

async function callAPI(url = '', params = '', method = 'GET') {
	const response = await fetch(url + new URLSearchParams(params), {
		method: method
	});
	return response.json();
}

function convertToSec(days = 0, hours = 0, minutes = 0, seconds = 0) {
	return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}