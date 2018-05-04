Splat = function(res) {
    var geometry = new THREE.PlaneBufferGeometry( 2 * (512 - 2) / 512, 2 * (256 - 2) / 256 );
    this.res = res;
    this.uniforms = {
        res : {type: 'v2' },
        field: { type: 't' },
        point : { type: 'v2'},
        color : { type: 'v3'},
        radius : { type: 'f'}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Splat' ).innerHTML,
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

Splat.prototype.compute = function(renderer, field, point, color, radius, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.field.value = field;
    this.uniforms.point.value = point;
    this.uniforms.color.value = color;
    this.uniforms.radius.value = radius;
    renderer.render(this.scene, this.camera, output, false);
}
