const DRClient = window.require('electron').remote.require('./client');
const AuthHandler = window.require('electron').remote.require('./client/auth');

export const session = new DRClient();
export const auth = new AuthHandler();
