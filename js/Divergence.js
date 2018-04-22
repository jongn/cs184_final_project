Divergence = function() {
    var geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    this.res = new THREE.Vector2(window.innerWidth,window.innerHeight);
    this.uniforms = {
        res : {type: 'v2' },
        u: { type: "t" },
        dx: {type:"f" },
        dy: {type:"f" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Divergence' ).innerHTML,
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

Divergence.prototype.compute = function(renderer, u, dx, dy, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.u.value = u;
    this.uniforms.dx.value = dx;
    this.uniforms.dy.value = dy;
    renderer.render(this.scene, this.camera, output, false);
}
