'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require('rxjs');
var cursor_handle_1 = require('../cursor_handle');
var utils_1 = require('../utils');
var ObservableCursor = (function (_super) {
    __extends(ObservableCursor, _super);
    function ObservableCursor(cursor) {
        var _this = this;
        _super.call(this, function (observer) {
            _this._observers.push(observer);
            if (!_this._hCursor) {
                _this._hCursor = new cursor_handle_1.CursorHandle(_this._observeCursor(cursor));
            }
            return function () {
                var index = _this._observers.indexOf(observer);
                if (index !== -1) {
                    _this._observers.splice(index, 1);
                }
                if (!_this._observers.length) {
                    _this.stop();
                }
            };
        });
        this.data = [];
        this._observers = [];
        _.extend(this, _.omit(cursor, 'count', 'map'));
        this._cursor = cursor;
    }
    ObservableCursor.create = function (cursor) {
        return new ObservableCursor(cursor);
    };
    Object.defineProperty(ObservableCursor.prototype, "cursor", {
        get: function () {
            return this._cursor;
        },
        enumerable: true,
        configurable: true
    });
    ObservableCursor.prototype.stop = function () {
        if (this._hCursor) {
            this._hCursor.stop();
        }
        this._runComplete();
        this._hCursor = null;
    };
    ObservableCursor.prototype.dispose = function () {
        this._observers = null;
        this._cursor = null;
    };
    ObservableCursor.prototype.fetch = function () {
        return this._cursor.fetch();
    };
    ObservableCursor.prototype.observe = function (callbacks) {
        return this._cursor.observe(callbacks);
    };
    ObservableCursor.prototype.observeChanges = function (callbacks) {
        return this._cursor.observeChanges(callbacks);
    };
    ObservableCursor.prototype._runComplete = function () {
        this._observers.forEach(function (observer) {
            observer.complete();
        });
    };
    ObservableCursor.prototype._runNext = function (cursor) {
        this._observers.forEach(function (observer) {
            observer.next(cursor.fetch());
        });
    };
    ObservableCursor.prototype.addedAt = function (doc, at, before) {
        this.data.splice(at, 0, doc);
        this.handleChange();
    };
    ObservableCursor.prototype.changedAt = function (doc, old, at) {
        this.data[at] = doc;
        this.handleChange();
    };
    ;
    ObservableCursor.prototype.removedAt = function (doc, at) {
        this.data.splice(at, 1);
        this.handleChange();
    };
    ;
    ObservableCursor.prototype.handleChange = function () {
        this._runNext(this._cursor);
    };
    ;
    ObservableCursor.prototype._observeCursor = function (cursor) {
        var _this = this;
        return utils_1.gZone.run(function () { return cursor.observe({
            addedAt: _this.addedAt.bind(_this),
            changedAt: _this.changedAt.bind(_this),
            removedAt: _this.removedAt.bind(_this)
        }); });
    };
    return ObservableCursor;
}(rxjs_1.Observable));
exports.ObservableCursor = ObservableCursor;
