const regex ="^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$"

let config = "";

fetch('./js/appconfig.json')
    .then((response) => response.json())
    .then((json) => {
        config = json
        if(document.cookie.indexOf('token=') != -1) {
            window.location.replace(`${config.public_url}/todo.html`);
        }
    });

function generateToken() {
	var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });

    document.cookie = `token=${uuid}; expires=Fri, 31 Dec 9999 21:10:10 GMT";`;

	window.location.replace(`${config.public_url}/todo.html`);
}

function login() {
    if(!$('#token').val().match(regex)) {
        alert("Invalid token.");
    } else {
        document.cookie = `token=${$('#token').val()}; expires=Fri, 31 Dec 9999 21:10:10 GMT";`;
        window.location.replace(`${config.public_url}/todo.html`);
    }
}