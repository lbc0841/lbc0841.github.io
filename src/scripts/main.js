import * as THREE from 'three';

import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { Sky } from 'three/addons/objects/Sky.js';

import friends from '../data/friends.json' with { type: 'json' };

// ====== Val ======
let webglRenderer, cssRenderer, scene, camera;

let terrainPositionOffsetY = 0, cameraRotateOffsetY = 0
let cameraRotateTargetY = 0;

let terrain = null, sphere = null;

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
initHomePage();
initAboutPage();
initNotesPage();
initFriendsPage();

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

function init(){
    // WebGL Renderer
    webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    webglRenderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(webglRenderer.domElement);

    // CSS Render
    cssRenderer = new CSS3DRenderer({ alpha: true });
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    document.body.appendChild(cssRenderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
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
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x525252,
                    wireframe: true,
                    wireframeLinewidth: 1
                });
            }
        });

        terrain = root;
        scene.add(terrain);
    });

    // Sphere
    objLoader.load('/threejs/model/sphere.obj', (root) => {
        root.scale.set(10, 10, 10);
        root.position.set(0, 0, -50);

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

function initHomePage(){
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
    const homePageNumber = createElement("div", ["page-title"], "01");
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
    socialLink_discord.href = "https://www.google.com/?pli=1";
    socialLink_discord.appendChild(discord_logo);
    socialLink_discord.appendChild(createElement("span", [], "Discord"));

    const socialLink_github = createElement("a", ["social-link"], "");
    const github_logo = createElement("span", ["fa-brands", "fa-github"], "");
    socialLink_github.href = "https://www.google.com/?pli=1";
    socialLink_github.appendChild(github_logo);
    socialLink_github.appendChild(createElement("span", [], "GitHub"));

    socialLinkContainer.appendChild(socialLink_discord);
    socialLinkContainer.appendChild(socialLink_github);
    homePage.appendChild(socialLinkContainer);

    // CSS3DObject
    const Object_homePage = new CSS3DObject(homePage);
    const Object_homePageBorder = new CSS3DObject(homePageBorder);

    Object_homePage.scale.set(2, 2, 2);
    Object_homePage.position.set(0, 0, -1450);
    Object_homePage.rotation.set(0, 0, 0);

    Object_homePageBorder.scale.set(2, 2, 2);
    Object_homePageBorder.position.set(0, 0, -1600);
    Object_homePageBorder.rotation.set(0, 0, 0);

    scene.add(Object_homePage);
    scene.add(Object_homePageBorder);
}

function initAboutPage(){
    // About Page
    const aboutPage = createElement("div", ["page"], "");

    // About Page Border
    const aboutPageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const aboutPageNumber = createElement("div", ["page-title"], "02");
    const aboutPageTitle = createElement("h3", ["text-lg"], "About Me");

    aboutPageNumber.appendChild(aboutPageTitle)
    aboutPage.appendChild(aboutPageNumber);

    // Description
    const sideBar = createElement("div", ["side-bar"], "");
    const avatar = createElement("img", ["h-[140px]", "w-[140px]", "mx-2", "my-4"], "");
    avatar.src = "https://avatars.githubusercontent.com/lbc0841";

    const desc = createElement("div", ["motto"], "梭哈，是種智慧\n賭狗，應有盡有");
    const l1 = createElement("h3", ["mx-2", "mt-4"], "- MBIT：INTP");
    const l2 = createElement("h3", ["mx-2"], "- 愚人節生日");
    const l3 = createElement("h3", ["mx-2"], "- 我裂開了");

    sideBar.appendChild(avatar);
    sideBar.appendChild(desc);
    sideBar.appendChild(l1);
    sideBar.appendChild(l2);
    sideBar.appendChild(l3);

    aboutPage.appendChild(sideBar);

    // CSS3DObject
    const Object_aboutPage = new CSS3DObject(aboutPage);
    const Object_aboutPageBorder = new CSS3DObject(aboutPageBorder);
    
    Object_aboutPage.scale.set(2, 2, 2);
    Object_aboutPage.position.set(1450, 0, 0);
    Object_aboutPage.rotation.set(0, Math.PI*3/2, 0);
    
    Object_aboutPageBorder.scale.set(2, 2, 2);
    Object_aboutPageBorder.position.set(1600, 0, 0);
    Object_aboutPageBorder.rotation.set(0, Math.PI*3/2, 0);
    
    scene.add(Object_aboutPage);
    scene.add(Object_aboutPageBorder);
}

function initNotesPage(){
    // Notes Page
    const notesPage = createElement("div", ["page"], "");

    // Notes Page Border
    const notesPageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const notesPageNumber = createElement("div", ["page-title"], "03");
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
    const Object_notesPage = new CSS3DObject(notesPage);
    const Object_notesPageBorder = new CSS3DObject(notesPageBorder);
    
    Object_notesPage.scale.set(2, 2, 2);
    Object_notesPage.position.set(0, 0, 1450);
    Object_notesPage.rotation.set(0, Math.PI, 0);
    
    Object_notesPageBorder.scale.set(2, 2, 2);
    Object_notesPageBorder.position.set(0, Math.PI, 1600);
    Object_notesPageBorder.rotation.set(0, Math.PI, 0);
    
    scene.add(Object_notesPage);
    scene.add(Object_notesPageBorder);
}

function initFriendsPage(){
    // Friends Page
    const friendsPage = createElement("div", ["page"], "");

    // Friends Page Border
    const friendsPageBorder = createElement("div", ["page-border"], "");

    // Page Number
    const friendsPageNumber = createElement("div", ["page-title"], "04");
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
        const desc = createElement("span", ["desc"], f.desc);
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
    Object_friendsPage.position.set(-1450, 0, 0);
    Object_friendsPage.rotation.set(0, Math.PI/2, 0);
    
    Object_friendsPageBorder.scale.set(2, 2, 2);
    Object_friendsPageBorder.position.set(-1600, 0, 0);
    Object_friendsPageBorder.rotation.set(0, Math.PI/2, 0);
    
    scene.add(Object_friendsPage);
    scene.add(Object_friendsPageBorder);
}

// mouse listener
window.addEventListener('mousemove', (e)=>{
    cameraRotateOffsetY = clamp((e.clientX - centerX)/w*0.5, -0.08, 0.08);
    terrainPositionOffsetY = clamp((e.clientY - centerY)/h*10, -12, 12);
});

window.addEventListener('wheel', function(event) {
    cameraRotateTargetY -= event.deltaY*0.005;
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
    cameraRotateTargetY = getMinRotateDistance(camera.rotation.y, 0);
});

aboutButton.addEventListener('click', function(event) {
    cameraRotateTargetY = getMinRotateDistance(camera.rotation.y, Math.PI*3/2);
});

notesButton.addEventListener('click', function(event) {
    cameraRotateTargetY = getMinRotateDistance(camera.rotation.y, Math.PI);
});

friendsButton.addEventListener('click', function(event) {  
    cameraRotateTargetY = getMinRotateDistance(camera.rotation.y, Math.PI/2);
});

// Animate
function animate(){
    requestAnimationFrame(animate);

    camera.rotation.y = lerp(camera.rotation.y, cameraRotateTargetY + cameraRotateOffsetY, 0.1);
    if(terrain) terrain.position.y = -10 + lerp(terrain.position.y, terrainPositionOffsetY, 0.1);
    if(sphere){
        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.002;
    }


    webglRenderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}
