const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * This is an abstract class that represents a game script. This class should be
 * subclassed to handle specific script formats.
 * @abstract
 */
class Script extends EventEmitter {

  constructor(name, script, params) {
    super();
    this.params = params || [];
    this.script = script;
    this.name = name;
    this.state = {};
    this.commandBuffer = [];
    this.moveBuffer = [];
    this.init();
  }

  /**
   * This function can be overridden to perform initialzation during
   * construction.
   */
  init() {
    return;
  }

  /**
   * Called when the script engine is ready for the next command from the
   * script.
   */
  nextCommand() {
    if (this.moveBuffer.length > 0) {
      this.emit('move', this, this.moveBuffer.shift());
      return;
    }

    if (this.commandBuffer.length > 0) {
      this.emit('command', this, this.commandBuffer.shift());
      return;
    }
  }

  /**
   * Called by the script engine when a message has been received from the
   * game session.
   * @param str (String) the message received.
   * @abstract
   */
  message(str) {
    throw('Not implmented');
  }

  /**
   * Called by the game engine to set the a new game state.
   * @param st (Object)
   */
  setState(state) {
    this.state = state;
  }

  /**
   * Called when a script is activated.
   * @abstract
   */
  start() {
    throw('Not implmented');
  }

  /**
   * Adds a command to the command queue, which will then be sent to the server.
   * @param command (string) The command to send to the server.
   */
  send(command) {
    this.commandBuffer.push(command);
  }

  /**
   * Prints a message to the game window
   * @param message (string) The message to print
   */
  print(message) {
    this.emit('print', this, message);
  }
  /**
   * Informs the script engine to send a desktop notification
   * @param message (string) the message body of the notification
   * @emits notify
   */
  notify(message) {
    this.emit('notify', this, msg);
  }

  /**
   * Adds a command to the moveBuffer which is then sent to the server.
   * @param command (string) The movement command to send to the server.
   */
  move(command)  {
    this.moveBuffer.push(command);
  }

  /**
   * Called to alert the game engine that the script has exited.
   * @emits exit
   */
  exit() {
    this.emit('exit', this);
  }

  /**
   * Called to alert the game engine that the script has errored.
   * @param message (string) the error message to send to the engine
   * @emits error
   */
  error(message) {
    this.emit('error', this, message);
  }
}

module.exports = Script;
