Draw = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.bias = new THREE.Vector3(0.5,0.5,0.5);
    this.scale = new THREE.Vector3(0.5,0.5,0.5);
    this.uniforms = {
        res : {type: 'v2' },
        bufferTexture: { type: "t" },
        bias: { type: "v3" },
        scale: {type:"v3" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Draw' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.quad = new THREE.Mesh(geometry, material);
    this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    this.camera.position.z = 2;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
}

Draw.prototype.compute = function(renderer, input, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.bufferTexture.value = input;
    this.uniforms.bias.value = this.bias;
    this.uniforms.scale.value = this.scale;
    renderer.render(this.scene, this.camera, output, false);
}
