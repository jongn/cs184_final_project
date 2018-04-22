Vorticity = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.uniforms = {
        res : {type: 'v2' },
        velocityField: { type: "t" },
        curlField: { type: "t" },
        dt: { type: "f" },
        curl: { type: "f" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Vorticity' ).innerHTML,
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

Vorticity.prototype.compute = function(renderer, velocityField, curlField, dt, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.velocityField.value = velocityField;
    this.uniforms.curlField.value = curlField;
    this.uniforms.dt.value = dt;
    this.uniforms.curl.value = 30;

    renderer.render(this.scene, this.camera, output, false);
}