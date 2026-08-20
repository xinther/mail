import settingService from './setting-service';
import userContext from '../security/user-context';
import BizError from '../error/biz-error';
import {t} from '../i18n/i18n';

export function adminEmailAccessEnabled(value) {
	return Number(value) === 1;
}

const privacyService = {
	async assertAdminEmailAccess(c) {
		const {adminViewEmail} = await settingService.query(c);
		if (adminEmailAccessEnabled(adminViewEmail)) return;
		console.warn(`[privacy:admin-email-blocked] userId=${userContext.getUserId(c)} path=${c.req.path}`);
		throw new BizError(t('adminEmailAccessDisabled'), 403);
	}
};

export default privacyService;
