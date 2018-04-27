Slab = function() {
	this.read = new THREE.WebGLRenderTarget( 512, 256, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });
    this.write = new THREE.WebGLRenderTarget( 512, 256, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType });
}

Slab.prototype.swap = function() {
	var tmp = this.read;
	this.read = this.write;
	this.write = tmp;
}