ExternalForce = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.smokeSource = new THREE.Vector3(0,0,0);
    this.sourceVelocity = new THREE.Vector2(0,0);
    this.uniforms = {
        bufferTexture: { type: "t" },
        res : {type: 'v2' },
        smokeSource: {type:"v3" },
        sourceVelocity: {type:"v2" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'ExternalForce' ).innerHTML,
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

ExternalForce.prototype.compute = function(renderer, input, output) {
    this.uniforms.bufferTexture.value = input;
    this.uniforms.res.value = this.res;
    this.uniforms.smokeSource.value = this.smokeSource;
    this.uniforms.sourceVelocity.value = this.sourceVelocity;
    renderer.render(this.scene, this.camera, output, false);
}