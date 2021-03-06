// Elix is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

/// <reference path="../core/shared.d.ts"/>

import { effectEndTarget } from "./internal.js";

declare const TransitionEffectMixin: StateMixin<
  {},
  {},
  {
    readonly [effectEndTarget]: Element;
    startEffect(effect: string): Promise<void>;
  },
  {
    effect: string;
    effectPhase: string;
  }
>;

export default TransitionEffectMixin;
