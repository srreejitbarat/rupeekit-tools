import catalog from './catalogs/bn.json';
import {createTranslator} from './translator';
export const i18n = createTranslator('bn', catalog);
