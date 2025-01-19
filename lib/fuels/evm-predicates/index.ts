import { PredicateVersion } from '../common';
import {
    abi as abi1728253389401,
    bin as bin1728253389401,
    generationDate as generationDate1728253389401,
} from './0xbbae06500cd11e6c1d024ac587198cb30c504bf14ba16548f19e21fa9e8f5f95';
import {
    abi as abi1725479113004,
    bin as bin1725479113004,
    generationDate as generationDate1725479113004,
} from './0xfdac03fc617c264fa6f325fd6f4d2a5470bf44cfbd33bc11efb3bf8b7ee2e938';

export const PREDICATE_VERSIONS = {
    '0xbbae06500cd11e6c1d024ac587198cb30c504bf14ba16548f19e21fa9e8f5f95': {
        predicate: { abi: abi1728253389401, bin: bin1728253389401 },
        generatedAt: generationDate1728253389401,
    },
    '0xfdac03fc617c264fa6f325fd6f4d2a5470bf44cfbd33bc11efb3bf8b7ee2e938': {
        predicate: { abi: abi1725479113004, bin: bin1725479113004 },
        generatedAt: generationDate1725479113004,
    },
} as const satisfies Record<string, PredicateVersion>;