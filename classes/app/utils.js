var _ = require('underscore');

class utils {
	static Distance(pt1, pt2) {
		if (_.isString(pt1) && _.isString(pt2)) {
			pt1 = pt1.split(',');
			pt2 = pt2.split(',');

			if (pt1.length == 2 && pt2.length == 2) {
				return Math.sqrt((pt2[0] - pt1[0]) * (pt2[0] - pt1[0]) + (pt2[1] - pt1[1]) * (pt2[1] - pt1[1]));
			}
			return 0;
		}
		return 0;
	}
}

module.exports = utils;