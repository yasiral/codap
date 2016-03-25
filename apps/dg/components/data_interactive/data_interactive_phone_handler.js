// ==========================================================================
//                          DG.DataInteractivePhoneHandler
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
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

/** @class
 *
 * The DataInteractivePhoneHandler todo: write this
 *
 * @extends SC.Object
 */
DG.DataInteractivePhoneHandler = SC.Object.extend(
    /** @scope DG.DataInteractivePhoneHandler.prototype */ {

      /**
       * @type {DG.DataInteractiveModel}
       */
      model: null,

      /**
       The total number of document-dirtying changes.
       @property   {Number}
       */
      changeCount: 0,

      /**
       The number of document-dirtying changes that have been saved.
       If this is less than the total change count, then the document is dirty.
       @property   {Number}
       */
      savedChangeCount: 0,

      handlerMap: null,

      /**
       Initialization method
       */
      init: function () {
        sc_super();

        this.handlerMap = {
            interactiveFrame: this.handleInteractiveFrame.bind(this),
            dataContext: this.handleDataContext.bind(this)
          };
      },

      /**
       * Break loops
       */
      destroy: function () {
        this.setPath('model.content', null);
        sc_super();
      },

      doCommand: function (iMessage, iCallback) {
        DG.log('gotIt: ' + JSON.stringify(iMessage));
        var type = iMessage.what.type;
        var result = ({success: false});
        try {
          if (type && this.handlerMap[type]) {
            result = this.handlerMap[type](iMessage, iCallback) || {success: false};
          } else {
            DG.logWarn("Unknown message type: " + type);
          }
        } finally {
          iCallback(result);
        }
      },

      /**
       Whether or not the document contains unsaved changes such that the user
       should be prompted to confirm when closing the document, for instance.
       @property   {Boolean}
       */
      hasUnsavedChanges: function () {
        return this.get('changeCount') > this.get('savedChangeCount');
      }.property(),

      /**
       Synchronize the saved change count with the full change count.
       This method should be called when a save occurs, for instance.
       */
      updateSavedChangeCount: function () {
        this.set('savedChangeCount', this.get('changeCount'));
      },

      /** todo: decide if we need this for this handler */
      dispatchCommand: function (iCmd, iCallback) {
      },

      /**
       *
       * @param  iMessage {object}
       *     {{
       *      action: 'update'|'get'|'delete'
       *      what: {type: 'interactiveFrame'}
       *      values: { {title: {String}, version: {String}, dimensions: { width: {Number}, height: {Number} }}}
       *     }}
       * @return {object} Object should include status and values.
       */
      handleInteractiveFrame: function( iMessage ) {

        var create = function() { // jshint ignore:line
          this.setPath('view.version',
              SC.none(this.context.gameVersion) ? '' : this.context.gameVersion);
          this.setPath('view.title',
              SC.none(this.context.gameName) ? '' : this.context.gameName);
        }.bind( this);

        switch( iMessage.action) {
          case 'create':
            //create();
            break;
        }
        return {success: true};
      },

      /**
       * handles operations on dataContext.
       *
       * Notes:
       *
       *  * At this point only one data context for each data interactive is permitted.
       *  * Updates permit modification of top-level api properties only. That is
       *    to say, not collections. Use collection API.
       *
       * @param  iMessage {object}
       *     {{
       *      action: 'create'|'update'|'get'|'delete'
       *      what: {{type: 'context'}}
       *      values: {{identifier: {string}, title: {string}, description: {string}, collections: [{Object}] }}
       *     }}
       *
       */
      handleDataContext: function (iMessage) {
        var success = false;
        var context;
        if (iMessage.action === 'create') {
          context = this.getPath('model.context');
          if (context) {
            DG.logWarn('Operation not permitted.');
            success = false;
          } else {
            context = DG.currDocumentController().createNewDataContext(iMessage.value);
            this.setPath('model.context', context);
            success = (!SC.none(context));
          }
        } else if (iMessage.action === 'update') {
          context = this.getPath('model.context');
          if (!context) {
            DG.logWarn('Update of non-existed object.');
            success = false;
          } else {
            ['identifier', 'title', 'description'].forEach(function (prop) {
              if (iMessage.value[prop]) {
                context.set(prop, iMessage.value[prop]);
              }
            });
          }
        } else if (iMessage.action === 'get') {
          // TODO
        } else if (iMessage.action === 'delete') {
          context = this.getPath('model.context');
          context.destroy();
          this.setPath('model.context', null);
        }
        return {success: success};
      }



    });
