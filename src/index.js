import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CinematicCamera } from 'three/addons/cameras/CinematicCamera.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ImprovedNoise} from 'https://unpkg.com/three/examples/jsm/math/ImprovedNoise.js';

THREE.ColorManagement.enabled = false; 

let camera, controls, scene, renderer,light1, light2, light3,ambientLight,raycaster,intersects,plane;
let sprite;
let group;
let composer;
const mouse = new THREE.Vector2();



init()
animate();

// const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
// const bloomLayer = new THREE.Layers();
// 			bloomLayer.set( BLOOM_SCENE );

// 			const params = {
// 				exposure: 1,
// 				bloomStrength: 5,
// 				bloomThreshold: 0,
// 				bloomRadius: 0,
// 				scene: 'Scene with Glow'
// 			};
// const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
// 			bloomPass.threshold = params.bloomThreshold;
// 			bloomPass.strength = params.bloomStrength;
// 			bloomPass.radius = params.bloomRadius;

// const bloomComposer = new EffectComposer( renderer );
// 			bloomComposer.renderToScreen = false;
// 			bloomComposer.addPass( renderScene );
// 			bloomComposer.addPass( bloomPass );

//             const finalPass = new ShaderPass(
// 				new THREE.ShaderMaterial( {
// 					uniforms: {
// 						baseTexture: { value: null },
// 						bloomTexture: { value: bloomComposer.renderTarget2.texture }
// 					},
// 					vertexShader: document.getElementById( 'vertexshader' ).textContent,
// 					fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
// 					defines: {}
// 				} ), 'baseTexture'
// 			);
// 			finalPass.needsSwap = true;

// 			const finalComposer = new EffectComposer( renderer );
// 			finalComposer.addPass( renderScene );
// 			finalComposer.addPass( finalPass );



async function init() {	
	scene = new THREE.Scene();
    scene.background = new THREE.Color(0,255,0);
    loadModel();
	// addPlane(100);
    initRaycaster();
    loadRenderer();	

    initSprite(100,'images/dick1.png',"https://www.xvideos.com/");
    initSprite(100,'images/dick2.png',"https://cn.pornhub.com/");
    initSprite(100,'images/walk.png',"https://cdosea.org/#video/i");
	// camera
	initCamera();

	// controls
	initControls();

	// lights
    lights();

    document.addEventListener( 'mouseup', onDocumentMouseUp );

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
    
    //sprite
    group.rotation.x =  new ImprovedNoise().noise(0,0,time*.1)*3*Math.sin(time*0.5);
    group.rotation.y = new ImprovedNoise().noise(0,0,time*.1)*3*Math.sin(time*0.1);
	group.rotation.z = new ImprovedNoise().noise(0,0,time*.1)*-3*Math.sin(time*0.5);

    //Cinecamera
    CinematicParam(Math.abs(Math.exp(Math.sin(time*2),0.5))*0.75+18,Math.abs(Math.exp(Math.sin(time*5),500))*8+12);
    
    //PP
  

    render();
}
 

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	// scene.texture.setSize(window.innerWidth, window.innerHeight)
    composer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function onDocumentMouseUp( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    intersects = raycaster.intersectObjects( scene.children );
    if(intersects[0]!=undefined){
        if (intersects.length > 0 & intersects[0].object.name!="Minecraft_2") {
            console.log(intersects[0].object);
            window.open(intersects[0].object.link);
        }

        if(intersects[0].object.name=="Minecraft_2"){
            // window.open(intersects[0].object.userData.link);
            window.open("https://www.instagram.com/xtrux_official/");
            // window.open("https://www.suhuiyu.com/");
        }
    }
}


async function loadModel(){
    const modelContainer = new THREE.Group();
    scene.add(modelContainer);
    const models = [
        {
          gltf: "models/gltf/minecraft_online.glb",
          link: "https://www.instagram.com/submarine_gallery",
          position: [0, 0, 0],
          scale: 0.5,
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
    scene.scale.set(scale, scale, scale);
    scene.position.set(...position);
        });
    });
}


function initSprite(amount=100,path= 'images/walk.png',hyperlink="https://cdosea.org/#video/i"){
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load( path, createHUDSprites );
	const map = textureLoader.load( path );
	group = new THREE.Group();
	const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true } );
	for ( let a = 0; a < amount; a ++ ) {
	    sprite = new THREE.Sprite( material );
		sprite.position.x = Math.random() * 400 -200;
        sprite.position.y = Math.random() * 400-200 ;
        sprite.position.z = Math.random()* 800 -400;
        sprite.scale.x=16*3;
        sprite.scale.y=9*3;
        // sprite.size = THREE.Vector2(30,40);
        // sprite.scale.normalize();
        // sprite.scale.multiplyScalar(50);
		// sprite.position.normalize();
		// sprite.position.multiplyScalar( 30 );
        sprite.link=hyperlink;
		group.add( sprite );
		}
    scene.add( group );
}


function createHUDSprites( texture ) {
    const material = new THREE.SpriteMaterial( { map: texture } );
    const width = material.map.image.width;
    const height = material.map.image.height;
    sprite = new THREE.Sprite( material );
    sprite.center.set( 0.0, 1.0 );
    sprite.scale.set( 1, 1, 1 );
    // updateHUDSprites();
}


function updateHUDSprites() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;

    sprite.position.set( - width, height, 1 ); // top left
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
        if ( camera.postprocessing.enabled ) {
        camera.renderCinematic( scene, renderer );
    } else {
        scene.overrideMaterial = null;
        renderer.clear();
        renderer.render( scene, camera );

    }
}
