import { createContext } from 'react';

/**
 * How much the player scales the canvas the slide is drawn on: 1 outside a
 * player, where a slide is drawn at its own size.
 */
export const SlideScaleContext = createContext(1);
