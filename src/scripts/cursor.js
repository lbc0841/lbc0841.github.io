const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const crossX = document.createElement("div");
crossX.style.position = "fixed";
crossX.style.left = "0";
crossX.style.width = "1px";
crossX.style.height = "100dvh";
crossX.style.pointerEvents = "none";
crossX.style.background = "rgba(255, 255, 255, 0.3)";
crossX.style.zIndex = "999";

const crossY = document.createElement("div");
crossY.style.position = "fixed";
crossY.style.left = "0";
crossY.style.width = "100dvw";
crossY.style.height = "1px";
crossY.style.pointerEvents = "none";
crossY.style.background = "rgba(255, 255, 255, 0.3)";
crossY.style.zIndex = "999";

const center = createElement("div", [], "");
center.style.position = "fixed";
center.style.width = "12px";
center.style.height = "12px";
center.style.transform = "translate(-50%, -50%)";
center.style.transition = "transform 200ms";
center.style.pointerEvents = "none";
center.style.zIndex = "999";

const borderContainer = createElement("div", ["border-container"], "");
const borderTL = createElement("div", ["corner-tl"], "");
const borderTR = createElement("div", ["corner-tr"], "");
const borderBL = createElement("div", ["corner-bl"], "");
const borderBR = createElement("div", ["corner-br"], "");

borderContainer.appendChild(borderTL);
borderContainer.appendChild(borderTR);
borderContainer.appendChild(borderBL);
borderContainer.appendChild(borderBR);

center.appendChild(borderContainer);

if(!isMobile){
    document.body.appendChild(crossX);
    document.body.appendChild(crossY);
    document.body.appendChild(center);
}

function createElement(tagName, classes, content){
    const element = document.createElement(tagName);
    element.textContent = content;

    classes.forEach(c => {
        element.classList.add(c);
    });

    return element;
}

window.addEventListener("mousemove", (e) => {
    crossY.style.top = e.clientY + "px";
    crossX.style.left = e.clientX + "px";

    center.style.left = e.clientX + "px";
    center.style.top = e.clientY + "px";

    const element = document.elementFromPoint(e.clientX, e.clientY);
    const cursor = getComputedStyle(element).cursor;

    if (cursor === "pointer") {
        center.style.transform = "translate(-50%, -50%) scale(1.6)";
        center.style.color = "#ff8400";
    }
    else {
        center.style.transform = "translate(-50%, -50%) scale(1)";
        center.style.color = "#ffffff";

    }
});