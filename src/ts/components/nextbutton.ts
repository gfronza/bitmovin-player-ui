import { ButtonConfig, Button } from './button';
import { UIInstanceManager } from '../uimanager';

/**
 * A button to go the next video.
 */
export class NextButton extends Button<ButtonConfig> {

  // The time at which to hide this button
  private targetTime: number;

  constructor(targetTime: number = 10, config: ButtonConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-nextvideobutton',
      text: 'Next',
    }, this.config);
    this.targetTime = targetTime;
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let playbackTimeHandler = () => {
      let t = player.getCurrentTime();
      if (t > this.targetTime) {
        this.getDomElement().css({
          'display': 'none',
        });
      } else {
        this.getDomElement().css({
          'display': 'block',
        });
      }
    };

    player.addEventHandler(player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
    player.addEventHandler(player.EVENT.ON_SEEKED, playbackTimeHandler);


    this.onClick.subscribe(() => {
      var playlistHandler = uimanager.getConfig().playlistHandler;

      if (playlistHandler === undefined) {
        throw new Error('playlistHandler not set in UIManager configuration object.');
      }

      playlistHandler.next();
    });
  }
}
