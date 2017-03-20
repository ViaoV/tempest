const DataConfig = require('../../../lib/data/DataConfig');
DataConfig.memoryDB = true;

const { Session } = require('../../../lib/data');
const { AuthHandler } = require('../../../lib/client');

describe('Session persistance', () => {
  it('should save a session', (done) => {
    var auth = new AuthHandler();
    auth.saveSession('u', 'p', 'cn', 'cc').then(() => {
      auth.getSavedSessions().then((sessions) => {
        expect(sessions.length).toBe(1);
        done();
      }).catch((e) => {
        expect(e).toBe(undefined);
        done();
      });
    }).catch((e) => {
      expect(e).toBe(undefined);
      done();
    });
  });
});
