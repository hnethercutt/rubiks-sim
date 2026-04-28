import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x545454);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

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

const materials = {
    right: new THREE.MeshBasicMaterial({ color: colors.blue }),
    left: new THREE.MeshBasicMaterial({ color: colors.green }),
    top: new THREE.MeshBasicMaterial({ color: colors.white }),
    bottom: new THREE.MeshBasicMaterial({ color: colors.yellow }),
    front: new THREE.MeshBasicMaterial({ color: colors.red }),
    back: new THREE.MeshBasicMaterial({ color: colors.orange })
}

const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
});


const cubes = [];
const spacing = 1.05;

function createCube(x, y, z) {
    const cube = new THREE.Mesh(geometry, [
        x === 1 ? materials.right : colors.black,
        x === -1 ? materials.left : colors.black,
        y === 1 ? materials.top : colors.black,
        y === -1 ? materials.bottom : colors.black,
        z === 1 ? materials.front : colors.black,
        z === -1 ? materials.back : colors.black
    ]);

    cube.userData.grid = { x, y, z };
    cube.position.set(x * spacing, y * spacing, z * spacing);

    const outline = new THREE.Mesh(geometry, outlineMaterial);
    outline.scale.set(1.03 * spacing, 1.03 * spacing, 1.03 * spacing);
    cube.add(outline);

    scene.add(cube);
    cubes.push(cube);
}

for(let x = -1; x <= 1; x++) {
    for(let y = -1; y <= 1; y++) {
        for(let z = -1; z <= 1; z++) {
            createCube(x, y, z);
        }
    }
}

camera.position.z = 10;
camera.position.x = 3;

function animate(time) {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);