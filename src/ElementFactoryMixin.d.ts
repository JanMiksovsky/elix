// Elix is a JavaScript project, but we use TypeScript as an internal tool to
// confirm our code is type safe.

/// <reference path="../src/shared.d.ts"/>

declare const ElementFactoryMixin: Mixin<{
  connectedCallback?(): void;
  updates?: PlainObject;
}, {
  $: {
    [key: string]: Element;
  };
  connectedCallback(): void;
  shadowRoot: ShadowRoot;
  updates: PlainObject;
}>;

export default ElementFactoryMixin;
