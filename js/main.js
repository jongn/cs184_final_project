var scene;
var camera;
var renderer;

//slabs
var velocity;
var density;
var pressure;
var temperature;
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
var externalVelocity;
var externalDensity;
var subtractGradient;
var vorticity;
var draw;

var displaySettings = {
    Slab: "Density"
};
gui = new dat.GUI();
gui.add(displaySettings, "Slab", [
    "Density",
    "Velocity",
    "Temperature",
    "Vorticity",
]);

var pressureSettings = {
    Iterations: 20
};
var pressureFolder = gui.addFolder("Pressure");
    pressureFolder.add(pressureSettings, "Iterations", 0, 50, 1);

var tempSettings = {
    Ambient: -0.1
};
var tempFolder = gui.addFolder("Temperature");
    tempFolder.add(tempSettings, "Ambient", -0.5, 0.5, 0.05);

function scene_setup(){
    scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
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
    externalVelocity = new ExternalVelocity();
    externalDensity = new ExternalDensity();
    buoyancy = new Buoyancy();
    draw = new Draw();
    jacobi = new Jacobi();
    divergence = new Divergence();
    subtractGradient = new SubtractGradient();
    curl = new Curl();
    vorticityConf = new VorticityConf();

    // create slabs

    velocity = new Slab();
    density = new Slab();
    temperature = new Slab();
    pressure = new Slab();
    temperature = new Slab();
    diverge = new Slab();
    vorticity = new Slab();

    //drawTexture is what is actually being drawn

    drawTexture = new THREE.WebGLRenderTarget( 512, 256, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });

    plane = new THREE.PlaneBufferGeometry( 2, 2 );
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


    externalVelocity.smokeSource.x = X * 512 / window.innerWidth;
    externalVelocity.smokeSource.y = Y * 256 / window.innerHeight;
    externalDensity.smokeSource.x = X * 512 / window.innerWidth;
    externalDensity.smokeSource.y = Y * 256 / window.innerHeight;

    externalVelocity.sourceVelocity.x = Math.round((X-lastX) / deltaTime * 100);
    externalVelocity.sourceVelocity.y = Math.round((Y-lastY) / deltaTime * 100);



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
    externalVelocity.smokeSource.z = 1.0;
    externalDensity.smokeSource.z = 1.0;
}
document.onmouseup = function(event){
    mouseDown = false;
    externalVelocity.smokeSource.z = 0;
    externalDensity.smokeSource.z = 0;
}

//Render everything!
function render() {

  advect.compute(renderer, velocity.read, velocity.read, 1.0, velocity.write);
  velocity.swap();

  advect.compute(renderer, velocity.read, density.read, 0.98, density.write);
  density.swap();

  advect.compute(renderer, velocity.read, temperature.read, 0.98, temperature.write);
  temperature.swap();

  buoyancy.compute(renderer, velocity.read, temperature.read, density.read, tempSettings.Ambient, velocity.write);
  velocity.swap();

  externalVelocity.compute(renderer, velocity.read, velocity.write);
  velocity.swap();

  color = [50, 50, 50];
  externalDensity.compute(renderer, density.read, color, density.write);
  density.swap();

  //externalForce.compute(renderer, temperature.read, temperature.write);
  //temperature.swap();

  curl.compute(renderer, velocity.read, vorticity.write);
  vorticity.swap();

  vorticityConf.compute(renderer, velocity.read, vorticity.read, 1.0, velocity.write);
  velocity.swap();

  divergence.compute(renderer, velocity.read, 1.0, 1.0, diverge.write);
  diverge.swap();

  renderer.clearTarget(pressure.read, true, false, false);
  for (var i = 0; i < pressureSettings.Iterations; i++) {
    jacobi.compute(renderer, pressure.read, diverge.read, -1.0, 4.0, pressure.write);
    pressure.swap();
  }

  subtractGradient.compute(renderer, velocity.read, pressure.read, 1.0, 1.0, velocity.write);
  velocity.swap()

  // curl.compute(renderer, velocity.read, velocity.write);
  // vorticity.compute(renderer, velocity.read, curl.read, dt, velocity.write);
  // velocity.swap()

  var read;
  let curr = displaySettings.Slab
  if (curr == "Density") {
      draw.setDisplay(new THREE.Vector3(0,0,0), new THREE.Vector3(1,0.1,0.5));
      read = density.read;
  } else if (curr == "Velocity") {
      draw.displayNeg();
      read = velocity.read;
  } else if (curr == "Temperature") {
      draw.displayNeg();
      read = temperature.read;
  } else if (curr == "Vorticity") {
      read = vorticity.read;
  }

  draw.compute(renderer, read, drawTexture);

  //var gl = renderer.getContext();
  
  renderer.render( scene, camera );


  // use for debugging
  /*
  var pixel = new Uint8Array(4);
  gl.readPixels(50, 50, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  console.log(pixel);
  */

  requestAnimationFrame( render );

}
render();
