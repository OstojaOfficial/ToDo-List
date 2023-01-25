let toggle = false;
let selected_id = "";
let selected_name = "";
let selected_expire = "";
let interval_arr = [];

if(document.cookie.indexOf('token=') == -1) {
	window.location.replace("http://127.0.0.1:8080/index.html");
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
	window.location.replace("http://127.0.0.1:8080/index.html");
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
	li.innerHTML = `<div><span id="title" class="text-break">${title}</span><br><span expire="" id="timer"></span></div><button class="btn badge btn-outline-light edit">X</button>`;
	li.setAttribute("data-id", id);
	$('#MainList').append(li);
	timer(id, expire);
}

function timer(id, expire) {
	let now = Date.now();
	let distance = expire - now;
	  
	let days = Math.floor(distance / (1000 * 60 * 60 * 24));
	let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((distance % (1000 * 60)) / 1000);
	  
	$(`[data-id="${id}"]`)[0].children[0].children[2].innerText = `${days}:${hours}:${minutes}:${seconds}`;
	interval_arr[`${id}`] = x = setInterval(() => {
		let now = Date.now();
		let distance = expire - now;
	  
		let days = Math.floor(distance / (1000 * 60 * 60 * 24));
		let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((distance % (1000 * 60)) / 1000);
	  
		$(`[data-id="${id}"]`)[0].children[0].children[2].innerText = `${days}:${hours}:${minutes}:${seconds}`;

		if (distance < 0) {
		  clearInterval(x);
		  $(`[data-id="${id}"]`)[0].children[0].children[2].innerText = "EXPIRED";
		}
	}, 1000, expire);
	interval_arr[`${id}`] = x;
}

function addTask() {

}

function updateTask() {

}

function deleteTask() {
	callAPI(`http://127.0.0.1:8080/api/delete/${selected_id}`, {}, "DELETE")
	.then((data) => {
		clearInterval(interval_arr[`${selected_id}`]);
		updateList();
		back();
	});
}

function updateList() {
	let count = 0;
	$('#MainList').empty();
	callAPI(`http://127.0.0.1:8080/api/list?`, {'token': `${getCookie("token")}`})
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

async function callAPI(url = '', params = '', method = 'GET') {
	const response = await fetch(url + new URLSearchParams(params), {
		method: method
	});
	return response.json();
}