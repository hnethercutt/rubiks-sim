import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import { cubeRotations } from './cubeRotations';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x545454);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;
camera.position.x = 4;
camera.position.y = 4;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new ArcballControls(camera, renderer.domElement);
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN
}
// Makes cube rotation faster, snappier and prevent it from rotating on it's own
controls.rotateSpeed = 2.0;
controls.enableDamping = false;
controls.enableAnimations = false;

const geometry = new THREE.BoxGeometry(1, 1, 1);

const colors = {
    red: 0xBA0C2F,
    orange: 0xFE5000,
    yellow: 0xFFD700,
    green: 0x009A44,
    blue: 0x003DA5,
    white: 0xffffff,
    black: 0x000000
};

// Colors of each side of a solved Rubiks cube
const materials = {
    right: new THREE.MeshBasicMaterial({ color: colors.blue }),
    left: new THREE.MeshBasicMaterial({ color: colors.green }),
    top: new THREE.MeshBasicMaterial({ color: colors.white }),
    bottom: new THREE.MeshBasicMaterial({ color: colors.yellow }),
    front: new THREE.MeshBasicMaterial({ color: colors.red }),
    back: new THREE.MeshBasicMaterial({ color: colors.orange }),
    hidden: new THREE.MeshBasicMaterial({ color: colors.black })
}

const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    // So only the back of the mesh renders/creates the outline illusion
    side: THREE.BackSide,
});

const cubes = [];
// Between each cube
const spacing = 1.05;

function createCube(x, y, z) {
    // Coordinates are used to determine the color of each side of the cube
    const cube = new THREE.Mesh(geometry, [
        x === 1 ? materials.right : materials.hidden,
        x === -1 ? materials.left : materials.hidden,
        y === 1 ? materials.top : materials.hidden,
        y === -1 ? materials.bottom : materials.hidden,
        z === 1 ? materials.front : materials.hidden,
        z === -1 ? materials.back : materials.hidden
    ]);

    // Set the cube at the given x,y,z coordinates
    cube.position.set(x * spacing, y * spacing, z * spacing);
    // And log these coordinates to keep track of its location
    cube.userData.grid = { x, y, z };

    // Add an "outline" to each cube for better realism
    const outline = new THREE.Mesh(geometry, outlineMaterial);
    // Just a larger cube scaled taking the spacing between cubes into consideration
    outline.scale.set(1.03 * spacing, 1.03 * spacing, 1.03 * spacing);
    cube.add(outline);

    // We want to add all 27 cubes individually to the scene
    scene.add(cube);
    // But hold a copy of them altogether 
    cubes.push(cube);
}

// Creates a 3x3 Rubiks cube
for(let x = -1; x <= 1; x++) {
    for(let y = -1; y <= 1; y++) {
        for(let z = -1; z <= 1; z++) {
            createCube(x, y, z);
        }
    }
}

// Shuffle the cube after page loads
// setTimeout(() => {
//     shuffleCube();
// }, 300);

let lastRotation = null;
function shuffleCube() {
    const rotations = 20;
    const axes = ['x', 'y', 'z'];
    // Want to keep the original face colors in place so don't rotate center rows
    const layers = [-1, 1];

    let i = 0;

    function nextRotation() {
        if(i >= rotations) { return; }

        if(isRotating) {
            requestAnimationFrame(nextRotation);
            return;
        }

        let axis, layer;

        do {
            // Pick a random axis and layer to rotate 
            axis = axes[Math.floor(Math.random() * axes.length)];
            layer = layers[Math.floor(Math.random() * layers.length)];
        // Make sure the same axis/layer isn't rotated over and over again/ensure a proper shuffle is done
        } while (lastRotation && lastRotation.axis === axis && lastRotation.layer === layer);

        // Determine if this rotation will be clockwise or counterclockwise 
        let direction = Math.random() > 0.5 ? -1 : 1;

        lastRotation = { axis, layer };
        rotateLayer(axis, layer, direction);

        i++;
        requestAnimationFrame(nextRotation);
    }
    nextRotation();
}

// Use raycaster and mouse coordinates to determine what cube was clicked
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Used to prevent a click rotation from occurring if a user is rotating the entire Rubiks by mouse dragging
let isDragging = false;
let startX, startY = 0;

window.addEventListener('mousedown', (e) => {
    // Store the starting mouse coordinates on initial click
    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;
});
// Check to see if the mouse is in a new location when the click is complete
window.addEventListener('mousemove', (e) => {
    if(Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        isDragging = true;
    }
});

window.addEventListener('click', (e) => {
    if(isDragging) { return; }
    
    // Normalize mouse coordinates 
    mouse.x = (e.clientX / window.innerWidth * 2 - 1);
    mouse.y = -(e.clientY / window.innerHeight * 2 - 1);
    
    // Set mouse coordinates on click as the origin for the ray and cam = direction
    raycaster.setFromCamera(mouse, camera);

    // Gets all intersection points between the ray and cubes non-recursively 
    const intersects = raycaster.intersectObjects(cubes, false);
    
    // False when the user didn't actual click the cube
    if(intersects.length > 0) {
        // All rotations by default are clockwise, but they will be counterclockwise on holding Shift
        const clockDirection = e.shiftKey ? -1 : 1;
        // The first intersection point is going to be the clicked cube
        handleCubeClick(intersects[0], clockDirection);
    } 
});

const cubeRotationsList = cubeRotations;
function handleCubeClick(clickedCube, clockDirection) {
    // Need to get normal matrix from world space and the grid coordinates for the clicked cube
    const normal = clickedCube.face.normal.clone();
    normal.applyMatrix3(new THREE.Matrix3().getNormalMatrix(clickedCube.object.matrixWorld)).round();
    const grid = clickedCube.object.userData.grid;

    let axis, layer, direction;

    // Locate the cube rotation instructions from the array that matches the clicked cube
    const cubeRotation = cubeRotationsList.find(cube => 
        cube.grid_x === grid.x && cube.grid_y === grid.y &&
        cube.grid_z === grid.z && cube.normal_x === normal.x &&
        cube.normal_y === normal.y && cube.normal_z === normal.z
    );

    // And then use this to determine what layer needs to be rotated, on what axis and in what direction
    axis = cubeRotation.axis;
    layer = cubeRotation.layer;
    direction = cubeRotation.direction * clockDirection;
    // And then perform the rotation
    rotateLayer(axis, layer, direction);
}

let isRotating = false;
function rotateLayer(axis, layer, direction) {
    // Prevents cube from literally breaking if it's repeatedly clicked on while completing a rotation
    if(isRotating) { return; }
    isRotating = true;

    const group = new THREE.Group();
    // All cubes that are in the same axis and layer as the clicked one where the rotation needs to occur
    const selected = cubes.filter(cube => Math.round(cube.userData.grid[axis]) === layer);
    // Temporarily add these cubes to a group so they can be rotated together
    selected.forEach(cube => group.attach(cube));
    scene.add(group);

    // Angle for the group to rotate on so that it lands in the correct place
    const angle = (Math.PI / 2) * direction;

    // Perform the animation and then ungroup the cubes
    animateRotation(group, axis, angle, () => {
        selected.forEach(cube => {
            scene.attach(cube);
            updateGridPosition(cube, axis, direction);
        });
        scene.remove(group);
        isRotating = false;
    });
}

function animateRotation(group, axis, angle, onComplete) {
    let rotated = 0;
    const speed = 0.1;

    function rotate() {
        // Continue animation until the rotating part of the cube is back in place
        if(Math.abs(rotated) >= Math.abs(angle)) {
            group.rotation[axis] = angle;
            onComplete();
            return;
        }

        // Animation is done by slowly increasing the group of cubes rotation
        const step = Math.sign(angle) * speed;
        group.rotation[axis] += step;
        rotated += step;

        requestAnimationFrame(rotate);
    }
    rotate();
}

/*
 * Need to make sure positions are attached to the cube currently in that spot and not with the cube that was there initially
 * This is important for consistent animations.
*/
function updateGridPosition(cube, axis, direction) {
    let { x, y, z } = cube.userData.grid;

    // We only need to update the coordinates not on the axis the cube rotated on
    if(axis === 'x') {
        cube.userData.grid.y = -direction * z;
        cube.userData.grid.z = direction * y;
    }

    if(axis === 'y') {
        cube.userData.grid.x = direction * z;
        cube.userData.grid.z = -direction * x;
    }

    if(axis === 'z') {
        cube.userData.grid.x = -direction * y;
        cube.userData.grid.y = direction * x;
    }
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);