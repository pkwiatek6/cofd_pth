export class TokenTwillightSamplerShader extends BaseSamplerShader {

    /** @override */
  static classPluginName = null;

  /** @inheritdoc */
  static fragmentShader = `
    precision ${PIXI.settings.PRECISION_FRAGMENT} float;
    uniform sampler2D sampler;
    uniform vec4 tintAlpha;
    uniform vec3 color;
    uniform float alpha;
    uniform bool enable;
    varying vec2 vUvs;
    
    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    
    void main() {
      vec4 baseColor = texture2D(sampler, vUvs);
  
      if ( baseColor.a > 0.0 ) {
        // Unmultiply rgb with alpha channel
        baseColor.rgb /= baseColor.a;

        // Computing halo
        float lum = perceivedBrightness(baseColor.rgb);
        vec3 haloColor = vec3(lum) * color;
        float halo = smoothstep(0.0, 0.4, lum);
        
        // Construct final image
        baseColor.a *= halo * alpha;
        baseColor.rgb = mix(baseColor.rgb * baseColor.a, haloColor * baseColor.a, 0.65);
      }
  
      // Output with tint and alpha
      gl_FragColor = baseColor * tintAlpha;
    }`;

  /** @inheritdoc */
  static defaultUniforms = {
    tintAlpha: [1, 1, 1, 1],
    sampler: 0,
    color: [0.4, 0.05, 0.6],
    alpha: 0.8
  };
  }