import {ButtonConfig, Button} from './button';
import {UIInstanceManager} from '../uimanager';
import SkipMessage = bitmovin.PlayerAPI.SkipMessage;
import {StringUtils} from '../stringutils';

/**
 * Configuration interface for the {@link IntroSkipButton}.
 */
export interface IntroSkipButtonConfig extends ButtonConfig {
  label?: string;
  showTime?: number;
  hideTime?: number;
  clickHandler: () => void;
}

/**
 * A button that is displayed during ads and can be used to skip the ad.
 */
export class IntroSkipButton extends Button<IntroSkipButtonConfig> {

  constructor(config: IntroSkipButtonConfig) {
    super(config);

    this.config = this.mergeConfig(config, <IntroSkipButtonConfig>{
      cssClass: 'ui-button-intro-skip',
      label: 'Skip introduction',
    }, this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <IntroSkipButtonConfig>this.getConfig(); // TODO get rid of generic cast

    this.hide();

    let playbackTimeHandler = () => {
      let t = player.getCurrentTime();
      if (t < config.showTime || t > config.hideTime) {
        this.hide();
      } else {
        this.show();
      }
    };

    player.addEventHandler(player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
    player.addEventHandler(player.EVENT.ON_SEEKED, playbackTimeHandler);

    this.setText(config.label);

    this.onClick.subscribe(() => {
      config.clickHandler();
    });
  }

  hide(): void {
    this.getDomElement().css({
      'display': 'none',
    });
  }

  show(): void {
    this.getDomElement().css({
      'display': 'block',
    });
  }
}