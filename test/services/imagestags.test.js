const assert = require('assert');
const app = require('../../src/app');

describe('\'imagestags\' service', () => {
  it('registered the service', () => {
    const service = app.service('imagestags');

    assert.ok(service, 'Registered the service');
  });
});
