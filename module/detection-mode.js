export class DetectionModeTwillight extends DetectionMode {

    /** @override */
    static getDetectionFilter() {
      return this._detectionFilter ??= GlowOverlayFilter.create({
        glowColor: [0.10, 0.0, 0.53, 1]
      });
    }
  
    /** @override */
    _canDetect(visionSource, target) {
  
      // See/Detect Invisibility can ONLY detect invisible status
      const tgt = target?.document;
      const isInvisible = (tgt instanceof TokenDocument) && tgt.hasStatusEffect(CONFIG.specialStatusEffects.TWILLIGHT);
      if ( !isInvisible ) return false;
  
      // The source may not be blind if the detection mode requires sight
      const src = visionSource.object.document;
      const isBlind = ( (src instanceof TokenDocument) && (this.type === DetectionMode.DETECTION_TYPES.SIGHT)
        && src.hasStatusEffect(CONFIG.specialStatusEffects.BLIND) );
      return !isBlind;
    }
  }