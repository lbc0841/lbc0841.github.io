const canvas = document.getElementById("time-line");
const ctx = canvas.getContext("2d");

const spacing = 10;
let lineCount = 0;
let currentOffset = 0, targetOffset = 0;

let lastTouchX = 0;

// Main Navigation Button
const homeButton = document.getElementById("home-button");
const aboutButton = document.getElementById("about-button");
const notesButton = document.getElementById("notes-button");
const friendsButton = document.getElementById("friends-button");

resize();
draw();

function lerp(start, end, time){
    return start + (end - start) * time;
}

window.addEventListener("resize", resize);

// PC Scroll
window.addEventListener("wheel", (e) => {
    targetOffset += e.deltaY*1.5;
});

// Mobile Scroll
window.addEventListener("touchstart", (e) => {
    lastTouchX = e.touches[0].clientX;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - lastTouchX;

    targetOffset -= deltaX * 2; // 靈敏度可調

    lastTouchX = touchX;
}, { passive: true });

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    lineCount = Math.ceil(canvas.width/spacing);
    lineCount += 10 - lineCount%10;
}

// button on click
const offset = 200;

homeButton.addEventListener('click', function(event) {
    targetOffset += offset;
});

aboutButton.addEventListener('click', function(event) {
    targetOffset += offset;
});

notesButton.addEventListener('click', function(event) {
    targetOffset += offset;
});

friendsButton.addEventListener('click', function(event) {  
    targetOffset += offset;
});

function draw() {
    currentOffset = lerp(currentOffset, targetOffset, 0.1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // arrow
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(canvas.width * 1/2 + 5, canvas.height* 3/4);
    ctx.lineTo(canvas.width * 1/2, canvas.height* 2/3);
    ctx.lineTo(canvas.width * 1/2 - 5, canvas.height* 3/4);

    ctx.stroke();

    // horizontal line
    ctx.strokeStyle = "#505050";
    ctx.lineWidth = 15;

    ctx.beginPath();

    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width * 1/5, canvas.height/2);
    ctx.moveTo(canvas.width * 4/5, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);

    ctx.stroke();
    
    // vertical line
    const totalWidth = spacing * lineCount;

    for(let i = 0; i < lineCount; i++){
        let x = i*spacing - currentOffset;

        x = ((x % totalWidth) + totalWidth) % totalWidth;
        const d = Math.abs(x - canvas.width/2);

        const r = 255 - Math.floor(200 * d/canvas.width*2);
        const g = 255 - Math.floor(200 * d/canvas.width*2);
        const b = 255 - Math.floor(200 * d/canvas.width*2);

        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 2;

        if(d < canvas.width * 2/7){
            ctx.beginPath();
            if(i%10 == 0){
                ctx.moveTo(x, canvas.height * 3/7);
                ctx.lineTo(x, canvas.height * 4/7);
            }
            else {
                ctx.moveTo(x, canvas.height * 10/21);
                ctx.lineTo(x, canvas.height * 11/21);
            }
            ctx.stroke();
        }
    }

    requestAnimationFrame(draw);
}