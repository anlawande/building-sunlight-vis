import GlobalMercator from './resources/globalmaptiles.js';

let camera, controls, scene, renderer;

let plane, cube, light, poly, sceneLights = [];

const globalMercatorUtils = new GlobalMercator();

window.addEventListener('load', () => {
    init();
    animate();

    loadAndRenderTileData();
    addControls();
});

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );
    // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 0, 200);

    // controls

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 0;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI;

    // world

    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 20;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.background = new THREE.Color(0xffffff);

    plane = new THREE.Mesh(
        //See Ref 1
        new THREE.PlaneGeometry(1223, 1223),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
        }));
    plane.rotation.x = -Math.PI / 2
    plane.castShadow = false;
    plane.receiveShadow = true;

    scene.add(plane);

    makeLights();

    const axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    window.addEventListener( 'resize', onWindowResize );

}

function makeLights() {
    const color = 0xFFFFFF;
    const intensity = 20;

    light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.position.y = 50;
    scene.add(light);
    let helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);

    let sceneLight = new THREE.PointLight( color, 1, 200 );
    sceneLight.position.set(200, 10, 0);
    scene.add(sceneLight);
    sceneLights.push(sceneLight);
    helper = new THREE.PointLightHelper(sceneLight, 10, 0xFF0000 );
    scene.add( helper );

    sceneLight = new THREE.PointLight( color, 1, 200 );
    sceneLight.position.set(-200, 10, 0);
    scene.add(sceneLight);
    sceneLights.push(sceneLight);
    helper = new THREE.PointLightHelper(sceneLight, 10, 0xFF0000 );
    scene.add( helper );

    sceneLight = new THREE.PointLight( color, 1, 200 );
    sceneLight.position.set(0, 10, 200);
    scene.add(sceneLight);
    sceneLights.push(sceneLight);
    helper = new THREE.PointLightHelper(sceneLight, 10, 0xFF0000 );
    scene.add( helper );

    sceneLight = new THREE.PointLight( color, 1, 200 );
    sceneLight.position.set(0, 10, -200);
    scene.add(sceneLight);
    sceneLights.push(sceneLight);
    helper = new THREE.PointLightHelper(sceneLight, 10, 0xFF0000 );
    scene.add( helper );
}

function makeInstance(coords, height) {
    var buildingShape = new THREE.Shape();

    buildingShape.moveTo(coords[0][0], coords[0][1]);
    coords.forEach(e => buildingShape.lineTo(e[0], e[1]));
    const extrudeSettings = {
        depth: height / 6.115, bevelEnabled: true, bevelSegments: 2, steps: 2,
        bevelSize: 0.1, bevelThickness: 0.1
    };

    let geometry = new THREE.ExtrudeGeometry(buildingShape, extrudeSettings);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x777777 }));
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0;
    scene.add(mesh);
}

function loadAndRenderTileData() {
    fetch('https://b.data.osmbuildings.org/0.2/ph2apjye/tile/15/5287/12712.json').then(j => j.json())
        .then((data) => {

            const refXTile = 5287;
            const refYTile = 12712;
            const tileBounds = globalMercatorUtils.TileBounds(refXTile,refYTile,15)
            const {lat: minLat, lon: minLon} = globalMercatorUtils.MetersToLatLon(tileBounds.minx, tileBounds.miny);
            const {lat: maxLat, lon: maxLon} = globalMercatorUtils.MetersToLatLon(tileBounds.maxx, tileBounds.maxy);
            const refLon = (minLon + maxLon) / 2;
            const refLat = -(minLat + maxLat) / 2;
            const latsPerUnit = 0.00005493172835070069; //See calculations below
            const longsPerUnits = 1 / (40075000 * Math.cos(refLat) / 360) * 8; // No idea how it is off by factor of 8;

            for (let i = 0; i < data.features.length; i++) {
                const coordsArr = data.features[i].geometry.coordinates;
                for (let j = 0; j < coordsArr.length; j++) {
                    let coords = coordsArr[j];
                    coords = coords.map(([x, y]) => {
                        return ([(x - refLon) / longsPerUnits, (y - refLat) / latsPerUnit])
                    });
                    makeInstance(coords, data.features[i].properties.height);
                }
            }
        });
}

function legacyBufferGeometryEarcutAlgo(coords, displace, normalArr) {

    const normals = [];
    const uvs = [];
    for (let i = 0; i < coords.length; i++) {
        normals.push(normalArr);
    }
    uvs.push([0, 1]);
    uvs.push([1, 1]);
    uvs.push([0, 0]);
    uvs.push([1, 0]);
    uvs.push([0, 1]);
    uvs.push([1, 1]);
    const faces = earcut(coords.flatMap(a => ([a[0], a[1]])));
    coords = coords.flatMap(a => ([a[0], 10, a[1]]));
    // console.log(coords);
    // console.log(faces);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(coords), 3));
    geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(normals.flatMap(a => (a))), 3));
    geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs.flatMap(a => (a))), 2));
    //1, 0, 4, 4, 3, 2, 2, 1, 4
    //1, 0, 5, 4, 3, 2, 1, 5, 4, 4, 2, 1
    geometry.setIndex([0, 1, 5, 2, 3, 4, 4, 5, 1, 1, 2, 4]);
    geometry.setIndex([0, 1, 5, 2, 3, 4, 1, 4, 5, 1, 2, 4]);
    // geometry.setIndex(faces);
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

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {

    renderer.render( scene, camera );

}

function addControls() {
    const dayTimeSlider = document.querySelector('#dayTimeSlider');
    dayTimeSlider.addEventListener('input', onChangeDayTimeSlider);
    const yearDaySlider = document.querySelector('#yearDaySlider');
    yearDaySlider.addEventListener('input', onChangeYearDaySlider);
    const sceneLights = document.querySelector('#sceneLights');
    sceneLights.addEventListener('input', onChangeSceneLights);
}

function onChangeDayTimeSlider(event) {
    const value = event.target.value;
    light.position.set(+value, light.position.y, light.position.z);
}

function onChangeYearDaySlider(event) {
    const value = event.target.value;
    light.position.set(light.position.x, light.position.y, +value);
}

function onChangeSceneLights(event) {
    for (let sceneLight of sceneLights) {
        sceneLight.intensity = event.target.checked ? 1 : 0;
    }
}

function lon2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

/*Calculations
* Mapping a 1223[1] m/side XY tile to 200 unit square in 3d space
* => 6.115 m/unit
*
* 1° latitude = 111320m [2]
* => 1m = 0.00000898311174991017 lat
* => 0.00005493172835070069 lat/unit
*
* * 1° longitude = 111320m [2]
* => 1m = 0.00000898311174991017 lat
* => 0.00005493172835070069 lat/unit
*/

//References
//1
//1223 meters/tile side @ zoom level 15
//https://docs.microsoft.com/en-us/azure/azure-maps/zoom-levels-and-tile-grid?tabs=csharp

//2
//Length in meters of 1° of latitude = always 111.32 km
//Length in meters of 1° of longitude = 40075 km * cos( latitude ) / 360
//https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
