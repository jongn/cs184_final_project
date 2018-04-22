var scene;
var camera;
var renderer;

//slabs
var velocity;
var density;
var pressure;
var temp;
var diverge;

var drawTexture;

var plane;
var finalMaterial;
var quad;

//shaders
var advect;
var buoyancy;
var divergence;
var jacobi;
var externalForce;
var subtractGradient;
var vorticity;
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

    //uncomment for shader compilation debugging?
    /*
    gl = renderer.getContext();

    source = document.getElementById( 'Draw' ).innerHTML;

    shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('Shader compiler log: ' + compilationLog);
    */


    //create shader programs

    advect = new Advect();
    externalForce = new ExternalForce();
    buoyancy = new Buoyancy();
    draw = new Draw();
    jacobi = new Jacobi();
    divergence = new Divergence();
    subtractGradient = new SubtractGradient();
    curl = new Curl();
    vorticity = new Vorticity();

    // create slabs

    velocity = new Slab();
    density = new Slab();
    temperature = new Slab();
    pressure = new Slab();
    temp = new Slab();
    diverge = new Slab();
    curlSlab = new Slab();

    //drawTexture is what is actually being drawn

    drawTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });

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
    externalForce.smokeSource.z = 1.0;
}
document.onmouseup = function(event){
    mouseDown = false;
    externalForce.smokeSource.z = 0;
}

//Render everything!
function render() {

  const dt = Math.min((Date.now() - lastTime) / 1000, 0.016)

  advect.compute(renderer, velocity.read, velocity.read, velocity.write);
  velocity.swap();

  advect.compute(renderer, velocity.read, density.read, density.write);
  density.swap();

  buoyancy.compute(renderer, velocity.read, temperature.read, density.read, dt, velocity.write);
  velocity.swap();

  externalForce.compute(renderer, velocity.read, velocity.write);
  velocity.swap();

  divergence.compute(renderer, velocity.read, 1.0, 1.0, diverge.write);
  diverge.swap();

  renderer.clearTarget(pressure.read, true, false, false);
  for (var i = 0; i < 10; i++) {
    jacobi.compute(renderer, pressure.read, diverge.read, -1.0, 4.0, pressure.write);
    pressure.swap();
  }

  subtractGradient.compute(renderer, velocity.read, pressure.read, 1.0, 1.0, velocity.write);


  // curl.compute(renderer, velocity.read, velocity.write);
  // vorticity.compute(renderer, velocity.read, curl.read, dt, velocity.write);
  // velocity.swap()

  draw.compute(renderer, velocity.write, drawTexture);


  //var gl = renderer.getContext();
  
  renderer.render( scene, camera );


  // use for debugging
  /*
  var pixel = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  console.log(pixel);
  */


  requestAnimationFrame( render );

  velocity.swap();
}
lastTime = Date.now();
render();