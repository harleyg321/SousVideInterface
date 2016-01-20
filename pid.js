"use strict";
class PID {
	constructor() {
		this._output = 0;
		this._iterm = 0;
		this._setpoint = 0;
		this._autoMode = false;
	};

	setTunings(kp, ki, kd) {
		this._kp = kp;
		this._ki = ki;
		this._kd = kd;
	};

	setOutputLimits(min, max) {
		this._min = min;
		this._max = max;
	};

	restrictOutput() {
		if (this._autoMode) {
			if(this._output > this._max) {
				this._output = this._max;
			} else if (this._output < this._min) {
				this._output = this._min;
			}
		}
	};

	restrictIterm() {
		if (this._iterm > this._max) {
			this._iterm = this._max;
		} else if (this._iterm < this._min) {
			this._iterm = this._min;
		}
	};

	setTarget(setpoint) {
		this._setpoint = setpoint;
	};

	initialise() {
		this.lasttime = Date.now();
		this._iterm = this._output;
		this._lastinput = this._output;
		this._lasterror = 0;
		this.restrictIterm();
	};

	setAuto(mode) {
		if(mode && !this._autoMode) {
			this.initialise();
		}
		this._autoMode = true;
	};

	compute(input) {
		if(!this._autoMode) {
			return false;
		} else {
			var now = Date.now();
			var dt = now - this._lasttime;
			var error = this._setpoint - input;
			var dError = (error - this._lasterror)/dt;
			this._iterm += this._ki * (error * dt);
			this.restrictIterm();

			this._output = this._kp * error + this._iterm + this._kd * dError;
			this.restrictOutput();

			this._lasterror = error;
			this._lasttime = now;
			return isNaN(this._output) ? 0 : this._output;
		}
	};
};

module.exports = PID;
