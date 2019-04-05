export = glob;
declare function glob(pattern: any, options: any, cb: any): any;
declare namespace glob {
  class Glob {
    constructor(pattern: any, options: any, cb: any);
    matches: any;
    paused: any;
    abort(): void;
    addListener(type: any, listener: any): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    getMaxListeners(): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    pause(): void;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    rawListeners(type: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    resume(): void;
    setMaxListeners(n: any): any;
  }
  class GlobSync {
    constructor(pattern: any, options: any, ...args: any[]);
    matches: any;
  }
  // Circular reference from glob
  const glob: any;
  function hasMagic(pattern: any, options_: any): any;
  function sync(pattern: any, options: any, ...args: any[]): any;
  namespace sync {
    class GlobSync {
      constructor(pattern: any, options: any, ...args: any[]);
      matches: any;
    }
  }
}
