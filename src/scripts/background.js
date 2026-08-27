import { float } from "three/tsl";

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.appendChild(canvas);

function random(l, r) {
    return Math.floor(Math.random() * (r - l + 1)) + l;
}

function rgba(r, g, b, a){
    return 'rgba(' + r + ',' +  g + ',' + b + ',' + a + ')'; 
}

const space = 50;
const points = [];

let mouse = {x: -1000, y: -1000};

for (let i = -100; i < canvas.width+100; i += space) {
    for (let j = -100; j < canvas.height+100; j += space) {

        let x;
        let y;

        if ((j / space) % 2 === 1) {
            x = i + random(10, 30);
            y = j + random(10, 30);
        }
        else {
            x = i + space / 2 + random(10, 30);
            y = j + random(10, 30);
        }

        points.push({
            x: x,
            y: y,

            ox: x,
            oy: y,

            vx: 0,
            vy: 0,
            
            color: 'rgba(50, 50, 50,' + random(50, 100)/100 + ')'
        });
    }
}


// mouse
let lastTime = Date.now();
let lastX = 0;
let lastY = 0;
let speed = 0;

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const currentTime = Date.now();
    const timeDelta = currentTime - lastTime;

    if (timeDelta > 0) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        speed = (distance / timeDelta)*2;
        
        lastTime = currentTime;
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of points) {
        // mouse move
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        // const dx = p.x - canvas.width/2;
        // const dy = p.y - canvas.height/2;

        const distance = Math.sqrt(dx * dx + dy * dy);

        const radius = 800;

        if (distance < radius) {
            const force = -(1 - distance/radius) * speed;

            const angle = Math.atan2(dy, dx);

            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
            p.color = rgba(255, 255, 255, 0.3-force/10);
        }

        // return to original position
        p.vx += (p.ox - p.x) * 0.03;
        p.vy += (p.oy - p.y) * 0.03;

        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx;
        p.y += p.vy;
    }

    

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#252525';

    for (let i = 0; i < points.length; i++) {

        const p = points[i];

        for (let j = i + 1; j < points.length; j++) {

            const q = points[j];

            const dx = p.x - q.x;
            const dy = p.y - q.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            // if (distance < space*2) {

            //     ctx.strokeStyle = p.color;
            //     ctx.beginPath();

            //     ctx.moveTo(p.x, p.y);
            //     ctx.lineTo(q.x, q.y);

            //     ctx.stroke();
            // }
        }
    }

    ctx.fillStyle = '#fff';

    for (const p of points) {

        ctx.fillStyle = p.color;
        ctx.beginPath();

        ctx.rect(
            p.x - 3,
            p.y - 3,
            2,
            2
        );

        ctx.fill();
    }


    requestAnimationFrame(animate);
}

animate();