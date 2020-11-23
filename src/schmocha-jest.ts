/*
    Root class
*/
import { SchmochaBase, SchmochaOptions } from './schmocha-base';
import { SchmochaDescribe, SchmochaIt } from './schmocha-types';

export class SchmochaJest extends SchmochaBase {
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
}
