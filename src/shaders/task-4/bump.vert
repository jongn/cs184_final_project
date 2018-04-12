attribute vec3 position;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform sampler2D textureDisplacement;
uniform vec2 textureDimension;

varying vec3 fPosition;
varying vec3 fNormal;

void main() {
    vec3 offset = position;

    // TODO: Compute displaced vertices
    float heightScaling = 0.8;

    vec3 b = cross(normal, tangent);

    mat3 TBN;
    TBN[0] = tangent;
    TBN[1] = b;
    TBN[2] = normal;

 	float w = textureDimension[0];
 	float h = textureDimension[1];

    float huv = texture2D(textureDisplacement, uv).r;
    float huv1 = texture2D(textureDisplacement, vec2(uv.x + 1.0/w, uv.y)).r;
    float huv2 = texture2D(textureDisplacement, vec2(uv.x, uv.y + 1.0/h)).r;

    // TODO: Compute displaced normals
    float normalScaling = 1.0;

    float dU = heightScaling * normalScaling * (huv1 - huv);
    float dV = heightScaling * normalScaling * (huv2 - huv);

    vec3 no = vec3(-dU, -dV, 1.0);
    vec3 nd = TBN * no;

    fPosition = vec3(0.0);
    fNormal = nd;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(offset, 1.0);
}