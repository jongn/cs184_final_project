Advect = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.uniforms = {
        res : {type: 'v2' },
        velocityField: { type: "t" },
        advectionField: { type: "t" },
        dissipation: {type:"f" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Advect' ).innerHTML,
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

Advect.prototype.compute = function(renderer, input, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.velocityField.value = input;
    this.uniforms.advectionField.value = input;
    this.uniforms.dissipation.value = 1.0;
    renderer.render(this.scene, this.camera, output, false);
}
