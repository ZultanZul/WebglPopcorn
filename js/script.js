"use strict";

var Colors = {
	white:0xd8d0d1,
	grey:0xcccccc,
};

window.addEventListener('load', init, false);

var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, controls, loaded;

function createScene() {

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog (0x000000, 500, 900); 
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	camera.position.x = 0;
	camera.position.z = 6;
	camera.position.y = 0;
	renderer = new THREE.WebGLRenderer({ 
		alpha: true, 
		antialias: true 
	});

	renderer.setSize(WIDTH, HEIGHT);
//	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	container = document.getElementById('canvas');
	container.appendChild(renderer.domElement);
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight, offLight;

function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xffffff,0x000000, 1)
	scene.add(hemisphereLight);  

	// lens flares
	var textureLoader = new THREE.TextureLoader();

	var textureFlare0 = textureLoader.load( "images/lensflare/lensflare0_blue.png" );
	var textureFlare2 = textureLoader.load( "images/lensflare/lensflare2.png" );
	var textureFlare3 = textureLoader.load( "images/lensflare/lensflare3_blue.png" );

	addLight( -300, 400, -1000);

	function addLight(x, y, z ) {

		var light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
		//	light.color.setHSL( h, s, l );
		light.position.set( x, y, z );
		scene.add( light );

		var flareColor = new THREE.Color( 0xffffff );
		//flareColor.setHSL( h, s, l + 0.5 );

		var lensFlare = new THREE.LensFlare( textureFlare0, 400, 0, THREE.AdditiveBlending, flareColor );

		lensFlare.add( textureFlare2, 256,0, THREE.AdditiveBlending );
		lensFlare.add( textureFlare2, 256,0, THREE.AdditiveBlending );
		lensFlare.add( textureFlare2, 256, 0, THREE.AdditiveBlending );

		lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

		lensFlare.customUpdateCallback = lensFlareUpdateCallback;
		lensFlare.position.copy( light.position );

		scene.add( lensFlare );

	}

}

 function lensFlareUpdateCallback( object ) {

	var f, fl = object.lensFlares.length;
	var flare;
	var vecX = -object.positionScreen.x * 2;
	var vecY = -object.positionScreen.y * 2;


	for( f = 0; f < fl; f++ ) {

		flare = object.lensFlares[ f ];

		flare.x = object.positionScreen.x + vecX * flare.distance;
		flare.y = object.positionScreen.y + vecY * flare.distance;

		flare.rotation = 0;

	}

	object.lensFlares[ 2 ].y += 0.025;
	object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

}


// //OBJ and MTL

// function Model() {

// 	this.mesh = new THREE.Object3D();	

// 	var _this = this;

// 	var model_folder = '../model/';
// 	var model_filename = 'popcorn';

// 	var manager = new THREE.LoadingManager();
// 	manager.onProgress = function ( item, loaded, total ) {
// 		console.log( item, loaded, total );
// 	};
	
// 	var mtlLoader = new THREE.MTLLoader();
// 	mtlLoader.setPath(model_folder);
	
// 	mtlLoader.load( model_filename + '.mtl', function( materials ) {
		
// 		materials.preload();
		
// 		var objLoader = new THREE.OBJLoader();
// 		objLoader.setMaterials(materials);
// 		objLoader.setPath(model_folder);
		
// 		objLoader.load( model_filename + '.obj', function (object) {
			
// 			object.applyMatrix( new THREE.Matrix4().makeTranslation(0, -5, 0) )
// 			object.scale.set(15,15,15);
// 			//scene.add(model);
// 			_this.mesh.add(object);

// 			finishedLoading();

// 		});
// 	});

// }




// //OBJ ONLY

// function Model() {

// 	this.mesh = new THREE.Object3D();	

// 	var _this = this;
	
// 	var objLoader = new THREE.OBJLoader();
// 	objLoader.setPath('../model/');		
// 	objLoader.load( 'popcorn' + '.obj', function (object) {
// 		var matPopCorn = new THREE.MeshLambertMaterial({color: 0xFFFFFF, shading:THREE.SmoothShading});


// 		object.children.forEach(function (child) {
// 	       child.material = matPopCorn;
// 	       child.geometry.computeFaceNormals();
// 	       child.geometry.computeVertexNormals();
// 	     });

// 		object.scale.set(5,5,5);
// 		object.position.x = 0;
// 		object.position.y = 0;
// 		object.position.z = 0;

// 		_this.mesh.add(object);

// 		finishedLoading();

// 	});
// }


//JSON

function Model() {

	this.mesh = new THREE.Object3D();	

	var _this = this;
	
	var JSONLoader = new THREE.ObjectLoader();

	JSONLoader.load(

	 'model/popcorn.json', 

	 function (object) {
		var matPopCorn = new THREE.MeshStandardMaterial({color: 0xFFFFFF, shading:THREE.SmoothShading, emissiveIntensity: .25, metalness: .01, roughness: .1, wireframe:false});
		object.children.forEach(function (child) {
	       child.material = matPopCorn;
	       child.geometry.computeFaceNormals();
	       child.geometry.computeVertexNormals();
	     });

		object.scale.set(5,5,5);		
		_this.mesh.add(object);
		finishedLoading();
	},
	function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },
    function ( xhr ) {
        console.error( 'An error happened' );
    });
}



function finishedLoading(){
	loaded = true;
	document.getElementById('preloader').classList.add('hidden');
}

function initSkybox(){

	var urls = [
		'images/skybox/sky_pos_x.jpg',
		'images/skybox/sky_neg_x.jpg',
		'images/skybox/sky_pos_y.jpg',
		'images/skybox/sky_neg_y.jpg',
		'images/skybox/sky_neg_z.jpg',
		'images/skybox/sky_pos_z.jpg'
	];
	
	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;
	
	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = reflectionCube;
	
	var material = new THREE.ShaderMaterial( {
	
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
		
	} ), skyBox = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000 ), material );

	scene.add( skyBox );
}

var model;

function createModel(){ 
	model = new Model();
	model.mesh.castShadow = true;
	model.mesh.receiveShadow = true;
	scene.add(model.mesh);
}

function init() {

	createScene();
	createModel();
	createLights();
	initSkybox();
	loop();
}

function loop(){

	renderer.render(scene, camera);
	requestAnimationFrame(loop);
	animation();
}

function animation (){

	//CAMERA Animations
	camera.rotation.z +=0.003;
	camera.rotation.y = (Math.sin(Date.now() * 0.002) * Math.PI * 0.01 );
	//camera.rotation.x = Math.sin(Date.now() * 0.005) * Math.PI * 0.02;

	//PopCorn Spin
	model.mesh.rotation.x +=0.05;
	model.mesh.rotation.y +=0.05;
	//model.mesh.rotation.z +=0.05;
 	model.mesh.rotation.z = Math.sin(Date.now() * 0.001) * Math.PI * 0.2;
 	model.mesh.position.z -=.75;

}
