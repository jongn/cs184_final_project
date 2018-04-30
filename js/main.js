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
var externalTemperature;
var subtractGradient;
var vorticity;
var splat;
var draw;

var displaySettings = {
    Slab: "Density"
};
gui = new dat.GUI();
gui.add(displaySettings, "Slab", [
    "Density",
    "Velocity",
    "Temperature",
    "Vorticity"
]);

var pressureSettings = {
    Iterations: 20
};
var pressureFolder = gui.addFolder("Pressure");
    pressureFolder.add(pressureSettings, "Iterations", 0, 50, 1);

var tempSettings = {
    Ambient: 0.0
};
var tempFolder = gui.addFolder("Temperature");
    tempFolder.add(tempSettings, "Ambient", -0.5, 0.5, 0.05);

var vorticitySettings = {
    Curl: 0.2
};
var vorticityFolder = gui.addFolder("Vorticity");
    vorticityFolder.add(vorticitySettings, "Curl", 0, 1.0, 0.05);

var colorSettings = {
    Color: "Constant"
};
gui.add(colorSettings, "Color", [
    "Constant",
    "Velocity-Based"
]);

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
    externalTemperature = new ExternalTemperature();
    buoyancy = new Buoyancy();
    draw = new Draw();
    jacobi = new Jacobi();
    divergence = new Divergence();
    subtractGradient = new SubtractGradient();
    curl = new Curl();
    vorticityConf = new VorticityConf();
    splat = new Splat();

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
    externalTemperature.smokeSource.x = X * 512 / window.innerWidth;
    externalTemperature.smokeSource.y = Y * 256 / window.innerHeight;

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
    externalTemperature.smokeSource.z = 0.2;
}
document.onmouseup = function(event){
    mouseDown = false;
    externalVelocity.smokeSource.z = 0;
    externalDensity.smokeSource.z = 0;
    externalTemperature.smokeSource.z = 0;
}

function multipleSplats(amount) {
  for (let i = 0; i < amount; i++) {
    const color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
    const x = window.innerWidth * Math.random();
    const y = window.innerHeight * Math.random();
    const dx = 1000 * (Math.random() - 0.5);
    const dy = 1000 * (Math.random() - 0.5);
    oneSplat(x, y, dx, dy, color);
  }
}

function oneSplat(x, y, dx, dy, color) {
  point = [x / window.innerWidth, 1.0 - y / window.innerHeight];
  color_v = [dx, -dy, 1.0];
  radius = 0.005;
  splat.compute(renderer, velocity.read, point, color_v, radius, velocity.write);
  velocity.swap();
  color_d = [color[0] * 0.3, color[1] * 0.3, color[2] * 0.3];
  splat.compute(renderer, density.read, point, color_d, radius, density.write);
  density.swap();
}

//Render everything!
function render() {

  externalVelocity.compute(renderer, velocity.read, velocity.write);
  velocity.swap();

  let currColor = colorSettings.Color;

  if (currColor == "Constant") {
      color = [50, 50, 50];
      externalDensity.compute(renderer, density.read, color, density.write);
  } else if (currColor == "Velocity-Based") {
      externalVelocity.compute(renderer, density.read, density.write);
  }
  density.swap();

  advect.compute(renderer, velocity.read, velocity.read, 1.0, 0.0, velocity.write);
  velocity.swap();

  advect.compute(renderer, velocity.read, density.read, 0.98, 0.5, density.write);
  density.swap();

  advect.compute(renderer, velocity.read, temperature.read, 0.98, 0.5, temperature.write);
  temperature.swap();

  buoyancy.compute(renderer, velocity.read, temperature.read, density.read, 0.5 * tempSettings.Ambient, velocity.write);
  velocity.swap();

  

  externalTemperature.compute(renderer, temperature.read, temperature.write);
  temperature.swap();

  curl.compute(renderer, velocity.read, vorticity.write);
  vorticity.swap();

  vorticityConf.compute(renderer, velocity.read, vorticity.read, vorticitySettings.Curl, velocity.write);
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
  let currSlab = displaySettings.Slab;
  if (currSlab == "Density") {
      if (currColor == "Constant") {
        draw.setDisplay(new THREE.Vector3(0,0,0), new THREE.Vector3(1.0,0.2,0.8));
      } else if (currColor == "Velocity-Based") {
        draw.displayNeg();
      }
      read = density.read;
  } else if (currSlab == "Velocity") {
      draw.displayNeg();
      read = velocity.read;
  } else if (currSlab == "Temperature") {
      amb = 0.5 * tempSettings.Ambient
      draw.setDisplay(new THREE.Vector3(0.5 + amb,0.5,0.5 - amb), new THREE.Vector3(1.0,1.0,1.0));
      read = temperature.read;
  } else if (currSlab == "Vorticity") {
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
