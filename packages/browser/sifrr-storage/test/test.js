const chai = require('chai'),
  assert = chai.assert,
  should = chai.should(),
  expect = chai.expect,
  BrowserStorage = require('../src/browserstorage'),
  JsonStorage = require('../src/storages/jsonstorage'),
  Storage = require('../src/storages/storage'),
  dummyData = require('./support/dummy.json');

describe('BrowserStorage', () => {
  describe('#new', () => {
    it('should return supported storage by default', () => {
      let x = new BrowserStorage();
      expect(x).to.be.an.instanceof(BrowserStorage.availableStores['indexeddb']);
      assert.equal(x.type, 'indexeddb')
    });

    Object.keys(BrowserStorage.availableStores).forEach((type) => {
      it(`should return ${type} if ${type} is prioritized`, () => {
        let x = new BrowserStorage({priority: [type]});
        expect(x).to.be.an.instanceof(BrowserStorage.availableStores[type]);
        assert.equal(x.type, type);
      });
    });
  });

  describe('#all', () => {
    it('should return all instances there are', () => {
      BrowserStorage._all = [];
      new BrowserStorage({ priority: ['cookies'] });
      new BrowserStorage({ priority: ['indexeddb'] });
      assert.equal(BrowserStorage.all.length, 2);
    });
  });

  describe('#json', () => {
    it('should return jsonstorage', () => {
      let x = BrowserStorage.json({ a: 'b' });
      assert.equal(x.type, 'jsonstorage');
    });
  });
});

describe('JsonStorage', () => {
  let options = {
    name: 'BrowserStorage',
    version: 1
  }

  describe('#new', () => {
    it('should parse provided string', () => {
      let x = new JsonStorage(options, '{"a": "b"}');
      assert.equal(x.store['a'], 'b')
      let y = new JsonStorage(options, '[{"a": "b"}]');
      assert.equal(y.store[0]['a'], 'b')
    });

    it('should not parse provided object', () => {
      let x = new JsonStorage(options, {a: "b"});
      assert.equal(x.store['a'], 'b')
    });
  });

  let x = new JsonStorage(options, dummyData);

  describe('#where', () => {
    it('= option', () => {
      expect(x.where({ '=': 'd' }).store).to.have.all.keys(['a', 'b', 'c']);
      expect(x.where({ surname: {'=': 'taparia'} }).store).to.have.all.keys(['aaditya', 'aayush']);
      expect(x.where({ hello: { why: {'=': 'you'} } }).store).to.have.all.keys(['aaditya', 'random']);
    });

    it('> option', () => {
      expect(x.where({ '>': 5 }).store).to.have.all.keys(['customers', 'range']);
      expect(x.where({ age: { '>': 20 } }).store).to.have.all.keys(['aaditya', 'mayank']);
    });

    it('< option', () => {
      expect(x.where({ hello: { length: { '<': 3 } } }).store).to.have.all.keys(['mayank']);
    });

    it('>= option', () => {
      expect(x.where({ '>=': 10 }).store).to.have.all.keys(['customers', 'range']);
    });

    it('<= option', () => {
      expect(x.where({ hello: { length: { '<=': 3 } } }).store).to.have.all.keys(['mayank', 'aaditya', 'random']);
    });

    it('~ option', () => {
      expect(x.where({ '~': 'xy' }).store).to.have.all.keys(['mnop', 'pqrs']);
      expect(x.where({ hobby: { '~': 'squash' } }).store).to.have.all.keys(['mayank', 'aaditya']);
    });
  });
});

describe('Storage', () => {
  let x = new Storage();

  describe('#_parseKeyValue', () => {
    it('should return key if key is array and value is not there', () => {
      assert.deepEqual(x._parseKeyValue([0, 1, 2]), [0, 1, 2])
    });

    it('should return object if key is object and value is not there', () => {
      assert.deepEqual(x._parseKeyValue({a: 'b', c: 'd'}), {a: 'b', c: 'd'})
    });

    it('should return array if key is string and value is not there', () => {
      assert.deepEqual(x._parseKeyValue('a'), ['a'])
    });

    it('should return object if key is string and value is string', () => {
      assert.deepEqual(x._parseKeyValue('a', 'b'), {a: 'b'})
    });
  });
});