function init(scene) {
    const gridHelper = new THREE.GridHelper( 1000, 100, 0x333000, 0xDDDDDD );
    scene.add( gridHelper );
    const axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    const loader = new THREE.FontLoader();

    loader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

        const geometry = new THREE.TextGeometry( 'N', {
            font: font,
            size: 10,
            height: 1,
            curveSegments: 2,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 2
        } );

        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( { color: 0x000000 } ));
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = -Math.PI / 2;
        mesh.position.x = 120;
        mesh.position.z = -5;

        scene.add(mesh);
    } );
}

export default init;
