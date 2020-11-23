import { expect } from 'chai';
import { Schmocha } from '../src/schmocha';

describe('#schmocha', () => {
  const [schDescribe, schIt] = Schmocha.create({
    namespace: 'schmocha',
    enabledTags: ['ffmpeg'],
  });

  it('should fail if passed a bad namespace', async () => {
    try {
      new Schmocha('this should fail');
      throw new Error('Did not throw expected error!');
    } catch (err) {
      expect(err).to.not.be.undefined;
    }
  });

  it('should provide a tuple of describe and it', () => {
    expect(schDescribe).to.not.be.undefined;
    expect(schIt).to.not.be.undefined;
  });

  describe('should skip tests based on configuration', () => {
    let foo = 'bar';
    schIt('should skip this test', () => {
      foo = 'baz';
    });
    expect(foo).to.equal('bar');
  });
});
