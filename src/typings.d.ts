/* SystemJS module definition */

declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any;
}

declare module '*.json';
