const assert = require('assert');
const app = require('../../src/app');

describe('\'paper\' service', () => {
  it('registered the service', () => {
    const service = app.service('paper');

    assert.ok(service, 'Registered the service');
  });
});
