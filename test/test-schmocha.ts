import { expect } from 'chai';
import {Schmocha} from '../src/schmocha';
import {Logger} from '@bitblit/ratchet/dist/common/logger';

describe('#schmocha', function() {
    this.timeout(30000000);

    it('should fail if passed a bad namespace', async() => {
        try {
            const s: Schmocha = new Schmocha('this should fail');
            this.bail();
        } catch (err) {
            Logger.debug('Expected error : %s', err);
        }
    });

});