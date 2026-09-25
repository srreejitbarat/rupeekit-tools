import catalog from '#i18n-catalog/hi';
import {createTranslator} from './translator';
import {registerTranslator} from './registry';
import I18nClientScope from './client-scope';

// Full catalog on the server (react-server condition); a small base in the
// browser, extended by the slices each localized module registers.
export const i18n = createTranslator('hi', catalog, I18nClientScope);
registerTranslator('hi', i18n);
