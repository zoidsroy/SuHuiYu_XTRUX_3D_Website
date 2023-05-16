
            import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
            import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
			let camera, controls, scene, renderer,light1, light2, light3, light4,ambientLight;
           
			// init().then( render );
            init()

			// render(); // remove when using next line for animation loop (requestAnimationFrame)
			animate();
            

			async function init() {
                
                  const texture = new THREE.TextureLoader().load(
                    "walk.png"
                  );

                scene = new THREE.Scene();
                scene.background=texture
               
                
                const loader = new GLTFLoader();
        		const gltf = await loader.loadAsync('models/gltf/minecraft_online.glb');
 				scene.add( gltf.scene );
                
                renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
                
                
                
                
                // camera
				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set( 0, 0, 20 );


				// controls

				controls = new OrbitControls( camera, renderer.domElement );
				controls.listenToKeyEvents( window ); // optional

				//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

				controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				controls.dampingFactor = 0.01;

				controls.screenSpacePanning = false;

				controls.minDistance = 10;
				controls.maxDistance = 100;

				controls.maxPolarAngle = Math.PI / 2;

			

				// lights

				// const dirLight1 = new THREE.DirectionalLight( 0xffffff );
				// dirLight1.position.set( 1, 1, 1 );
				// scene.add( dirLight1 );

				// const dirLight2 = new THREE.DirectionalLight( 0x002288 );
				// dirLight2.position.set( - 1, - 1, - 1 );
				// scene.add( dirLight2 );

                light1 = new THREE.PointLight( new THREE.Color("rgb(255, 255, 255)"), 3, 50 );
				
				scene.add( light1 );

				light2 = new THREE.PointLight( new THREE.Color("rgb(255, 0, 0)"), 10, 100 );
								scene.add( light2 );

				light3 = new THREE.PointLight( new THREE.Color("rgb(255, 255, 255)"), 3, 50 );
								scene.add( light3 );

				// light4 = new THREE.PointLight( new THREE.Color("rgb(255, 0, 0)"), 3, 100 );
				// 				scene.add( light4 );
				ambientLight = new THREE.AmbientLight( new THREE.Color("rgb(255, 30, 30)"),5);
				scene.add( ambientLight );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {
                        
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
                // scene.texture.setSize(window.innerWidth, window.innerHeight)
				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );
               				controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

				render();
                // renderer.render( scene, camera );
			}

			function render() {

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

				// light4.position.x = Math.sin( time * 0.7 ) * 2;
				// light4.position.y = Math.cos( time * 0.7 ) * 4;
				// light4.position.z = Math.sin( time * 0.5 ) * 4;

                renderer.render( scene, camera );
                }


