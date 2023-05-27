import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CinematicCamera } from 'three/addons/cameras/CinematicCamera.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ImprovedNoise} from 'https://unpkg.com/three/examples/jsm/math/ImprovedNoise.js';
import { AnaglyphEffect } from 'three/addons/effects/AnaglyphEffect.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


THREE.ColorManagement.enabled = false; 

let camera, controls, scene, renderer,light1, light2, light3,light4,light5,ambientLight,raycaster,intersects,plane;
let sprite;
let composer;
let effect;
const mouse = new THREE.Vector2();
let group = new THREE.Group();
let listener = new THREE.AudioListener();

const startButton = document.getElementById( 'startButton' );
		startButton.addEventListener( 'click', init );

// animate();



async function init() {	
	scene = new THREE.Scene();

    const overlay = document.getElementById( 'overlay' );
	overlay.remove();
    const container = document.getElementById( 'container' );

    // scene.background = new THREE.Color(0,255,0);
    initSkybox();
    loadModel();
	// addPlane(100);
    initRaycaster();
    loadRenderer();	

    initSprite(20,'images/walk.png',"https://cdosea.org/#video/i");
    initSprite(20,'images/tentacle.png','https://www.instagram.com/p/CsrPA3vp5cL/');
    initSprite(20,'images/crazy.png',"https://www.instagram.com/suhuiyu1976/");
    initSprite(20,'images/still 001.png',"https://www.youtube.com/watch?v=JiHiUGf4AD8&t=2311s");
    initSprite(20,'images/still 002.png',"https://www.instagram.com/suhuiyu1976/");
	// camera
	initCamera();
    //audio
    initGlobalAudio();
    initPointAudio1();
    initPointAudio2();
	// controls
	initControls();

	// lights
    lights();

    postprocess();

    // callFX();

    document.addEventListener( 'mouseup', onDocumentMouseUp );

	window.addEventListener( 'resize', onWindowResize );
    animate();
}


function animate() {
	requestAnimationFrame( animate );
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	
    //Light
    const time = Date.now() * 0.0005;
	light1.position.x = Math.sin( time * 1 ) * 10;
	light1.position.y = Math.cos( time * 3 ) * 10;
	light1.position.z = Math.cos( time * 2 ) * 7;

	light2.position.x = Math.cos( time * 0.01 ) * 50;
	light2.position.y = Math.sin( time * 0.2 ) * 4;
	light2.position.z = Math.sin( time * 0.07 ) * 6;

	light3.position.x = Math.sin( time * 3 ) * -9;
	light3.position.y = Math.cos( time * 3 ) * -4;
	light3.position.z = Math.sin( time * 2 ) * -6;

    light4.position.x = Math.sin( time * 5 ) * -20;
	light4.position.y = Math.cos( time * 3 ) * -4;
	light4.position.z = Math.sin( time * 5 ) * -6;
    
    //sprite
    group.rotation.x =  new ImprovedNoise().noise(0,0,time*.1)*3*Math.sin(time*0.5);
    group.rotation.y = new ImprovedNoise().noise(0,0,time*.1)*3*Math.sin(time*0.1);
	group.rotation.z = new ImprovedNoise().noise(0,0,time*.1)*-3*Math.sin(time*0.5);

    //Cinecamera
    CinematicParam(Math.abs(Math.exp(Math.sin(time*2),0.5))*0.75+18,Math.abs(Math.exp(Math.sin(time*5),500))*8+12);
    
    //PP
    composer.render();

    // render();
}
 

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// scene.texture.setSize(window.innerWidth, window.innerHeight)
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}


function onDocumentMouseUp( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    intersects = raycaster.intersectObjects( scene.children );
    if(intersects[0]!=undefined){
        if (intersects.length > 0 & intersects[0].object.name!="SpaceShip1") {
            console.log(intersects[0].object);
            window.open(intersects[0].object.link);
        }

        if(intersects[0].object.name=="SpaceShip1"){
            window.open(intersects[0].object.userData.link);
            }
    }
}

function initSkybox(){
    new RGBELoader()
    .setPath( 'images/' )
    .load( 'sky.hdr', function ( texture ) {

        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
    } );
}


async function loadModel(){
    let m = new THREE.MeshStandardMaterial( {
        color: 0,
        roughness: 0,
        metalness: 1,
        emissive:10,
        side: THREE.DoubleSide
    } );

    const modelContainer = new THREE.Group();
    scene.add(modelContainer);
    const models = [
        {
          gltf: "models/gltf/online.glb",
          link: "https://www.instagram.com/xtrux_official",
          position: [0, 0, 0],
          scale: 0.25,
          material: m
        }
      ]
    let loader = new GLTFLoader();
    models.forEach(modelDetails => {
    const { gltf, scale, position, link } = modelDetails;

    loader.load(gltf, ({ scene }) => {
    scene.traverse(child => {
    child.userData.link = link;
        });
    modelContainer.add(scene);
    scene.scale.set(scale,scale,scale);
    scene.position.set(...position);
        });
    });
}


function initSprite(amount=100, path='images/walk.png',hyperlink="https://cdosea.org/#video/i"){   
    const map = new THREE.TextureLoader().load(path );
	const material = new THREE.SpriteMaterial( { map: map, color: new THREE.Color("rgb(90, 90, 90)"), fog: true} );
	for ( let a = 0; a < amount; a ++ ) {
	    sprite = new THREE.Sprite( material );
        sprite.center.set( 0.0, 1.0 );
        // sprite.scale.set( 1, 1, 1 );
		sprite.position.x = Math.random() * 400 -200;
        sprite.position.y = Math.random() * 400-200 ;
        sprite.position.z = Math.random()* 800 -400;
        sprite.scale.x=16*3;
        sprite.scale.y=9*3;
        sprite.link=hyperlink;
		group.add( sprite );
		}
    scene.add( group );
}


// function createHUDSprites( texture ) {
//     // const material = new THREE.SpriteMaterial( { map: texture } );
//     // const width = material.map.image.width;
//     // const height = material.map.image.height;
//     // sprite = new THREE.Sprite( material );
//     // sprite.center.set( 0.0, 1.0 );
//     // sprite.scale.set( 1, 1, 1 );
//     // updateHUDSprites();
// }


// function updateHUDSprites() {
//     const width = window.innerWidth / 2;
//     const height = window.innerHeight / 2;
//     sprite.position.set( - width, height, 1 ); // top left
// }


function initRaycaster(){
    raycaster = new THREE.Raycaster();
}


function loadRenderer(){
    renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
				renderer.toneMapping = THREE.ReinhardToneMapping;
	document.body.appendChild( renderer.domElement );
}


function initCamera(){
    // camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 2000 );
	camera=new CinematicCamera(35,window.innerWidth/window.innerHeight,1,1000);
    camera.position.set( 0, 0, 5 );
    
    }


function CinematicParam(focalLength=20,fstop=15){
    
    let effectController = {

        focalLength:focalLength,
        // jsDepthCalculation: true,
        // shaderFocus: false,
        //
        fstop: fstop,
        maxblur: 1.5,
        //
        showFocus: false,
        focalDepth: 3,
        // manualdof: false,
        // vignetting: false,
        // depthblur: false,
        //
        // threshold: 0.5,
        // gain: 2.0,
        // bias: 0.5,
        // fringe: 0.7,
        //
        // focalLength: 35,
        // noise: true,
        // pentagon: false,
        //
        // dithering: 0.0001

    };

    let matChanger = function ( ) {

        for ( const e in effectController ) {

            if ( e in camera.postprocessing.bokeh_uniforms ) {

                camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];
            }
        }
        camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
        camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
        camera.setLens( effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc );
        effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;
    };
    matChanger();
}


function postprocess(){
    const renderScene = new RenderPass( scene, camera );
    const params = {
        exposure: 1,
        bloomStrength: 1,
        bloomThreshold: 0.,
        bloomRadius: 0.5
    };
	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;
    
	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );
    renderer.toneMappingExposure = Math.pow( params.exposure, 4.0 );


}

function callFX(){
    // const width = window.innerWidth || 2;
	// const height = window.innerHeight || 2;
    // effect = new AnaglyphEffect( renderer );
	// effect.setSize( width, height );
}
function initControls(){
    controls = new OrbitControls( camera, renderer.domElement );
	controls.listenToKeyEvents( window ); // optional
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 4;
	controls.maxDistance = 10;

	controls.maxPolarAngle = Math.PI;
}

function initGlobalAudio(path){
    const audioElement = document.getElementById( 'music' );
			audioElement.play();
    const sound = new THREE.Audio( listener );
    camera.add( listener );
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( path='audio/230526.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 1 );
    sound.play();

});
}


function initPointAudio1(){
    const audioElement = document.getElementById( 'point1Music' );
			// audioElement.play();
 const sound = new THREE.PositionalAudio( listener );
    camera.add( listener );
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'audio/SupaLiJian.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 2 );
	sound.setRefDistance( 15 );
	sound.play();
});
const point = new THREE.Object3D();
scene.add(point);
point.position.set(20,20,20);
point.add(sound);
}


function initPointAudio2(){
    const audioElement = document.getElementById( 'point2Music' );
			// audioElement.play();
 const sound = new THREE.PositionalAudio( listener );
    camera.add( listener );
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'audio/airplane.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 2 );
	sound.setRefDistance( 5 );
	sound.play();
});
const point = new THREE.Object3D();
scene.add(point);
point.position.set(-20,-20,-20);
point.add(sound);
}


function lights(){
    light1 = new THREE.PointLight( new THREE.Color("rgb(255, 255, 255)"), 70, 5 );
	scene.add( light1 );

	light2 = new THREE.PointLight( new THREE.Color("rgb(255, 0, 0)"), 10, 10 );
	scene.add( light2 );

	light3 = new THREE.PointLight( new THREE.Color("rgb(255, 255, 255)"), 70, 5 );
	scene.add( light3 );

    light4 = new THREE.PointLight( new THREE.Color("rgb(255, 0, 0)"), 20, 30 );
	scene.add( light4 );

    light5 = new THREE.SpotLight( new THREE.Color("rgb(255, 255, 255)"), 24, 20);
    light5.position.set(0,15,0);
	scene.add( light5 );

	ambientLight = new THREE.AmbientLight( new THREE.Color("rgb(255, 30, 0)"),5);
	scene.add( ambientLight );
}


function render() {
        if ( camera.postprocessing.enabled ) {
        camera.renderCinematic( scene, renderer );
    } else {
        scene.overrideMaterial = null;
        // renderer.clear();
        // renderer.render( scene, camera );
        
    }
    // effect.render( scene, camera );
}
