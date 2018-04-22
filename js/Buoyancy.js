Buoyancy = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.uniforms = {
        res : {type: 'v2' },
        velocityField: { type: "t" },
        temperatureField: { type: "t" },
        densityField: { type: "t" },
        ambientTemperature: { type: "f" },
        dt: { type: "f" },
        sigma: { type: "f" },
        kappa: { type: "f" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Buoyancy' ).innerHTML,
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

Buoyancy.prototype.compute = function(renderer, velocityField, temperatureField, densityField, dt, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.velocityField.value = velocityField;
    this.uniforms.temperatureField.value = temperatureField;
    this.uniforms.densityField.value = densityField;
    this.uniforms.ambientTemperature.value = 0.0;
    this.uniforms.dt.value = dt;
    this.uniforms.sigma.value = 1.0;
    this.uniforms.kappa.value = 0.01;
    renderer.render(this.scene, this.camera, output, false);
}
