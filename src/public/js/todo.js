let toggle = false;
$('#token').val(getCookie("token"));

if(document.cookie.indexOf('token=') == -1) {
	window.location.replace("http://127.0.0.1:8080/index.html");
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