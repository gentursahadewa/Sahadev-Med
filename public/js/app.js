const sidebar =
document.getElementById(
"sidebar"
);

const toggle =
document.getElementById(
"sidebarToggle"
);

const overlay =
document.getElementById(
"overlay"
);

if(toggle){

toggle.addEventListener("click", () => {

    sidebar.classList.add("show");
    overlay.classList.add("show");

    toggle.classList.add("hidden");

});

}

if(overlay){

overlay.addEventListener("click",()=>{

    sidebar.classList.remove("show");
    overlay.classList.remove("show");

    toggle.classList.remove("hidden");

});

}

document
.querySelectorAll(
".sidebar a"
)
.forEach(link=>{

link.addEventListener(
"click",
()=>{

if(
window.innerWidth <= 768
){

sidebar.classList.remove(
"show"
);

overlay.classList.remove(
"show"
);

}

});

});

