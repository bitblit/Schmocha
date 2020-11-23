/*
    Root class
*/
import { Logger } from '@bitblit/ratchet/dist/common/logger';
import { MapRatchet } from '@bitblit/ratchet/dist/common/map-ratchet';
import * as fs from 'fs';
import * as path from 'path';
import { SchmochaConfig } from './schmocha-config';
import { SchmochaConfigFile } from './schmocha-config-file';
import { SchmochaDescribe, SchmochaIt } from './schmocha-types';

export interface SchmochaOptions {
  namespace: string;
  enabledTags?: string[];
  reqParams?: string[];
}

export interface SchmochaProvider {
  createDescribe(sch: SchmochaBase, options: SchmochaOptions): SchmochaDescribe;
  createIt(sch: SchmochaBase, options: SchmochaOptions): SchmochaIt;
}

export class SchmochaBase {
  public static DEFAULT_FILE: string = 'schmocha.json';
  public static ENV_VAR_NAME: string = 'SCHMOCHA';

  protected readonly config: SchmochaConfig;
  private readonly filePath: string;

  constructor(private namespace: string) {
    if (!namespace) {
      throw new Error('You must provide a namespace');
    }

    this.filePath = process.env[SchmochaBase.ENV_VAR_NAME] || path.join(process.cwd(), SchmochaBase.DEFAULT_FILE);

    if (!fs.existsSync(this.filePath)) {
      throw new Error('Schmocha file not found (using "' + this.filePath + '")');
    }
    const fullFile: SchmochaConfigFile = JSON.parse(fs.readFileSync(this.filePath).toString());

    const finder: SchmochaConfig[] = fullFile.configs.filter((c) => namespace === c.namespace);
    if (finder.length === 0) {
      throw new Error('Namespace not found in file ' + this.filePath);
    } else if (finder.length > 1) {
      throw new Error('Namespace found more than once in ' + this.filePath);
    } else {
      this.config = finder[0];
      Logger.debug('Schmocha configured to %j', this.config);
    }
  }

  protected static doCreate(options: SchmochaOptions, provider: SchmochaProvider): [SchmochaDescribe, SchmochaIt] {
    const sch = new SchmochaBase(options.namespace);
    return [provider.createDescribe(sch, options), provider.createIt(sch, options)];
  }

  public filterToEnabled(inTagList: string[]): string[] {
    const tagList: string[] = inTagList || [];
    const filtered: string[] = tagList.filter((t) => this.config.enabledTags.indexOf(t) > -1);
    Logger.silly('Filtered %j to %j', inTagList, filtered);
    return filtered;
  }

  public allEnabled(inTagList: string[]): boolean {
    const tagList: string[] = inTagList || [];
    return this.filterToEnabled(tagList).length == tagList.length;
  }

  public anyEnabled(inTagList: string[]): boolean {
    const tagList: string[] = inTagList || [];
    return this.filterToEnabled(tagList).length > 0;
  }

  public allDisabled(inTagList: string[]): boolean {
    return !this.anyEnabled(inTagList);
  }

  public anyDisabled(inTagList: string[]): boolean {
    return !this.allEnabled(inTagList);
  }

  public paramsPresent(inParamList: string[]): boolean {
    const paramList: string[] = inParamList || [];
    let rval: boolean = true;
    paramList.forEach((p) => {
      rval = rval && !!this.param(p);
    });
    return rval;
  }

  public param<T>(name: string): T {
    let rval: T = null;

    if (this.config.parameters) {
      const pth: string[] = name.split('.');
      rval = MapRatchet.findValue(this.config.parameters, pth) as T;
    }

    return rval;
  }

  public shouldSkip({ reqParams = [], enabledTags = [] }: SchmochaOptions): boolean {
    let rval: boolean = false;
    if (!this.paramsPresent(reqParams)) {
      rval = true;
      Logger.debug('Missing param, skipping');
    }
    if (this.anyDisabled(enabledTags)) {
      rval = true;
      Logger.debug('At least one disabled, skipping');
    }
    return rval;
  }
}
