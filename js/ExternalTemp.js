ExternalTemp = function() {
    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
    this.res = new THREE.Vector2(512, 256);
    this.smokeSource = new THREE.Vector3(0,0,0);
    this.uniforms = {
        bufferTexture: { type: "t" },
        res : {type: 'v2' },
        smokeSource: {type:"v3" },
        temp: {type:"f" }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'ExternalTemp' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.quad = new THREE.Mesh(geometry, material);
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    //this.camera.position.z = 2;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
}

ExternalTemp.prototype.compute = function(renderer, input, temp, output) {
    this.uniforms.bufferTexture.value = input;
    this.uniforms.res.value = this.res;
    this.uniforms.smokeSource.value = this.smokeSource;
    this.uniforms.temp.value = temp;
    renderer.render(this.scene, this.camera, output, false);
}