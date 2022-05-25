let camera, controls, scene, renderer;

let plane, cube, light, poly;

window.addEventListener('load', () => {
    init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
    animate();

    addSunControls();
});

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

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI;

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
        new THREE.PlaneGeometry(100, 100, 2, 2),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
        }));
    // plane.castShadow = false;
    // plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2
    plane.castShadow = false;
    plane.receiveShadow = true;
    window.plane = plane;
    let helper = new THREE.VertexNormalsHelper( plane, 20, 0x00ff00, 2 );

    // scene.add(plane);
    // scene.add(helper);
    const refLon = 37.364688;
    const refLat = -121.912974;

    let coords = [[-121.912974,37.364688],[-121.912801,37.364768],[-121.912779,37.36474],[-121.912745,37.364756],[-121.912769,37.364788],[-121.912731,37.364806],[-121.912705,37.364771],[-121.912651,37.364796],[-121.912671,37.364822],[-121.912548,37.36488],[-121.912438,37.364731],[-121.912554,37.364677],[-121.912528,37.364642],[-121.912669,37.364576],[-121.912643,37.364542],[-121.912809,37.364465],[-121.912974,37.364688]];
    coords = coords.slice(0, 4).map(([x, y]) => ([Math.floor((x - refLat) * 100000), Math.floor((y - refLon) * 100000)]));

    // coords.push([0, 20, 0]);
    // coords.pop();
    // console.log(coords);
    makeInstance(coords, 0, [-1, 0, 0]);
    makeInstance(coords, 10, [1, 0, 0]);
    makeInstance(coords, 20, [0, 1, 0]);
    makeInstance(coords, 30, [0, -1, 0]);
    makeInstance(coords, 40, [0, 0, 1]);
    makeInstance(coords, 50, [0, 0, -1]);
    // const normals = [];
    // const uvs = [];
    // for (let i = 0; i < coords.length; i++) {
    //     normals.push([0, 1, 0]);
    //     uvs.push([0, 1]);
    // }
    // const faces = earcut(coords.flatMap(a => ([a[0], a[1]])));
    // coords = coords.flatMap(a => ([a[0], 10, a[1]]));
    // console.log(coords);
    // console.log(faces);
    // // let points = coords.map(cord => new THREE.Vector3( cord[0], cord[1], cord[2] ));
    // // points = points.concat(coords.map(cord => new THREE.Vector3( cord[0], cord[1] + 10, cord[2] )))
    // // const points = [];
    // // points.push(new THREE.Vector3( 10, 20, 10 ));
    // // points.push(new THREE.Vector3( 20, 20, 10 ));
    // // points.push(new THREE.Vector3( 20, 20, 20 ));
    // // points.push(new THREE.Vector3( 10, 20, 20 ));
    // // points.push(new THREE.Vector3( 10, 20, 10 ));
    // // points.push(new THREE.Vector3( 20, 20, 10 ));
    // // points.push(new THREE.Vector3( 20, 20, 20 ));
    // // points.push(new THREE.Vector3( 10, 20, 20 ));
    //
    // // geometry = new THREE.ConvexGeometry(points);
    // // const path = new THREE.Path();
    // //
    // // path.moveTo(points[0].x, points[0].z);
    // // for (let point of points) {
    // //     // console.log(point);
    // //     path.lineTo(point.x, point.z);
    // // }
    // // geometry = new THREE.BufferGeometry().setFromPoints( points );
    // // material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    // // material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    // geometry = new THREE.BufferGeometry();
    // geometry.setAttribute(
    //     'position',
    //     new THREE.BufferAttribute(new Float32Array(coords), 3));
    // geometry.setAttribute(
    //     'normal',
    //     new THREE.BufferAttribute(new Float32Array(normals.flatMap(a => (a))), 3));
    // geometry.setAttribute(
    //     'uv',
    //     new THREE.BufferAttribute(new Float32Array(uvs.flatMap(a => (a))), 2));
    // geometry.setIndex(faces);
    // // geometry.computeVertexNormals();
    // material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    // poly = new THREE.Mesh(geometry, material);
    // poly.castShadow = false;
    // poly.receiveShadow = false;
    // helper = new THREE.VertexNormalsHelper( poly, 20, 0x00ffff, 2 );
    // scene.add(poly);
    // scene.add(helper);

    // lights

    const color = 0xFFFFFF;
    const intensity = 100;
    light = new THREE.PointLight( color, intensity, 200 );
    light.position.set(0, 80, 0);
    light.castShadow = true;
    scene.add(light);
    helper = new THREE.PointLightHelper( light, 50, 0xFF0000 );
    scene.add( helper );

    // const axesHelper = new THREE.AxesHelper( 50 );
    // scene.add( axesHelper );

    window.addEventListener( 'resize', onWindowResize );

}

function makeInstance(coords, displace, normalArr) {
    const normals = [];
    const uvs = [];
    for (let i = 0; i < coords.length; i++) {
        normals.push(normalArr);
        uvs.push([0, 1]);
    }
    const faces = earcut(coords.flatMap(a => ([a[0], a[1]])));
    coords = coords.flatMap(a => ([a[0], 10, a[1]]));
    console.log(coords);
    console.log(faces);
    // let points = coords.map(cord => new THREE.Vector3( cord[0], cord[1], cord[2] ));
    // points = points.concat(coords.map(cord => new THREE.Vector3( cord[0], cord[1] + 10, cord[2] )))
    // const points = [];
    // points.push(new THREE.Vector3( 10, 20, 10 ));
    // points.push(new THREE.Vector3( 20, 20, 10 ));
    // points.push(new THREE.Vector3( 20, 20, 20 ));
    // points.push(new THREE.Vector3( 10, 20, 20 ));
    // points.push(new THREE.Vector3( 10, 20, 10 ));
    // points.push(new THREE.Vector3( 20, 20, 10 ));
    // points.push(new THREE.Vector3( 20, 20, 20 ));
    // points.push(new THREE.Vector3( 10, 20, 20 ));

    // geometry = new THREE.ConvexGeometry(points);
    // const path = new THREE.Path();
    //
    // path.moveTo(points[0].x, points[0].z);
    // for (let point of points) {
    //     // console.log(point);
    //     path.lineTo(point.x, point.z);
    // }
    // geometry = new THREE.BufferGeometry().setFromPoints( points );
    // material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    // material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(coords), 3));
    geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(normals.flatMap(a => (a))), 3));
    geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs.flatMap(a => (a))), 2));
    geometry.setIndex(faces);
    // geometry.computeVertexNormals();
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    poly = new THREE.Mesh(geometry, material);
    poly.castShadow = false;
    poly.receiveShadow = false;
    poly.position.x += displace;
    let helper = new THREE.VertexNormalsHelper( poly, 20, 0x00ffff, 2 );
    scene.add(poly);
    scene.add(helper);
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
    // poly.rotation.x += 0.01;
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
