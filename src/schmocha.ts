/*
    Root class
*/
import * as fs from 'fs';
import * as path from 'path';

import {SchmochaConfig} from './schmocha-config';
import {SchmochaConfigFile} from './schmocha-config-file';
import {Logger} from '@bitblit/ratchet/dist/common/logger';
import {MapRatchet} from '@bitblit/ratchet/dist/common/map-ratchet';
import {Suite} from 'mocha';

export class Schmocha {
    public static DEFAULT_FILE: string = 'schmocha.json';
    public static ENV_VAR_NAME: string = 'SCHMOCHA';

    private readonly config: SchmochaConfig;
    private readonly filePath: string;

    constructor(private namespace: string){
        if (!namespace) {
            throw new Error('You must provide a namespace');
        }

        this.filePath = process.env[Schmocha.ENV_VAR_NAME] || path.join(process.cwd(), Schmocha.DEFAULT_FILE);

        if (!fs.existsSync(this.filePath)) {
            throw new Error('Schmocha file not found (using "'+this.filePath+'")');
        }
        const fullFile: SchmochaConfigFile = JSON.parse(fs.readFileSync(this.filePath).toString());

        const finder: SchmochaConfig[] = fullFile.configs.filter( c => namespace === c.namespace);
        if (finder.length === 0) {
            throw new Error('Namespace not found in file '+this.filePath);
        } else if (finder.length > 1) {
            throw new Error('Namespace found more than once in '+this.filePath);
        } else {
            this.config = finder[0];
            Logger.debug('Schmocha configured to %j', this.config);
        }
    }

    public static check(namespace: string, mocha: Suite, enabledTags: string[] = [], reqParams: string[] = []): Schmocha {

        let sch: Schmocha = new Schmocha(namespace);
        if (!sch.skipIfAnyDisabled(enabledTags, mocha) || !sch.skipIfParamsMissing(reqParams, mocha)) {
            sch = null;
        }
        return sch;
    }

    public allEnabled(inTagList: string[]): boolean {
        const tagList: string[] = inTagList || [];
        const filtered: string[] = this.config.enabledTags.filter(t => tagList.indexOf(t) > -1);
        return filtered.length == tagList.length;
    }

    public anyEnabled(inTagList: string[]): boolean {
        const tagList: string[] = inTagList || [];
        const filtered: string[] = this.config.enabledTags.filter(t => tagList.indexOf(t) > -1);
        return filtered.length > 0;
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
        paramList.forEach(p => {
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

    public skipIfParamsMissing(params: string[], mocha:Suite): boolean {
        let rval: boolean = true;
        if (!this.paramsPresent(params)) {
            rval = false;
            Logger.debug('Missing param, skipping');
            mocha.ctx.test.skip();
        }
        return rval;
    }

    public skipIfAllDisabled(tags: string[], mocha:Suite): boolean {
        let rval: boolean = true;
        if (this.allDisabled(tags)) {
            rval = false;
            mocha.ctx.test.skip();
            Logger.debug('All disabled, skipping');
        }
        return rval;
    }

    public skipIfAnyDisabled(tags: string[], mocha:Suite): boolean {
        let rval: boolean = true;
        if (this.allDisabled(tags)) {
            rval = false;
            mocha.ctx.test.skip();
            Logger.debug('At least one disabled, skipping');
        }
        return rval;
    }

}

