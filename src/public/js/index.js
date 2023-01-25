const regex ="^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$"

if(document.cookie.indexOf('token=') != -1) {
	window.location.replace("http://127.0.0.1:8080/todo.html");
}

function generateToken() {
	var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });

    document.cookie = `token=${uuid}`;

	window.location.replace("http://127.0.0.1:8080/todo.html");
}

function login() {
    if(!$('#token').val().match(regex)) {
        console.log("wrong regex");
    } else {
        document.cookie = `token=${$('#token').val()}`;
        window.location.replace("http://127.0.0.1:8080/todo.html");
    }
}