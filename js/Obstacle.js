Obstacle = function(res) {
    var circleGeometry = new THREE.CircleGeometry(15, 300);
    var positions = new Float32Array(36 * 3 * 3);
    var normals = new Float32Array(36 * 3 * 3);
    var radius = 0.1;

    // https://stackoverflow.com/questions/45603799/scale-buffergeometry-objects-from-their-center
    for (var i = 0; i < 36; i++) {
        const a0 = (i + 0) * Math.PI * 2 / 36;
        const a1 = (i + 1) * Math.PI * 2 / 36;
        positions[9*i + 0] = 0; 
        positions[9*i + 1] = 0; 
        positions[9*i + 2] = 0; 
        positions[9*i + 3] = Math.cos(a0) * radius;
        positions[9*i + 4] = Math.sin(a0) * radius;
        positions[9*i + 5] = 0; 
        positions[9*i + 6] = Math.cos(a1) * radius;;
        positions[9*i + 7] = Math.sin(a1) * radius; 
        positions[9*i + 8] = 0;
        normals[9*i + 0] = 0;
        normals[9*i + 1] = 0;
        normals[9*i + 2] = 0;
        normals[9*i + 3] = Math.cos(a0);
        normals[9*i + 4] = Math.sin(a0);
        normals[9*i + 5] = 0;
        normals[9*i + 6] = Math.cos(a1);
        normals[9*i + 7] = Math.sin(a1);
        normals[9*i + 8] = 0;
    }

    //circleGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    //circleGeometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

    this.res = res;
    this.circleUniforms = {
        color: { type: "v3" }
    };
    var circleMaterial = new THREE.ShaderMaterial({
        uniforms: this.circleUniforms,
        fragmentShader: document.getElementById( 'Blank' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.circle = new THREE.Mesh(circleGeometry, circleMaterial);
    //this.line = new THREE.Line(geometry, material);
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.circleCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50 );
    this.circleCamera.position.z = 50;
    //this.camera.position.z = 2;
    this.circleScene = new THREE.Scene();
    this.circleScene.add(this.circle);
    //this.scene.add(this.line);

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
    this.uniforms = {
        read: { type: "t" },
        res : {type: 'v2' }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Dummy' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.quad = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);


    var blank = new THREE.PlaneBufferGeometry( 2, 2 );
    this.blankUniforms = {
        color: { type: "v3" }
    };
    var blankMaterial = new THREE.ShaderMaterial({
        uniforms: this.blankUniforms,
        fragmentShader: document.getElementById( 'Blank' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.blankQuad = new THREE.Mesh(blank, blankMaterial);
    this.blankScene = new THREE.Scene();
    this.blankScene.add(this.blankQuad);
}

Obstacle.prototype = {
    constructor: Obstacle,
    initCircle: function(renderer, color, output) {
        this.circleUniforms.color.value = color;
        renderer.render(this.circleScene, this.circleCamera, output, false);
    },
    initBlank: function(renderer, color, output) {
        this.blankUniforms.color.value = color;
        renderer.render(this.blankScene, this.camera, output, false);
    }
}