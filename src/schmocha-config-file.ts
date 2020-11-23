import { SchmochaConfig } from './schmocha-config';

export interface SchmochaConfigFile {
  version: number;
  configs: SchmochaConfig[];
}
