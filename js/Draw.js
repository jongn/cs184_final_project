Draw = function(res) {
    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
    this.res = res;
    this.bias = new THREE.Vector3(0.5,0.5,0.5);
    this.scale = new THREE.Vector3(0.5,0.5,0.5);
    this.uniforms = {
        res : {type: 'v2' },
        bufferTexture: { type: "t" },
        obstacle: { type: "t" },
        bias: { type: "v3" },
        scale: {type:"v3" },
        obstacleColor: {type: "v3"}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Draw' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.quad = new THREE.Mesh(geometry, material);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    //this.camera.position.z = 2;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
}

Draw.prototype.compute = function(renderer, obstacle, obstacleColor, input, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.bufferTexture.value = input;
    this.uniforms.obstacle.value = obstacle;
    this.uniforms.obstacleColor.value = obstacleColor;
    this.uniforms.bias.value = this.bias;
    this.uniforms.scale.value = this.scale;
    renderer.render(this.scene, this.camera, output, false);
}

Draw.prototype.displayNeg = function() {
        this.bias = new THREE.Vector3(0.5,0.5,0.5);
        this.scale = new THREE.Vector3(0.5,0.5,0.5); 
}

Draw.prototype.setDisplay = function(bias, scale) {
        this.bias = bias;
        this.scale = scale; 
}

