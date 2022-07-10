import SunposUtils from "../resources/sunpos.js";

let sunPath, sunBall;
let worldPos = {x: 0, y: 0, z: 0};

function renderSunPath(scene, when, location) {
    const coords = [];
    const tempWhen = [...when];
    for (let i = 0; i < 24; i+= 0.25) {
        tempWhen[3] = Math.floor(i);
        tempWhen[4] = (i - Math.floor(i)) * 60;
        const [azimuth, elevation] = SunposUtils.sunpos(tempWhen, location, true);
        if (elevation < 0) {
            continue;
        }
        const [x, y, z] = SunposUtils.sunposXYZ(50, azimuth, elevation);
        coords.push([y, z, x]);
    }
    const curve = new THREE.CatmullRomCurve3( coords.map(([x, y, z]) => new THREE.Vector3(x, y, z)) );

    const geometry = new THREE.TubeGeometry( curve, 100, 2, 3, false );
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { color: 0xE2DA39 } ));
    if (sunPath) {
        scene.remove(sunPath);
    }
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.x = worldPos.x;
    mesh.position.y = 0;
    mesh.position.z = worldPos.z;
    scene.add(mesh);
    sunPath = mesh;
    return mesh;
}

function renderSunBall(scene) {
    if (sunBall) {
        scene.remove(sunBall);
    }
    const geometry = new THREE.SphereGeometry( 5, 32, 16 );
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { color: 0xE2DA39 } ));
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    scene.add(mesh);
    sunBall = mesh;
    return mesh;
}

function positionSunBall(when, location) {
    if (!sunBall) {
        return;
    }
    const [azimuth, elevation] = SunposUtils.sunpos(when, location, true);
    const [x, y, z] = SunposUtils.sunposXYZ(50, azimuth, elevation);
    sunBall.originalPosition = { x: y, y: z, z: x };
    sunBall.position.x = y + worldPos.x;
    sunBall.position.y = z + worldPos.y;
    sunBall.position.z = x + worldPos.z;
}

function translateSunPathAndBall(newPos) {
    worldPos.x = newPos.x;
    worldPos.y = newPos.y;
    worldPos.z = newPos.z;
    if (!sunBall) {
        return;
    }
    sunBall.position.x = sunBall.originalPosition.x + newPos.x;
    sunBall.position.y = sunBall.originalPosition.y + newPos.y;
    sunBall.position.z = sunBall.originalPosition.z + newPos.z;

    if (!sunPath) {
        return;
    }
    sunPath.position.x = newPos.x;
    sunPath.position.y = newPos.y;
    sunPath.position.z = newPos.z;
}

export default { renderSunPath, renderSunBall, positionSunBall, onWorldMove: translateSunPathAndBall };
