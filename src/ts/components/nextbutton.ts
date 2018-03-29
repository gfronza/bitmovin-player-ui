import {ButtonConfig, Button} from './button';
import {UIInstanceManager} from '../uimanager';

/**
 * A button to go the next video.
 */
export class NextButton extends Button<ButtonConfig> {

  constructor(config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-nextvideobutton',
      text: 'Next',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      var playlistHandler = uimanager.getConfig().playlistHandler;

      if (playlistHandler === undefined) {
        throw new Error('playlistHandler not set in UIManager configuration object.');
      }

      playlistHandler.next();
    });
  }
}