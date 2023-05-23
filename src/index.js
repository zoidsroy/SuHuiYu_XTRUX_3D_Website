import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, controls, scene, renderer,light1, light2, light3,ambientLight,raycaster,intersects,plane;
let spriteTL, spriteTR, spriteBL, spriteBR, spriteC,mapC;
let group;
const mouse = new THREE.Vector2();

init()
animate();

async function init() {	
	scene = new THREE.Scene();
    
    loadModel();
	// addPlane(100);
    initRaycaster();
    loadRenderer();	

    initSprite();
	// camera
	initCamera();

	// controls
	initControls();

	// lights
    lights();

    

    document.addEventListener( 'mousemove', onDocumentMouseMove );

	window.addEventListener( 'resize', onWindowResize );
}

function animate() {
	requestAnimationFrame( animate );
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	
    //Light
    const time = Date.now() * 0.0005;
	light1.position.x = Math.sin( time * 1 ) * 10;
	light1.position.y = Math.cos( time * 3 ) * 10;
	light1.position.z = Math.cos( time * 2 ) * 7;

	light2.position.x = Math.cos( time * 0.3 ) * 6;
	light2.position.y = Math.sin( time * 0.9 ) * 4;
	light2.position.z = Math.sin( time * 0.7 ) * 6;

	light3.position.x = Math.sin( time * 3 ) * -9;
	light3.position.y = Math.cos( time * 3 ) * -4;
	light3.position.z = Math.sin( time * 2 ) * -6;
    render();
}


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// scene.texture.setSize(window.innerWidth, window.innerHeight)
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

async function loadModel(){
    const loader = new GLTFLoader();
	const gltf = await loader.loadAsync('models/gltf/minecraft_online.glb');
	    scene.add( gltf.scene );
        gltf.scene.children[0].scale.multiplyScalar(0.5); 
}

function initSprite(){
    const textureLoader = new THREE.TextureLoader();

				textureLoader.load( 'walk.png', createHUDSprites );
				const mapB = textureLoader.load( 'walk.png' );
				group = new THREE.Group();
				const material = new THREE.SpriteMaterial( { map: mapB, color: 0xffffff, fog: true } );
	
				for ( let a = 0; a < 100; a ++ ) {
					const sprite = new THREE.Sprite( material );
					sprite.position.x = Math.random() * 400 -200;
                    sprite.position.y = Math.random() * 400-200 ;
                    sprite.position.z = Math.random()* 800 -400;
                    sprite.scale.normalize();
                    sprite.scale.multiplyScalar(30);
					// sprite.position.normalize();
					// sprite.position.multiplyScalar( 30 );
					group.add( sprite );
				}
				scene.add( group );
}

function createHUDSprites( texture ) {
    const material = new THREE.SpriteMaterial( { map: texture } );
    const width = material.map.image.width;
    const height = material.map.image.height;
    spriteTL = new THREE.Sprite( material );
    spriteTL.center.set( 0.0, 1.0 );
    spriteTL.scale.set( 1, 1, 1 );
    // sceneOrtho.add( spriteTL );
    // updateHUDSprites();
}


function addPlane(num){
    const geometry = new THREE.PlaneGeometry(10, 10);

    for ( let i = 0; i < num; i ++ ) {

        plane = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
        
        plane.name="plane";
        plane.position.x = Math.random() * 400 -200;
        plane.position.y = Math.random() * 400-200 ;
        plane.position.z = Math.random()* 800 -400;

        plane.scale.x = Math.random() + 0.5;
        plane.scale.y = Math.random() + 0.5;
        scene.add( plane );
    }
}

function initRaycaster(){
    raycaster = new THREE.Raycaster();
}

function loadRenderer(){
    renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}

function initCamera(){
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set( 0, 0, 22 );
}

function initControls(){
    controls = new OrbitControls( camera, renderer.domElement );
	controls.listenToKeyEvents( window ); // optional
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 10;
	controls.maxDistance = 100;

	controls.maxPolarAngle = Math.PI;
}

function lights(){
    light1 = new THREE.PointLight( new THREE.Color("rgb(255, 255, 255)"), 3, 50 );
	scene.add( light1 );

	light2 = new THREE.PointLight( new THREE.Color("rgb(255, 0, 0)"), 10, 100 );
	scene.add( light2 );

	light3 = new THREE.PointLight( new THREE.Color("rgb(255, 255, 255)"), 3, 50 );
	scene.add( light3 );

	ambientLight = new THREE.AmbientLight( new THREE.Color("rgb(255, 30, 30)"),5);
	scene.add( ambientLight );
}



function render() {
    const time = Date.now() / 1000;
    group.rotation.x = time * 0.1;
    group.rotation.y = time * 0.1;
	group.rotation.z = time * 0.1;

    // find intersections

    raycaster.setFromCamera( mouse, camera );

    intersects = raycaster.intersectObjects( scene.children );

        if (intersects.length > 0) {
        console.log(intersects[0].object);
    }
             renderer.clear();
        renderer.render( scene, camera );

	}
