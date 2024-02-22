export class TokenHealthColorSettingsDialogue extends FormApplication{
    constructor() {
        const color_healthy = game.settings.get("mta", "tokenHealthColorHealthy");
        const color_bashing = game.settings.get("mta", "tokenHealthColorBashing");
        const color_lethal = game.settings.get("mta", "tokenHealthColorLethal");
        const color_aggravated = game.settings.get("mta", "tokenHealthColorAggravated");

        let object = {color_healthy: color_healthy, color_bashing: color_bashing, color_lethal: color_lethal, color_aggravated: color_aggravated};
        super(object, {submitOnChange: true, closeOnSubmit: false});
        this.object = object;
    }

    getData() {
        const data = super.getData();
        return data.object;
    }

    activateListeners(html) {
      super.activateListeners(html);
      
      html.find('.reset-color').click(ev => {
        const color = ev.currentTarget.dataset.color;
        switch(color) {
          case 'healthy':
            this.object.color_healthy = '#000000';
            this._updateObject(ev, {color_healthy: '#000000'});
            this.render();
            break;
          case 'bashing':

            this.object.color_bashing = '#eaba0a';
            this._updateObject(ev, {color_bashing: '#eaba0a'});
            this.render();
            break;
          case 'lethal':
            this.object.color_lethal = '#d37313';
            this._updateObject(ev, {color_lethal: '#d37313'});
            this.render();
            break;
          case 'aggravated':
            this.object.color_aggravated = '#a52525';
            this._updateObject(ev, {color_aggravated: '#a52525'});
            this.render();
            break;
        }
      });
    }
    
  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ["worldbuilding", "dialogue", "mta-sheet"],
          template: "systems/mta/templates/dialogues/dialogue-tokenHealthColorSettings.html",
        resizable: true,
        width: 400,
        height: 250,
        title: "Token health color settings"
      });
    }

    async _updateObject(event, formData){
        game.settings.set("mta", "tokenHealthColorHealthy", formData.color_healthy);
        game.settings.set("mta", "tokenHealthColorBashing", formData.color_bashing);
        game.settings.set("mta", "tokenHealthColorLethal", formData.color_lethal);
        game.settings.set("mta", "tokenHealthColorAggravated", formData.color_aggravated);
        game.canvas.draw();
    }
}