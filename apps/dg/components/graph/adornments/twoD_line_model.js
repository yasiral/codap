// ==========================================================================
//                          DG.TwoDLineModel
//
//  Author:   William Finzer
//
//  Copyright (c) 2014 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

sc_require('components/graph/adornments/plot_adornment_model');

/** @class  DG.TwoDLineModel - The model for a movable line.

  @extends DG.PlotAdornmentModel
*/
DG.TwoDLineModel = DG.PlotAdornmentModel.extend(
/** @scope DG.TwoDLineModel.prototype */ 
{
  /**
    The current slope of the line.
    @property { Number }
  */
  slope: null,

  /**
    The current intercept of the line.
    @property { Number }
  */
  intercept: null,

  /**
    True if the line is vertical
    @property { Boolean }
  */
  isVertical: false,

  /**
    If the line is vertical, it intersects the x-axis at this world value.
    @property { Number }
  */
  xIntercept: null,

  /**
   * Set by my plotModel when squares of residuals are showing
   */
  showSumSquares: false,

  /**
   * @property {Number}
   */
  sumSquaresResiduals: null,

  /**
    Is the intercept locked at the origin?
    @property { Boolean }
  */
  isInterceptLocked: function( iKey, iLocked) {
    if( iLocked !== undefined) {
      this._interceptLocked = iLocked;
      if( iLocked)
        this.set('intercept', 0);
    }
    return this._interceptLocked;
  }.property(),

  /**
    Use the bounds of the given axes to recompute slope and intercept.
  */
  toggleInterceptLocked: function() {
    this.set('isInterceptLocked', !this._interceptLocked);
  },

  /**
    Private cache.
    @property { Boolean }
  */
  _needsComputing: null,

  /**
   * Note that our slope and intercept values are out of date, for lazy evaluation.
   * Dependencies, which will require a recompute
   *  - case-attribute-values added/deleted/changed for the primary and secondary axis attribute(s)
   *  - primary or secondary axis attributes changed (from one attribute to another)
   *  - axis models changed (must be up to date when we use them here)
   */
  setComputingNeeded: function() {
    this._needsComputing = true;
  },

  /**
    Private cache.
    @property { Boolean }
  */
  _interceptLocked: null,

  /**
    Provide reasonable defaults.
  */
  init: function() {
    sc_super();
    this.slope = 1;
    this.isVertical = false;
    this.xIntercept = null;
    this._interceptLocked = false;
    this._needsComputing = true;
  },

  /**
   True if we need to compute a new slope and intercept to force within plot bounds
   @return { Boolean }
   */
  isComputingNeeded: function() {
    return this._needsComputing && this.get('isVisible');
  },

  /**
   Use the bounds of the given axes to recompute slope and intercept.
   */
  recomputeSlopeAndInterceptIfNeeded: function( iXAxis, iYAxis) {
    if( this.isComputingNeeded( iXAxis, iYAxis))
      this.recomputeSlopeAndIntercept( iXAxis, iYAxis);
  },

  /**
   * @return { [{x:{Number}, y: {Number}}] } with properties specific to a given subclass
   */
  getCoordinates: function() {
    var tValues = [],
        tCases = this.getPath('plotModel.cases'),
        tXVarID = this.getPath('plotModel.xVarID'),
        tYVarID = this.getPath('plotModel.yVarID');
    if( Array.isArray(tCases)) {
      tCases.forEach(function (iCase) {
        var tXValue = iCase.getNumValue(tXVarID),
            tYValue = iCase.getNumValue(tYVarID);
        if (isFinite(tXValue) && isFinite(tYValue)) {
          tValues.push({x: tXValue, y: tYValue});
        }
      });
    }
    return tValues;
  },

  createStorage: function() {
    var tStorage = sc_super();
    DG.ObjectMap.copy( tStorage, {
      isInterceptLocked: this.get('isInterceptLocked'),
    });
    return tStorage;
  },

  /**
   * @param { Object } with properties specific to a given subclass
   */
  restoreStorage: function( iStorage) {
    sc_super();
    this.set('isInterceptLocked', iStorage.isInterceptLocked);
  }

});

