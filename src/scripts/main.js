import * as THREE from 'three';

import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

import { treemap, hierarchy, tree } from "https://cdn.skypack.dev/d3-hierarchy@3";
import * as d3 from "https://cdn.skypack.dev/d3@7";

import friends from '../data/friends.json' with { type: 'json' };
import skill_tree from '../data/skill_tree.json' with { type: 'json' };
import live from '../data/live.json' with { type: 'json' };

// ====== Val ======
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

let webglRenderer, cssRenderer, scene, camera;
const cameraGroup = new THREE.Group();

let cameraRotateOffsetX = 0, cameraRotateOffsetY = 0
let cameraRotateTargetY = 0;

let terrain = null, sphere = null;

// particle
const particleCount = 5000;
let particleGeometry = new THREE.BufferGeometry();
const particlePosition = new Float32Array(particleCount * 3);
const particleVelocity = [];

// page
const pageGroups = [];
let pageNum = 0;

let lastTouchX = 0;
let basePageDistance = 0;
if(isMobile) basePageDistance = 1800;
else basePageDistance = 1450;
 
// Canvas W H
const w = window.innerWidth;
const centerX = w/2;

const h = window.innerHeight;
const centerY = h/2;

// Main Navigation Button
const homeButton = document.getElementById("home-button");
const aboutButton = document.getElementById("about-button");
const notesButton = document.getElementById("notes-button");
const friendsButton = document.getElementById("friends-button");

// ====== Init ======
init();

initObjects();
initParticle();

initHomePage();
initAboutPage();
// initNotesPage();
initLivePage();
initFriendsPage();

pageGroups.forEach((pg, index) => {
    pg.rotation.set(0, -(Math.PI*2 * index/pageGroups.length), 0);
    scene.add(pg);
});

// animate
animate();

// ======
function lerp(start, end, time){
    return start + (end - start) * time;
}

function clamp(val, min, max){
    if(val > max) return max;
    if(val < min) return min;
    return val;
}

function getMinRotateDistance(camera, target){
    if(Math.abs(camera-(target-Math.PI*2)) < Math.abs(camera-target)) return target - Math.PI*2;
    return target;
}

function createElement(tagName, classes, content){
    const element = document.createElement(tagName);
    element.textContent = content;

    classes.forEach(c => {
        element.classList.add(c);
    });

    return element;
}

function createCircleTexture(){
    const size = 128;
    const canvas = document.createElement("canvas");

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// ====== Init function ======
function init(){
    // WebGL Renderer
    webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    webglRenderer.setPixelRatio(window.devicePixelRatio);
    // webglRenderer.setClearColor(0x000000, 0);
    document.body.appendChild(webglRenderer.domElement);

    // CSS Render
    cssRenderer = new CSS3DRenderer({ alpha: false });
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    document.body.appendChild(cssRenderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    cameraGroup.add(camera);

    scene.add(cameraGroup);
    // texture loader
    // textureLoader = new THREE.TextureLoader();
}

function initObjects(){
    const objLoader = new OBJLoader();

    // Terrain
    objLoader.load('/threejs/model/terrain.obj', (root) => {
        root.scale.set(10, 10, 10);
        root.position.y = -60;

        root.traverse((child) => {
            if (child.isMesh) {
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        // 目前不需要 cameraPosition uniform（因為用 view space 計算距離）
                    },
                    vertexShader: `
                        varying vec3 vWorldPosition;
                
                        void main() {
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `,
                    fragmentShader: `
                        precision mediump float;   // ← 這一行很重要！
                
                        varying vec3 vWorldPosition;
                
                        void main() {
                            float distance = length(vWorldPosition);
                
                            float minDist = 100.0;
                            float maxDist = 1000.0;
                
                            float t = clamp((distance - minDist) / (maxDist - minDist), 0.0, 1.0);
                
                            vec3 nearColor = vec3(0, 0, 0);
                            vec3 farColor  = vec3(0.2, 0.2, 0.2);
                
                            vec3 color = mix(nearColor, farColor, t);
                
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `,
                    wireframe: true,
                    wireframeLinewidth: 1.5
                });

                child.material = material;
            }
        });

        terrain = root;
        scene.add(terrain);
    });

    // Sphere
    objLoader.load('/threejs/model/sphere.obj', (root) => {
        root.scale.set(10, 10, 10);
        root.position.set(0, 0, -(basePageDistance/25));

        root.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0xc97115,
                    wireframe: true,
                    wireframeLinewidth: 1
                });
            }
        });

        sphere = root;
        scene.add(sphere);
    });
}

function initParticle(){
    for(let i=0; i<particleCount; i++){
        particlePosition[i*3] = (Math.random()-0.5) * 400;
        particlePosition[i*3+1] = (Math.random()-0.4) * 100;
        particlePosition[i*3+2] = (Math.random()-0.5) * 400;

        particleVelocity.push(0.1 + Math.random()*0.1);
    }

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePosition, 3)
    );

    const material = new THREE.PointsMaterial({
        map: createCircleTexture(),
        size: 1,
        transparent:true,
        opacity: 0.3,
        depthWrite:false,
        blending: THREE.AdditiveBlending
    });

    const particle = new THREE.Points(particleGeometry, material);
    scene.add(particle);
}

function initHomePage(){
    pageNum++;
    
    // Home Page
    const homePage = createElement("div", ["page"], "");

    // Home Page Border
    const homePageBorder = createElement("div", ["page-border"], "");

    // Logo
    const logo = createElement("div", ["logo"], "");
    homePage.appendChild(logo);

    window.addEventListener('load', function () {
		lottie.loadAnimation({
			container: logo,
			renderer: 'svg',
			loop: false,
			autoplay: true,
			path: '/lottie/logo.json'
		});
	});

    // Page Number
    const homePageNumber = createElement("div", ["page-title"], "0"+pageNum);
    const homePageTitle = createElement("h3", ["text-lg"], "Home Page");

    homePageNumber.appendChild(homePageTitle)
    homePage.appendChild(homePageNumber);

    // Version
    const version = createElement("div", ["version"], "Version: Beta");
    homePage.appendChild(version);

    // Last Update
    const lastUpdateContainer = createElement("div", ["last-update-container"], "Last Update");
    const lastUpdateDate = createElement("h3", ["last-update-date"], "May 2026");

    lastUpdateContainer.appendChild(lastUpdateDate);
    homePage.appendChild(lastUpdateContainer);

    // Social Link
    const socialLinkContainer = createElement("div", ["social-link-container"], "");

    const socialLink_discord = createElement("a", ["social-link"], "");
    const discord_logo = createElement("span", ["fa-brands", "fa-discord"], "");
    socialLink_discord.href = "https://discord.gg/GWEmUwaSFG";
    socialLink_discord.appendChild(discord_logo);
    socialLink_discord.appendChild(createElement("span", [], "Discord"));

    const socialLink_github = createElement("a", ["social-link"], "");
    const github_logo = createElement("span", ["fa-brands", "fa-github"], "");
    socialLink_github.href = "https://github.com/lbc0841";
    socialLink_github.appendChild(github_logo);
    socialLink_github.appendChild(createElement("span", [], "GitHub"));

    socialLinkContainer.appendChild(socialLink_discord);
    socialLinkContainer.appendChild(socialLink_github);
    homePage.appendChild(socialLinkContainer);

    // CSS3DObject
    const Object_homePage = new CSS3DObject(homePage);
    const Object_homePageBorder = new CSS3DObject(homePageBorder);

    Object_homePage.scale.set(2, 2, 2);
    Object_homePage.position.set(0, 0, -basePageDistance);

    Object_homePageBorder.scale.set(2, 2, 2);
    Object_homePageBorder.position.set(0, 0, -(basePageDistance+150));

    const group = new THREE.Group();
    group.add(Object_homePage);
    group.add(Object_homePageBorder);

    pageGroups.push(group);
}

function initAboutPage(){
    pageNum++;

    // About Page
    const aboutPage = createElement("div", ["page"], "");

    // About Page Border
    const aboutPageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const aboutPageNumber = createElement("div", ["page-title"], "0"+pageNum);
    const aboutPageTitle = createElement("h3", ["text-lg"], "About Me");

    aboutPageNumber.appendChild(aboutPageTitle)
    aboutPage.appendChild(aboutPageNumber);

    // Description
    const sideBar = createElement("div", ["side-bar"], "");
    const avatar = createElement("img", ["avatar"], "");
    avatar.src = "https://avatars.githubusercontent.com/lbc0841";

    const motto = createElement("div", ["motto"], "梭哈，是種智慧\n賭狗，應有盡有");
    const desc = createElement("h3", ["author-desc"], "- MBIT：INTP\n- 愚人節生日\n- 我裂開了");

    sideBar.appendChild(avatar);
    sideBar.appendChild(motto);
    sideBar.appendChild(desc);

    aboutPage.appendChild(sideBar);

    // chart
    const chart = createElement("div", ["chart"], "");

    drawTree(chart);
    aboutPage.appendChild(chart);

    // CSS3DObject
    const Object_aboutPage = new CSS3DObject(aboutPage);
    const Object_aboutPageBorder = new CSS3DObject(aboutPageBorder);
    
    Object_aboutPage.scale.set(2, 2, 2);
    Object_aboutPage.position.set(0, 0, -basePageDistance);
    
    Object_aboutPageBorder.scale.set(2, 2, 2);
    Object_aboutPageBorder.position.set(0, 0, -(basePageDistance+150));
    
    const group = new THREE.Group();
    group.add(Object_aboutPage);
    group.add(Object_aboutPageBorder);

    pageGroups.push(group);
}

function initNotesPage(){
    pageNum++;

    // Notes Page
    const notesPage = createElement("div", ["page"], "");

    // Notes Page Border
    const notesPageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const notesPageNumber = createElement("div", ["page-title"], "0"+pageNum);
    const notesPageTitle = createElement("h3", ["text-lg"], "My Notes");
    
    notesPageNumber.appendChild(notesPageTitle)
    notesPage.appendChild(notesPageNumber);

    // 01
    const notes = createElement("div", ["notes-container"], "");
    const note1 = createElement("div", ["note"], "01. 數位電子乙級");
    const note2 = createElement("div", ["note"], "02. ZJANS-ZeroJudge題解");
    
    notes.appendChild(note1);
    notes.appendChild(note2);
    notesPage.appendChild(notes);

    // CSS3DObject
    const Object_livePage = new CSS3DObject(notesPage);
    const Object_livePageBorder = new CSS3DObject(notesPageBorder);
    
    Object_livePage.scale.set(2, 2, 2);
    Object_livePage.position.set(0, 0, -basePageDistance);
    
    Object_livePageBorder.scale.set(2, 2, 2);
    Object_livePageBorder.position.set(0, 0, -(basePageDistance+150));
    
    const group = new THREE.Group();
    group.add(Object_livePage);
    group.add(Object_livePageBorder);

    pageGroups.push(group);
}

function initLivePage(){
    pageNum++;

    // Live Page
    const livePage = createElement("div", ["page"], "");

    // Live Page Border
    const livePageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const livePageNumber = createElement("div", ["page-title"], "0"+pageNum);
    const livePageTitle = createElement("h3", ["text-lg"], "My Live");
    
    livePageNumber.appendChild(livePageTitle)
    livePage.appendChild(livePageNumber);

    // Live
    const liveContainer = createElement("div", ["live-container"], "");

    live.forEach(l => {
        const item = createElement("div", ["live-item"], "");

        const img = createElement("div", ["live-img"], "");
        img.style.background = "url(" + l.image + ")";
        img.style.backgroundSize = "cover";
        img.style.backgroundPosition = "center";

        const content = createElement("div", ["live-content"], l.name);

        item.appendChild(img);
        item.appendChild(content);
        liveContainer.appendChild(item);
    });

    livePage.appendChild(liveContainer);

    // CSS3DObject
    const Object_notesPage = new CSS3DObject(livePage);
    const Object_notesPageBorder = new CSS3DObject(livePageBorder);
    
    Object_notesPage.scale.set(2, 2, 2);
    Object_notesPage.position.set(0, 0, -basePageDistance);
    
    Object_notesPageBorder.scale.set(2, 2, 2);
    Object_notesPageBorder.position.set(0, 0, -(basePageDistance+150));
    
    const group = new THREE.Group();
    group.add(Object_notesPage);
    group.add(Object_notesPageBorder);

    pageGroups.push(group);
}

function initFriendsPage(){
    pageNum++;

    // Friends Page
    const friendsPage = createElement("div", ["page"], "");

    // Friends Page Border
    const friendsPageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const friendsPageNumber = createElement("div", ["page-title"], "0"+pageNum);
    const friendsPageTitle = createElement("h3", ["text-lg"], "Friends List");
    
    friendsPageNumber.appendChild(friendsPageTitle)
    friendsPage.appendChild(friendsPageNumber);

    // Friends
    const friendsContainer = createElement("div", ["friends-container"], "");
    friends.forEach(f => {
        const friend = createElement("a", ["friend"], "");
        friend.href = f.url;

        const avatar = createElement("img", ["h-full"], "");
        avatar.src = f.avatar;

        const nameContainer = createElement("div", ["w-full"], "");
        const name = createElement("h3", ["name"], f.name);
        const desc = createElement("span", ["friend-desc"], f.desc);
        nameContainer.appendChild(name);
        nameContainer.appendChild(desc);

        friend.appendChild(avatar);
        friend.appendChild(nameContainer);
        friendsContainer.appendChild(friend);
    });
    
    friendsPage.appendChild(friendsContainer);

    // CSS3DObject
    const Object_friendsPage = new CSS3DObject(friendsPage);
    const Object_friendsPageBorder = new CSS3DObject(friendsPageBorder);
    
    Object_friendsPage.scale.set(2, 2, 2);
    Object_friendsPage.position.set(0, 0, -basePageDistance);
    
    Object_friendsPageBorder.scale.set(2, 2, 2);
    Object_friendsPageBorder.position.set(0, 0, -(basePageDistance+150));
    
    const group = new THREE.Group();
    group.add(Object_friendsPage);
    group.add(Object_friendsPageBorder);

    pageGroups.push(group);
}

// mouse listener
window.addEventListener('mousemove', (e)=>{
    if(!isMobile){
        cameraRotateOffsetY = clamp((e.clientX - centerX)/w*0.4, -0.06, 0.06);
        cameraRotateOffsetX = clamp((e.clientY - centerY)/w*0.4, -0.06, 0.06);
    }
});

// PC Scroll
window.addEventListener('wheel', function(event) {
    cameraRotateTargetY -= event.deltaY*0.003;
}, { passive: true });

// Mobile Scroll
window.addEventListener("touchstart", (e) => {
    lastTouchX = e.touches[0].clientX;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - lastTouchX;

    cameraRotateTargetY += deltaX*0.004;

    lastTouchX = touchX;
}, { passive: true });

// on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

// button on click
homeButton.addEventListener('click', function(event) {
    cameraRotateTargetY = getMinRotateDistance(cameraGroup.rotation.y, 0);
});

aboutButton.addEventListener('click', function(event) {
    cameraRotateTargetY = getMinRotateDistance(cameraGroup.rotation.y, Math.PI*3/2);
});

notesButton.addEventListener('click', function(event) {
    cameraRotateTargetY = getMinRotateDistance(cameraGroup.rotation.y, Math.PI);
});

friendsButton.addEventListener('click', function(event) {  
    cameraRotateTargetY = getMinRotateDistance(cameraGroup.rotation.y, Math.PI/2);
});

// Animate
function animate(){
    requestAnimationFrame(animate);

    updateCamera();
    updateParticle();

    if(sphere){
        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.002;
    }

    webglRenderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}

function drawTree(chart){
    let width = 680;
    let height = 500;
    
    const svg = d3.select(chart)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr('transform', `translate(${0},${30})`);

    const hierarchyData = d3.hierarchy(skill_tree, function(d){ return d.children;});
    const tree = d3.tree().size([width, height-100]);

    // node

    // node group
    const node = svg.append("g")
        .selectAll("g")
        .data(tree(hierarchyData).descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // 圖片 node
    node.append("image")
        .attr("href", d => d.data.logo)
        .attr("x", -20)
        .attr("y", -20)
        .attr("width", 40)
        .attr("height", 40);

    // 名稱
    node.append("text")
        .text(d => d.data.name)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "white");


    // line
    const g = svg.append("g");

    g.selectAll("path")
        .data(tree(hierarchyData).descendants().slice(1))
        .join("path")
        .attr("d", function(d) {
            return "M" + d.x + "," + d.y
                // + "L" + d.x + "," + (d.y - d.parent.y/2)
                + "C" + d.x + "," + (d.y + d.parent.y) / 2.5
                + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2.5
                + " " + d.parent.x + "," + d.parent.y;
            })
        .attr("stroke","white").attr("fill","none");
}

function updateCamera(){
    cameraGroup.rotation.y = lerp(cameraGroup.rotation.y, cameraRotateTargetY + cameraRotateOffsetY, 0.1);
    camera.rotation.x = lerp(camera.rotation.x, cameraRotateOffsetX, 0.1);
    camera.rotation.z = lerp(camera.rotation.z, (cameraGroup.rotation.y-cameraRotateTargetY)*0.2, 0.1);
}

function updateParticle(){
    const pos = particleGeometry.attributes.position.array;

    for(let i=0; i<particleCount; i++){

        pos[i*3+1] -= particleVelocity[i];

        if(pos[i*3+1] < -60){

            pos[i*3+1] = 60;

            pos[i*3] = (Math.random()-0.5)*400;
            pos[i*3+2] = (Math.random()-0.5)*400;
        }
    }

    particleGeometry.attributes.position.needsUpdate = true;
}
