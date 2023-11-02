$(function(){
	if (sessionStorage.getItem("data-bs-theme")) {
		$("html").attr("data-bs-theme", sessionStorage.getItem("data-bs-theme"))
	}
})
