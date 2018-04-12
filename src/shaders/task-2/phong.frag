precision highp float;

uniform vec3 cameraPosition;
uniform vec3 lPosition;
uniform vec3 lIntensity;

varying vec3 fPosition;
varying vec3 fNormal;

void main() {
    // TODO: Part 5.2
    //gl_FragColor = vec4(vec3(0.0), 1.0);

    vec4 ka = vec4(0.0);
    vec4 ia = vec4(0.0);

    vec4 term1 = ka * ia;

    float r = distance(lPosition, fPosition);

    vec3 fNormal_norm = normalize(fNormal);
    vec3 l_norm = normalize(lPosition - fPosition);

    vec4 kd = vec4(0.8);

    vec4 term2 = kd * vec4((lIntensity / (r * r)) * max(0.0, dot(fNormal_norm, l_norm)), 1.0);

    vec4 ks = vec4(0.5);

    vec3 v_norm = normalize(cameraPosition - fPosition);
    vec3 h = l_norm + v_norm;
    vec3 h_norm = normalize(h);

    vec4 term3 = ks * vec4((lIntensity / (r * r)) * pow(max(0.0, dot(fNormal_norm, h_norm)), 100.0), 1.0);

    gl_FragColor = term1 + term2 + term3;
}