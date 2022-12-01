/*
 * Copyright (c) 2022 Oleg Nemanov <lego12239@yandex.ru>
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

let finsum = {};

finsum.version = "1.0";
finsum.ignore_errors = 0;

/*
 * This is a default is_correct function, which can be replaced
 * by lib user with a function which calls finsum._is_correct() with needed
 * parameters.
 */
finsum.is_correct = function (sum)
{
	return finsum._is_correct(sum, 2, /[,.]/);
}

/*
 * Check a sum in a fractional form for correctness.
 *  sum  - a sum in fractional form
 *  fpdq - a maximum fractional part digits quantity for sum
 *  fps  - fractional part separators(string or regexp)
 * ret:
 *  0 - if not correct
 *  1 - if correct
 *
 * Leading and trailing spaces are removed before checking.
 * Trailing zeroes are also removed before checking.
 */
finsum._is_correct = function (sum, fpdq, fps)
{
	fpdq = Number(fpdq);
	if (!Number.isInteger(fpdq))
		throw `fpdq is not an integer: ${fpdq}`;
	if (fps == null)
		throw "fps must contain some characters!";

	let p = sum.toString().trim().split(fps);
	if (!p[0].match(/^[+-]?[0-9]+$/))
		return 0;
	if (p.length == 1)
		return 1;
	else if (p.length > 2)
		return 0;
	if (!p[1].match(/^[0-9]+$/))
		return 0;

	let fract = p[1].replace(/0*$/, "");
	if (fract.length > fpdq)
		return 0;
	return 1;
}

/*
 * This is a default parse function, which can be replaced
 * by lib user with a function which calls finsum._parse() with needed
 * parameters.
 */
finsum.parse = function (sum)
{
	return finsum._parse(sum, 2, /[,.]/);
}

/*
 * Convert a money sum represented in fractional form to integer form.
 * prms:
 *  sum  - a money sum to convert
 *  fpdq - a fractional part digits quantity(to be returned)
 *  fps  - a fractional part separator(string or regexp)
 * ret:
 *  INTEGER - a converted sum
 */
finsum._parse = function (sum, fpdq, fps)
{
	fpdq = Number(fpdq);
	if (!Number.isInteger(fpdq))
		throw `fpdq is not an integer: ${fpdq}`;
	if (fps == null)
		throw "fps must contain some characters!";

	let p = sum.toString().trim().split(fps);
	if (p.length == 1)
		p[1] = "0";
	else if (p.length > 2)
		throw `sum isn't a number: ${sum}`;
	if (!p[0].match(/^[+-]?[0-9]+$/))
		throw `integer part is not an integer: ${p[0]}`
	if (!p[1].match(/^[0-9]+$/))
		throw `fractional part is not an unsigned integer: ${p[1]}`

	let fract = p[1].replace(/0*$/, "");
	let zero_cnt = fpdq - fract.length;
	if (zero_cnt > 0) {
		fract = fract.padEnd(fpdq, "0");
	} else if (zero_cnt < 0) {
		if (!finsum.ignore_errors)
			throw `fractional part is too large: ${fract}`;
		fract = fract.substring(0, fpdq);
	}

	return Number(p[0].concat(fract));
}

/*
 * This is a default fmt function, which can be replaced
 * by lib user with a function which calls finsum._fmt() with needed
 * parameters.
 */
finsum.fmt = function (sum)
{
	return finsum._fmt(sum, 2, ".");
}

/*
 * Format a sum represented in integer form as a fractional form sum.
 * prms:
 *  sum  - a sum to format
 *  fpdq - a fractional part digits quantity for sum
 *  fps  - a fractional part separator
 * ret:
 *  STRING - a sum in the fractional form
 */
finsum._fmt = function (sum, fpdq, fps)
{
	let sign = "", int, fract;

	if (!Number.isInteger(sum))
		throw `sum isn't an integer: ${sum}`;
	fpdq = Number(fpdq);
	if (!Number.isInteger(fpdq))
		throw `fpdq is not an integer: ${fpdq}`;
	if (fps == null)
		throw "fps must contain some characters!";

	if (sum < 0) {
		sign = "-";
		sum = sum * -1;
	}

	int = Math.trunc(sum / 10**fpdq);
	fract = sum % 10**fpdq;
	fract = fract.toString().padStart(fpdq, "0");

	return `${sign}${int}${fps}${fract}`;
}
