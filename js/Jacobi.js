Jacobi = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.uniforms = {
        res : {type: 'v2' },
        x: { type: "t" },
        b: { type: "t" },
        alpha: {type:"f" },
        beta: {type:"f" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Jacobi' ).innerHTML,
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

Jacobi.prototype.compute = function(renderer, x, b, alpha, beta, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.x.value = x;
    this.uniforms.b.value = b;
    this.uniforms.alpha.value = alpha;
    this.uniforms.beta.value = beta;
    renderer.render(this.scene, this.camera, output, false);
}
