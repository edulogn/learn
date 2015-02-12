(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Calendar = require('rc-calendar');
var DatePicker = Calendar.Picker;
var zhCn = require('gregorian-calendar/lib/locale/zh-cn'); // spm error
var DateTimeFormat = require('gregorian-calendar-format');
var GregorianCalendar = require('gregorian-calendar');
var CalendarLocale = require('rc-calendar/lib/locale/zh-cn');

var Test = React.createClass({displayName: "Test",
  open: function () {
    this.refs.picker.setState({
      open: true
    });
  },

  handleChange:function(value){
    console.log('DatePicker change: '+(this.props.formatter.format(value)));
  },

  handleCalendarSelect: function (v) {
    //console.log('outer knows: ' + this.props.formatter.format(v));
    // sync status
    this.setState({
      value: v
    });
  },

  getDefaultProps: function () {
    return {
      formatter: new DateTimeFormat('yyyy-MM-dd HH:mm:ss', zhCn)
    }
  },

  getInitialState: function () {
    var value = new GregorianCalendar(zhCn);
    value.setTime(Date.now());
    return {
      showTime:true,
      value: value
    };
  },

  handleShowTimeChange:function(e){
    this.setState({
      showTime:e.target.checked
    });
  },

  render: function () {
    var state = this.state;
    var calendar = React.createElement(Calendar, {locale: CalendarLocale, 
      orient: ['bottom','left'], 
      showTime: this.state.showTime, onSelect: this.handleCalendarSelect});
    return  React.createElement("div", {className: "form-group"}, 
      React.createElement("div", {className: "input-group"}, 
        React.createElement("span", null, React.createElement("input", {type: "checkbox", checked: this.state.showTime, onChange: this.handleShowTimeChange}), " showTime")
      ), 
      React.createElement("div", {className: "input-group"}, 
        React.createElement(DatePicker, {ref: "picker", formatter: this.props.formatter, calendar: calendar, 
          value: state.value, onChange: this.handleChange}, 
          React.createElement("input", {type: "text", className: "form-control", style: {background:'white',cursor:'pointer'}})
        ), 
        React.createElement("span", {className: "input-group-addon", onClick: this.open}, 
          React.createElement("span", {className: "glyphicon glyphicon-calendar"})
        )
      )
    );
  }
});

React.render(React.createElement(Test, null), document.getElementById('react-content-input'));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"gregorian-calendar":4,"gregorian-calendar-format":2,"gregorian-calendar/lib/locale/zh-cn":8,"rc-calendar":10,"rc-calendar/lib/locale/zh-cn":19}],2:[function(require,module,exports){
module.exports = require('./lib/gregorian-calendar-format');
},{"./lib/gregorian-calendar-format":3}],3:[function(require,module,exports){
/**
 * @ignore
 * DateTimeFormat for
 * Inspired by DateTimeFormat from JDK.
 * @author yiminghe@gmail.com
 */

var GregorianCalendar = require('gregorian-calendar');
var MAX_VALUE = Number.MAX_VALUE,
  /**
   * date or time style enum
   * @enum {Number} Date.Formatter.Style
   */
  DateTimeStyle = {
    /**
     * full style
     */
    FULL: 0,
    /**
     * long style
     */
    LONG: 1,
    /**
     * medium style
     */
    MEDIUM: 2,
    /**
     * short style
     */
    SHORT: 3
  };

/*
 Letter    Date or Time Component    Presentation    Examples
 G    Era designator    Text    AD
 y    Year    Year    1996; 96
 M    Month in year    Month    July; Jul; 07
 w    Week in year    Number    27
 W    Week in month    Number    2
 D    Day in year    Number    189
 d    Day in month    Number    10
 F    Day of week in month    Number    2
 E    Day in week    Text    Tuesday; Tue
 a    Am/pm marker    Text    PM
 H    Hour in day (0-23)    Number    0
 k    Hour in day (1-24)    Number    24
 K    Hour in am/pm (0-11)    Number    0
 h    Hour in am/pm (1-12)    Number    12
 m    Minute in hour    Number    30
 s    Second in minute    Number    55
 S    Millisecond    Number    978
 x z    Time zone    General time zone    Pacific Standard Time; PST; GMT-08:00
 Z    Time zone    RFC 822 time zone    -0800
 */

var patternChars = new Array(GregorianCalendar.DAY_OF_WEEK_IN_MONTH + 2).
  join('1');

var ERA = 0;

var calendarIndexMap = {};

patternChars = patternChars.split('');
patternChars[ERA] = 'G';
patternChars[GregorianCalendar.YEAR] = 'y';
patternChars[GregorianCalendar.MONTH] = 'M';
patternChars[GregorianCalendar.DAY_OF_MONTH] = 'd';
patternChars[GregorianCalendar.HOUR_OF_DAY] = 'H';
patternChars[GregorianCalendar.MINUTES] = 'm';
patternChars[GregorianCalendar.SECONDS] = 's';
patternChars[GregorianCalendar.MILLISECONDS] = 'S';
patternChars[GregorianCalendar.WEEK_OF_YEAR] = 'w';
patternChars[GregorianCalendar.WEEK_OF_MONTH] = 'W';
patternChars[GregorianCalendar.DAY_OF_YEAR] = 'D';
patternChars[GregorianCalendar.DAY_OF_WEEK_IN_MONTH] = 'F';

(function () {
  for (var index in patternChars) {
    calendarIndexMap[patternChars[index]] = index;
  }
})();

function mix(t, s) {
  for (var p in s) {
    t[p] = s[p];
  }
}

var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g,
  EMPTY = '';

function substitute(str, o, regexp) {
  if (typeof str !== 'string' || !o) {
    return str;
  }

  return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
    if (match.charAt(0) === '\\') {
      return match.slice(1);
    }
    return (o[name] === undefined) ? EMPTY : o[name];
  });
}

patternChars = patternChars.join('') + 'ahkKZE';

function encode(lastField, count, compiledPattern) {
  compiledPattern.push({
    field: lastField,
    count: count
  });
}

function compile(pattern) {
  var length = pattern.length;
  var inQuote = false;
  var compiledPattern = [];
  var tmpBuffer = null;
  var count = 0;
  var lastField = -1;

  for (var i = 0; i < length; i++) {
    var c = pattern.charAt(i);

    if (c === '\'') {
      // '' is treated as a single quote regardless of being
      // in a quoted section.
      if ((i + 1) < length) {
        c = pattern.charAt(i + 1);
        if (c === '\'') {
          i++;
          if (count !== 0) {
            encode(lastField, count, compiledPattern);
            lastField = -1;
            count = 0;
          }
          if (inQuote) {
            tmpBuffer += c;
          }
          continue;
        }
      }
      if (!inQuote) {
        if (count !== 0) {
          encode(lastField, count, compiledPattern);
          lastField = -1;
          count = 0;
        }
        tmpBuffer = '';
        inQuote = true;
      } else {
        compiledPattern.push({
          text: tmpBuffer
        });
        inQuote = false;
      }
      continue;
    }
    if (inQuote) {
      tmpBuffer += c;
      continue;
    }
    if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z')) {
      if (count !== 0) {
        encode(lastField, count, compiledPattern);
        lastField = -1;
        count = 0;
      }
      compiledPattern.push({
        text: c
      });
      continue;
    }

    if (patternChars.indexOf(c) === -1) {
      throw new Error('Illegal pattern character "' + c + '"');
    }

    if (lastField === -1 || lastField === c) {
      lastField = c;
      count++;
      continue;
    }
    encode(lastField, count, compiledPattern);
    lastField = c;
    count = 1;
  }

  if (inQuote) {
    throw new Error('Unterminated quote');
  }

  if (count !== 0) {
    encode(lastField, count, compiledPattern);
  }

  return compiledPattern;
}

var zeroDigit = '0';

// TODO zeroDigit localization??
function zeroPaddingNumber(value, minDigits, maxDigits, buffer) {
  // Optimization for 1, 2 and 4 digit numbers. This should
  // cover most cases of formatting date/time related items.
  // Note: This optimization code assumes that maxDigits is
  // either 2 or Integer.MAX_VALUE (maxIntCount in format()).
  buffer = buffer || [];
  maxDigits = maxDigits || MAX_VALUE;
  if (value >= 0) {
    if (value < 100 && minDigits >= 1 && minDigits <= 2) {
      if (value < 10 && minDigits === 2) {
        buffer.push(zeroDigit);
      }
      buffer.push(value);
      return buffer.join('');
    } else if (value >= 1000 && value < 10000) {
      if (minDigits === 4) {
        buffer.push(value);
        return buffer.join('');
      }
      if (minDigits === 2 && maxDigits === 2) {
        return zeroPaddingNumber(value % 100, 2, 2, buffer);
      }
    }
  }
  buffer.push(value + '');
  return buffer.join('');
}

/**
 *
 * date time formatter for KISSY gregorian date.
 *
 *      @example
 *      use('date/format,date/gregorian',function(S, DateFormat, GregorianCalendar){
     *          var calendar = new GregorianCalendar(2013,9,24);
     *          // ' to escape
     *          var formatter = new DateFormat("'today is' ''yyyy/MM/dd a''");
     *          document.write(formatter.format(calendar));
     *      });
 *
 * @class Date.Formatter
 * @param {String} pattern patter string of date formatter
 *
 * <table border="1">
 * <thead valign="bottom">
 * <tr><th class="head">Letter</th>
 * <th class="head">Date or Time Component</th>
 * <th class="head">Presentation</th>
 * <th class="head">Examples</th>
 * </tr>
 * </thead>
 * <tbody valign="top">
 * <tr><td>G</td>
 * <td>Era designator</td>
 * <td>Text</td>
 * <td>AD</td>
 * </tr>
 * <tr><td>y</td>
 * <td>Year</td>
 * <td>Year</td>
 * <td>1996; 96</td>
 * </tr>
 * <tr><td>M</td>
 * <td>Month in year</td>
 * <td>Month</td>
 * <td>July; Jul; 07</td>
 * </tr>
 * <tr><td>w</td>
 * <td>Week in year</td>
 * <td>Number</td>
 * <td>27</td>
 * </tr>
 * <tr><td>W</td>
 * <td>Week in month</td>
 * <td>Number</td>
 * <td>2</td>
 * </tr>
 * <tr><td>D</td>
 * <td>Day in year</td>
 * <td>Number</td>
 * <td>189</td>
 * </tr>
 * <tr><td>d</td>
 * <td>Day in month</td>
 * <td>Number</td>
 * <td>10</td>
 * </tr>
 * <tr><td>F</td>
 * <td>Day of week in month</td>
 * <td>Number</td>
 * <td>2</td>
 * </tr>
 * <tr><td>E</td>
 * <td>Day in week</td>
 * <td>Text</td>
 * <td>Tuesday; Tue</td>
 * </tr>
 * <tr><td>a</td>
 * <td>Am/pm marker</td>
 * <td>Text</td>
 * <td>PM</td>
 * </tr>
 * <tr><td>H</td>
 *       <td>Hour in day (0-23)</td>
 * <td>Number</td>
 * <td>0</td>
 * </tr>
 * <tr><td>k</td>
 *       <td>Hour in day (1-24)</td>
 * <td>Number</td>
 * <td>24</td>
 * </tr>
 * <tr><td>K</td>
 * <td>Hour in am/pm (0-11)</td>
 * <td>Number</td>
 * <td>0</td>
 * </tr>
 * <tr><td>h</td>
 * <td>Hour in am/pm (1-12)</td>
 * <td>Number</td>
 * <td>12</td>
 * </tr>
 * <tr><td>m</td>
 * <td>Minute in hour</td>
 * <td>Number</td>
 * <td>30</td>
 * </tr>
 * <tr><td>s</td>
 * <td>Second in minute</td>
 * <td>Number</td>
 * <td>55</td>
 * </tr>
 * <tr><td>S</td>
 * <td>Millisecond</td>
 * <td>Number</td>
 * <td>978</td>
 * </tr>
 * <tr><td>x/z</td>
 * <td>Time zone</td>
 * <td>General time zone</td>
 * <td>Pacific Standard Time; PST; GMT-08:00</td>
 * </tr>
 * <tr><td>Z</td>
 * <td>Time zone</td>
 * <td>RFC 822 time zone</td>
 * <td>-0800</td>
 * </tr>
 * </tbody>
 * </table>

 * @param {Object} locale locale object
 * @param {Number} timeZoneOffset time zone offset by minutes
 */
function DateTimeFormat(pattern, locale, timeZoneOffset) {
  this.locale = locale;
  this.pattern = compile(pattern);
  this.timezoneOffset = timeZoneOffset;
}

function formatField(field, count, locale, calendar) {
  var current,
    value;
  switch (field) {
    case 'G':
      value = calendar.getYear() > 0 ? 1 : 0;
      current = locale.eras[value];
      break;
    case 'y':
      value = calendar.getYear();
      if (value <= 0) {
        value = 1 - value;
      }
      current = (zeroPaddingNumber(value, 2, count !== 2 ? MAX_VALUE : 2));
      break;
    case 'M':
      value = calendar.getMonth();
      if (count >= 4) {
        current = locale.months[value];
      } else if (count === 3) {
        current = locale.shortMonths[value];
      } else {
        current = zeroPaddingNumber(value + 1, count);
      }
      break;
    case 'k':
      current = zeroPaddingNumber(calendar.getHourOfDay() || 24,
        count);
      break;
    case 'E':
      value = calendar.getDayOfWeek();
      current = count >= 4 ?
        locale.weekdays[value] :
        locale.shortWeekdays[value];
      break;
    case 'a':
      current = locale.ampms[calendar.getHourOfDay() >= 12 ?
        1 :
        0];
      break;
    case 'h':
      current = zeroPaddingNumber(calendar.
        getHourOfDay() % 12 || 12, count);
      break;
    case 'K':
      current = zeroPaddingNumber(calendar.
        getHourOfDay() % 12, count);
      break;
    case 'Z':
      var offset = calendar.getTimezoneOffset();
      var parts = [offset < 0 ? '-' : '+'];
      offset = Math.abs(offset);
      parts.push(zeroPaddingNumber(Math.floor(offset / 60) % 100, 2),
        zeroPaddingNumber(offset % 60, 2));
      current = parts.join('');
      break;
    default :
      // case 'd':
      // case 'H':
      // case 'm':
      // case 's':
      // case 'S':
      // case 'D':
      // case 'F':
      // case 'w':
      // case 'W':
      var index = calendarIndexMap[field];
      value = calendar.get(index);
      current = zeroPaddingNumber(value, count);
  }
  return current;
}

function matchField(dateStr, startIndex, matches) {
  var matchedLen = -1,
    index = -1,
    i,
    len = matches.length;
  for (i = 0; i < len; i++) {
    var m = matches[i];
    var mLen = m.length;
    if (mLen > matchedLen &&
      matchPartString(dateStr, startIndex, m, mLen)) {
      matchedLen = mLen;
      index = i;
    }
  }
  return index >= 0 ? {
    value: index,
    startIndex: startIndex + matchedLen
  } : null;
}

function matchPartString(dateStr, startIndex, match, mLen) {
  for (var i = 0; i < mLen; i++) {
    if (dateStr.charAt(startIndex + i) !== match.charAt(i)) {
      return false;
    }
  }
  return true;
}

function getLeadingNumberLen(str) {
  var i, c,
    len = str.length;
  for (i = 0; i < len; i++) {
    c = str.charAt(i);
    if (c < '0' || c > '9') {
      break;
    }
  }
  return i;
}

function matchNumber(dateStr, startIndex, count, obeyCount) {
  var str = dateStr, n;
  if (obeyCount) {
    if (dateStr.length <= startIndex + count) {
      return null;
    }
    str = dateStr.substring(startIndex, count);
    if (!str.match(/^\d+$/)) {
      return null;
    }
  } else {
    str = str.substring(startIndex);
  }
  n = parseInt(str, 10);
  if (isNaN(n)) {
    return null;
  }
  return {
    value: n,
    startIndex: startIndex + getLeadingNumberLen(str)
  };
}

function parseField(calendar, dateStr, startIndex, field, count, locale, obeyCount, tmp) {
  var match, year, hour;
  if (dateStr.length <= startIndex) {
    return startIndex;
  }
  switch (field) {
    case 'G':
      if ((match = matchField(dateStr, startIndex, locale.eras))) {
        if (calendar.isSetYear()) {
          if (match.value === 0) {
            year = calendar.getYear();
            calendar.setYear(1 - year);
          }
        } else {
          tmp.era = match.value;
        }
      }
      break;
    case 'y':
      if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
        year = match.value;
        if ('era' in tmp) {
          if (tmp.era === 0) {
            year = 1 - year;
          }
        }
        calendar.setYear(year);
      }
      break;
    case 'M':
      var month;
      if (count >= 3) {
        if ((match = matchField(dateStr, startIndex, locale[count === 3 ?
            'shortMonths' : 'months']))) {
          month = match.value;
        }
      } else {
        if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
          month = match.value - 1;
        }
      }
      if (match) {
        calendar.setMonth(month);
      }
      break;
    case 'k':
      if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
        calendar.setHourOfDay(match.value % 24);
      }
      break;
    case 'E':
      if ((match = matchField(dateStr, startIndex, locale[count > 3 ?
          'weekdays' :
          'shortWeekdays']))) {
        calendar.setDayOfWeek(match.value);
      }
      break;
    case 'a':
      if ((match = matchField(dateStr, startIndex, locale.ampms))) {
        if (calendar.isSetHourOfDay()) {
          if (match.value) {
            hour = calendar.getHourOfDay();
            if (hour < 12) {
              calendar.setHourOfDay((hour + 12) % 24);
            }
          }
        } else {
          tmp.ampm = match.value;
        }
      }
      break;
    case 'h':
      if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
        hour = match.value %= 12;
        if (tmp.ampm) {
          hour += 12;
        }
        calendar.setHourOfDay(hour);
      }
      break;
    case 'K':
      if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
        hour = match.value;
        if (tmp.ampm) {
          hour += 12;
        }
        calendar.setHourOfDay(hour);
      }
      break;
    case 'Z':
      var sign = 1,
        zoneChar = dateStr.charAt(startIndex);
      if (zoneChar === '-') {
        sign = -1;
        startIndex++;
      } else if (zoneChar === '+') {
        startIndex++;
      } else {
        break;
      }
      if ((match = matchNumber(dateStr, startIndex, 2, true))) {
        var zoneOffset = match.value * 60;
        startIndex = match.startIndex;
        if ((match = matchNumber(dateStr, startIndex, 2, true))) {
          zoneOffset += match.value;
        }
        calendar.setTimezoneOffset(zoneOffset);
      }
      break;
    default :
      // case 'd':
      // case 'H':
      // case 'm':
      // case 's':
      // case 'S':
      // case 'D':
      // case 'F':
      // case 'w':
      // case 'W'
      if ((match = matchNumber(dateStr, startIndex, count, obeyCount))) {
        var index = calendarIndexMap[field];
        calendar.set(index, match.value);
      }
  }
  if (match) {
    startIndex = match.startIndex;
  }
  return startIndex;
}

mix(DateTimeFormat.prototype, {
  getLocale: function (calendar) {
    if (this.locale) {
      return this.locale;
    }
    if (calendar) {
      return calendar.locale;
    }
    return GregorianCalendar.defaultLocale;
  },

  getTimezoneOffset: function (calendar) {
    if (typeof this.timezoneOffset !== 'undefined') {
      return this.timezoneOffset;
    }
    return this.getLocale(calendar).timezoneOffset;
  },

  /**
   * format a GregorianDate instance according to specified pattern
   * @param {Date.Gregorian} calendar GregorianDate instance
   * @returns {string} formatted string of GregorianDate instance
   */
  format: function (calendar) {
    if (calendar.isGregorianCalendar) {

    } else {
      var time = calendar.getTime();
      calendar = /**@type {Date.Gregorian}
       @ignore*/new GregorianCalendar(this.getTimezoneOffset(), this.getLocale());
      calendar.setTime(time);
    }
    var i,
      ret = [],
      pattern = this.pattern,
      len = pattern.length;
    for (i = 0; i < len; i++) {
      var comp = pattern[i];
      if (comp.text) {
        ret.push(comp.text);
      } else if ('field' in comp) {
        ret.push(formatField(comp.field, comp.count, this.getLocale(calendar), calendar));
      }
    }
    return ret.join('');
  },

  /**
   * parse a formatted string of GregorianDate instance according to specified pattern
   * @param {String} dateStr formatted string of GregorianDate
   * @returns {Date.Gregorian}
   */
  parse: function (dateStr) {
    var calendar = /**@type {Date.Gregorian}
       @ignore*/new GregorianCalendar(this.getTimezoneOffset(), this.getLocale()),
      i,
      j,
      tmp = {},
      obeyCount = false,
      dateStrLen = dateStr.length,
      errorIndex = -1,
      startIndex = 0,
      oldStartIndex = 0,
      pattern = this.pattern,
      len = pattern.length;

    loopPattern: {
      for (i = 0; errorIndex < 0 && i < len; i++) {
        var comp = pattern[i], text, textLen;
        oldStartIndex = startIndex;
        if ((text = comp.text)) {
          textLen = text.length;
          if ((textLen + startIndex) > dateStrLen) {
            errorIndex = startIndex;
          } else {
            for (j = 0; j < textLen; j++) {
              if (text.charAt(j) !== dateStr.charAt(j + startIndex)) {
                errorIndex = startIndex;
                break loopPattern;
              }
            }
            startIndex += textLen;
          }
        } else if ('field' in comp) {
          obeyCount = false;
          var nextComp = pattern[i + 1];
          if (nextComp) {
            if ('field' in nextComp) {
              obeyCount = true;
            } else {
              var c = nextComp.text.charAt(0);
              if (c >= '0' && c <= '9') {
                obeyCount = true;
              }
            }
          }
          startIndex = parseField(calendar,
            dateStr,
            startIndex,
            comp.field,
            comp.count,
            this.getLocale(calendar),
            obeyCount,
            tmp);
          if (startIndex === oldStartIndex) {
            errorIndex = startIndex;
          }
        }
      }
    }

    if (errorIndex >= 0) {
      console.error('error when parsing date');
      console.error(dateStr);
      console.error(dateStr.substring(0, errorIndex) + '^');
      return undefined;
    }
    return calendar;
  }
});

mix(DateTimeFormat, {
  Style: DateTimeStyle,

  /**
   * get a formatter instance of short style pattern.
   * en-us: M/d/yy h:mm a
   * zh-cn: yy-M-d ah:mm
   * @param {Object} locale locale object
   * @param {Number} timeZoneOffset time zone offset by minutes
   * @returns {Date.Gregorian}
   * @static
   */
  getInstance: function (locale, timeZoneOffset) {
    return this.getDateTimeInstance(DateTimeStyle.SHORT, DateTimeStyle.SHORT, locale, timeZoneOffset);
  },

  /**
   * get a formatter instance of specified date style.
   * @param {Date.Formatter.Style} dateStyle date format style
   * @param {Object} locale
   * @param {Number} timeZoneOffset time zone offset by minutes
   * @returns {Date.Gregorian}
   * @static
   */
  getDateInstance: function (dateStyle, locale, timeZoneOffset) {
    return this.getDateTimeInstance(dateStyle, undefined, locale, timeZoneOffset);
  },

  /**
   * get a formatter instance of specified date style and time style.
   * @param {Date.Formatter.Style} dateStyle date format style
   * @param {Date.Formatter.Style} timeStyle time format style
   * @param {Object} locale
   * @param {Number} timeZoneOffset time zone offset by minutes
   * @returns {Date.Gregorian}
   * @static
   */
  getDateTimeInstance: function (dateStyle, timeStyle, locale, timeZoneOffset) {
    locale = locale || GregorianCalendar.defaultLocale;
    var datePattern = '';
    if (dateStyle !== undefined) {
      datePattern = locale.datePatterns[dateStyle];
    }
    var timePattern = '';
    if (timeStyle !== undefined) {
      timePattern = locale.timePatterns[timeStyle];
    }
    var pattern = datePattern;
    if (timePattern) {
      if (datePattern) {
        pattern = substitute(locale.dateTimePattern, {
          date: datePattern,
          time: timePattern
        });
      } else {
        pattern = timePattern;
      }
    }
    return new DateTimeFormat(pattern, locale, timeZoneOffset);
  },

  /**
   * get a formatter instance of specified time style.
   * @param {Date.Formatter.Style} timeStyle time format style
   * @param {Object} locale
   * @param {Number} timeZoneOffset time zone offset by minutes
   * @returns {Date.Gregorian}
   * @static
   */
  getTimeInstance: function (timeStyle, locale, timeZoneOffset) {
    return this.getDateTimeInstance(undefined, timeStyle, locale, timeZoneOffset);
  }
});

module.exports = DateTimeFormat;

DateTimeFormat.version = '@VERSION@';
},{"gregorian-calendar":4}],4:[function(require,module,exports){
module.exports = require('./lib/gregorian-calendar');
},{"./lib/gregorian-calendar":6}],5:[function(require,module,exports){
/**
 * @ignore
 * const for gregorian date
 * @author yiminghe@gmail.com
 */

module.exports = {
    /**
     * Enum indicating sunday
     * @type Number
     * @member Date.Gregorian
     */
    SUNDAY: 0,
    /**
     * Enum indicating monday
     * @type Number
     * @member Date.Gregorian
     */
    MONDAY: 1,
    /**
     * Enum indicating tuesday
     * @type Number
     * @member Date.Gregorian
     */
    TUESDAY: 2,
    /**
     * Enum indicating wednesday
     * @type Number
     * @member Date.Gregorian
     */
    WEDNESDAY: 3,
    /**
     * Enum indicating thursday
     * @type Number
     * @member Date.Gregorian
     */
    THURSDAY: 4,
    /**
     * Enum indicating friday
     * @type Number
     * @member Date.Gregorian
     */
    FRIDAY: 5,
    /**
     * Enum indicating saturday
     * @type Number
     * @member Date.Gregorian
     */
    SATURDAY: 6,
    /**
     * Enum indicating january
     * @type Number
     * @member Date.Gregorian
     */
    JANUARY: 0,
    /**
     * Enum indicating february
     * @type Number
     * @member Date.Gregorian
     */
    FEBRUARY: 1,
    /**
     * Enum indicating march
     * @type Number
     * @member Date.Gregorian
     */
    MARCH: 2,
    /**
     * Enum indicating april
     * @type Number
     * @member Date.Gregorian
     */
    APRIL: 3,
    /**
     * Enum indicating may
     * @type Number
     * @member Date.Gregorian
     */
    MAY: 4,
    /**
     * Enum indicating june
     * @type Number
     * @member Date.Gregorian
     */
    JUNE: 5,
    /**
     * Enum indicating july
     * @type Number
     * @member Date.Gregorian
     */
    JULY: 6,
    /**
     * Enum indicating august
     * @type Number
     * @member Date.Gregorian
     */
    AUGUST: 7,
    /**
     * Enum indicating september
     * @type Number
     * @member Date.Gregorian
     */
    SEPTEMBER: 8,
    /**
     * Enum indicating october
     * @type Number
     * @member Date.Gregorian
     */
    OCTOBER: 9,
    /**
     * Enum indicating november
     * @type Number
     * @member Date.Gregorian
     */
    NOVEMBER: 10,
    /**
     * Enum indicating december
     * @type Number
     * @member Date.Gregorian
     */
    DECEMBER: 11
};
},{}],6:[function(require,module,exports){
/**
 * GregorianCalendar class
 * @ignore
 * @author yiminghe@gmail.com
 */
var toInt = parseInt;
var Utils = require('./utils');
var defaultLocale = require('./locale/en-us');
var Const = require('./const');

/**
 * GregorianCalendar class.
 *
 * - no arguments:
 *   Constructs a default GregorianCalendar using the current time
 *   in the default time zone with the default locale.
 * - one argument timezoneOffset:
 *   Constructs a GregorianCalendar based on the current time
 *   in the given timezoneOffset with the default locale.
 * - one argument locale:
 *   Constructs a GregorianCalendar
 *   based on the current time in the default time zone with the given locale.
 * - two arguments
 *   Constructs a GregorianCalendar based on the current time in the given time zone with the given locale.
 *      - zone - the given time zone.
 *      - aLocale - the given locale.
 *
 * - 3 to 6 arguments:
 *   Constructs a GregorianCalendar with the given date and time set for the default time zone with the default locale.
 *      - year - the value used to set the YEAR calendar field in the calendar.
 *      - month - the value used to set the MONTH calendar field in the calendar. Month value is 0-based. e.g.,
 *        0 for January.
 *      - dayOfMonth - the value used to set the DAY_OF_MONTH calendar field in the calendar.
 *      - hourOfDay - the value used to set the HOUR_OF_DAY calendar field in the calendar.
 *      - minute - the value used to set the MINUTE calendar field in the calendar.
 *      - second - the value used to set the SECONDS calendar field in the calendar.
 *
 *
 * @class Date.Gregorian
 */
function GregorianCalendar(timezoneOffset, locale) {

  var args = [].slice.call(arguments, 0);

  if (typeof timezoneOffset === 'object') {
    locale = timezoneOffset;
    timezoneOffset = locale.timezoneOffset;
  } else if (args.length >= 3) {
    timezoneOffset = locale = null;
  }

  locale = locale || defaultLocale;

  this.locale = locale;

  this.fields = [];

  /**
   * The currently set time for this date.
   * @protected
   * @type Number|undefined
   */
  this.time = undefined;
  /**
   * The timezoneOffset in minutes used by this date.
   * @type Number
   * @protected
   */
  if (typeof timezoneOffset !== 'number') {
    timezoneOffset = locale.timezoneOffset;
  }
  this.timezoneOffset = timezoneOffset;

  /**
   * The first day of the week
   * @type Number
   * @protected
   */
  this.firstDayOfWeek = locale.firstDayOfWeek;

  /**
   * The number of days required for the first week in a month or year,
   * with possible values from 1 to 7.
   * @@protected
   * @type Number
   */
  this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;

  this.fieldsComputed = false;

  if (arguments.length >= 3) {
    this.set.apply(this, args);
  }
}

Utils.mix(GregorianCalendar, Const);

Utils.mix(GregorianCalendar, {
  Utils: Utils,

  defaultLocale: defaultLocale,

  /**
   * Determines if the given year is a leap year.
   * Returns true if the given year is a leap year. To specify BC year numbers,
   * 1 - year number must be given. For example, year BC 4 is specified as -3.
   * @param {Number} year the given year.
   * @returns {Boolean} true if the given year is a leap year; false otherwise.
   * @static
   * @method
   */
  isLeapYear: Utils.isLeapYear,

  /**
   * Enum indicating year field of date
   * @type Number
   */
  YEAR: 1,
  /**
   * Enum indicating month field of date
   * @type Number
   */
  MONTH: 2,
  /**
   * Enum indicating the day of the month
   * @type Number
   */
  DAY_OF_MONTH: 3,
  /**
   * Enum indicating the hour (24).
   * @type Number
   */
  HOUR_OF_DAY: 4,
  /**
   * Enum indicating the minute of the day
   * @type Number
   */
  MINUTES: 5,
  /**
   * Enum indicating the second of the day
   * @type Number
   */
  SECONDS: 6,
  /**
   * Enum indicating the millisecond of the day
   * @type Number
   */
  MILLISECONDS: 7,
  /**
   * Enum indicating the week number within the current year
   * @type Number
   */
  WEEK_OF_YEAR: 8,
  /**
   * Enum indicating the week number within the current month
   * @type Number
   */
  WEEK_OF_MONTH: 9,

  /**
   * Enum indicating the day of the day number within the current year
   * @type Number
   */
  DAY_OF_YEAR: 10,
  /**
   * Enum indicating the day of the week
   * @type Number
   */
  DAY_OF_WEEK: 11,
  /**
   * Enum indicating the day of the ordinal number of the day of the week
   * @type Number
   */
  DAY_OF_WEEK_IN_MONTH: 12,

  /**
   * Enum indicating am
   * @type Number
   */
  AM: 0,
  /**
   * Enum indicating pm
   * @type Number
   */
  PM: 1
});

var fields = ['',
  'Year', 'Month', 'DayOfMonth',
  'HourOfDay',
  'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear',
  'WeekOfMonth', 'DayOfYear', 'DayOfWeek',
  'DayOfWeekInMonth'
];

var YEAR = GregorianCalendar.YEAR;
var MONTH = GregorianCalendar.MONTH;
var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
var MINUTE = GregorianCalendar.MINUTES;
var SECONDS = GregorianCalendar.SECONDS;

var MILLISECONDS = GregorianCalendar.MILLISECONDS;
var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;

var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;

var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based
var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 0-based

var ONE_SECOND = 1000;
var ONE_MINUTE = 60 * ONE_SECOND;
var ONE_HOUR = 60 * ONE_MINUTE;
var ONE_DAY = 24 * ONE_HOUR;
var ONE_WEEK = ONE_DAY * 7;

var EPOCH_OFFSET = 719163; // Fixed date of January 1, 1970 (Gregorian)

var mod = Utils.mod,
  isLeapYear = Utils.isLeapYear,
  floorDivide = Math.floor;

var MIN_VALUES = [
  undefined,
  1,              // YEAR
  GregorianCalendar.JANUARY,        // MONTH
  1,              // DAY_OF_MONTH
  0,              // HOUR_OF_DAY
  0,              // MINUTE
  0,              // SECONDS
  0,              // MILLISECONDS

  1,              // WEEK_OF_YEAR
  undefined,              // WEEK_OF_MONTH

  1,              // DAY_OF_YEAR
  GregorianCalendar.SUNDAY,         // DAY_OF_WEEK
  1             // DAY_OF_WEEK_IN_MONTH
];

var MAX_VALUES = [
  undefined,
  292278994,      // YEAR
  GregorianCalendar.DECEMBER,       // MONTH
  undefined, // DAY_OF_MONTH
  23,             // HOUR_OF_DAY
  59,             // MINUTE
  59,             // SECONDS
  999,            // MILLISECONDS
  undefined,             // WEEK_OF_YEAR
  undefined,              // WEEK_OF_MONTH
  undefined,            // DAY_OF_YEAR
  GregorianCalendar.SATURDAY,       // DAY_OF_WEEK
  undefined              // DAY_OF_WEEK_IN_MONTH
];

GregorianCalendar.prototype = {
  constructor: GregorianCalendar,

  isGregorianCalendar: 1,

  /**
   * Determines if current year is a leap year.
   * Returns true if the given year is a leap year. To specify BC year numbers,
   * 1 - year number must be given. For example, year BC 4 is specified as -3.
   * @returns {Boolean} true if the given year is a leap year; false otherwise.
   * @method
   * @member Date.Gregorian
   */
  isLeapYear: function () {
    return isLeapYear(this.getYear());
  },

  /**
   * Return local info for current date instance
   * @returns {Object}
   */
  getLocale: function () {
    return this.locale;
  },

  /**
   * Returns the minimum value for
   * the given calendar field of this GregorianCalendar instance.
   * The minimum value is defined as the smallest value
   * returned by the get method for any possible time value,
   * taking into consideration the current values of the getFirstDayOfWeek,
   * getMinimalDaysInFirstWeek.
   * @param field the calendar field.
   * @returns {Number} the minimum value for the given calendar field.
   */
  getActualMinimum: function (field) {
    if (MIN_VALUES[field] !== undefined) {
      return MIN_VALUES[field];
    }

    var fields = this.fields;
    if (field === WEEK_OF_MONTH) {
      var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
      return cal.get(WEEK_OF_MONTH);
    }

    throw new Error('minimum value not defined!');
  },

  /**
   * Returns the maximum value for the given calendar field
   * of this GregorianCalendar instance.
   * The maximum value is defined as the largest value returned
   * by the get method for any possible time value, taking into consideration
   * the current values of the getFirstDayOfWeek, getMinimalDaysInFirstWeek methods.
   * @param field the calendar field.
   * @returns {Number} the maximum value for the given calendar field.
   */
  getActualMaximum: function (field) {
    if (MAX_VALUES[field] !== undefined) {
      return MAX_VALUES[field];
    }
    var value,
      fields = this.fields;
    switch (field) {
      case DAY_OF_MONTH:
        value = getMonthLength(fields[YEAR], fields[MONTH]);
        break;

      case WEEK_OF_YEAR:
        var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
        value = endOfYear.get(WEEK_OF_YEAR);
        if (value === 1) {
          value = 52;
        }
        break;

      case WEEK_OF_MONTH:
        var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
        value = endOfMonth.get(WEEK_OF_MONTH);
        break;

      case DAY_OF_YEAR:
        value = getYearLength(fields[YEAR]);
        break;

      case DAY_OF_WEEK_IN_MONTH:
        value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
        break;
    }
    if (value === undefined) {
      throw new Error('maximum value not defined!');
    }
    return value;
  },

  /**
   * Determines if the given calendar field has a value set,
   * including cases that the value has been set by internal fields calculations
   * triggered by a get method call.
   * @param field the calendar field to be cleared.
   * @returns {boolean} true if the given calendar field has a value set; false otherwise.
   */
  isSet: function (field) {
    return this.fields[field] !== undefined;
  },

  /**
   * Converts the time value (millisecond offset from the Epoch)
   * to calendar field values.
   * @protected
   */
  computeFields: function () {
    var time = this.time;
    var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
    var fixedDate = toInt(timezoneOffset / ONE_DAY);
    var timeOfDay = timezoneOffset % ONE_DAY;
    fixedDate += toInt(time / ONE_DAY);
    timeOfDay += time % ONE_DAY;
    if (timeOfDay >= ONE_DAY) {
      timeOfDay -= ONE_DAY;
      fixedDate++;
    } else {
      while (timeOfDay < 0) {
        timeOfDay += ONE_DAY;
        fixedDate--;
      }
    }

    fixedDate += EPOCH_OFFSET;

    var date = Utils.getGregorianDateFromFixedDate(fixedDate);

    var year = date.year;

    var fields = this.fields;
    fields[YEAR] = year;
    fields[MONTH] = date.month;
    fields[DAY_OF_MONTH] = date.dayOfMonth;
    fields[DAY_OF_WEEK] = date.dayOfWeek;

    if (timeOfDay !== 0) {
      fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
      var r = timeOfDay % ONE_HOUR;
      fields[MINUTE] = toInt(r / ONE_MINUTE);
      r %= ONE_MINUTE;
      fields[SECONDS] = toInt(r / ONE_SECOND);
      fields[MILLISECONDS] = r % ONE_SECOND;
    } else {
      fields[HOUR_OF_DAY] =
        fields[MINUTE] =
          fields[SECONDS] =
            fields[MILLISECONDS] = 0;
    }

    var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
    var dayOfYear = fixedDate - fixedDateJan1 + 1;
    var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;

    fields[DAY_OF_YEAR] = dayOfYear;
    fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;

    var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);

    // 本周没有足够的时间在当前年
    if (weekOfYear === 0) {
      // If the date belongs to the last week of the
      // previous year, use the week number of "12/31" of
      // the "previous" year.
      var fixedDec31 = fixedDateJan1 - 1;
      var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
      weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
    } else
    // 本周是年末最后一周，可能有足够的时间在新的一年
    if (weekOfYear >= 52) {
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      var nDays = nextJan1st - nextJan1;
      // 本周有足够天数在新的一年
      if (nDays >= this.minimalDaysInFirstWeek &&
          // 当天确实在本周，weekOfYear === 53 时是不需要这个判断
        fixedDate >= (nextJan1st - 7)
      ) {
        weekOfYear = 1;
      }
    }

    fields[WEEK_OF_YEAR] = weekOfYear;
    fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);

    this.fieldsComputed = true;
  },

  /**
   * Converts calendar field values to the time value
   * (millisecond offset from the Epoch).
   * @protected
   */
  computeTime: function () {
    if (!this.isSet(YEAR)) {
      throw new Error('year must be set for GregorianCalendar');
    }

    var fields = this.fields;

    var year = fields[YEAR];
    var timeOfDay = 0;
    if (this.isSet(HOUR_OF_DAY)) {
      timeOfDay += fields[HOUR_OF_DAY];
    }
    timeOfDay *= 60;
    timeOfDay += fields[MINUTE] || 0;
    timeOfDay *= 60;
    timeOfDay += fields[SECONDS] || 0;
    timeOfDay *= 1000;
    timeOfDay += fields[MILLISECONDS] || 0;

    var fixedDate = 0;

    fields[YEAR] = year;

    fixedDate = fixedDate + this.getFixedDate();

    // millis represents local wall-clock time in milliseconds.
    var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;

    millis -= this.timezoneOffset * ONE_MINUTE;

    this.time = millis;

    this.computeFields();
  },

  /**
   * Fills in any unset fields in the calendar fields. First,
   * the computeTime() method is called if the time value (millisecond offset from the Epoch)
   * has not been calculated from calendar field values.
   * Then, the computeFields() method is called to calculate all calendar field values.
   * @protected
   */
  complete: function () {
    if (this.time === undefined) {
      this.computeTime();
    }
    if (!this.fieldsComputed) {
      this.computeFields();
    }
  },

  getFixedDate: function () {

    var self = this;

    var fields = self.fields;

    var firstDayOfWeekCfg = self.firstDayOfWeek;

    var year = fields[YEAR];

    var month = GregorianCalendar.JANUARY;

    if (self.isSet(MONTH)) {
      month = fields[MONTH];
      if (month > GregorianCalendar.DECEMBER) {
        year += toInt(month / 12);
        month %= 12;
      } else if (month < GregorianCalendar.JANUARY) {
        year += floorDivide(month / 12);
        month = mod(month, 12);
      }
    }

    // Get the fixed date since Jan 1, 1 (Gregorian). We are on
    // the first day of either `month' or January in 'year'.
    var fixedDate = Utils.getFixedDate(year, month, 1);
    var firstDayOfWeek;
    var dayOfWeek = self.firstDayOfWeek;

    if (self.isSet(DAY_OF_WEEK)) {
      dayOfWeek = fields[DAY_OF_WEEK];
    }

    if (self.isSet(MONTH)) {
      if (self.isSet(DAY_OF_MONTH)) {
        fixedDate += fields[DAY_OF_MONTH] - 1;
      } else {
        if (self.isSet(WEEK_OF_MONTH)) {
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);

          // If we have enough days in the first week, then
          // move to the previous week.
          if ((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek) {
            firstDayOfWeek -= 7;
          }

          if (dayOfWeek !== firstDayOfWeekCfg) {
            firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
          }

          fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
        } else {
          var dowim;
          if (self.isSet(DAY_OF_WEEK_IN_MONTH)) {
            dowim = fields[DAY_OF_WEEK_IN_MONTH];
          } else {
            dowim = 1;
          }
          var lastDate = (7 * dowim);
          if (dowim < 0) {
            lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
          }
          fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
        }
      }
    } else {
      // We are on the first day of the year.
      if (self.isSet(DAY_OF_YEAR)) {
        fixedDate += fields[DAY_OF_YEAR] - 1;
      } else {
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        // If we have enough days in the first week, then move
        // to the previous week.
        if ((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek) {
          firstDayOfWeek -= 7;
        }
        if (dayOfWeek !== firstDayOfWeekCfg) {
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
      }
    }

    return fixedDate;
  },

  /**
   * Returns this Calendar's time value in milliseconds
   * @member Date.Gregorian
   * @returns {Number} the current time as UTC milliseconds from the epoch.
   */
  getTime: function () {
    if (this.time === undefined) {
      this.computeTime();
    }
    return this.time;
  },

  /**
   * Sets this Calendar's current time from the given long value.
   * @param time the new time in UTC milliseconds from the epoch.
   */
  setTime: function (time) {
    this.time = time;
    this.fieldsComputed = false;
    this.complete();
  },

  /**
   * Returns the value of the given calendar field.
   * @param field the given calendar field.
   * @returns {Number} the value for the given calendar field.
   */
  get: function (field) {
    this.complete();
    return this.fields[field];
  },

  /**
   * Returns the year of the given calendar field.
   * @method getYear
   * @returns {Number} the year for the given calendar field.
   */

  /**
   * Returns the month of the given calendar field.
   * @method getMonth
   * @returns {Number} the month for the given calendar field.
   */

  /**
   * Returns the day of month of the given calendar field.
   * @method getDayOfMonth
   * @returns {Number} the day of month for the given calendar field.
   */

  /**
   * Returns the hour of day of the given calendar field.
   * @method getHourOfDay
   * @returns {Number} the hour of day for the given calendar field.
   */

  /**
   * Returns the minute of the given calendar field.
   * @method getMinute
   * @returns {Number} the minute for the given calendar field.
   */

  /**
   * Returns the second of the given calendar field.
   * @method getSecond
   * @returns {Number} the second for the given calendar field.
   */

  /**
   * Returns the millisecond of the given calendar field.
   * @method getMilliSecond
   * @returns {Number} the millisecond for the given calendar field.
   */

  /**
   * Returns the week of year of the given calendar field.
   * @method getWeekOfYear
   * @returns {Number} the week of year for the given calendar field.
   */

  /**
   * Returns the week of month of the given calendar field.
   * @method getWeekOfMonth
   * @returns {Number} the week of month for the given calendar field.
   */

  /**
   * Returns the day of year of the given calendar field.
   * @method getDayOfYear
   * @returns {Number} the day of year for the given calendar field.
   */

  /**
   * Returns the day of week of the given calendar field.
   * @method getDayOfWeek
   * @returns {Number} the day of week for the given calendar field.
   */

  /**
   * Returns the day of week in month of the given calendar field.
   * @method getDayOfWeekInMonth
   * @returns {Number} the day of week in month for the given calendar field.
   */

  /**
   * Sets the given calendar field to the given value.
   * @param field the given calendar field.
   * @param v the value to be set for the given calendar field.
   */
  set: function (field, v) {
    var len = arguments.length;
    if (len === 2) {
      this.fields[field] = v;
    } else if (len < MILLISECONDS + 1) {
      for (var i = 0; i < len; i++) {
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      throw  new Error('illegal arguments for GregorianCalendar set');
    }
    this.time = undefined;
  },

  /**
   * Set the year of the given calendar field.
   * @method setYear
   */

  /**
   * Set the month of the given calendar field.
   * @method setMonth
   */

  /**
   * Set the day of month of the given calendar field.
   * @method setDayOfMonth
   */

  /**
   * Set the hour of day of the given calendar field.
   * @method setHourOfDay
   */

  /**
   * Set the minute of the given calendar field.
   * @method setMinute
   */

  /**
   * Set the second of the given calendar field.
   * @method setSecond
   */

  /**
   * Set the millisecond of the given calendar field.
   * @method setMilliSecond
   */

  /**
   * Set the week of year of the given calendar field.
   * @method setWeekOfYear
   */

  /**
   * Set the week of month of the given calendar field.
   * @method setWeekOfMonth
   */

  /**
   * Set the day of year of the given calendar field.
   * @method setDayOfYear
   */

  /**
   * Set the day of week of the given calendar field.
   * @method setDayOfWeek
   */

  /**
   * Set the day of week in month of the given calendar field.
   * @method setDayOfWeekInMonth
   */

  /**
   * add for specified field based on two rules:
   *
   *  - Add rule 1. The value of field after the call minus the value of field before the
   *  call is amount, modulo any overflow that has occurred in field
   *  Overflow occurs when a field value exceeds its range and,
   *  as a result, the next larger field is incremented or
   *  decremented and the field value is adjusted back into its range.
   *
   *  - Add rule 2. If a smaller field is expected to be invariant,
   *  but it is impossible for it to be equal to its
   *  prior value because of changes in its minimum or maximum after
   *  field is changed, then its value is adjusted to be as close
   *  as possible to its expected value. A smaller field represents a
   *  smaller unit of time. HOUR_OF_DAY is a smaller field than
   *  DAY_OF_MONTH. No adjustment is made to smaller fields
   *  that are not expected to be invariant. The calendar system
   *  determines what fields are expected to be invariant.
   *
   *
   *      @example
   *      use('date/gregorian',function(S, GregorianCalendar){
         *          var d = new GregorianCalendar();
         *          d.set(2012, GregorianCalendar.JANUARY, 31);
         *          d.add(Gregorian.MONTH,1);
         *          // 2012-2-29
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *          d.add(Gregorian.MONTH,12);
         *          // 2013-2-28
         *          document.writeln('<p>'+d.getYear()+'-'+d.getMonth()+'-'+d.getDayOfWeek())
         *      });
   *
   * @param field the calendar field.
   * @param {Number} amount he amount of date or time to be added to the field.
   */
  add: function (field, amount) {
    if (!amount) {
      return;
    }
    var self = this;
    var fields = self.fields;
    // computer and retrieve original value
    var value = self.get(field);
    if (field === YEAR) {
      value += amount;
      self.set(YEAR, value);
      adjustDayOfMonth(self);
    } else if (field === MONTH) {
      value += amount;
      var yearAmount = floorDivide(value / 12);
      value = mod(value, 12);
      if (yearAmount) {
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      self.set(MONTH, value);
      adjustDayOfMonth(self);
    } else {
      switch (field) {
        case HOUR_OF_DAY:
          amount *= ONE_HOUR;
          break;
        case MINUTE:
          amount *= ONE_MINUTE;
          break;
        case SECONDS:
          amount *= ONE_SECOND;
          break;
        case MILLISECONDS:
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          amount *= ONE_WEEK;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          amount *= ONE_DAY;
          break;
        default:
          throw new Error('illegal field for add');
      }
      self.setTime(self.time + amount);
    }

  },

  /**
   * add the year of the given calendar field.
   * @method addYear
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the month of the given calendar field.
   * @method addMonth
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the day of month of the given calendar field.
   * @method addDayOfMonth
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the hour of day of the given calendar field.
   * @method addHourOfDay
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the minute of the given calendar field.
   * @method addMinute
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the second of the given calendar field.
   * @method addSecond
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the millisecond of the given calendar field.
   * @method addMilliSecond
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the week of year of the given calendar field.
   * @method addWeekOfYear
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the week of month of the given calendar field.
   * @method addWeekOfMonth
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the day of year of the given calendar field.
   * @method addDayOfYear
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the day of week of the given calendar field.
   * @method addDayOfWeek
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * add the day of week in month of the given calendar field.
   * @method addDayOfWeekInMonth
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * Get rolled value for the field
   * @protected
   */
  getRolledValue: function (value, amount, min, max) {
    var diff = value - min;
    var range = max - min + 1;
    amount %= range;
    return min + (diff + amount + range) % range;
  },

  /**
   * Adds a signed amount to the specified calendar field without changing larger fields.
   * A negative roll amount means to subtract from field without changing
   * larger fields. If the specified amount is 0, this method performs nothing.
   *
   *
   *
   *      @example
   *      var d = new GregorianCalendar();
   *      d.set(1999, GregorianCalendar.AUGUST, 31);
   *      // 1999-4-30
   *      // Tuesday June 1, 1999
   *      d.set(1999, GregorianCalendar.JUNE, 1);
   *      d.add(Gregorian.WEEK_OF_MONTH,-1); // === d.add(Gregorian.WEEK_OF_MONTH,
   *      d.get(Gregorian.WEEK_OF_MONTH));
   *      // 1999-06-29
   *
   *
   * @param field the calendar field.
   * @param {Number} amount the signed amount to add to field.
   */
  roll: function (field, amount) {
    if (!amount) {
      return;
    }
    var self = this;
    // computer and retrieve original value
    var value = self.get(field);
    var min = self.getActualMinimum(field);
    var max = self.getActualMaximum(field);
    value = self.getRolledValue(value, amount, min, max);

    self.set(field, value);

    // consider compute time priority
    switch (field) {
      case MONTH:
        adjustDayOfMonth(self);
        break;
      default:
        // other fields are set already when get
        self.updateFieldsBySet(field);
        break;
    }
  },

  /**
   * roll the year of the given calendar field.
   * @method rollYear
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the month of the given calendar field.
   * @param {Number} amount the signed amount to add to field.
   * @method rollMonth
   */

  /**
   * roll the day of month of the given calendar field.
   * @method rollDayOfMonth
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the hour of day of the given calendar field.
   * @method rollHourOfDay
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the minute of the given calendar field.
   * @method rollMinute
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the second of the given calendar field.
   * @method rollSecond
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the millisecond of the given calendar field.
   * @method rollMilliSecond
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the week of year of the given calendar field.
   * @method rollWeekOfYear
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the week of month of the given calendar field.
   * @method rollWeekOfMonth
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the day of year of the given calendar field.
   * @method rollDayOfYear
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * roll the day of week of the given calendar field.
   * @method rollDayOfWeek
   * @param {Number} amount the signed amount to add to field.
   */

  /**
   * remove other priority fields when call getFixedDate
   * precondition: other fields are all set or computed
   * @protected
   */
  updateFieldsBySet: function (field) {
    var fields = this.fields;
    switch (field) {
      case WEEK_OF_MONTH:
        fields[DAY_OF_MONTH] = undefined;
        break;
      case DAY_OF_YEAR:
        fields[MONTH] = undefined;
        break;
      case DAY_OF_WEEK:
        fields[DAY_OF_MONTH] = undefined;
        break;
      case WEEK_OF_YEAR:
        fields[DAY_OF_YEAR] = undefined;
        fields[MONTH] = undefined;
        break;
    }
  },

  /**
   * get current date instance's timezone offset
   * @returns {Number}
   */
  getTimezoneOffset: function () {
    return this.timezoneOffset;
  },

  /**
   * set current date instance's timezone offset
   */
  setTimezoneOffset: function (timezoneOffset) {
    if (this.timezoneOffset !== timezoneOffset) {
      this.fieldsComputed = undefined;
      this.timezoneOffset = timezoneOffset;
    }
  },

  /**
   * set first day of week for current date instance
   */
  setFirstDayOfWeek: function (firstDayOfWeek) {
    if (this.firstDayOfWeek !== firstDayOfWeek) {
      this.firstDayOfWeek = firstDayOfWeek;
      this.fieldsComputed = false;
    }
  },

  /**
   * Gets what the first day of the week is; e.g., SUNDAY in the U.S., MONDAY in France.
   * @returns {Number} the first day of the week.
   */
  getFirstDayOfWeek: function () {
    return this.firstDayOfWeek;
  },

  /**
   * Sets what the minimal days required in the first week of the year are; For example,
   * if the first week is defined as one that contains the first day of the first month of a year,
   * call this method with value 1.
   * If it must be a full week, use value 7.
   * @param minimalDaysInFirstWeek the given minimal days required in the first week of the year.
   */
  setMinimalDaysInFirstWeek: function (minimalDaysInFirstWeek) {
    if (this.minimalDaysInFirstWeek !== minimalDaysInFirstWeek) {
      this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
      this.fieldsComputed = false;
    }
  },

  /**
   * Gets what the minimal days required in the first week of the year are; e.g.,
   * if the first week is defined as one that contains the first day of the first month of a year,
   * this method returns 1.
   * If the minimal days required must be a full week, this method returns 7.
   * @returns {Number} the minimal days required in the first week of the year.
   */
  getMinimalDaysInFirstWeek: function () {
    return this.minimalDaysInFirstWeek;
  },

  /**
   * Returns the number of weeks in the week year
   * represented by this GregorianCalendar.
   *
   * For example, if this GregorianCalendar's date is
   * December 31, 2008 with the ISO
   * 8601 compatible setting, this method will return 53 for the
   * period: December 29, 2008 to January 3, 2010
   * while getActualMaximum(WEEK_OF_YEAR) will return
   * 52 for the period: December 31, 2007 to December 28, 2008.
   *
   * @return {Number} the number of weeks in the week year.
   */
  getWeeksInWeekYear: function () {
    var weekYear = this.getWeekYear();
    if (weekYear === this.get(YEAR)) {
      return this.getActualMaximum(WEEK_OF_YEAR);
    }
    // Use the 2nd week for calculating the max of WEEK_OF_YEAR
    var gc = this.clone();
    gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
    return gc.getActualMaximum(WEEK_OF_YEAR);
  },

  /**
   * Returns the week year represented by this GregorianCalendar.
   * The dates in the weeks between 1 and the
   * maximum week number of the week year have the same week year value
   * that may be one year before or after the calendar year value.
   *
   * @return {Number} the week year represented by this GregorianCalendar.
   */
  getWeekYear: function () {
    var year = this.get(YEAR); // implicitly  complete
    var weekOfYear = this.get(WEEK_OF_YEAR);
    var month = this.get(MONTH);
    if (month === GregorianCalendar.JANUARY) {
      if (weekOfYear >= 52) {
        --year;
      }
    } else if (month === GregorianCalendar.DECEMBER) {
      if (weekOfYear === 1) {
        ++year;
      }
    }
    return year;
  },
  /**
   * Sets this GregorianCalendar to the date given by the date specifiers - weekYear,
   * weekOfYear, and dayOfWeek. weekOfYear follows the WEEK_OF_YEAR numbering.
   * The dayOfWeek value must be one of the DAY_OF_WEEK values: SUNDAY to SATURDAY.
   *
   * @param weekYear    the week year
   * @param weekOfYear  the week number based on weekYear
   * @param dayOfWeek   the day of week value
   */
  setWeekDate: function (weekYear, weekOfYear, dayOfWeek) {
    if (dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY) {
      throw new Error('invalid dayOfWeek: ' + dayOfWeek);
    }
    var fields = this.fields;
    // To avoid changing the time of day fields by date
    // calculations, use a clone with the GMT time zone.
    var gc = this.clone();
    gc.clear();
    gc.setTimezoneOffset(0);
    gc.set(YEAR, weekYear);
    gc.set(WEEK_OF_YEAR, 1);
    gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
    var days = dayOfWeek - this.getFirstDayOfWeek();
    if (days < 0) {
      days += 7;
    }
    days += 7 * (weekOfYear - 1);
    if (days !== 0) {
      gc.add(DAY_OF_YEAR, days);
    } else {
      gc.complete();
    }
    fields[YEAR] = gc.get(YEAR);
    fields[MONTH] = gc.get(MONTH);
    fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
    this.complete();
  },
  /**
   * Creates and returns a copy of this object.
   * @returns {Date.Gregorian}
   */
  clone: function () {
    if (this.time === undefined) {
      this.computeTime();
    }
    var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
    cal.setTime(this.time);
    return cal;
  },

  /**
   * Compares this GregorianCalendar to the specified Object.
   * The result is true if and only if the argument is a GregorianCalendar object
   * that represents the same time value (millisecond offset from the Epoch)
   * under the same Calendar parameters and Gregorian change date as this object.
   * @param {Date.Gregorian} obj the object to compare with.
   * @returns {boolean} true if this object is equal to obj; false otherwise.
   */
  equals: function (obj) {
    return this.getTime() === obj.getTime() &&
      this.firstDayOfWeek === obj.firstDayOfWeek &&
      this.timezoneOffset === obj.timezoneOffset &&
      this.minimalDaysInFirstWeek === obj.minimalDaysInFirstWeek;
  },

  /**
   * Sets all the calendar field values or specified field and the time value
   * (millisecond offset from the Epoch) of this Calendar undefined.
   * This means that isSet() will return false for all the calendar fields,
   * and the date and time calculations will treat the fields as if they had never been set.
   * @param [field] the calendar field to be cleared.
   */
  clear: function (field) {
    if (field === undefined) {
      this.field = [];
    } else {
      this.fields[field] = undefined;
    }
    this.time = undefined;
    this.fieldsComputed = false;
  }
};

var GregorianCalendarProto = GregorianCalendar.prototype;

Utils.each(fields, function (f, index) {
  if (f) {
    GregorianCalendarProto['get' + f] = function () {
      return this.get(index);
    };

    GregorianCalendarProto['isSet' + f] = function () {
      return this.isSet(index);
    };

    GregorianCalendarProto['set' + f] = function (v) {
      return this.set(index, v);
    };

    GregorianCalendarProto['add' + f] = function (v) {
      return this.add(index, v);
    };

    GregorianCalendarProto['roll' + f] = function (v) {
      return this.roll(index, v);
    };
  }
});

// ------------------- private start

function adjustDayOfMonth(self) {
  var fields = self.fields;
  var year = fields[YEAR];
  var month = fields[MONTH];
  var monthLen = getMonthLength(year, month);
  var dayOfMonth = fields[DAY_OF_MONTH];
  if (dayOfMonth > monthLen) {
    self.set(DAY_OF_MONTH, monthLen);
  }
}

function getMonthLength(year, month) {
  return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
}

function getYearLength(year) {
  return isLeapYear(year) ? 366 : 365;
}

function getWeekNumber(self, fixedDay1, fixedDate) {
  var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
  var nDays = (fixedDay1st - fixedDay1);
  if (nDays >= self.minimalDaysInFirstWeek) {
    fixedDay1st -= 7;
  }
  var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
  return floorDivide(normalizedDayOfPeriod / 7) + 1;
}

function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
  // 1.1.1 is monday
  // one week has 7 days
  return fixedDate - mod(fixedDate - dayOfWeek, 7);
}

// ------------------- private end

module.exports = GregorianCalendar;
/*
 http://docs.oracle.com/javase/7/docs/api/java/util/GregorianCalendar.html

 TODO
 - day saving time
 - i18n
 - julian calendar
 */

},{"./const":5,"./locale/en-us":7,"./utils":9}],7:[function(require,module,exports){
/**
 * en-us locale
 * @ignore
 * @author yiminghe@gmail.com
 */
module.exports = {
    // in minutes
    timezoneOffset: -8 * 60,
    firstDayOfWeek: 0,
    minimalDaysInFirstWeek: 1,

    // DateFormatSymbols
    eras: ['BC', 'AD'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
        'Saturday'],
    shortWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ampms: ['AM', 'PM'],
    datePatterns: ['EEEE, MMMM d, yyyy', 'MMMM d, yyyy', 'MMM d, yyyy', 'M/d/yy'],
    timePatterns: ['h:mm:ss a \'GMT\'Z', 'h:mm:ss a', 'h:mm:ss a', 'h:mm a'],
    dateTimePattern: '{date} {time}'
};

},{}],8:[function(require,module,exports){
/**
 * zh-cn locale
 * @ignore
 * @author yiminghe@gmail.com
 */
module.exports = {
    // in minutes
    timezoneOffset: 8 * 60,
    firstDayOfWeek: 1,
    minimalDaysInFirstWeek: 1,

    // DateFormatSymbols
    eras: ['公元前', '公元'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'],
    shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'],
    weekdays: ['星期天', '星期一', '星期二', '星期三', '星期四',
        '星期五', '星期六'],
    shortWeekdays: ['周日', '周一', '周二', '周三', '周四', '周五',
        '周六'],
    ampms: ['上午', '下午'],
    /*jshint quotmark: false*/
    datePatterns: ["yyyy'年'M'月'd'日' EEEE", "yyyy'年'M'月'd'日'", "yyyy-M-d", "yy-M-d"],
    timePatterns: ["ahh'时'mm'分'ss'秒' 'GMT'Z", "ahh'时'mm'分'ss'秒'", "H:mm:ss", "ah:mm"],
    dateTimePattern: '{date} {time}'
};

},{}],9:[function(require,module,exports){
/**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */

var Const = require('./const');
var floor = Math.floor;
var ACCUMULATED_DAYS_IN_MONTH
        //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],

    ACCUMULATED_DAYS_IN_MONTH_LEAP
        //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        = [0, 31, 59 + 1, 90 + 1, 120 + 1, 151 + 1, 181 + 1,
            212 + 1, 243 + 1, 273 + 1, 304 + 1, 334 + 1],

    DAYS_OF_YEAR = 365,
    DAYS_OF_4YEAR = 365 * 4 + 1,
    DAYS_OF_100YEAR = DAYS_OF_4YEAR * 25 - 1,
    DAYS_OF_400YEAR = DAYS_OF_100YEAR * 4 + 1;

function getDayOfYear(year, month, dayOfMonth) {
    return dayOfMonth + (exports.isLeapYear(year) ?
        ACCUMULATED_DAYS_IN_MONTH_LEAP[month] :
        ACCUMULATED_DAYS_IN_MONTH[month]);
}

function getDayOfWeekFromFixedDate(fixedDate) {
    // The fixed day 1 (January 1, 1 Gregorian) is Monday.
    if (fixedDate >= 0) {
        return fixedDate % 7;
    }
    return exports.mod(fixedDate, 7);
}

function getGregorianYearFromFixedDate(fixedDate) {
    var d0;
    var d1, d2, d3;//, d4;
    var n400, n100, n4, n1;
    var year;
    d0 = fixedDate - 1;

    n400 = floor(d0 / DAYS_OF_400YEAR);
    d1 = exports.mod(d0, DAYS_OF_400YEAR);
    n100 = floor(d1 / DAYS_OF_100YEAR);
    d2 = exports.mod(d1, DAYS_OF_100YEAR);
    n4 = floor(d2 / DAYS_OF_4YEAR);
    d3 = exports.mod(d2, DAYS_OF_4YEAR);
    n1 = floor(d3 / DAYS_OF_YEAR);

    year = 400 * n400 + 100 * n100 + 4 * n4 + n1;

    // ?
    if (!(n100 === 4 || n1 === 4)) {
        ++year;
    }

    return year;
}

var exports = module.exports = {
    each: function (arr, fn) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (fn(arr[i], i, arr) === false) {
                break;
            }
        }
    },

    mix: function (t, s) {
        for (var p in s) {
            t[p] = s[p];
        }
    },

    isLeapYear: function (year) {
        if ((year & 3) !== 0) {
            return false;
        }
        return (year % 100 !== 0) || (year % 400 === 0);
    },

    mod: function (x, y) {
        // 负数时不是镜像关系
        return (x - y * floor(x / y));
    },

    // month: 0 based
    getFixedDate: function (year, month, dayOfMonth) {
        var prevYear = year - 1;
        // 考虑公元前
        return DAYS_OF_YEAR * prevYear + floor(prevYear / 4) -
            floor(prevYear / 100) + floor(prevYear / 400) +
            getDayOfYear(year, month, dayOfMonth);
    },

    getGregorianDateFromFixedDate: function (fixedDate) {
        var year = getGregorianYearFromFixedDate(fixedDate);
        var jan1 = exports.getFixedDate(year, Const.JANUARY, 1);
        var isLeap = exports.isLeapYear(year);
        var ACCUMULATED_DAYS = isLeap ? ACCUMULATED_DAYS_IN_MONTH_LEAP : ACCUMULATED_DAYS_IN_MONTH;
        var daysDiff = fixedDate - jan1;
        var month, i;

        for (i = 0; i < ACCUMULATED_DAYS.length; i++) {
            if (ACCUMULATED_DAYS[i] <= daysDiff) {
                month = i;
            } else {
                break;
            }
        }

        var dayOfMonth = fixedDate - jan1 - ACCUMULATED_DAYS[month] + 1;
        var dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);

        return {
            year: year,
            month: month,
            dayOfMonth: dayOfMonth,
            dayOfWeek: dayOfWeek,
            isLeap: isLeap
        };
    }
};
},{"./const":5}],10:[function(require,module,exports){
module.exports = require('./lib/Calendar');
module.exports.Picker = require('./lib/Picker');

},{"./lib/Calendar":11,"./lib/Picker":14}],11:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

/**
 * Calendar ui component for React
 */
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var DATE_ROW_COUNT = 6;
var DATE_COL_COUNT = 7;
var DateTimeFormat = require('gregorian-calendar-format');
var GregorianCalendar = require('gregorian-calendar');
var KeyCode = require('./util').KeyCode;
var MonthPanel = require('./MonthPanel');
var util = require('./util');
var Time = require('./Time');

function noop() {
}

function getIdFromDate(d) {
  return 'rc-calendar-' + d.getYear() +
    '-' + d.getMonth() + '-' +
    d.getDayOfMonth();
}

function goStartMonth(self) {
  var next = self.state.value.clone();
  next.setDayOfMonth(1);
  self.setState({value: next});
}

function goEndMonth(self) {
  var next = self.state.value.clone();
  next.setDayOfMonth(next.getActualMaximum(GregorianCalendar.MONTH));
  self.setState({value: next});
}

function goMonth(self, direction) {
  var next = self.state.value.clone();
  next.addMonth(direction);
  self.setState({value: next});
}

function goYear(self, direction) {
  var next = self.state.value.clone();
  next.addYear(direction);
  self.setState({value: next});
}

function goWeek(self, direction) {
  var next = self.state.value.clone();
  next.addWeekOfYear(direction);
  self.setState({value: next});
}

function goDay(self, direction) {
  var next = self.state.value.clone();
  next.addDayOfMonth(direction);
  self.setState({value: next});
}

function isSameDay(one, two) {
  return one.getYear() === two.getYear() &&
    one.getMonth() === two.getMonth() &&
    one.getDayOfMonth() === two.getDayOfMonth();
}
//
//function isSameMonth(one, two) {
//  return one.getYear() === two.getYear() &&
//    one.getMonth() === two.getMonth();
//}

function beforeCurrentMonthYear(current, today) {
  if (current.getYear() < today.getYear()) {
    return 1;
  }
  return current.getYear() === today.getYear() &&
    current.getMonth() < today.getMonth();
}

function afterCurrentMonthYear(current, today) {
  if (current.getYear() > today.getYear()) {
    return 1;
  }
  return current.getYear() === today.getYear() &&
    current.getMonth() > today.getMonth();
}

var Calendar = React.createClass({displayName: "Calendar",
  propTypes: {
    className: React.PropTypes.string,
    orient: React.PropTypes.arrayOf(React.PropTypes.oneOf(['left', 'top', 'right', 'bottom'])),
    locale: React.PropTypes.object,
    showWeekNumber: React.PropTypes.bool,
    showToday: React.PropTypes.bool,
    showTime: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onBlur: React.PropTypes.func
  },

  prefixClsFn: util.prefixClsFn,

  getInitialState: function () {
    var value = this.props.value;
    if (!value) {
      value = new GregorianCalendar();
      value.setTime(Date.now());
    }
    return {
      orient: this.props.orient,
      prefixCls: this.props.prefixCls || 'rc-calendar',
      value: value
    };
  },

  getDefaultProps: function () {
    return {
      locale: require('./locale/en-us'),
      onKeyDown: noop,
      className: '',
      showToday: true,
      onSelect: noop,
      onFocus: noop,
      onBlur: noop
    };
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.value) {
      this.setState({
        value: nextProps.value
      });
    }
  },

  goMonth: function (direction) {
    var next = this.state.value.clone();
    next.addMonth(direction);
    this.setState({
      value: next
    });
  },

  goYear: function (direction) {
    var next = this.state.value.clone();
    next.addYear(direction);
    this.setState({
      value: next
    });
  },

  nextMonth: function () {
    this.goMonth(1);
  },

  previousMonth: function () {
    this.goMonth(-1);
  },

  nextYear: function () {
    this.goYear(1);
  },

  previousYear: function () {
    this.goYear(-1);
  },

  handleSelect: function (current, byKeyBoard) {
    var props = this.props;
    this.setState({
      value: current
    });
    if (!byKeyBoard) {
      props.onSelect(current);
    }
  },

  handleDayClick: function (current) {
    this.handleSelect(current);
  },

  chooseToday: function () {
    var today = this.state.value.clone();
    today.setTime(Date.now());
    this.setState({
      value: today
    });
  },

  handleKeyDown: function (e) {
    var self = this;
    var keyCode = e.keyCode;
    // mac
    var ctrlKey = e.ctrlKey || e.metaKey;
    switch (keyCode) {
      case KeyCode.DOWN:
        goWeek(self, 1);
        e.preventDefault();
        return true;
      case KeyCode.UP:
        goWeek(self, -1);
        e.preventDefault();
        return true;
      case KeyCode.LEFT:
        if (ctrlKey) {
          goYear(self, -1);
        } else {
          goDay(self, -1);
        }
        e.preventDefault();
        return true;
      case KeyCode.RIGHT:
        if (ctrlKey) {
          goYear(self, 1);
        } else {
          goDay(self, 1);
        }
        e.preventDefault();
        return true;
      case KeyCode.HOME:
        goStartMonth(self);
        e.preventDefault();
        return true;
      case KeyCode.END:
        goEndMonth(self);
        e.preventDefault();
        return true;
      case KeyCode.PAGE_DOWN:
        goMonth(self, 1);
        e.preventDefault();
        return true;
      case KeyCode.PAGE_UP:
        goMonth(self, -1);
        e.preventDefault();
        return true;
      case KeyCode.ENTER:
        self.props.onSelect(self.state.value);
        e.preventDefault();
        return true;
    }
    self.props.onKeyDown(e);
  },

  showMonthPanel: function () {
    this.setState({
      showMonthPanel: 1
    });
  },

  onMonthPanelSelect: function (current) {
    this.setState({
      value: current,
      showMonthPanel: 0
    });
  },

  renderDates: function () {
    var props = this.props;
    var self = this,
      i, j,
      dateTable = [],
      current,
      showWeekNumber = props.showWeekNumber,
      locale = props.locale,
      value = this.state.value,
      today = value.clone(),
      prefixClsFn = this.prefixClsFn,
      cellClass = prefixClsFn('cell'),
      weekNumberCellClass = prefixClsFn('week-number-cell'),
      dateClass = prefixClsFn('date'),
      dateRender = props.dateRender,
      disabledDate = props.disabledDate,
      dateLocale = value.getLocale(),
      dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale),
      todayClass = prefixClsFn('today'),
      selectedClass = prefixClsFn('selected-day'),
      lastMonthDayClass = prefixClsFn('last-month-cell'),
      nextMonthDayClass = prefixClsFn('next-month-btn-day'),
      disabledClass = prefixClsFn('disabled-cell');
    today.setTime(Date.now());
    var month1 = value.clone();
    month1.set(value.getYear(), value.getMonth(), 1);
    var day = month1.getDayOfWeek();
    var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
    // calculate last month
    var lastMonth1 = month1.clone();
    lastMonth1.addDayOfMonth(0 - lastMonthDiffDay);
    var passed = 0;
    for (i = 0; i < DATE_ROW_COUNT; i++) {
      for (j = 0; j < DATE_COL_COUNT; j++) {
        current = lastMonth1;
        if (passed) {
          current = current.clone();
          current.addDayOfMonth(passed);
        }
        dateTable.push(current);
        passed++;
      }
    }
    var tableHtml = [];
    passed = 0;
    for (i = 0; i < DATE_ROW_COUNT; i++) {
      var weekNumberCell;
      var dateCells = [];
      if (showWeekNumber) {
        weekNumberCell = (React.createElement("td", {key: dateTable[passed].getWeekOfYear(), role: "gridcell", className: weekNumberCellClass}, dateTable[passed].getWeekOfYear()));
      }
      for (j = 0; j < DATE_COL_COUNT; j++) {
        current = dateTable[passed];
        var cls = cellClass;
        var disabled = false;
        var selected = false;

        if (isSameDay(current, today)) {
          cls += ' ' + todayClass;
        }
        if (isSameDay(current, value)) {
          cls += ' ' + selectedClass;
          selected = true;
        }
        if (beforeCurrentMonthYear(current, value)) {
          cls += ' ' + lastMonthDayClass;
        }
        if (afterCurrentMonthYear(current, value)) {
          cls += ' ' + nextMonthDayClass;
        }
        if (disabledDate && disabledDate(current, value)) {
          cls += ' ' + disabledClass;
          disabled = true;
        }

        var dateHtml;
        if (!(dateRender && (dateHtml = dateRender(current, value)))) {
          dateHtml = (
            React.createElement("span", {
              key: getIdFromDate(current), 
              className: dateClass, 
              "aria-selected": selected, 
              "aria-disabled": disabled}, 
              current.getDayOfMonth()
            ));
        }

        dateCells.push(
          React.createElement("td", {key: passed, onClick: disabled ? noop : this.handleDayClick.bind(this, current), role: "gridcell", title: dateFormatter.format(current), className: cls}, 
        dateHtml
          ));

        passed++;
      }
      tableHtml.push(
        React.createElement("tr", {
          key: i, 
          role: "row"}, 
          weekNumberCell, 
          dateCells
        ));
    }
    self.dateTable = dateTable;
    return tableHtml;
  },

  getTodayTime: function () {
    var self = this;
    var locale = self.props.locale;
    var value = self.state.value;
    var dateLocale = value.getLocale();
    var today = value.clone();
    today.setTime(Date.now());
    return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
  },

  getMonthYear: function () {
    var self = this;
    var locale = self.props.locale;
    var value = self.state.value;
    var dateLocale = value.getLocale();
    return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
  },

  onFocus: function () {
    if (this._blurTimer) {
      clearTimeout(this._blurTimer);
      this._blurTimer = null;
    } else {
      this.props.onFocus();
    }
  },

  onBlur: function () {
    if (this._blurTimer) {
      clearTimeout(this._blurTimer);
    }
    var self = this;
    this._blurTimer = setTimeout(function () {
      self.props.onBlur();
    }, 100);
  },

  render: function () {
    var showWeekNumberEl;
    var props = this.props;
    var locale = props.locale;
    var state = this.state;
    var value = state.value;
    var dateLocale = value.getLocale();
    var veryShortWeekdays = [];
    var weekDays = [];
    var firstDayOfWeek = value.getFirstDayOfWeek();
    var prefixCls = state.prefixCls;
    var prefixClsFn = this.prefixClsFn;

    for (var i = 0; i < DATE_COL_COUNT; i++) {
      var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
      veryShortWeekdays[i] = locale.veryShortWeekdays[index];
      weekDays[i] = dateLocale.weekdays[index];
    }

    if (props.showWeekNumber) {
      showWeekNumberEl = (
        React.createElement("th", {role: "columnheader", className: prefixClsFn("column-header", "week-number-header")}, 
          React.createElement("span", {className: prefixClsFn("column-header-inner")}, "x")
        ));
    }
    var weekDaysEls = weekDays.map(function (value, xindex) {
      return (
        React.createElement("th", {key: xindex, role: "columnheader", title: value, className: prefixClsFn("column-header")}, 
          React.createElement("span", {className: prefixClsFn("column-header-inner")}, 
          veryShortWeekdays[xindex]
          )
        ));
    });
    var footerEl;
    if (props.showToday || props.showTime) {
      var todayEl;
      if (props.showToday) {
        todayEl = (React.createElement("a", {className: prefixClsFn("today-btn"), 
          role: "button", 
          onClick: this.chooseToday, 
          title: this.getTodayTime()}, locale.today));
      }
      var timeEl;
      if (props.showTime) {
        timeEl = (React.createElement(Time, {value: value, rootPrefixCls: prefixCls, prefixClsFn: prefixClsFn, locale: locale, onChange: this.handleSelect}));
      }
      footerEl = (
        React.createElement("div", {className: prefixClsFn("footer")}, 
        timeEl, 
        todayEl
        ));
    }

    var monthPanel;
    if (state.showMonthPanel) {
      monthPanel = React.createElement(MonthPanel, {locale: locale, value: value, rootPrefixCls: state.prefixCls, onSelect: this.onMonthPanelSelect});
    }

    var className = prefixCls;
    if (props.className) {
      className += ' ' + props.className;
    }
    var orient = state.orient;
    if (orient) {
      orient.forEach(function (o) {
        className += ' ' + prefixClsFn('orient-' + o);
      });
    }
    return (
      React.createElement("div", {className: className, tabIndex: "0", onFocus: this.onFocus, onBlur: this.onBlur, onKeyDown: this.handleKeyDown}, 
        React.createElement("div", {style: {outline: 'none'}}, 
          React.createElement("div", {className: prefixClsFn("header")}, 
            React.createElement("a", {className: prefixClsFn("prev-year-btn"), 
              role: "button", 
              onClick: this.previousYear, 
              title: locale.previousYear}, 
              "«"
            ), 
            React.createElement("a", {className: prefixClsFn("prev-month-btn"), 
              role: "button", 
              onClick: this.previousMonth, 
              title: locale.previousMonth}, 
              "‹"
            ), 
            React.createElement("a", {className: prefixClsFn("month-select"), 
              role: "button", 
              onClick: this.showMonthPanel, 
              title: locale.monthSelect}, 
              React.createElement("span", {className: prefixClsFn("month-select-content")}, this.getMonthYear()), 
              React.createElement("span", {className: prefixClsFn("month-select-arrow")}, "x")
            ), 
            React.createElement("a", {className: prefixClsFn("next-month-btn"), 
              onClick: this.nextMonth, 
              title: locale.nextMonth}, 
              "›"
            ), 
            React.createElement("a", {className: prefixClsFn("next-year-btn"), 
              onClick: this.nextYear, 
              title: locale.nextYear}, 
              "»"
            )
          ), 
          React.createElement("div", {className: prefixClsFn("calendar-body")}, 
            React.createElement("table", {className: prefixClsFn("table"), cellSpacing: "0", role: "grid"}, 
              React.createElement("thead", null, 
                React.createElement("tr", {role: "row"}, 
              showWeekNumberEl, 
              weekDaysEls
                )
              ), 
              React.createElement("tbody", {className: prefixClsFn("tbody")}, 
            this.renderDates()
              )
            )
          ), 
        footerEl
        ), 
      monthPanel
      ));
  }
});
module.exports = Calendar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./MonthPanel":13,"./Time":15,"./locale/en-us":18,"./util":20,"gregorian-calendar":4,"gregorian-calendar-format":2}],12:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var ROW = 3;
var COL = 4;
var cx = require('./util').cx;
var util = require('./util');

function goYear(self, direction) {
  var next = self.state.value.clone();
  next.addYear(direction);
  self.setState({value: next});
}

var DecadePanel = React.createClass({displayName: "DecadePanel",
  getInitialState: function () {
    return {
      value: this.props.value,
      prefixCls: this.props.rootPrefixCls + '-decade-panel'
    };
  },

  prefixClsFn: util.prefixClsFn,

  getDefaultProps: function () {
    return {
      onSelect: function () {
      }
    };
  },

  nextCentury: function (e) {
    goYear(this, 100);
    e.preventDefault();
  },

  previousCentury: function (e) {
    goYear(this, -100);
    e.preventDefault();
  },

  chooseDecade: function (year, e) {
    var next = this.state.value.clone();
    next.setYear(year);
    this.props.onSelect(next);
    e.preventDefault();
  },

  render: function () {
    var value = this.state.value;
    var locale = this.props.locale;
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 100, 10) * 100;
    var preYear = startYear - 10;
    var endYear = startYear + 99;
    var decades = [];
    var index = 0;
    var prefixClsFn = this.prefixClsFn;

    for (var i = 0; i < ROW; i++) {
      decades[i] = [];
      for (var j = 0; j < COL; j++) {
        decades[i][j] = {
          startDecade: preYear + index * 10,
          endDecade: preYear + index * 10 + 9
        };
        index++;
      }
    }

    var self = this;
    var decadesEls = decades.map(function (row, index) {
      var tds = row.map(function (d) {
        var startDecade = d.startDecade;
        var endDecade = d.endDecade;
        var classNameMap = {};
        classNameMap[prefixClsFn('cell')] = 1;
        classNameMap[prefixClsFn('selected-cell')] = startDecade <= currentYear && currentYear <= endDecade;
        classNameMap[prefixClsFn('last-century-cell')] = startDecade < startYear;
        classNameMap[prefixClsFn('next-century-cell')] = endDecade > endYear;
        return (React.createElement("td", {
          key: startDecade, 
          onClick: self.chooseDecade.bind(self, startDecade), 
          role: "gridcell", 
          className: cx(classNameMap)
        }, 
          React.createElement("a", {
            className: prefixClsFn('decade')}, 
             startDecade, 
            React.createElement("br", null), 
            "-", 
            React.createElement("br", null), endDecade
          )
        ));
      });
      return (React.createElement("tr", {key: index, role: "row"}, tds));
    });

    return (
      React.createElement("div", {className: this.state.prefixCls}, 
        React.createElement("div", {className: prefixClsFn('header')}, 
          React.createElement("a", {className: prefixClsFn('prev-century-btn'), 
            role: "button", 
            onClick: this.previousCentury, 
            title: locale.previousCentury}, 
            "«"
          ), 
          React.createElement("div", {className: prefixClsFn('century')}, 
                startYear, "-", endYear
          ), 
          React.createElement("a", {className: prefixClsFn('next-century-btn'), 
            role: "button", 
            onClick: this.nextCentury, 
            title: locale.nextCentury}, 
            "»"
          )
        ), 
        React.createElement("div", {className: prefixClsFn('body')}, 
          React.createElement("table", {className: prefixClsFn('table'), cellSpacing: "0", role: "grid"}, 
            React.createElement("tbody", {className: prefixClsFn('tbody')}, 
            decadesEls
            )
          )
        )
      ));
  }
});

module.exports = DecadePanel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util":20}],13:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var DateTimeFormat = require('gregorian-calendar-format');
var ROW = 3;
var COL = 4;
var cx = require('./util').cx;
var YearPanel = require('./YearPanel');
var util = require('./util');

function goYear(self, direction) {
  var next = self.state.value.clone();
  next.addYear(direction);
  self.setState({value: next});
}

var MonthPanel = React.createClass({displayName: "MonthPanel",
  prefixClsFn: util.prefixClsFn,

  getInitialState: function () {
    return {
      value: this.props.value,
      prefixCls: this.props.rootPrefixCls + '-month-panel'

    };
  },

  getDefaultProps: function () {
    return {
      onSelect: function () {
      }
    };
  },

  nextYear: function () {
    goYear(this, 1);
  },

  previousYear: function () {
    goYear(this, -1);
  },

  chooseMonth: function (month) {
    var next = this.state.value.clone();
    next.setMonth(month);
    this.props.onSelect(next);
  },

  showYearPanel: function () {
    this.setState({
      showYearPanel: 1
    });
  },

  onYearPanelSelect: function (current) {
    this.setState({
      value: current,
      showYearPanel: 0
    });
  },

  getMonths: function () {
    var props = this.props;
    var value = this.state.value;
    var current = value.clone();
    var locale = props.locale;
    var monthYearFormat = locale.monthYearFormat;
    var dateLocale = value.getLocale();
    var dateFormatter = new DateTimeFormat(monthYearFormat, dateLocale);
    var months = [];
    var shortMonths = dateLocale.shortMonths;
    var index = 0;
    for (var i = 0; i < ROW; i++) {
      months[i] = [];
      for (var j = 0; j < COL; j++) {
        current.setMonth(index);
        months[i][j] = {
          value: index,
          content: shortMonths[index],
          title: dateFormatter.format(current)
        };
        index++;
      }
    }

    return months;
  },

  render: function () {
    var self = this;
    var props = this.props;
    var value = this.state.value;
    var locale = props.locale;
    var months = this.getMonths();
    var year = value.getYear();
    var currentMonth = value.getMonth();
    var prefixClsFn = this.prefixClsFn;
    var monthsEls = months.map(function (month, index) {
      var tds = month.map(function (m) {
        var classNameMap = {};
        classNameMap[prefixClsFn('cell')] = 1;
        classNameMap[prefixClsFn('selected-cell')] = m.value === currentMonth;
        return (
          React.createElement("td", {role: "gridcell", 
            key: m.value, 
            onClick: self.chooseMonth.bind(self, m.value), 
            title: m.title, 
            className: cx(classNameMap)}, 
            React.createElement("a", {
              className: prefixClsFn('month')}, 
            m.content
            )
          ));
      });
      return (React.createElement("tr", {key: index, role: "row"}, tds));
    });

    var yearPanel;
    if (this.state.showYearPanel) {
      yearPanel = React.createElement(YearPanel, {locale: locale, value: value, rootPrefixCls: props.rootPrefixCls, onSelect: this.onYearPanelSelect});
    }

    return (
      React.createElement("div", {className: this.state.prefixCls}, 
        React.createElement("div", null, 
          React.createElement("div", {className: prefixClsFn('header')}, 
            React.createElement("a", {className: prefixClsFn('prev-year-btn'), 
              role: "button", 
              onClick: this.previousYear, 
              title: locale.previousYear}, 
              "«"
            ), 

            React.createElement("a", {className: prefixClsFn('year-select'), 
              role: "button", 
              onClick: this.showYearPanel, 
              title: locale.yearSelect}, 
              React.createElement("span", {className: prefixClsFn('year-select-content')}, year), 
              React.createElement("span", {className: prefixClsFn('year-select-arrow')}, "x")
            ), 

            React.createElement("a", {className: prefixClsFn('next-year-btn'), 
              role: "button", 
              onClick: this.nextYear, 
              title: locale.nextYear}, 
              "»"
            )
          ), 
          React.createElement("div", {className: prefixClsFn('body')}, 
            React.createElement("table", {className: prefixClsFn('table'), cellSpacing: "0", role: "grid"}, 
              React.createElement("tbody", {className: prefixClsFn('tbody')}, 
              monthsEls
              )
            )
          )
        ), 
      yearPanel
      ));
  }
});

module.exports = MonthPanel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./YearPanel":17,"./util":20,"gregorian-calendar-format":2}],14:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var DateTimeFormat = require('gregorian-calendar-format');
var cloneWithProps = require('./utils/cloneWithProps');
var createChainedFunction = require('./util').createChainedFunction;
var KeyCode = require('./util').KeyCode;
var domAlign = require('dom-align');
var orientMap = {
  tl: ['top', 'left'],
  tr: ['top', 'right'],
  bl: ['bottom', 'left'],
  br: ['bottom', 'right']
};

/**
 * DatePicker = wrap input using Calendar
 */
var Picker = React.createClass({displayName: "Picker",
  propTypes: {
    onChange: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      prefixCls: 'rc-calendar-picker',
      onChange: function () {
      },
      formatter: new DateTimeFormat('yyyy-MM-dd', require('gregorian-calendar/lib/locale/en-us'))
    };
  },

  getInitialState: function () {
    return {
      open: this.props.open,
      value: this.props.value,
      orient: this.props.calendar.props.orient || ['top', 'left']
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      value: nextProps.value
    });
  },

  handleInputClick: function () {
    this.setState({
      open: true
    });
  },

  handleKeyDown: function (e) {
    // down
    if (e.keyCode === KeyCode.DOWN) {
      e.preventDefault();
      this.handleInputClick();
    }
  },

  handleCalendarKeyDown: function (e) {
    var self = this;
    if (e.keyCode === KeyCode.ESC) {
      e.stopPropagation();
      self.setState({
        open: false
      }, function () {
        self.refs.input.getDOMNode().focus();
      });
    }
  },

  handleCalendarSelect: function (value) {
    var self = this;
    var currentValue = this.state.value;
    if (this.props.calendar.props.showTime) {
      this.setState({
        value: value
      });
    } else {
      self.setState({
        value: value,
        open: false
      }, function () {
        self.refs.input.getDOMNode().focus();
      });
    }
    if (!currentValue || currentValue.getTime() !== value.getTime()) {
      self.props.onChange(value);
    }
  },

  handleCalendarBlur: function () {
    // if invisible, will not trigger blur
    this.setState({
      open: false
    });
  },

  componentDidMount: function () {
    this.componentDidUpdate();
  },

  componentDidUpdate: function () {
    var refs = this.refs;
    if (this.state.open && !this._lastOpen) {
      var orient = this.state.orient;
      var points = ['tl', 'bl'];
      var offset = [0, 5];
      if (orient.indexOf('top') !== -1 && orient.indexOf('left') !== -1) {
        points = ['tl', 'bl'];
      } else if (orient.indexOf('top') !== -1 && orient.indexOf('right') !== -1) {
        points = ['tr', 'br'];
      } else if (orient.indexOf('bottom') !== -1 && orient.indexOf('left') !== -1) {
        points = ['bl', 'tl'];
        offset = [0, -5];
      } else if (orient.indexOf('bottom') !== -1 && orient.indexOf('right') !== -1) {
        points = ['br', 'tr'];
        offset = [0, -5];
      }

      var align = domAlign(refs.calendar.getDOMNode(), refs.input.getDOMNode(), {
        points: points,
        offset: offset,
        overflow: {
          adjustX: 1,
          adjustY: 1
        }
      });
      points = align.points;
      var newOrient = orientMap[points[0]];
      this.refs.calendar.setState({
        orient: newOrient
      });
      this.refs.calendar.getDOMNode().focus();
    }
    this._lastOpen = this.state.open;
  },

  render: function () {
    var props = this.props;
    var input = props.children;
    var state = this.state;
    var value = state.value;
    var calendar = this._cacheCalendar;
    if (state.open) {
      this._cacheCalendar = calendar = cloneWithProps(props.calendar, {
        ref: 'calendar',
        value: value,
        // focused: true,
        orient: state.orient,
        onBlur: this.handleCalendarBlur,
        onKeyDown: this.handleCalendarKeyDown,
        onSelect: createChainedFunction(this.handleCalendarSelect, props.calendar.props.onSelect)
      });
    }
    var inputValue = '';
    if (value) {
      inputValue = props.formatter.format(value);
    }
    input = cloneWithProps(input, {
      ref: 'input',
      readOnly: true,
      onClick: this.handleInputClick,
      value: inputValue,
      onKeyDown: this.handleKeyDown
    });
    var classes = [props.prefixCls];
    if (state.open) {
      classes.push(props.prefixCls + '-open');
    }
    return React.createElement("span", {className: classes.join(' ')}, [input, calendar]);
  }
});

module.exports = Picker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util":20,"./utils/cloneWithProps":22,"dom-align":24,"gregorian-calendar-format":2,"gregorian-calendar/lib/locale/en-us":7}],15:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

/**
 * time component for Calendar
 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var util = require('./util');
var KeyCode = util.KeyCode;
var TimePanel = require('./TimePanel');

function padding(number) {
  if (number < 10) {
    number = '0' + number;
  }
  return number;
}

function loop(value, min, max) {
  if (value === min - 1) {
    value = max;
  } else if (value === max + 1) {
    value = min;
  }
  return value;
}

function keyDownWrap(method, min, max) {
  return function (e) {
    var value = e.target.value;
    var number = parseInt(value, 10);
    var keyCode = e.keyCode;
    var handled;
    if (keyCode === KeyCode.DOWN) {
      number++;
      e.stopPropagation();
      e.preventDefault();
      handled = 1;
    } else if (keyCode === KeyCode.UP) {
      number--;
      e.stopPropagation();
      e.preventDefault();
      handled = 1;
    }
    if (handled){
      number = loop(number, min, max);
      var time = this.props.value.clone();
      time[method](number);
      this.props.onChange(time,1);
    }
  };
}

var Time = React.createClass({displayName: "Time",
  getInitialState: function () {
    return {
      showHourPanel: 0,
      showMinutePanel: 0,
      showSecondPanel: 0
    };
  },

  onHourKeyDown: keyDownWrap('setHourOfDay', 0, 23),

  onMinuteKeyDown: keyDownWrap('setMinutes', 0, 59),

  onSecondKeyDown: keyDownWrap('setSeconds', 0, 59),

  onSelectPanel: function (value) {
    this.setState({
      showHourPanel: 0,
      showMinutePanel: 0,
      showSecondPanel: 0
    });
    this.props.onChange(value);
  },

  onHourClick: function () {
    this.setState({
      showHourPanel: 1,
      showMinutePanel: 0,
      showSecondPanel: 0
    });
  },

  onMinuteClick: function () {
    this.setState({
      showHourPanel: 0,
      showMinutePanel: 1,
      showSecondPanel: 0
    });
  },

  onSecondClick: function () {
    this.setState({
      showHourPanel: 0,
      showMinutePanel: 0,
      showSecondPanel: 1
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    var props = this.props;
    var state = this.state;
    var value = props.value;
    var nextValue = nextProps.value;
    return nextState.showHourPanel !== state.showHourPanel ||
      nextState.showMinutePanel !== state.showMinutePanel ||
      nextState.showSecondPanel !== state.showSecondPanel ||
      value.getHourOfDay() !== nextValue.getHourOfDay() ||
      value.getMinutes() !== nextValue.getMinutes() ||
      value.getSeconds() !== nextValue.getSeconds();
  },

  render: function () {
    var state = this.state;
    var props = this.props;
    var prefixClsFn = props.prefixClsFn;
    var value = props.value;
    var locale = props.locale;
    var hour = value.getHourOfDay();
    var minute = value.getMinutes();
    var second = value.getSeconds();
    var panel;
    var commonProps = {
      value: value,
      onSelect: this.onSelectPanel,
      rootPrefixCls: props.rootPrefixCls
    };
    if (state.showHourPanel) {
      panel = React.createElement(TimePanel, React.__spread({rowCount: 6, colCount: 4, getter: "getHourOfDay", setter: "setHourOfDay", 
        title: locale.hourPanelTitle}, 
      commonProps));
    } else if (state.showMinutePanel) {
      panel = React.createElement(TimePanel, React.__spread({rowCount: 6, colCount: 10, getter: "getMinutes", setter: "setMinutes", 
        title: locale.minutePanelTitle}, 
      commonProps));
    } else if (state.showSecondPanel) {
      panel = React.createElement(TimePanel, React.__spread({rowCount: 6, colCount: 10, getter: "getSeconds", setter: "setSeconds", 
        title: locale.secondPanelTitle}, 
      commonProps));
    }
    return (React.createElement("span", null, 
      React.createElement("input", {className: prefixClsFn("time-input"), title: locale.hourInput, readOnly: true, value: padding(hour), 
        onClick: this.onHourClick, 
        onKeyDown: this.onHourKeyDown}), 
      React.createElement("span", null, " : "), 
      React.createElement("input", {className: prefixClsFn("time-input"), title: locale.minuteInput, readOnly: true, value: padding(minute), 
        onClick: this.onMinuteClick, 
        onKeyDown: this.onMinuteKeyDown}), 
      React.createElement("span", null, " : "), 
      React.createElement("input", {className: prefixClsFn("time-input"), title: locale.secondInput, readOnly: true, value: padding(second), 
        onClick: this.onSecondClick, 
        onKeyDown: this.onSecondKeyDown}), 
    panel
    ));
  }
});

module.exports = Time;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./TimePanel":16,"./util":20}],16:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var cx = require('./util').cx;
var util = require('./util');

var TimePanel = React.createClass({displayName: "TimePanel",
  getInitialState: function () {
    return {
      value: this.props.value,
      prefixCls: this.props.rootPrefixCls + '-time-panel'
    };
  },

  prefixClsFn: util.prefixClsFn,

  getDefaultProps: function () {
    return {
      onSelect: function () {
      }
    };
  },

  choose: function (hour, e) {
    var next = this.state.value.clone();
    var method = this.props.setter;
    next[method](hour);
    this.props.onSelect(next);
    e.preventDefault();
  },

  render: function () {
    var value = this.state.value;
    var props = this.props;
    var method = props.getter;
    var currentHour = value[method]();
    var data = [];
    var prefixClsFn = this.prefixClsFn;
    var ROW = props.rowCount;
    var COL = props.colCount;

    for (var i = 0; i < ROW; i++) {
      data[i] = [];
      for (var j = 0; j < COL; j++) {
        data[i][j] = i * COL + j;
      }
    }

    var self = this;
    var hoursEls = data.map(function (row, index) {
      var tds = row.map(function (d) {
        var classNameMap = {};
        classNameMap[prefixClsFn('cell')] = 1;
        classNameMap[prefixClsFn('selected-cell')] = d === currentHour;
        return (React.createElement("td", {
          key: d, 
          onClick: self.choose.bind(self, d), 
          role: "gridcell", 
          className: cx(classNameMap)}, 
          React.createElement("a", {
            className: prefixClsFn('time')}, 
          d
          )
        ));
      });
      return (React.createElement("tr", {key: index, role: "row"}, tds));
    });

    return (
      React.createElement("div", {className: this.state.prefixCls}, 
        React.createElement("div", {className: prefixClsFn('header')}, 
          React.createElement("div", {className: prefixClsFn('title')}, 
                props.title
          )
        ), 
        React.createElement("div", {className: prefixClsFn('body')}, 
          React.createElement("table", {className: prefixClsFn('table'), cellSpacing: "0", role: "grid"}, 
            React.createElement("tbody", {className: prefixClsFn('tbody')}, 
            hoursEls
            )
          )
        )
      ));
  }
});

module.exports = TimePanel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util":20}],17:[function(require,module,exports){
(function (global){
/** @jsx React.DOM */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var DateTimeFormat = require('gregorian-calendar-format');
var ROW = 3;
var COL = 4;
var cx = require('./util').cx;
var DecadePanel = require('./DecadePanel');
var util = require('./util');

function goYear(self, direction) {
  var next = self.state.value.clone();
  next.addYear(direction);
  self.setState({value: next});
}

var YearPanel = React.createClass({displayName: "YearPanel",
  prefixClsFn: util.prefixClsFn,

  getInitialState: function () {
    return {
      value: this.props.value,
      prefixCls: this.props.rootPrefixCls + '-year-panel'
    };
  },

  getDefaultProps: function () {
    return {
      onSelect: function () {
      }
    };
  },

  nextDecade: function () {
    goYear(this, 10);
  },

  previousDecade: function () {
    goYear(this, -10);
  },

  chooseYear: function (year) {
    var next = this.state.value.clone();
    next.setYear(year);
    this.props.onSelect(next);
  },

  showDecadePanel: function () {
    this.setState({
      showDecadePanel: 1
    });
  },

  onDecadePanelSelect: function (current) {
    this.setState({
      value: current,
      showDecadePanel: 0
    });
  },

  getYears: function () {
    var value = this.state.value;
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 10, 10) * 10;
    var preYear = startYear - 1;
    var current = value.clone();
    var locale = this.props.locale;
    var yearFormat = locale.yearFormat;
    var dateLocale = value.getLocale();
    var dateFormatter = new DateTimeFormat(yearFormat, dateLocale);
    var years = [];
    var index = 0;
    for (var i = 0; i < ROW; i++) {
      years[i] = [];
      for (var j = 0; j < COL; j++) {
        current.setYear(preYear + index);
        years[i][j] = {
          content: preYear + index,
          title: dateFormatter.format(current)
        };
        index++;
      }
    }
    return years;
  },

  render: function () {
    var self = this;
    var props = this.props;
    var value = this.state.value;
    var locale = props.locale;
    var years = this.getYears();
    var currentYear = value.getYear();
    var startYear = parseInt(currentYear / 10, 10) * 10;
    var endYear = startYear + 9;
    var prefixClsFn = this.prefixClsFn;

    var yeasEls = years.map(function (row, index) {
      var tds = row.map(function (y) {
        var classNameMap = {};
        classNameMap[prefixClsFn('cell')] = 1;
        classNameMap[prefixClsFn('selected-cell')] = y.content === currentYear;
        classNameMap[prefixClsFn('last-decade-cell')] = y.content < startYear;
        classNameMap[prefixClsFn('next-decade-cell')] = y.content > endYear;
        return (
          React.createElement("td", {role: "gridcell", 
            title: y.title, 
            key: y.content, 
            onClick: self.chooseYear.bind(self, y.content), 
            className: cx(classNameMap)
          }, 
            React.createElement("a", {
              className: prefixClsFn('year')}, 
            y.content
            )
          ));
      });
      return (React.createElement("tr", {key: index, role: "row"}, tds));
    });

    var decadePanel;
    if (this.state.showDecadePanel) {
      decadePanel = React.createElement(DecadePanel, {locale: locale, value: value, rootPrefixCls: props.rootPrefixCls, onSelect: this.onDecadePanelSelect});
    }

    return (
      React.createElement("div", {className: this.state.prefixCls}, 
        React.createElement("div", null, 
          React.createElement("div", {className: prefixClsFn('header')}, 
            React.createElement("a", {className: prefixClsFn('prev-decade-btn'), 
              role: "button", 
              onClick: this.previousDecade, 
              title: locale.previousDecade}, 
              "«"
            ), 

            React.createElement("a", {className: prefixClsFn('decade-select'), 
              role: "button", 
              onClick: this.showDecadePanel, 
              title: locale.decadeSelect}, 
              React.createElement("span", {className: prefixClsFn('decade-select-content')}, 
                startYear, "-", endYear
              ), 
              React.createElement("span", {className: prefixClsFn('decade-select-arrow')}, "x")
            ), 

            React.createElement("a", {className: prefixClsFn('next-decade-btn'), 
              role: "button", 
              onClick: this.nextDecade, 
              title: locale.nextDecade}, 
              "»"
            )
          ), 
          React.createElement("div", {className: prefixClsFn('body')}, 
            React.createElement("table", {className: prefixClsFn('table'), cellSpacing: "0", role: "grid"}, 
              React.createElement("tbody", {className: prefixClsFn('tbody')}, 
              yeasEls
              )
            )
          )
        ), 
      decadePanel
      ));
  }
});

module.exports = YearPanel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./DecadePanel":12,"./util":20,"gregorian-calendar-format":2}],18:[function(require,module,exports){
/**
 * i18n resources for date-picker
 * @ignore
 * @author yiminghe@gmail.com
 */
module.exports = {
  today: 'Today',
  clear: 'Clear',
  hourPanelTitle: 'Select hour',
  minutePanelTitle: 'Select minute',
  secondPanelTitle: 'Select second',
  monthSelect: 'Choose a month',
  yearSelect: 'Choose a year',
  decadeSelect: 'Choose a decade',
  yearFormat: 'yyyy',
  dateFormat: 'M/d/yyyy',
  monthYearFormat: 'MMMM yyyy',
  previousMonth: 'Previous month (PageUp)',
  nextMonth: 'Next month (PageDown)',
  hourInput: 'Last hour(Up), Next hour(Down)',
  minuteInput: 'Last minute(Up), Next minute(Down)',
  secondInput: 'Last second(Up), Next second(Down)',
  previousYear: 'Last year (Control + left)',
  nextYear: 'Next year (Control + right)',
  previousDecade: 'Last decade',
  nextDecade: 'Next decade',
  previousCentury: 'Last century',
  nextCentury: 'Next century',
  veryShortWeekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
};

},{}],19:[function(require,module,exports){
/**
 * i18n resources for date-picker
 * @ignore
 * @author yiminghe@gmail.com
 */
module.exports = ({
  today: '今天',
  clear: '清除',
  previousMonth: '上个月 (翻页上键)',
  nextMonth: '下个月 (翻页下键)',
  monthSelect: '选择月份',
  yearSelect: '选择年份',
  decadeSelect: '选择年代',
  hourInput: '上一小时(上方向键), 下一小时(下方向键)',
  minuteInput: '上一分钟(上方向键), 下一分钟(下方向键)',
  secondInput: '上一秒(上方向键), 下一小时(下方向键)',
  hourPanelTitle: '选择小时',
  minutePanelTitle: '选择分钟',
  secondPanelTitle: '选择秒',
  /*jshint quotmark: false*/
  yearFormat: "yyyy'年'",
  monthYearFormat: "yyyy'年'M'月'",
  dateFormat: "yyyy'年'M'月'd'日'",
  previousYear: '上一年 (Control键加左方向键)',
  nextYear: '下一年 (Control键加右方向键)',
  previousDecade: '上一年代',
  nextDecade: '下一年代',
  previousCentury: '上一世纪',
  nextCentury: '下一世纪',
  veryShortWeekdays: ['日', '一', '二', '三', '四', '五', '六']
});

},{}],20:[function(require,module,exports){
function cx(classNames) {
  if (typeof classNames === 'object') {
    return Object.keys(classNames).filter(function (className) {
      return classNames[className];
    }).join(' ');
  } else {
    return Array.prototype.join.call(arguments, ' ');
  }
}

var KeyCode = {
  ESC: 27,
  ENTER: 13,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

module.exports = {
  cx: cx,
  createChainedFunction: function (one, two) {
    var hasOne = typeof one === 'function';
    var hasTwo = typeof two === 'function';

    if (!hasOne && !hasTwo) {
      return null;
    }
    if (!hasOne) {
      return two;
    }
    if (!hasTwo) {
      return one;
    }

    return function chainedFunction() {
      one.apply(this, arguments);
      two.apply(this, arguments);
    };
  },
  prefixClsFn: function () {
    var prefixCls = this.state.prefixCls;
    var args = Array.prototype.slice.call(arguments, 0);
    return args.map(function (s) {
      return prefixCls + '-' + s;
    }).join(' ');
  },
  KeyCode: KeyCode
};

},{}],21:[function(require,module,exports){
/**
 * Copyright 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This file contains an unmodified version of:
 * https://github.com/facebook/react/blob/v0.12.0/src/vendor/stubs/Object.assign.js
 *
 * This source code is licensed under the BSD-style license found here:
 * https://github.com/facebook/react/blob/v0.12.0/LICENSE
 * An additional grant of patent rights can be found here:
 * https://github.com/facebook/react/blob/v0.12.0/PATENTS
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

//function assign(target, sources) {
function assign(target) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;

},{}],22:[function(require,module,exports){
(function (global){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This file contains modified versions of:
 * https://github.com/facebook/react/blob/v0.12.0/src/utils/cloneWithProps.js
 * https://github.com/facebook/react/blob/v0.12.0/src/core/ReactPropTransferer.js
 *
 * This source code is licensed under the BSD-style license found here:
 * https://github.com/facebook/react/blob/v0.12.0/LICENSE
 * An additional grant of patent rights can be found here:
 * https://github.com/facebook/react/blob/v0.12.0/PATENTS
 *
 * TODO: This should be replaced as soon as cloneWithProps is available via
 *  the core React package or a separate package.
 *  @see https://github.com/facebook/react/issues/1906
 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var joinClasses = require('./joinClasses');
var assign = require("./Object.assign");

/**
 * Creates a transfer strategy that will merge prop values using the supplied
 * `mergeStrategy`. If a prop was previously unset, this just sets it.
 *
 * @param {function} mergeStrategy
 * @return {function}
 */
function createTransferStrategy(mergeStrategy) {
  return function(props, key, value) {
    if (!props.hasOwnProperty(key)) {
      props[key] = value;
    } else {
      props[key] = mergeStrategy(props[key], value);
    }
  };
}

var transferStrategyMerge = createTransferStrategy(function(a, b) {
  // `merge` overrides the first object's (`props[key]` above) keys using the
  // second object's (`value`) keys. An object's style's existing `propA` would
  // get overridden. Flip the order here.
  return assign({}, b, a);
});

function emptyFunction() {}

/**
 * Transfer strategies dictate how props are transferred by `transferPropsTo`.
 * NOTE: if you add any more exceptions to this list you should be sure to
 * update `cloneWithProps()` accordingly.
 */
var TransferStrategies = {
  /**
   * Never transfer `children`.
   */
  children: emptyFunction,
  /**
   * Transfer the `className` prop by merging them.
   */
  className: createTransferStrategy(joinClasses),
  /**
   * Transfer the `style` prop (which is an object) by merging them.
   */
  style: transferStrategyMerge
};

/**
 * Mutates the first argument by transferring the properties from the second
 * argument.
 *
 * @param {object} props
 * @param {object} newProps
 * @return {object}
 */
function transferInto(props, newProps) {
  for (var thisKey in newProps) {
    if (!newProps.hasOwnProperty(thisKey)) {
      continue;
    }

    var transferStrategy = TransferStrategies[thisKey];

    if (transferStrategy && TransferStrategies.hasOwnProperty(thisKey)) {
      transferStrategy(props, thisKey, newProps[thisKey]);
    } else if (!props.hasOwnProperty(thisKey)) {
      props[thisKey] = newProps[thisKey];
    }
  }
  return props;
}

/**
 * Merge two props objects using TransferStrategies.
 *
 * @param {object} oldProps original props (they take precedence)
 * @param {object} newProps new props to merge in
 * @return {object} a new object containing both sets of props merged.
 */
function mergeProps(oldProps, newProps) {
  return transferInto(assign({}, oldProps), newProps);
}

var ReactPropTransferer = {
  mergeProps: mergeProps
};

var CHILDREN_PROP = 'children';

/**
 * Sometimes you want to change the props of a child passed to you. Usually
 * this is to add a CSS class.
 *
 * @param {object} child child component you'd like to clone
 * @param {object} props props you'd like to modify. They will be merged
 * as if you used `transferPropsTo()`.
 * @return {object} a clone of child with props merged in.
 */
function cloneWithProps(child, props) {
  var newProps = ReactPropTransferer.mergeProps(props, child.props);

  // Use `child.props.children` if it is provided.
  if (!newProps.hasOwnProperty(CHILDREN_PROP) &&
    child.props.hasOwnProperty(CHILDREN_PROP)) {
    newProps.children = child.props.children;
  }

  if (React.version.substr(0, 4) === '0.12') {
    var mockLegacyFactory = function() {};
    mockLegacyFactory.isReactLegacyFactory = true;
    mockLegacyFactory.type = child.type;

    return React.createElement(mockLegacyFactory, newProps);
  }

  // The current API doesn't retain _owner and _context, which is why this
  // doesn't use ReactElement.cloneAndReplaceProps.
  return React.createElement(child.type, newProps);
}

module.exports = cloneWithProps;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Object.assign":21,"./joinClasses":23}],23:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This file contains an unmodified version of:
 * https://github.com/facebook/react/blob/v0.12.0/src/utils/joinClasses.js
 *
 * This source code is licensed under the BSD-style license found here:
 * https://github.com/facebook/react/blob/v0.12.0/LICENSE
 * An additional grant of patent rights can be found here:
 * https://github.com/facebook/react/blob/v0.12.0/PATENTS
 */

"use strict";

/**
 * Combines multiple className strings into one.
 * http://jsperf.com/joinclasses-args-vs-array
 *
 * @param {...?string} classes
 * @return {string}
 */
function joinClasses(className/*, ... */) {
  if (!className) {
    className = '';
  }
  var nextClass;
  var argLength = arguments.length;
  if (argLength > 1) {
    for (var ii = 1; ii < argLength; ii++) {
      nextClass = arguments[ii];
      if (nextClass) {
        className = (className ? className + ' ' : '') + nextClass;
      }
    }
  }
  return className;
}

module.exports = joinClasses;

},{}],24:[function(require,module,exports){
/**
 * align dom node flexibly
 * @author yiminghe@gmail.com
 */

var utils = require('./lib/utils');

// http://yiminghe.iteye.com/blog/1124720

/**
 * 得到会导致元素显示不全的祖先元素
 */

function getOffsetParent(element) {
  // ie 这个也不是完全可行
  /*
   <div style="width: 50px;height: 100px;overflow: hidden">
   <div style="width: 50px;height: 100px;position: relative;" id="d6">
   元素 6 高 100px 宽 50px<br/>
   </div>
   </div>
   */
  // element.offsetParent does the right thing in ie7 and below. Return parent with layout!
  //  In other browsers it only includes elements with position absolute, relative or
  // fixed, not elements with overflow set to auto or scroll.
  //        if (UA.ie && ieMode < 8) {
  //            return element.offsetParent;
  //        }
  // 统一的 offsetParent 方法
  var doc = element.ownerDocument,
    body = doc.body,
    parent,
    positionStyle = utils.css(element, 'position'),
    skipStatic = positionStyle === 'fixed' || positionStyle === 'absolute';

  if (!skipStatic) {
    return element.nodeName.toLowerCase() === 'html' ? null : element.parentNode;
  }

  for (parent = element.parentNode; parent && parent !== body; parent = parent.parentNode) {
    positionStyle = utils.css(parent, 'position');
    if (positionStyle !== 'static') {
      return parent;
    }
  }
  return null;
}

/**
 * 获得元素的显示部分的区域
 */

function getVisibleRectForElement(element) {
  var visibleRect = {
      left: 0,
      right: Infinity,
      top: 0,
      bottom: Infinity
    },
    el,
    scrollX,
    scrollY,
    winSize,
    doc = element.ownerDocument,
    win = doc.defaultView || doc.parentWindow,
    body = doc.body,
    documentElement = doc.documentElement;

  // Determine the size of the visible rect by climbing the dom accounting for
  // all scrollable containers.
  for (el = element;
       (el = getOffsetParent(el));) {
    // clientWidth is zero for inline block elements in ie.
    if ((navigator.userAgent.indexOf('MSIE') === -1 || el.clientWidth !== 0) &&
        // body may have overflow set on it, yet we still get the entire
        // viewport. In some browsers, el.offsetParent may be
        // document.documentElement, so check for that too.
      (el !== body &&
      el !== documentElement &&
      utils.css(el, 'overflow') !== 'visible')) {
      var pos = utils.offset(el);
      // add border
      pos.left += el.clientLeft;
      pos.top += el.clientTop;

      visibleRect.top = Math.max(visibleRect.top, pos.top);
      visibleRect.right = Math.min(visibleRect.right,
        // consider area without scrollBar
        pos.left + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom,
        pos.top + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.left);
    }
  }

  // Clip by window's viewport.
  scrollX = utils.getWindowScrollLeft(win);
  scrollY = utils.getWindowScrollTop(win);
  visibleRect.left = Math.max(visibleRect.left, scrollX);
  visibleRect.top = Math.max(visibleRect.top, scrollY);
  winSize = {
    width: utils.viewportWidth(win),
    height: utils.viewportHeight(win)
  };
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && visibleRect.left >= 0 &&
  visibleRect.bottom > visibleRect.top &&
  visibleRect.right > visibleRect.left ?
    visibleRect : null;
}

function getElFuturePos(elRegion, refNodeRegion, points, offset) {
  var xy,
    diff,
    p1,
    p2;

  xy = {
    left: elRegion.left,
    top: elRegion.top
  };

  p1 = getAlignOffset(refNodeRegion, points[1]);
  p2 = getAlignOffset(elRegion, points[0]);

  diff = [p2.left - p1.left, p2.top - p1.top];

  return {
    left: xy.left - diff[0] + (+offset[0]),
    top: xy.top - diff[1] + (+offset[1])
  };
}

function isFailX(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.left < visibleRect.left ||
    elFuturePos.left + elRegion.width > visibleRect.right;
}

function isFailY(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.top < visibleRect.top ||
    elFuturePos.top + elRegion.height > visibleRect.bottom;
}

function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
  var pos = utils.clone(elFuturePos),
    size = {
      width: elRegion.width,
      height: elRegion.height
    };

  if (overflow.adjustX && pos.left < visibleRect.left) {
    pos.left = visibleRect.left;
  }

  // Left edge inside and right edge outside viewport, try to resize it.
  if (overflow.resizeWidth &&
    pos.left >= visibleRect.left &&
    pos.left + size.width > visibleRect.right) {
    size.width -= (pos.left + size.width) - visibleRect.right;
  }

  // Right edge outside viewport, try to move it.
  if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
    // 保证左边界和可视区域左边界对齐
    pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
  }

  // Top edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top < visibleRect.top) {
    pos.top = visibleRect.top;
  }

  // Top edge inside and bottom edge outside viewport, try to resize it.
  if (overflow.resizeHeight &&
    pos.top >= visibleRect.top &&
    pos.top + size.height > visibleRect.bottom) {
    size.height -= (pos.top + size.height) - visibleRect.bottom;
  }

  // Bottom edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
    // 保证上边界和可视区域上边界对齐
    pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
  }

  return utils.mix(pos, size);
}

function flip(points, reg, map) {
  var ret = [];
  utils.each(points, function (p) {
    ret.push(p.replace(reg, function (m) {
      return map[m];
    }));
  });
  return ret;
}

function flipOffset(offset, index) {
  offset[index] = -offset[index];
  return offset;
}

domAlign.__getOffsetParent = getOffsetParent;

domAlign.__getVisibleRectForElement = getVisibleRectForElement;

function getRegion(node) {
  var offset, w, h;
  if (!utils.isWindow(node)) {
    offset = utils.offset(node);
    w = utils.outerWidth(node);
    h = utils.outerHeight(node);
  } else {
    var win = utils.getWindow(node);
    offset = {
      left: utils.getWindowScrollLeft(win),
      top: utils.getWindowScrollTop(win)
    };
    w = utils.viewportWidth(win);
    h = utils.viewportHeight(win);
  }
  offset.width = w;
  offset.height = h;
  return offset;
}

/**
 * 获取 node 上的 align 对齐点 相对于页面的坐标
 */

function getAlignOffset(region, align) {
  var V = align.charAt(0),
    H = align.charAt(1),
    w = region.width,
    h = region.height,
    x, y;

  x = region.left;
  y = region.top;

  if (V === 'c') {
    y += h / 2;
  } else if (V === 'b') {
    y += h;
  }

  if (H === 'c') {
    x += w / 2;
  } else if (H === 'r') {
    x += w;
  }

  return {
    left: x,
    top: y
  };
}

/*
 * align node
 * @param {Element} node current dom node
 * @param {Object} align align config
 *
 *    @example
 *    {
 *      node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
 *      points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tr 与参考节点的 tl 对齐
 *      offset: [0, 0]      // 有效值为 [n, m]
 *    }
 */
function domAlign(el, refNode, align) {
  var points = align.points;
  var offset = align.offset;
  var overflow = align.overflow;
  offset = offset && [].concat(offset) || [0, 0];
  overflow = overflow || {};
  var newOverflowCfg = {};

  var fail = 0;
  // 当前节点可以被放置的显示区域
  var visibleRect = getVisibleRectForElement(el);
  // 当前节点所占的区域, left/top/width/height
  var elRegion = getRegion(el);
  // 参照节点所占的区域, left/top/width/height
  var refNodeRegion = getRegion(refNode);
  // 当前节点将要被放置的位置
  var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
  // 当前节点将要所处的区域
  var newElRegion = utils.merge(elRegion, elFuturePos);

  // 如果可视区域不能完全放置当前节点时允许调整
  if (visibleRect && (overflow.adjustX || overflow.adjustY)) {
    if (overflow.adjustX) {
      // 如果横向不能放下
      if (isFailX(elFuturePos, elRegion, visibleRect)) {
        fail = 1;
        // 对齐位置反下
        points = flip(points, /[lr]/ig, {
          l: 'r',
          r: 'l'
        });
        // 偏移量也反下
        offset = flipOffset(offset, 0);
      }
    }

    if (overflow.adjustY) {
      // 如果纵向不能放下
      if (isFailY(elFuturePos, elRegion, visibleRect)) {
        fail = 1;
        // 对齐位置反下
        points = flip(points, /[tb]/ig, {
          t: 'b',
          b: 't'
        });
        // 偏移量也反下
        offset = flipOffset(offset, 1);
      }
    }

    // 如果失败，重新计算当前节点将要被放置的位置
    if (fail) {
      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
      utils.mix(newElRegion, elFuturePos);
    }

    // 检查反下后的位置是否可以放下了
    // 如果仍然放不下只有指定了可以调整当前方向才调整
    newOverflowCfg.adjustX = overflow.adjustX &&
    isFailX(elFuturePos, elRegion, visibleRect);

    newOverflowCfg.adjustY = overflow.adjustY &&
    isFailY(elFuturePos, elRegion, visibleRect);

    // 确实要调整，甚至可能会调整高度宽度
    if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
      newElRegion = adjustForViewport(elFuturePos, elRegion,
        visibleRect, newOverflowCfg);
    }
  }

  // https://github.com/kissyteam/kissy/issues/190
  // http://localhost:8888/kissy/src/overlay/demo/other/relative_align/align.html
  // 相对于屏幕位置没变，而 left/top 变了
  // 例如 <div 'relative'><el absolute></div>
  utils.offset(el, {left: newElRegion.left, top: newElRegion.top});

  // need judge to in case set fixed with in css on height auto element
  if (newElRegion.width !== elRegion.width) {
    utils.css(el, 'width', el.width() + newElRegion.width - elRegion.width);
  }

  if (newElRegion.height !== elRegion.height) {
    utils.css(el, 'height', el.height() + newElRegion.height - elRegion.height);
  }

  return {
    points: points,
    offset: offset,
    overflow: newOverflowCfg
  };
}

module.exports = domAlign;
/**
 *  2012-04-26 yiminghe@gmail.com
 *   - 优化智能对齐算法
 *   - 慎用 resizeXX
 *
 *  2011-07-13 yiminghe@gmail.com note:
 *   - 增加智能对齐，以及大小调整选项
 **/

},{"./lib/utils":25}],25:[function(require,module,exports){
var RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source;

function getClientPosition(elem) {
  var box, x, y;
  var doc = elem.ownerDocument;
  var body = doc.body;
  var docElem = doc && doc.documentElement;
  // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
  box = elem.getBoundingClientRect();

  // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
  // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
  // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

  x = box.left;
  y = box.top;

  // In IE, most of the time, 2 extra pixels are added to the top and left
  // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
  // IE6 standards mode, this border can be overridden by setting the
  // document element's border to zero -- thus, we cannot rely on the
  // offset always being 2 pixels.

  // In quirks mode, the offset can be determined by querying the body's
  // clientLeft/clientTop, but in standards mode, it is found by querying
  // the document element's clientLeft/clientTop.  Since we already called
  // getClientBoundingRect we have already forced a reflow, so it is not
  // too expensive just to query them all.

  // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
  // 窗口边框标准是设 documentElement ,quirks 时设置 body
  // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
  // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
  // 标准 ie 下 docElem.clientTop 就是 border-top
  // ie7 html 即窗口边框改变不了。永远为 2
  // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0

  x -= docElem.clientLeft || body.clientLeft || 0;
  y -= docElem.clientTop || body.clientTop || 0;

  return {left: x, top: y};
}

function getScroll(w, top) {
  var ret = w['page' + (top ? 'Y' : 'X') + 'Offset'];
  var method = 'scroll' + (top ? 'Top' : 'Left');
  if (typeof ret !== 'number') {
    var d = w.document;
    //ie6,7,8 standard mode
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      //quirks mode
      ret = d.body[method];
    }
  }
  return ret;
}

function getScrollLeft(w) {
  return getScroll(w);
}

function getScrollTop(w) {
  return getScroll(w, true);
}

function getOffset(el) {
  var pos = getClientPosition(el);
  var doc = el.ownerDocument;
  var w = doc.defaultView || doc.parentWindow;
  pos.left += getScrollLeft(w);
  pos.top += getScrollTop(w);
  return pos;
}
function _getComputedStyle(elem, name, computedStyle) {
  var val = '';
  var d = elem.ownerDocument;

  // https://github.com/kissyteam/kissy/issues/61
  if ((computedStyle = (computedStyle || d.defaultView.getComputedStyle(elem, null)))) {
    val = computedStyle.getPropertyValue(name) || computedStyle[name];
  }

  return val;
}

var _RE_NUM_NO_PX = new RegExp('^(' + RE_NUM + ')(?!px)[a-z%]+$', 'i');
var RE_POS = /^(top|right|bottom|left)$/,
  CURRENT_STYLE = 'currentStyle',
  RUNTIME_STYLE = 'runtimeStyle',
  LEFT = 'left',
  PX = 'px';

function _getComputedStyleIE(elem, name) {
  // currentStyle maybe null
  // http://msdn.microsoft.com/en-us/library/ms535231.aspx
  var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

  // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
  // 一开始就处理了! CUSTOM_STYLE.height,CUSTOM_STYLE.width ,cssHook 解决@2011-08-19
  // 在 ie 下不对，需要直接用 offset 方式
  // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

  // From the awesome hack by Dean Edwards
  // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
  // If we're not dealing with a regular pixel number
  // but a number that has a weird ending, we need to convert it to pixels
  // exclude left right for relativity
  if (_RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)) {
    // Remember the original values
    var style = elem.style,
      left = style[LEFT],
      rsLeft = elem[RUNTIME_STYLE][LEFT];

    // prevent flashing of content
    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];

    // Put in the new values to get a computed value out
    style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
    ret = style.pixelLeft + PX;

    // Revert the changed values
    style[LEFT] = left;

    elem[RUNTIME_STYLE][LEFT] = rsLeft;
  }
  return ret === '' ? 'auto' : ret;
}

var getComputedStyleX;
if (typeof window !== 'undefined') {
  getComputedStyleX = window.getComputedStyle ? _getComputedStyle : _getComputedStyleIE;
}

// 设置 elem 相对 elem.ownerDocument 的坐标
function setOffset(elem, offset) {
  // set position first, in-case top/left are set even on static elem
  if (css(elem, 'position') === 'static') {
    elem.style.position = 'relative';
  }

  var old = getOffset(elem),
    ret = {},
    current, key;

  for (key in offset) {
    current = parseFloat(css(elem, key)) || 0;
    ret[key] = current + offset[key] - old[key];
  }
  css(elem, ret);
}

function each(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    fn(arr[i]);
  }
}

function isBorderBoxFn(elem) {
  return getComputedStyleX(elem, 'boxSizing') === 'border-box';
}

var BOX_MODELS = ['margin', 'border', 'padding'],
  CONTENT_INDEX = -1,
  PADDING_INDEX = 2,
  BORDER_INDEX = 1,
  MARGIN_INDEX = 0;

function swap(elem, options, callback) {
  var old = {},
    style = elem.style,
    name;

  // Remember the old values, and insert the new ones
  for (name in options) {
    old[name] = style[name];
    style[name] = options[name];
  }

  callback.call(elem);

  // Revert the old values
  for (name in options) {
    style[name] = old[name];
  }
}

function getPBMWidth(elem, props, which) {
  var value = 0, prop, j, i;
  for (j = 0; j < props.length; j++) {
    prop = props[j];
    if (prop) {
      for (i = 0; i < which.length; i++) {
        var cssProp;
        if (prop === 'border') {
          cssProp = prop + which[i] + 'Width';
        } else {
          cssProp = prop + which[i];
        }
        value += parseFloat(getComputedStyleX(elem, cssProp)) || 0;
      }
    }
  }
  return value;
}

/**
 * A crude way of determining if an object is a window
 * @member util
 */
function isWindow(obj) {
  // must use == for ie8
  /*jshint eqeqeq:false*/
  return obj != null && obj == obj.window;
}

var domUtils = {};

each(['Width', 'Height'], function (name) {
  domUtils['doc' + name] = function (refWin) {
    var d = refWin.document;
    return Math.max(
      //firefox chrome documentElement.scrollHeight< body.scrollHeight
      //ie standard mode : documentElement.scrollHeight> body.scrollHeight
      d.documentElement['scroll' + name],
      //quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
      d.body['scroll' + name],
      domUtils['viewport' + name](d));
  };

  domUtils['viewport' + name] = function (win) {
    // pc browser includes scrollbar in window.innerWidth
    var prop = 'client' + name,
      doc = win.document,
      body = doc.body,
      documentElement = doc.documentElement,
      documentElementProp = documentElement[prop];
    // 标准模式取 documentElement
    // backcompat 取 body
    return doc.compatMode === 'CSS1Compat' && documentElementProp ||
      body && body[prop] || documentElementProp;
  };
});

/*
 得到元素的大小信息
 @param elem
 @param name
 @param {String} [extra]  'padding' : (css width) + padding
 'border' : (css width) + padding + border
 'margin' : (css width) + padding + border + margin
 */
function getWH(elem, name, extra) {
  if (isWindow(elem)) {
    return name === 'width' ? domUtils.viewportWidth(elem) : domUtils.viewportHeight(elem);
  } else if (elem.nodeType === 9) {
    return name === 'width' ? domUtils.docWidth(elem) : domUtils.docHeight(elem);
  }
  var which = name === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'],
    borderBoxValue = name === 'width' ? elem.offsetWidth : elem.offsetHeight;
  var computedStyle = getComputedStyleX(elem);
  var isBorderBox = isBorderBoxFn(elem, computedStyle);
  var cssBoxValue = 0;
  if (borderBoxValue == null || borderBoxValue <= 0) {
    borderBoxValue = undefined;
    // Fall back to computed then un computed css if necessary
    cssBoxValue = getComputedStyleX(elem, name);
    if (cssBoxValue == null || (Number(cssBoxValue)) < 0) {
      cssBoxValue = elem.style[name] || 0;
    }
    // Normalize '', auto, and prepare for extra
    cssBoxValue = parseFloat(cssBoxValue) || 0;
  }
  if (extra === undefined) {
    extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
  }
  var borderBoxValueOrIsBorderBox = borderBoxValue !== undefined || isBorderBox;
  var val = borderBoxValue || cssBoxValue;
  if (extra === CONTENT_INDEX) {
    if (borderBoxValueOrIsBorderBox) {
      return val - getPBMWidth(elem, ['border', 'padding'],
          which, computedStyle);
    } else {
      return cssBoxValue;
    }
  } else if (borderBoxValueOrIsBorderBox) {
    return val + (extra === BORDER_INDEX ? 0 :
        (extra === PADDING_INDEX ?
          -getPBMWidth(elem, ['border'], which, computedStyle) :
          getPBMWidth(elem, ['margin'], which, computedStyle)));
  } else {
    return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra),
        which, computedStyle);
  }
}

var cssShow = {position: 'absolute', visibility: 'hidden', display: 'block'};

// fix #119 : https://github.com/kissyteam/kissy/issues/119
function getWHIgnoreDisplay(elem) {
  var val, args = arguments;
  // in case elem is window
  // elem.offsetWidth === undefined
  if (elem.offsetWidth !== 0) {
    val = getWH.apply(undefined, args);
  } else {
    swap(elem, cssShow, function () {
      val = getWH.apply(undefined, args);
    });
  }
  return val;
}

each(['width', 'height'], function (name) {
  var first = name.charAt(0).toUpperCase() + name.slice(1);
  domUtils['outer' + first] = function (el, includeMargin) {
    return el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX);
  };
  var which = name === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];

  domUtils[name] = function (elem, val) {
    if (val !== undefined) {
      if (elem) {
        var computedStyle = getComputedStyleX(elem);
        var isBorderBox = isBorderBoxFn(elem);
        if (isBorderBox) {
          val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
        }
        return css(elem, name, val);
      }
      return;
    }
    return elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX);
  };
});

function css(el, name, value) {
  if (typeof name === 'object') {
    for (var i in name) {
      css(el, i, name[i]);
    }
    return;
  }
  if (typeof value !== 'undefined') {
    if (typeof value === 'number') {
      value = value + 'px';
    }
    el.style[name] = value;
  } else {
    return getComputedStyleX(el, name);
  }
}

function mix(to, from) {
  for (var i in from) {
    to[i] = from[i];
  }
  return to;
}

var utils = module.exports = {
  getWindow: function (node) {
    var doc = node.ownerDocument || node;
    return doc.defaultView || doc.parentWindow;
  },
  offset: function (el, value) {
    if (typeof value !== 'undefined') {
      setOffset(el, value);
    } else {
      return getOffset(el);
    }
  },
  isWindow: isWindow,
  each: each,
  css: css,
  clone: function (obj) {
    var ret = {};
    for (var i in obj) {
      ret[i] = obj[i];
    }
    var overflow = obj.overflow;
    if (overflow) {
      for (i in obj) {
        ret.overflow[i] = obj.overflow[i];
      }
    }
    return ret;
  },
  mix: mix,
  getWindowScrollLeft: function (w) {
    return getScrollLeft(w);
  },
  getWindowScrollTop: function (w) {
    return getScrollTop(w);
  },
  merge: function () {
    var ret = {};
    for (var i = 0; i < arguments.length; i++) {
      utils.mix(ret, arguments[i]);
    }
    return ret;
  },
  viewportWidth: 0,
  viewportHeight: 0
};

mix(utils, domUtils);

},{}]},{},[1]);
