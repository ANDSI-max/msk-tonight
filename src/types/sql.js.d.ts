declare module "sql.js" {
  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export class Database {
    constructor(data?: ArrayLike<number> | Buffer | null);
    run(sql: string, params?: any[]): Database;
    exec(sql: string, params?: any[]): QueryReturn[];
    prepare(sql: string, params?: any[]): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface QueryReturn {
    columns: string[];
    values: any[][];
  }

  export class Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    getAsObject(params?: any): any;
    get(params?: any): any[];
    reset(): void;
    free(): boolean;
  }

  export interface InitSqlJsOptions {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(options?: InitSqlJsOptions): Promise<SqlJsStatic>;
}