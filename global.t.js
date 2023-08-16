/**
 * @typedef {Object} DialogButton
 * @property {string} icon
 * @property {string} label
 * @property {function(any): void} callback
 */

/**
 * @typedef {Object} DialogConfig
 * @property {string} title
 * @property {string} content
 * @property {{ [key: string]: DialogButton }} buttons
 * @property {function(any): void} render
 */

/**
 * @class
 * @param {DialogConfig} config
 */
function Dialog(config) {
  this.render = function (isTrue) {}
}

// Let's also add the canvas type from before
/**
 * @type {{
 *   tokens: {
 *     controlled: any
 *   }
 * }}
 */
let canvas

/**
 * @typedef {Object} UINotifications
 * @property {function(string): void} error
 * @property {function(string): void} info
 * @property {function(string): void} warn
 */

/**
 * @typedef {Object} UI
 * @property {UINotifications} notifications
 */

/**
 * @type {UI}
 */
let ui

/**
 * @typedef {Object} Scene
 * @property {function(string, Array<Object>): void} updateEmbeddedDocuments
 */

/**
 * @typedef {Object} GameScenes
 * @property {Scene} viewed
 */

/**
 * @typedef {Object} Game
 * @property {GameScenes} scenes
 */

/**
 * @type {Game}
 */
let game;
