import * as THREE from 'three';

import { OrbitControls } from '/OrbitControls.js';

let camera, controls, scene, renderer;

let plane, cube, light;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

addSunControls();

function init(array, offset) {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );
    // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 0, 100);

    // controls

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 4;

    // world

    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 20;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    scene.background = new THREE.Color(0xffffff);

    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
        }));
    // plane.castShadow = false;
    // plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2
    plane.castShadow = false;
    plane.receiveShadow = true;
    scene.add(plane);

    // lights

    const color = 0xFFFFFF;
    const intensity = 100;
    light = new THREE.PointLight( color, intensity, 200 );
    light.position.set(0, 80, 0);
    light.castShadow = true;
    scene.add(light);
    const helper = new THREE.PointLightHelper( light, 50, 0xFF0000 );
    scene.add( helper );

    const axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    // cube.rotation.x += 0.01;
    // light.position.x += 0.1;
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {

    renderer.render( scene, camera );

}

function addSunControls() {
    const dayTimeSlider = document.querySelector('#dayTimeSlider');
    dayTimeSlider.addEventListener('input', onChangeDayTimeSlider);
}

function onChangeDayTimeSlider(event) {
    const value = event.target.value;
    light.position.x = value;
}
