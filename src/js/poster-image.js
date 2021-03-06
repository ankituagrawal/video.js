/**
 * @file poster-image.js
 */
import ClickableComponent from './clickable-component.js';
import Component from './component.js';
import * as Fn from './utils/fn.js';
import * as Dom from './utils/dom.js';
import * as browser from './utils/browser.js';

/**
 * A `ClickableComponent` that handles showing the poster image for the player.
 *
 * @extends ClickableComponent
 */
class PosterImage extends ClickableComponent {

  /**
   * Create an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should attach to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  constructor(player, options) {
    super(player, options);

    this.update();
    player.on('posterchange', Fn.bind(this, this.update));
  }

  /**
   * Clean up and dispose of the `PosterImage`.
   */
  dispose() {
    this.player().off('posterchange', this.update);
    super.dispose();
  }

  /**
   * Create the `PosterImage`s DOM element.
   *
   * @return {Element}
   *         The element that gets created.
   */
  createEl() {
    const el = Dom.createEl('div', {
      className: 'vjs-poster',

      // Don't want poster to be tabbable.
      tabIndex: -1
    });

    // To ensure the poster image resizes while maintaining its original aspect
    // ratio, use a div with `background-size` when available. For browsers that
    // do not support `background-size` (e.g. IE8), fall back on using a regular
    // img element.
    if (!browser.BACKGROUND_SIZE_SUPPORTED) {
      this.fallbackImg_ = Dom.createEl('img');
      el.appendChild(this.fallbackImg_);
    }

    return el;
  }

  /**
   * An {@link EventTarget~EventListener} for {@link Player#posterchange} events.
   *
   * @listens Player#posterchange
   *
   * @param {EventTarget~Event} [event]
   *        The `Player#posterchange` event that triggered this function.
   */
  update(event) {
    const url = this.player().poster();

    this.setSrc(url);

    // If there's no poster source we should display:none on this component
    // so it's not still clickable or right-clickable
    if (url) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Set the source of the `PosterImage` depending on the display method.
   *
   * @param {String} url
   *        The URL to the source for the `PosterImage`.
   */
  setSrc(url) {
    if (this.fallbackImg_) {
      this.fallbackImg_.src = url;
    } else {
      let backgroundImage = '';

      // Any falsey values should stay as an empty string, otherwise
      // this will throw an extra error
      if (url) {
        backgroundImage = `url("${url}")`;
      }

      this.el_.style.backgroundImage = backgroundImage;
    }
  }

  /**
   * An {@link EventTarget~EventListener} for clicks on the `PosterImage`. See
   * {@link ClickableComponent#handleClick} for instances where this will be triggered.
   *
   * @listens tap
   * @listens click
   * @listens keydown
   *
   * @param {EventTarget~Event} event
   +        The `click`, `tap` or `keydown` event that caused this function to be called.
   */
  handleClick(event) {
    // We don't want a click to trigger playback when controls are disabled
    // but CSS should be hiding the poster to prevent that from happening
    if (this.player_.paused()) {
      this.player_.play();
    } else {
      this.player_.pause();
    }
  }

}

Component.registerComponent('PosterImage', PosterImage);
export default PosterImage;
