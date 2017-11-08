import { module, test } from 'qunit';

import Map from '@ember/map-polyfill';
import { isEmpty } from '@ember/utils';

let object, number, string, map;

module('Ember.Map (forEach and get are implicitly tested)', {
  beforeEach() {
    object = {};
    number = 42;
    string = 'foo';

    map = Map.create();
  }
});

let mapHasLength = function(assert, expected, theMap) {
  theMap = theMap || map;

  let length = 0;
  theMap.forEach(function() {
    length++;
  });

  assert.equal(length, expected, 'map should contain ' + expected + ' items');
};

let mapHasEntries = function(assert, entries, theMap) {
  theMap = theMap || map;

  for (let i = 0; i < entries.length; i++) {
    assert.equal(theMap.get(entries[i][0]), entries[i][1]);
    assert.equal(theMap.has(entries[i][0]), true);
  }

  mapHasLength(assert, entries.length, theMap);
};

let unboundThis;

(function() {
  unboundThis = this;
}());

test('set', function(assert) {
  map.set(object, 'winning');
  map.set(number, 'winning');
  map.set(string, 'winning');

  mapHasEntries(assert, [
    [object, 'winning'],
    [number, 'winning'],
    [string, 'winning']
  ]);

  map.set(object, 'losing');
  map.set(number, 'losing');
  map.set(string, 'losing');

  mapHasEntries(assert, [
    [object, 'losing'],
    [number, 'losing'],
    [string, 'losing']
  ]);

  assert.equal(map.has('nope'), false, 'expected the key `nope` to not be present');
  assert.equal(map.has({}), false, 'expected they key `{}` to not be present');
});

test('set chaining', function(assert) {
  map.set(object, 'winning').
  set(number, 'winning').
  set(string, 'winning');

  mapHasEntries(assert, [
    [object, 'winning'],
    [number, 'winning'],
    [string, 'winning']
  ]);

  map.set(object, 'losing').
  set(number, 'losing').
  set(string, 'losing');

  mapHasEntries(assert, [
    [object, 'losing'],
    [number, 'losing'],
    [string, 'losing']
  ]);

  assert.equal(map.has('nope'), false, 'expected the key `nope` to not be present');
  assert.equal(map.has({}), false, 'expected they key `{}` to not be present');
});

test('with key with undefined value', function(assert) {
  map.set('foo', undefined);

  map.forEach(function(value, key) {
    assert.equal(value, undefined);
    assert.equal(key, 'foo');
  });

  assert.ok(map.has('foo'), 'has key foo, even with undefined value');

  assert.equal(map.size, 1);
});

test('arity of forEach is 1 – es6 23.1.3.5', function(assert) {
  assert.equal(map.forEach.length, 1, 'expected arity for map.forEach is 1');
});

test('forEach throws without a callback as the first argument', function(assert) {
  assert.equal(map.forEach.length, 1, 'expected arity for map.forEach is 1');
});

test('has empty collection', function(assert) {
  assert.equal(map.has('foo'), false);
  assert.equal(map.has(), false);
});

test('delete', function(assert) {
  map.set(object, 'winning');
  map.set(number, 'winning');
  map.set(string, 'winning');

  map.delete(object);
  map.delete(number);
  map.delete(string);

  // doesn't explode
  map.delete({});

  mapHasEntries(assert, []);

  assert.expectNoDeprecation();
});

test('copy and then update', function(assert) {
  map.set(object, 'winning');
  map.set(number, 'winning');
  map.set(string, 'winning');

  let map2 = map.copy();

  map2.set(object, 'losing');
  map2.set(number, 'losing');
  map2.set(string, 'losing');

  mapHasEntries(assert, [
    [object, 'winning'],
    [number, 'winning'],
    [string, 'winning']
  ]);

  mapHasEntries(assert, [
    [object, 'losing'],
    [number, 'losing'],
    [string, 'losing']
  ], map2);
});

test('copy and then delete', function(assert) {
  map.set(object, 'winning');
  map.set(number, 'winning');
  map.set(string, 'winning');

  let map2 = map.copy();

  map2.delete(object);
  map2.delete(number);
  map2.delete(string);

  mapHasEntries(assert, [
    [object, 'winning'],
    [number, 'winning'],
    [string, 'winning']
  ]);

  mapHasEntries(assert, [], map2);
});

test('size', function(assert) {
  //Add a key twice
  assert.equal(map.size, 0);
  map.set(string, 'a string');
  assert.equal(map.size, 1);
  map.set(string, 'the same string');
  assert.equal(map.size, 1);

  //Add another
  map.set(number, 'a number');
  assert.equal(map.size, 2);

  //Remove one that doesn't exist
  map.delete('does not exist');
  assert.equal(map.size, 2);

  //Check copy
  let copy = map.copy();
  assert.equal(copy.size, 2);

  //Remove a key twice
  map.delete(number);
  assert.equal(map.size, 1);
  map.delete(number);
  assert.equal(map.size, 1);

  //Remove the last key
  map.delete(string);
  assert.equal(map.size, 0);
  map.delete(string);
  assert.equal(map.size, 0);
});

test('forEach without proper callback', function(assert) {
  assert.expectAssertion(function() {
    map.forEach();
  }, '[object Undefined] is not a function');

  assert.expectAssertion(function() {
    map.forEach(undefined);
  }, '[object Undefined] is not a function');

  assert.expectAssertion(function() {
    map.forEach(1);
  }, '[object Number] is not a function');

  assert.expectAssertion(function() {
    map.forEach({});
  }, '[object Object] is not a function');

  map.forEach(function(value, key) {
    map.delete(key);
  });
  // ensure the error happens even if no data is present
  assert.equal(map.size, 0);
  assert.expectAssertion(function() {
    map.forEach({});
  }, '[object Object] is not a function');
});

test('forEach basic', function(assert) {
  map.set('a', 1);
  map.set('b', 2);
  map.set('c', 3);

  let iteration = 0;

  let expectations = [
    { value: 1, key: 'a', context: unboundThis },
    { value: 2, key: 'b', context: unboundThis },
    { value: 3, key: 'c', context: unboundThis }
  ];

  map.forEach(function(value, key, theMap) {
    let expectation = expectations[iteration];

    assert.equal(value, expectation.value, 'value should be correct');
    assert.equal(key, expectation.key, 'key should be correct');
    assert.equal(this, expectation.context, 'context should be as if it was unbound');
    assert.equal(map, theMap, 'map being iterated over should be passed in');

    iteration++;
  });

  assert.equal(iteration, 3, 'expected 3 iterations');
});

test('forEach basic /w context', function(assert) {
  map.set('a', 1);
  map.set('b', 2);
  map.set('c', 3);

  let iteration = 0;
  let context = {};
  let expectations = [
    { value: 1, key: 'a', context: context },
    { value: 2, key: 'b', context: context },
    { value: 3, key: 'c', context: context }
  ];

  map.forEach(function(value, key, theMap) {
    let expectation = expectations[iteration];

    assert.equal(value, expectation.value, 'value should be correct');
    assert.equal(key, expectation.key, 'key should be correct');
    assert.equal(this, expectation.context, 'context should be as if it was unbound');
    assert.equal(map, theMap, 'map being iterated over should be passed in');

    iteration++;
  }, context);

  assert.equal(iteration, 3, 'expected 3 iterations');
});

test('forEach basic /w deletion while enumerating', function(assert) {
  map.set('a', 1);
  map.set('b', 2);
  map.set('c', 3);

  let iteration = 0;

  let expectations = [
    { value: 1, key: 'a', context: unboundThis },
    { value: 2, key: 'b', context: unboundThis }
  ];

  map.forEach(function(value, key, theMap) {
    if (iteration === 0) {
      map.delete('c');
    }

    let expectation = expectations[iteration];

    assert.equal(value, expectation.value, 'value should be correct');
    assert.equal(key, expectation.key, 'key should be correct');
    assert.equal(this, expectation.context, 'context should be as if it was unbound');
    assert.equal(map, theMap, 'map being iterated over should be passed in');

    iteration++;
  });

  assert.equal(iteration, 2, 'expected 3 iterations');
});

test('forEach basic /w addition while enumerating', function(assert) {
  map.set('a', 1);
  map.set('b', 2);
  map.set('c', 3);

  let iteration = 0;

  let expectations = [
    { value: 1, key: 'a', context: unboundThis },
    { value: 2, key: 'b', context: unboundThis },
    { value: 3, key: 'c', context: unboundThis },
    { value: 4, key: 'd', context: unboundThis }
  ];

  map.forEach(function(value, key, theMap) {
    if (iteration === 0) {
      map.set('d', 4);
    }

    let expectation = expectations[iteration];

    assert.equal(value, expectation.value, 'value should be correct');
    assert.equal(key, expectation.key, 'key should be correct');
    assert.equal(this, expectation.context, 'context should be as if it was unbound');
    assert.equal(map, theMap, 'map being iterated over should be passed in');

    iteration++;
  });

  assert.equal(iteration, 4, 'expected 3 iterations');
});

test('clear', function(assert) {
  let iterations = 0;

  map.set('a', 1);
  map.set('b', 2);
  map.set('c', 3);
  map.set('d', 4);

  assert.equal(map.size, 4);

  map.forEach(function() {
    iterations++;
  });
  assert.equal(iterations, 4);

  map.clear();
  assert.equal(map.size, 0);
  iterations = 0;
  map.forEach(function() {
    iterations++;
  });
  assert.equal(iterations, 0);
});

test('-0', function(assert) {
  assert.equal(map.has(-0), false);
  assert.equal(map.has(0), false);

  map.set(-0, 'zero');

  assert.equal(map.has(-0), true);
  assert.equal(map.has(0), true);

  assert.equal(map.get(0), 'zero');
  assert.equal(map.get(-0), 'zero');

  map.forEach(function(value, key) {
    assert.equal(1 / key, Infinity, 'spec says key should be positive zero');
  });
});

test('NaN', function(assert) {
  assert.equal(map.has(NaN), false);

  map.set(NaN, 'not-a-number');

  assert.equal(map.has(NaN), true);

  assert.equal(map.get(NaN), 'not-a-number');
});

test('NaN Boxed', function(assert) {
  //jshint -W053
  let boxed = new Number(NaN);
  assert.equal(map.has(boxed), false);

  map.set(boxed, 'not-a-number');

  assert.equal(map.has(boxed), true);
  assert.equal(map.has(NaN), false);

  assert.equal(map.get(NaN), undefined);
  assert.equal(map.get(boxed), 'not-a-number');
});

test('0 value', function(assert) {
  let obj = {};
  assert.equal(map.has(obj), false);

  assert.equal(map.size, 0);
  map.set(obj, 0);
  assert.equal(map.size, 1);

  assert.equal(map.has(obj), true);
  assert.equal(map.get(obj), 0);

  map.delete(obj);
  assert.equal(map.has(obj), false);
  assert.equal(map.get(obj), undefined);
  assert.equal(map.size, 0);
});

test('Ember.isEmpty Ember.Map', function(assert) {
  let map = new Map();
  assert.equal(isEmpty(map), true, 'Empty map is empty');
  map.set('foo', 'bar');
  assert.equal(isEmpty(map), false, 'Map is not empty');
});
