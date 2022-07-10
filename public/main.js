import GlobalMercator from './resources/globalmaptiles.js';
import SunposUtils from './resources/sunpos.js';
import utils from "./lib/utils.js";
import grid from "./lib/grid.js";
import sunPathManager from './lib/sunPath.js';

let camera, controls, scene, renderer;

let plane, cube, light;
let loadingBackdrop;
let shadowMapSize = 2048;

const globalMercatorUtils = new GlobalMercator();
const today = new Date();
const initialCameraPosition = [-200, 100, 0];
const zoomLevel = 15;
const monthArr = [0, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

window.addEventListener('load', () => {
    loadingBackdrop = document.querySelector('#loading-backdrop');
    init();
    animate();

    const yearDaySlider = document.querySelector('#yearDaySlider');
    yearDaySlider.value = dayNumFromMonthDay(today.getMonth()+1, today.getDate());
    addControls();
});

const location =[37.789545, -122.3987127];
// Fourth of July, 2022 at 11:20 am MDT (-6 hours)
const when = [2022, today.getMonth()+1, today.getDate(), 12, 0, 0, -7];

function init() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.querySelector('#canvas-container').appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(...initialCameraPosition);

    // controls

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.5;

    controls.screenSpacePanning = false;

    controls.minDistance = 0;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI;
    controls.addEventListener( 'change', utils.debounce((target) => sunPathManager.onWorldMove(target), 300,
        (event) => [event.target.target]) );

    // world

    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 20;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.background = new THREE.Color(0xffffff);

    plane = new THREE.Mesh(
        //See calculations
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
        }));
    plane.rotation.x = -Math.PI / 2
    plane.castShadow = false;
    plane.receiveShadow = true;

    scene.add(plane);

    makeLights();
    renderDateTimeOutput();

    grid(scene);
    sunPathManager.renderSunPath(scene, when, location);
    sunPathManager.renderSunBall(scene);
    sunPathManager.positionSunBall(when, location);

    window.addEventListener( 'resize', onWindowResize );

}

function makeLights() {
    const color = 0xFFFFFF;
    const intensity = 3;

    light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.shadow.mapSize.width = shadowMapSize;
    light.shadow.mapSize.height = shadowMapSize;
    light.shadow.camera.left = 150;
    light.shadow.camera.right = -150;
    light.shadow.camera.top = 150;
    light.shadow.camera.bottom = -150;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    scene.add(light);
    // let helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(helper);

    let ambientLight = new THREE.PointLight(color, 0.3);
    ambientLight.position.y = 100;
    ambientLight.position.x = 200;
    ambientLight.castShadow = false;
    scene.add(ambientLight);

    ambientLight = new THREE.PointLight(color, 0.3);
    ambientLight.position.y = 100;
    ambientLight.position.x = -200;
    ambientLight.castShadow = false;
    scene.add(ambientLight);

    ambientLight = new THREE.PointLight(color, 0.3);
    ambientLight.position.y = 100;
    ambientLight.position.z = 200;
    ambientLight.castShadow = false;
    scene.add(ambientLight);

    ambientLight = new THREE.PointLight(color, 0.3);
    ambientLight.position.y = 100;
    ambientLight.position.z = -200;
    ambientLight.castShadow = false;
    scene.add(ambientLight);
}

function positionSunLight() {
    const [azimuth, elevation] = SunposUtils.sunpos(when, location, true);
    const [x, y, z] = SunposUtils.sunposXYZ(200, azimuth, elevation);
    light.position.x = y;
    light.position.y = z;
    light.position.z = x;
}

function makeInstance(coords, height) {
    const buildingShape = new THREE.Shape();

    buildingShape.moveTo(coords[0][0], coords[0][1]);
    coords.forEach(e => buildingShape.lineTo(e[0], e[1]));
    const extrudeSettings = {
        depth: height / 6.115, bevelEnabled: true, bevelSegments: 2, steps: 2,
        bevelSize: 0.1, bevelThickness: 0.1
    };

    let geometry = new THREE.ExtrudeGeometry(buildingShape, extrudeSettings);

    //121, 109, 86
    const colorRandArr = [utils.randomIntInRange(100, 120), utils.randomIntInRange(95, 110), utils.randomIntInRange(70, 90)];
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: `rgb(${colorRandArr[0]}, ${colorRandArr[1]}, ${colorRandArr[2]})` }));
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.PI / 2;
    mesh.position.y = 0;
    scene.add(mesh);
    return mesh;
}

function loadAndRenderTileData(lat, lon) {
    const refXTile = lon2tile(lon, zoomLevel);
    const refYTile = lat2tile(lat, zoomLevel);
    fetch(`https://data.osmbuildings.org/0.2/anonymous/tile/${zoomLevel}/${refXTile}/${refYTile}.json`).then(j => j.json())
        .then((data) => {
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
                    const mesh = makeInstance(coords, data.features[i].properties.height);
                    mesh.xy = { x: refXTile, y: refYTile };
                }
            }

            location[0] = refLat;
            location[1] = refLon;
            positionSunLight();
            sunPathManager.renderSunPath(scene, when, location);
            sunPathManager.positionSunBall(when, location);
            loadingBackdrop.classList.remove('fade');
        });
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

let frame = 1;
function animate() {

    if (frame <= 60) {
        for (const obj of scene.children) {
            if ((obj.type !== 'Mesh' && obj.geometry && obj.geometry.type !== 'ExtrudeGeometry') || !obj.xy) {
                continue;
            }
            obj.scale.z = frame / 60;
        }
        frame++;
    }
    requestAnimationFrame( animate );

    positionSunLight();
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {

    renderer.render( scene, camera );

}

function renderDateTimeOutput() {
    const outputContainer = document.querySelector("#dateTimeOutput");
    const monthName = monthArr[when[1]];
    outputContainer.innerHTML = `${when[0]}, ${monthName} ${padToLength2(when[2])} ${padToLength2(when[3])}:${padToLength2(when[4])}:${padToLength2(when[5])} ${padToLength2(when[6])} GMT`;
}

function padToLength2(num) {
    let abs = Math.abs(num) < 10 ? '0' + Math.abs(num) : Math.abs(num);
    return num < 0 ? '-' + abs : abs;
}

function addControls() {
    const loadDataBtn = document.querySelector('#loadDataBtn');
    loadDataBtn.addEventListener('click', onLoadDataBtnClicked);
    const dayTimeSlider = document.querySelector('#dayTimeSlider');
    dayTimeSlider.addEventListener('input', onChangeDayTimeSlider);
    const yearDaySlider = document.querySelector('#yearDaySlider');
    yearDaySlider.addEventListener('input', onChangeYearDaySlider);
    const shadowMapSelect = document.querySelector('#shadowMapSize');
    shadowMapSelect.addEventListener('input', onChangeShadowMapSize);
}

function onLoadDataBtnClicked(event) {
    loadingBackdrop.classList.add('fade');
    const latInput = document.querySelector('#latInput').value;
    const lonInput = document.querySelector('#lonInput').value;
    loadAndRenderTileData(parseFloat(latInput), parseFloat(lonInput));
}

function onChangeDayTimeSlider(event) {
    const value = event.target.value;
    when[3] = Math.floor(+value);
    when[4] = (+value - Math.floor(+value)) * 60;
    renderDateTimeOutput();
    sunPathManager.positionSunBall(when, location);
}

function onChangeYearDaySlider(event) {
    const value = event.target.value;
    const [month, day] = monthDayFromDayNum(+value);
    when[1] = month;
    when[2] = day;
    renderDateTimeOutput();
    sunPathManager.renderSunPath(scene, when, location);
    sunPathManager.positionSunBall(when, location);
}

function onChangeShadowMapSize(event) {
    shadowMapSize = parseInt(event.target.value);
    light.shadow.mapSize.width = shadowMapSize;
    light.shadow.mapSize.height = shadowMapSize;
    light.shadow.map = null;
}

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function lon2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
function monthDayFromDayNum(dayNum) {
    if (dayNum < 0 || dayNum > 364) {
        throw new Error("Day number out of bounds");
    }
    let monthIdx = 0;
    let remDays = dayNum;
    while (remDays >= monthDays[monthIdx]) {
        remDays -= monthDays[monthIdx];
        monthIdx++;
    }
    return [monthIdx+1, remDays+1];
}

function dayNumFromMonthDay(month, day) {
    let monthNum = 0;
    let numDays = 0;
    while (monthNum < month - 1) {
        numDays += monthDays[monthNum++];
    }
    return numDays + day - 1;
}

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
