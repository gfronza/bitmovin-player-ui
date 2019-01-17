import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {Label, LabelConfig} from './label';
import {Component, ComponentConfig} from './component';
import {Timeout} from '../timeout';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link BufferingOverlay} component.
 */
export interface BufferingOverlayConfig extends ContainerConfig {
  /**
   * Delay in milliseconds after which the buffering overlay will be displayed. Useful to bypass short stalls without
   * displaying the overlay. Set to 0 to display the overlay instantly.
   * Default: 1000ms (1 second)
   */
  showDelayMs?: number;
}

/**
 * Overlays the player and displays a buffering indicator.
 */
export class BufferingOverlay extends Container<BufferingOverlayConfig> {

  private indicators: Component<ComponentConfig>[];
  private progressLabel: BufferingProgressLabel;

  constructor(config: BufferingOverlayConfig = {}) {
    super(config);

    this.progressLabel = new BufferingProgressLabel({ text: "0%" });

    this.indicators = [
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      new Component<ComponentConfig>({ tag: 'div', cssClass: 'ui-buffering-overlay-indicator' }),
      this.progressLabel
    ];

    this.config = this.mergeConfig(config, <BufferingOverlayConfig>{
      cssClass: 'ui-buffering-overlay',
      hidden: true,
      components: this.indicators,
      showDelayMs: 1000,
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = <BufferingOverlayConfig>this.getConfig();

    let overlayShowTimeout = new Timeout(config.showDelayMs, () => {
      this.show();
    });

    let progressTimeout = new Timeout(200, () => {
      // let level = player.buffer.getLevel("ForwardDuration", "video");
      let currentBuffer = player.getVideoBufferLength();

      if (currentBuffer) {
        let restartThreshold = (player.getConfig().tweaks ? player.getConfig().tweaks.restart_threshold : null) || 0.9
        let progress = Math.min(100, Math.round((currentBuffer / restartThreshold) * 100));
        this.progressLabel.setText(progress + '%');
      } else {
        this.progressLabel.setText('0%');
      }
    }, true);

    let showOverlay = () => {
      overlayShowTimeout.start();
      progressTimeout.start();
    };

    let hideOverlay = () => {
      overlayShowTimeout.clear();
      progressTimeout.clear();
      this.hide();
    };

    player.on(player.exports.PlayerEvent.StallStarted, showOverlay);
    player.on(player.exports.PlayerEvent.StallEnded, hideOverlay);
    player.on(player.exports.PlayerEvent.Play, showOverlay);
    player.on(player.exports.PlayerEvent.Playing, hideOverlay);
    player.on(player.exports.PlayerEvent.Paused, hideOverlay);
    player.on(player.exports.PlayerEvent.Seek, showOverlay);
    player.on(player.exports.PlayerEvent.Seeked, hideOverlay);
    player.on(player.exports.PlayerEvent.TimeShift, showOverlay);
    player.on(player.exports.PlayerEvent.TimeShifted, hideOverlay);
    player.on(player.exports.PlayerEvent.SourceUnloaded, hideOverlay);

    // Show overlay if player is already stalled at init
    if (player.isStalled()) {
      this.show();
    }
  }
}

class BufferingProgressLabel extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-buffering-overlay-progress-label',
    }, this.config);
  }
}
