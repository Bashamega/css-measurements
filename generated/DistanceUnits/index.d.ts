import type { LocalFontRelativeLengths } from './LocalFontRelativeLengths';
import type { RootFontRelativeLengths } from './RootFontRelativeLengths';
import type { ViewportUnits } from './ViewportUnits';
import type { ContainerUnits } from './ContainerUnits';
import type { Percentages } from './Percentages';

export type DistanceUnits = LocalFontRelativeLengths | RootFontRelativeLengths | ViewportUnits | ContainerUnits | Percentages;