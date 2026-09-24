import catalog from './catalogs/hi.json';
import {createTranslator} from './translator';
export const i18n = createTranslator('hi', catalog);
