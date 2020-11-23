import { Logger } from '@bitblit/ratchet/dist/common/logger';
import { describe, it, Suite } from 'mocha';
import { SchmochaBase, SchmochaOptions } from './schmocha-base';
import { SchmochaDescribe, SchmochaIt } from './schmocha-types';

export class Schmocha extends SchmochaBase {
  public static create(options: SchmochaOptions): [SchmochaDescribe, SchmochaIt] {
    return SchmochaBase.doCreate(options, {
      createDescribe(sch: SchmochaBase, options: SchmochaOptions): SchmochaDescribe {
        return sch.shouldSkip(options) ? describe.skip : describe;
      },
      createIt(sch: SchmochaBase, options: SchmochaOptions): SchmochaIt {
        return sch.shouldSkip(options) ? it.skip : it;
      },
    });
  }

  public static check(namespace: string, mocha: Suite, enabledTags: string[] = [], reqParams: string[] = []): Schmocha {
    let sch: Schmocha = new Schmocha(namespace);
    if (!sch.skipIfAnyDisabled(enabledTags, mocha) || !sch.skipIfParamsMissing(reqParams, mocha)) {
      sch = null;
    }
    return sch;
  }

  public skipIfParamsMissing(params: string[], mocha: Suite): boolean {
    let rval: boolean = true;
    if (!this.paramsPresent(params)) {
      rval = false;
      Logger.debug('Missing param, skipping');
      mocha.ctx.test.skip();
    }
    return rval;
  }

  public skipIfAllDisabled(tags: string[], mocha: Suite): boolean {
    let rval: boolean = true;
    if (this.allDisabled(tags)) {
      rval = false;
      mocha.ctx.test.skip();
      Logger.debug('All disabled, skipping');
    }
    return rval;
  }

  public skipIfAnyDisabled(tags: string[], mocha: Suite): boolean {
    let rval: boolean = true;
    if (this.anyDisabled(tags)) {
      rval = false;
      mocha.ctx.test.skip();
      Logger.debug('At least one disabled, skipping');
    }
    return rval;
  }
}
