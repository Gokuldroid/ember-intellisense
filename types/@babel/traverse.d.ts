export const Hub: any;
export const NodePath: any;
export const Scope: any;
export default function _default(parent: any, opts: any, scope: any, state: any, parentPath: any): void;
export default namespace _default {
  namespace cache {
    function clear(): void;
    function clearPath(): void;
    function clearScope(): void;
    const path: WeakMap;
    const scope: WeakMap;
  }
  function cheap(node: any, enter: any): any;
  function clearNode(node: any, opts: any): void;
  function explode(visitor: any): any;
  function hasType(tree: any, type: any, blacklistTypes: any): any;
  function node(node: any, opts: any, scope: any, state: any, parentPath: any, skipKeys: any): void;
  function removeProperties(tree: any, opts: any): any;
  function verify(visitor: any): void;
  namespace visitors {
    function explode(visitor: any): any;
    function merge(visitors: any, states: any, wrapper: any): any;
    function verify(visitor: any): void;
  }
}
export namespace visitors {
  function explode(visitor: any): any;
  function merge(visitors: any, states: any, wrapper: any): any;
  function verify(visitor: any): void;
}
