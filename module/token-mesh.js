import {
    TokenTwillightSamplerShader
  } from "./shaders.js";

export class TokenMeshMTA extends TokenMesh {

    refresh(attributes=undefined) {
        super.refresh(attributes);
        // Handle special shader assignment
        const isTwillight = this.document.hasStatusEffect(CONFIG.specialStatusEffects.TWILLIGHT);
        const shader = isInvisible ? TokenTwillightSamplerShader : BaseSamplerShader;
        this.setShaderClass(shader);
    }
}