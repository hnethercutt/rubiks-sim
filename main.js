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
const material = [
    new THREE.MeshBasicMaterial({color: 0x009A44}), // right GREEN
    new THREE.MeshBasicMaterial({color: 0x003DA5}), // left BLUE
    new THREE.MeshBasicMaterial({color: 0xBA0C2F}), // top RED
    new THREE.MeshBasicMaterial({color: 0xFE5000}), // bottom ORANGE
    new THREE.MeshBasicMaterial({color: 0xffffff}), // front WHITE
    new THREE.MeshBasicMaterial({color: 0xFFD700}) // back YELLOW
];
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
});

addCube();
function addCube() {
    for(let z = 0; z < 3; z++) {
        for(let x = 0; x < 3; x++) {
            for(let y = 0; y < 3; y++) {
                const cube = new THREE.Mesh(geometry, material);
    
                cube.position.set(x * 1.05, y * 1.05, z * 1.05);
                scene.add(cube);

                const outline = new THREE.Mesh(geometry, outlineMaterial);
                outline.scale.set(1.03 * 1.05, 1.03 * 1.05, 1.03 * 1.05);
                outline.position.copy(cube.position);
                scene.add(outline);
            }
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