const { Script } = require('../../../lib/script_engine');
const fs = require('fs');

describe('script compilation', () => {
  it('should compile coffee script files', (done) => {
    const script = new Script('test', `p "hello world"`);
    script.compile()
      .then((script) => {
        expect(script).not.toBe(undefined);
        done();
      })
      .catch((e) => {
        console.log(e);
        expect(e).toBe(undefined);
        done();
      });
  });
});

describe('put command', () => {
  it('should emit command event', (done) => {
    const script = new Script('test', `p "hello"`);
    script.on('command', (script, msg) => {
      expect(msg).toBe('hello');
      done();
    });
    script.on('error', console.log);
    script.start();
  });
});

describe('match command', () => {
  it('should emit command event on match', (done) => {
    const script = new Script('test', `
      match "test123", ->
        p "123"
      match "test321", ->
        p "321"
    `);
    script.on('command', (script, msg) => {
      expect(msg).toBe('123');
      done();
    });
    script.on('error', (script, e) => {
      expect(e).toBe(undefined);
      done();
    });
    script.on('started', (s) => {
      s.message('test123');
    });
    script.start();
  });
});

describe('next command', () => {
  it('should call function on match', (done) => {
    const script = new Script('test', ` next "test123", -> p "123" `);
    script.on('command', (script, msg) => {
      expect(msg).toBe('123');
      expect(script.triggers.length).toBe(0);
      done();
    });
    script.on('error', (script, e) => {
      expect(e).toBe(undefined);
      done();
    });
    script.on('started', (s) => {
      s.message('test123');
    });
    script.start();
  });
});

describe('trigger command', () => {
  it('should call function on match', (done) => {
    const script = new Script('test', ` trigger "test123", -> p "123" `);
    script.on('command', (script, msg) => {
      expect(msg).toBe('123');
      expect(script.triggers.length).toBe(1);
      done();
    });
    script.on('error', (script, e) => {
      expect(e).toBe(undefined);
      done();
    });
    script.on('started', (s) => {
      s.message('test123');
    });
    script.start();
  });
});

describe('print command', () => {
  it('should emit print event', (done) => {
    const script = new Script('test', `print "test"`);
    script.on('print', (script, msg) => {
      expect(msg).toBe('test');
      done();
    });
    script.on('error', (script, e) => {
      expect(e).toBe(undefined);
      done();
    });
    script.start();
  });
});

describe('notify command', () => {
  it('should emit notify event', (done) => {
    const script = new Script('test', `notify "test"`);
    script.on('notify', (script, msg) => {
      expect(msg).toBe('test');
      done();
    });
    script.on('error', (script, e) => {
      expect(e).toBe(undefined);
      done();
    });
    script.start();
  });
});

describe('$ should return state', () => {
  it('should emit notify event', (done) => {
    const script = new Script('test', `print $().test`);
    const state = { test: '123' };
    script.on('error', (script, e) => {
      expect(e).toBe(undefined);
      done();
    });
    script.on('print', (s, msg) => {
        expect(msg).toBe(state.test);
        done();
      });
    script.setState(state);
    script.start();
  });
});

describe('wait', () => {

  it('should delay execution', (done) => {
    const script = new Script('test', `wait 1, -> p "test"`);
    script.on('command', (s, msg) => {
      expect(msg).toBe('test');
      done();
    });
    script.start();
  });

  it('should add to delays collection', (done) => {
    const script = new Script('test', `wait 1, -> p("test")`);
    script.on('started', (s) => {
      expect(s.delays.length).toBe(1);
      done();
    });
    script.start();
  });

});
