import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x545454);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
camera.position.x = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new TrackballControls(camera, renderer.domElement);
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
}
// Makes cube rotation faster and snappier
controls.rotateSpeed = 8.0;
controls.staticMoving = false;
controls.dynamicDampingFactor = 0.5;

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
function createCube(x, y, z) {
    // Between each cube
    const spacing = 1.05;

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

function animate() {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);