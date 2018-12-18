#!/usr/bin/env node
"use strict";

import * as _ from 'lodash';

const _even = (n) => _.isInteger(n) && n % 2 === 0;
const _validPosition = (p) => p === "left" || p === "middle" || p === "right";
const _validValue = (v, m) => _even(v) && (m || v > 0);
const _validStartValue = (v, m) => m ? _validValue(v, m) : !v;

const _lastNonZeroValue = (vals) => {
	let nums = _.filter(vals, (val) => {
		return _.isInteger(val) && val !== 0;
	});
	return _.last(nums);
};

const _validAddHat = (v, a) => a < 0 && (v + a) <= 0;
const _shouldAddHatNormal = (m, vs, v, a) => {
	if (!m) return false;
	if (_lastNonZeroValue(vs) <= 0) return false;
	return _validAddHat(v, a);
};

const _validAddHatCrossed = (v, a) => a > 0 && (v + a) >= 0;
const _shouldAddHatCrossed = (m, vs, v, a) => {
	if (!m) return false;
	if (_lastNonZeroValue(vs) >= 0) return false;
	return _validAddHatCrossed(v, a);
};

const _isUnplayedRefa = (i) => _.isPlainObject(i) && _.get(i, "middle", 22) === 0;

const _checkMiddle = (m, s) => {
	if (!m) throw new Error(s + ":Cannot mark a refa in a soup column! middle=" + m);
};

const _checkPosition = (p, s) => {
	if (!_validPosition(p)) throw new Error(s + ":Invalid position " + p);
};

export default class PrefPapersColumn {

	constructor(value, middle = false) {
		if (!_validStartValue(value, middle)) throw new Error("PrefPaperColumn::constructor:Value is not valid " + value);

		this.middle = middle;
		this.initialValue = this.middle ? value : 0;
		this.reset();

		return this;
	}

	reset() {
		this.values = [];
		this.value = this.initialValue;
		if (this.middle && _validStartValue(this.value, this.middle)) this.values.push(this.value);
		return this;
	}

	processNewValue(value) {
		this.processHatAddition(value);
		this.value += value;
		if (this.value !== 0) this.values.push(this.value);
	}

	addValue(value, invalidated = false) {
		if (!_validValue(value, this.middle)) throw new Error("PrefPaperColumn::addValue:Value is not valid " + value);
		if (invalidated) this.values.push({invalidated: true, value: this.value + value});
		else this.processNewValue(value);
		return this;
	}

	processHatAddition(value) {
		if (_shouldAddHatNormal(this.middle, this.values, this.value, value)) this.values.push({hat: 1});
		else if (_shouldAddHatCrossed(this.middle, this.values, this.value, value)) this.values.push({hat: -1});
		return this;
	}

	addRefa() {
		_checkMiddle(this.middle, "PrefPaperColumn::addRefa");
		this.values.push({
			left: 0,
			middle: 0,
			right: 0
		});
		return this;
	}

	getUnplayedRefasCount() {
		return _.size(_.filter(this.values, _isUnplayedRefa));
	}

	markPlayedRefa(position, failed = false) {
		_checkMiddle(this.middle, "PrefPaperColumn::markPlayedRefa");
		_checkPosition(position, "PrefPaperColumn::markPlayedRefa");
		let index = _.findIndex(this.values, (i) => _.get(i, position, 222) === 0);
		if (index >= 0) _.set(this.values[index], position, (failed ? -1 : 1));
		return this;
	}

	getValue() {
		return this.value;
	}

	getJSON() {
		return this.values;
	}

}