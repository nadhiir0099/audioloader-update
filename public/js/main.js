const tabs = document.querySelectorAll(".tab-btn");
const content = document.querySelectorAll(".single");

let active = (new URLSearchParams(location.search)).get("active");
let wa = document.getElementById(active /*|| `<%#= active %>`*/ ||"video");
if(wa) wa.classList.add("active");

tabs.forEach((tab,index)=>{
    tab.addEventListener("click", (e)=>{
        tabs.forEach(tab=>{tab.classList.remove("active")});
        tab.classList.add("active");

        var line = document.querySelector(".line2");
            line.style.width = e.target.offsetWidth + "px";
            line.style.left = e.target.offsetLeft + "px";


        content.forEach(single=>single.classList.remove("active"))
        content[index].classList.add("active");
    })
})

let downloadBtns = document.querySelectorAll(".playlistvidsingledownload");
let downloadallbtn = document.querySelector(".downloadall-btn");
downloadallbtn.addEventListener("click", function() {
    let i = 0;
    let interval = setInterval(() => {
        if(i>=downloadBtns.length) return clearInterval(interval);
        let dbtn = downloadBtns[i];
        dbtn.click();
        i++;
    }, 1000);
});