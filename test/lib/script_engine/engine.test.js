const { ScriptEngine, Script }  = require('../../../lib/script_engine');
const fs = require('fs');

describe('Script loading', () => {
  const engine = new ScriptEngine('./');
  beforeEach((done) => {
    fs.writeFile('test2.coffee', `
      func = (count) ->
        p "put data"
        p "put another data"
        if count > 3
          exit()
        else
          func(count + 1)
      func(0)`, done);
  });

  it('should read coffeescript files', (done) => {
    engine.readScript('test2')
      .then((script) => {
        expect(script).not.toBe(undefined);
        done();
      })
      .catch((e) => {
        expect(e).toBe(undefined);
        done();
      });
  });

  it('should load script file', (done) => {
      engine.loadScript('test2');
      engine.on('script.loaded', (script) => {
        expect(script.name).toBe('test2');
        done();
      });
      engine.on('script.error', (e) => {
        expect(e).toBe(undefined);
        done();
      });
    });

  afterEach((done) => {
    fs.unlink('test2.coffee', done);
  });
});

describe('event', () => {

  describe('started', () => {
    it('should fire on script add', (done) => {
      const engine = new ScriptEngine('./');
      engine.on('script.started', (script) => {
        expect(script).not.toBe(undefined);
        done();
      });
      engine.addScript(new Script('test', `p "test"`));
    });
  });

  describe('command', () => {

    it('should bubble from script', (done) => {
      const engine = new ScriptEngine('./');
      engine.on('script.command', (script, msg) => {
        expect(msg).toBe('test');
        done();
      });
      engine.addScript(new Script('test', `p "test"`));
    });

  });

  describe('notify', () => {

    it('should bubble from script', (done) => {
      const engine = new ScriptEngine('./');
      engine.on('script.notify', (script, msg) => {
        expect(msg).toBe('test');
        done();
      });
      engine.addScript(new Script('test', `notify "test"`));
    });

  });

  describe('print', () => {

    it('should bubble from script', (done) => {
      const engine = new ScriptEngine('./');
      engine.on('script.print', (script, msg) => {
        expect(msg).toBe('test');
        done();
      });
      engine.addScript(new Script('test', `print "test"`));
    });

  });

});

describe('setState', () => {

  it('should set script states', () => {
    const engine = new ScriptEngine('./');
    const state = { test: 123 };
    engine.addScript(new Script('test', `print "test"`));
    engine.setState(state);
    expect(engine.scripts[0].state == state);
  });

});

describe('message', () => {

  it('should pass to script', (done) => {
    const engine = new ScriptEngine('./');
    engine.on('script.command', (script, msg) => {
      expect(msg).toBe('test');
      done();
    });
    engine.on('script.started', (s) => { engine.message('test'); });
    engine.addScript(new Script('test', `next "test", -> p("test")`));
  });

});
