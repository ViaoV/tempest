const { ScriptEngine, Script }  = require('../../../lib/script_engine');
const fs = require('fs');

ScriptEngine.scriptsPath = '.';

describe('Script loading', () => {
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
    ScriptEngine.readScript('test2')
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
      ScriptEngine.loadScript('test2');
      ScriptEngine.on('script.loaded', (script) => {
        expect(script.name).toBe('test2');
        done();
      });
      ScriptEngine.on('script.error', (e) => {
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
      ScriptEngine.on('script.started', (script) => {
        expect(script).not.toBe(undefined);
        done();
      });
      ScriptEngine.addScript(new Script('test', `p "test"`));
    });
  });

  describe('command', () => {

    it('should bubble from script', (done) => {
      ScriptEngine.on('script.command', (script, msg) => {
        expect(msg).toBe('test');
        done();
      });
      ScriptEngine.addScript(new Script('test', `p "test"`));
    });

  });

  describe('notify', () => {

    it('should bubble from script', (done) => {
      ScriptEngine.on('script.notify', (script, msg) => {
        expect(msg).toBe('test');
        done();
      });
      ScriptEngine.addScript(new Script('test', `notify "test"`));
    });

  });

  describe('print', () => {

    it('should bubble from script', (done) => {
      ScriptEngine.on('script.print', (script, msg) => {
        expect(msg).toBe('test');
        done();
      });
      ScriptEngine.addScript(new Script('test', `print "test"`));
    });

  });

});

describe('setState', () => {

  it('should set script states', () => {
    const state = { test: 123 };
    ScriptEngine.addScript(new Script('test', `print "test"`));
    ScriptEngine.setState(state);
    expect(ScriptEngine.scripts[0].state == state);
  });

});

describe('message', () => {

  it('should pass to script', (done) => {
    ScriptEngine.on('script.command', (script, msg) => {
      expect(msg).toBe('test');
      done();
    });
    ScriptEngine.on('script.started', (s) => { ScriptEngine.message('test'); });
    ScriptEngine.addScript(new Script('test', `next "test", -> p("test")`));
  });

});
