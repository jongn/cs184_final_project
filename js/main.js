var scene;
var camera;
var renderer;

var bufferScene;
var bufferScene2;
var velocityA;
var velocityB;

var velocity;
var density;

var drawTexture;

var bufferMaterial;
var plane;
var bufferObject;
var finalMaterial;
var quad;

var advect;
var externalForce;
var draw;

function scene_setup(){
    scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera.position.z = 2;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}


function buffer_texture_setup(){

    gl = renderer.getContext();

    source = document.getElementById( 'Draw' ).innerHTML;

    shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('Shader compiler log: ' + compilationLog);



    //Create buffer scene

    advect = new Advect();
    externalForce = new ExternalForce();
    draw = new Draw();


    bufferScene = new THREE.Scene();
    bufferScene2 = new THREE.Scene();
    //Create 2 buffer textures
    velocityA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });
    velocityB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });
    drawTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });

    velocity = new Slab();
    density = new Slab();
    /*
    //Pass textureA to shader

    bufferMaterial = new THREE.ShaderMaterial( {
        uniforms: {
         bufferTexture: { type: "t", value: velocityA },
         res : {type: 'v2',value:new THREE.Vector2(window.innerWidth,window.innerHeight)},//Keeps the resolution
         smokeSource: {type:"v3",value:new THREE.Vector3(0,0,0)},
         sourceVelocity: {type:"v2",value:new THREE.Vector2(0,0)},
         time: {type:"f",value:Math.random()*Math.PI*2+Math.PI}
        },
        fragmentShader: document.getElementById( 'advectShader' ).innerHTML
    } );


    plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    bufferObject = new THREE.Mesh( plane, bufferMaterial );
    bufferScene.add(bufferObject);
    */
    //Draw textureB to screen 
    plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    finalMaterial =  new THREE.MeshBasicMaterial({map: drawTexture});
    quad = new THREE.Mesh( plane, finalMaterial );
    scene.add(quad);
}

//Initialize the Threejs scene
scene_setup();

//Setup the frame buffer/texture we're going to be rendering to instead of the screen
buffer_texture_setup();

//Send position of smoke source with value
var mouseDown = false;
var timeStamp = null;
var lastX = null;
var lastY = null;
function UpdateMousePosition(X,Y){
    var currentTime = Date.now();
    var deltaTime = currentTime - timeStamp;


    externalForce.smokeSource.x = X;
    externalForce.smokeSource.y = Y;

    externalForce.sourceVelocity.x = Math.round((X-lastX) / deltaTime * 100);
    externalForce.sourceVelocity.y = Math.round((Y-lastY) / deltaTime * 100);



    timeStamp = currentTime;
    lastX = X;
    lastY = Y;
}
document.onmousemove = function(event){
    UpdateMousePosition(event.clientX, window.innerHeight - event.clientY)
}

document.onmousedown = function(event){
    mouseDown = true;
    timeStamp = Date.now();
    lastX = event.clientX;
    lastY = window.innerHeight - event.clientY;
    //bufferMaterial.uniforms.smokeSource.value.z = 0.1;
    externalForce.smokeSource.z = 0.1;
}
document.onmouseup = function(event){
    mouseDown = false;
    //bufferMaterial.uniforms.smokeSource.value.z = 0;
    externalForce.smokeSource.z = 0;
}

//Render everything!
function render() {

  //Draw to textureB
  //renderer.render(bufferScene,camera,velocityB,true);
  advect.compute(renderer, velocityA, velocityB);
  //Swap textureA and B
  var t = velocityA;
  velocityA = velocityB;
  velocityB = t;

  externalForce.compute(renderer, velocityA, velocityB);
  //Swap textureA and B
  //var t = velocityA;
  //velocityA = velocityB;
  //velocityB = t;


  //Load to final draw texture
  draw.compute(renderer, velocityB, drawTexture);
  //var gl = renderer.getContext();


  //advect.quad.material.map = velocityB;
  //advect.uniforms.bufferTexture.value = velocityA;
  //advect2.quad.material.map = velocityB;
  //advect2.uniforms.bufferTexture.value = velocityA;
  
  //bufferMaterial.uniforms.bufferTexture.value = velocityA;

  //advect2.compute();

  //Update time
  //bufferMaterial.uniforms.time.value += 0.01;

  //Finally, draw to the screen

  
  renderer.render( scene, camera );
  /*
  var pixel = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  console.log(pixel);
  */
  requestAnimationFrame( render );

  var t = velocityA;
  velocityA = velocityB;
  velocityB = t
}
render();