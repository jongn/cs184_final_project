precision highp float;

uniform vec3 lPosition;
uniform vec3 lIntensity;

varying vec3 fPosition;
varying vec3 fNormal;

void main() {
    // TODO: Part 5.1

    float r = distance(lPosition, fPosition);

    vec3 fNormal_norm = normalize(fNormal);
    vec3 l_norm = normalize((lPosition - fPosition));

    gl_FragColor = vec4((lIntensity / (r * r)) * max(0.0, dot(fNormal_norm, l_norm)), 1.0);

    //gl_FragColor = vec4(vec3(0.0), 1.0);
}