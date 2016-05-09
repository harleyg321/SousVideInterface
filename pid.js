"use strict";
class PID {
	constructor() {
		this._output = 0;
		this._pterm = 0;
		this._iterm = 0;
		this._dterm = 0;
		this._setpoint = 0;
		this._lastsetpoint = 0;
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
		this._lastsetpoint = this._setpoint;
		this._setpoint = setpoint;
	};

	initialise() {
		this._lasttime = Date.now();
		this._iterm = this._output;
		this._lasterror = 0;
		this._lasterrorSmoothed = 0;
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
			if (!isNaN(input)) this._lastinput = input;
			return false;
		} else {
			var now = Date.now();
			var dt = (now - this._lasttime)/1000;
			var inputSmoothed = this.filterInput(input);
			var error = (this._setpoint - input);
			var errorSmoothed = (this._setpoint - inputSmoothed);
			var dError = (errorSmoothed - this._lasterrorSmoothed)/dt;
			this._iterm += this._ki * (error * dt);
			this.restrictIterm();
			
			this._pterm = this._kp * error;
			this._dterm = this._kd * dError;

			this._output = this._pterm + this._iterm + this._dterm;
			this.restrictOutput();

			this._lasterror = error;
			this._lasterrorSmoothed = errorSmoothed;
			this._lastsetpoint = this._setpoint;
			this._lasttime = now;
			return this._output;
		}
	};

	getPterm() {
		return this._pterm;
	}

	getIterm() {
		return this._iterm;
	}

	getDterm() {
		return this._dterm;
	}

	filterInput(input) {
		if(typeof this._inputSmoothed === 'undefined') {
			this._inputSmoothed = input;
			this._lastinputSmoothed = input;
		} else {
			this._inputSmoothed += (input - this._inputSmoothed) / 100;
		}
		return this._inputSmoothed;
	}

};

module.exports = PID;
