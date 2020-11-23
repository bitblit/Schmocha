export type DoneFn = (reason?: string | Error) => void;
export type TestName = string;
export type TestFn = (done?: DoneFn) => Promise<void | undefined | unknown> | void | undefined;
export type BlockFn = () => void;
export type BlockName = string;

export interface SchmochaDescribe {
  (blockName: BlockName, blockFn: BlockFn): void;
}

export interface SchmochaIt {
  (testName: TestName, fn: TestFn, timeout?: number): void;
}
