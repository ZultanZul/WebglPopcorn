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
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	scene.add(hemisphereLight);  

	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -700;
	shadowLight.shadow.camera.right = 700;
	shadowLight.shadow.camera.top = 500;
	shadowLight.shadow.camera.bottom = -500;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2056;
	shadowLight.shadow.mapSize.height = 2056;

	scene.add(shadowLight);
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


//OBJ ONLY

function Model() {

	this.mesh = new THREE.Object3D();	

	var _this = this;
	
	var objLoader = new THREE.OBJLoader();
	objLoader.setPath('../model/');		
	objLoader.load( 'popcorn' + '.obj', function (object) {
		var matPopCorn = new THREE.MeshLambertMaterial({color: 0xFFFFFF, shading:THREE.SmoothShading});


		object.children.forEach(function (child) {
	       child.material = matPopCorn;
	       child.geometry.computeFaceNormals();
	       child.geometry.computeVertexNormals();
	     });

		object.scale.set(5,5,5);
		object.position.x = 0;
		object.position.y = 0;
		object.position.z = 0;

		_this.mesh.add(object);

		finishedLoading();

	});
}


// //JSON

// function Model() {

// 	this.mesh = new THREE.Object3D();	

// 	var _this = this;
	
// 	var JSONLoader = new THREE.ObjectLoader();

// 	JSONLoader.load(

// 	 '../model/popcorn.json', 

// 	 function (object) {
// 		var matPopCorn = new THREE.MeshStandardMaterial({color: 0xFFFFFF, shading:THREE.SmoothShading, emissiveIntensity: .25, metalness: .01, roughness: .1, wireframe:false});
// 		object.children.forEach(function (child) {
// 	       child.material = matPopCorn;
// 	       child.geometry.computeFaceNormals();
// 	       child.geometry.computeVertexNormals();
// 	     });

// 		object.scale.set(5,5,5);		
// 		_this.mesh.add(object);
// 		finishedLoading();
// 	},
// 	function ( xhr ) {
//         console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//     },
//     function ( xhr ) {
//         console.error( 'An error happened' );
//     });
// }




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
	//model.mesh.position.set(0,0,-20);
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

	camera.rotation.z +=0.005;
	camera.rotation.y = (Math.sin(Date.now() * 0.002) * Math.PI * 0.01 );
	//camera.rotation.x = Math.sin(Date.now() * 0.005) * Math.PI * 0.02;

	model.mesh.rotation.x +=0.05;
	model.mesh.rotation.y +=0.05;
	//model.mesh.rotation.z +=0.05;
 	model.mesh.rotation.z = Math.sin(Date.now() * 0.001) * Math.PI * 0.2;

 	model.mesh.position.z -=0.5;

}
