  var executeRules;
  var url = 'https://webhook.site/90e9d5c9-cd0e-4d44-b172-c9d5a00094eb';
var reactorPromise = Promise;
  (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
          typeof define === 'function' && define.amd ? define(['exports'], factory) :
              (global = global || self, factory(global.actionExecutioner = {}));
  }(this, (function (exports) { 'use strict';

      var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

      function unwrapExports (x) {
          return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
      }

      function createCommonjsModule(fn, module) {
          return module = { exports: {} }, fn(module, module.exports), module.exports;
      }


      var sendBeacon = function(settings, payload) {
          //throw new Error('eee');
          if (fetch) {
              fetch(settings.url, {
                  method: 'POST',
                  body: JSON.stringify(payload),
              });
          }

          return payload;
      };

      /***************************************************************************************
       * (c) 2019 Adobe. All rights reserved.
       * This file is licensed to you under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License. You may obtain a copy
       * of the License at http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software distributed under
       * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
       * OF ANY KIND, either express or implied. See the License for the specific language
       * governing permissions and limitations under the License.
       ****************************************************************************************/

      var isKeyArray = function(i) {
          return !!i.match(/[[0-9]+]/);
      };

      /***************************************************************************************
       * (c) 2019 Adobe. All rights reserved.
       * This file is licensed to you under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License. You may obtain a copy
       * of the License at http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software distributed under
       * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
       * OF ANY KIND, either express or implied. See the License for the specific language
       * governing permissions and limitations under the License.
       ****************************************************************************************/

      var getArrayIndex = function(i) {
          var match = i.match(/\[([0-9]+)]$/);
          return match && match[1];
      };

      var getValue = function(payload, sourcePath) {
          var pathParts = sourcePath.split('.');
          var result = payload;

          pathParts.forEach(function(pathPart) {
              if (result) {
                  if (isKeyArray(pathPart)) {
                      var property = pathPart.substring(0, pathPart.indexOf('['));
                      var index = getArrayIndex(pathPart);
                      if (result[property]) {
                          result = result[property][index];
                      }
                  } else {
                      result = result[pathPart];
                  }
              }
          });

          return result || null;
      };

      var setValue = function(payload, destinationPath, value) {
          var path = destinationPath.split('.');
          var currentNode = payload;
          var parentNode = null;
          var currentKey = null;
          var untouchedCurrentKey = null;

          path.forEach(function(i, currentPosition, allElements) {
              var defaultValue = {};
              if (isKeyArray(i)) {
                  defaultValue = [];
              }

              parentNode = currentNode;
              untouchedCurrentKey = i;
              if (i.indexOf('[') !== -1) {
                  i = i.substring(0, i.indexOf('['));
              }
              currentKey = i;

              currentNode[i] = currentNode[i] || defaultValue;

              if (Array.isArray(currentNode[i])) {
                  if (allElements[currentPosition + 1]) {
                      var arrayIndex = getArrayIndex(untouchedCurrentKey);
                      if (arrayIndex) {
                          currentNode[i][arrayIndex] = currentNode[i][arrayIndex] || {};
                          currentNode = currentNode[i][arrayIndex];
                      } else {
                          currentNode[i].push({});
                          currentNode = currentNode[i][currentNode[i].length - 1];
                      }
                  } else {
                      currentNode = currentNode[i];
                  }
              } else {
                  currentNode = currentNode[i];
              }
          });

          if (Array.isArray(parentNode[currentKey])) {
              var arrayIndex = getArrayIndex(untouchedCurrentKey);

              if (arrayIndex) {
                  parentNode[currentKey][arrayIndex] = value;
              } else {
                  parentNode[currentKey].push(value);
              }
          } else {
              parentNode[currentKey] = value;
          }

          return payload;
      };

      var transform = function(settings, payload) {
          var newPayload = {};

          (settings.mappings || []).forEach(function(mapping) {
              var sourceValue = getValue(payload, mapping.sourceKey);
              newPayload = setValue(newPayload, mapping.destinationKey, sourceValue);
          });

          return newPayload;
      };

      /***************************************************************************************
       * (c) 2018 Adobe. All rights reserved.
       * This file is licensed to you under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License. You may obtain a copy
       * of the License at http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software distributed under
       * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
       * OF ANY KIND, either express or implied. See the License for the specific language
       * governing permissions and limitations under the License.
       ****************************************************************************************/

      var isNumber = function(value) {
          return typeof value === 'number' && isFinite(value); // isFinite weeds out NaNs.
      };

      var isString = function(value) {
          return typeof value === 'string' || value instanceof String;
      };

      var updateCase = function(operand, caseInsensitive) {
          return caseInsensitive && isString(operand) ? operand.toLowerCase() : operand;
      };

      var castToStringIfNumber = function(operand) {
          return isNumber(operand) ? String(operand) : operand;
      };

      var castToNumberIfString = function(operand) {
          return isString(operand) ? Number(operand) : operand;
      };

      var guardStringCompare = function(compare) {
          return function(leftOperand, rightOperand, caseInsensitive) {
              leftOperand = castToStringIfNumber(leftOperand);
              rightOperand = castToStringIfNumber(rightOperand);

              return (
                  isString(leftOperand) &&
                  isString(rightOperand) &&
                  compare(leftOperand, rightOperand, caseInsensitive)
              );
          };
      };

      var guardNumberCompare = function(compare) {
          return function(leftOperand, rightOperand) {
              leftOperand = castToNumberIfString(leftOperand);
              rightOperand = castToNumberIfString(rightOperand);

              return (
                  isNumber(leftOperand) &&
                  isNumber(rightOperand) &&
                  compare(leftOperand, rightOperand)
              );
          };
      };

      var guardCaseSensitivity = function(compare) {
          return function(leftOperand, rightOperand, caseInsensitive) {
              return compare(
                  updateCase(leftOperand, caseInsensitive),
                  updateCase(rightOperand, caseInsensitive)
              );
          };
      };

      var conditions = {
          equals: guardCaseSensitivity(function(leftOperand, rightOperand) {
              return leftOperand == rightOperand;
          }),
          doesNotEqual: function() {
              return !conditions.equals.apply(null, arguments);
          },
          contains: guardStringCompare(guardCaseSensitivity(function(leftOperand, rightOperand) {
              return leftOperand.indexOf(rightOperand) !== -1;
          })),
          doesNotContain: function() {
              return !conditions.contains.apply(null, arguments);
          },
          startsWith: guardStringCompare(guardCaseSensitivity(function(leftOperand, rightOperand) {
              return leftOperand.indexOf(rightOperand) === 0;
          })),
          doesNotStartWith: function() {
              return !conditions.startsWith.apply(null, arguments);
          },
          endsWith: guardStringCompare(guardCaseSensitivity(function(leftOperand, rightOperand) {
              return leftOperand.substring(
                  leftOperand.length - rightOperand.length,
                  leftOperand.length
              ) === rightOperand;
          })),
          doesNotEndWith: function() {
              return !conditions.endsWith.apply(null, arguments);
          },
          matchesRegex: guardStringCompare(function(leftOperand, rightOperand, caseInsensitive) {
              // Doing something like new RegExp(/ab+c/, 'i') throws an error in some browsers (e.g., IE11),
              // so we don't want to instantiate the regex until we know we're working with a string.
              return new RegExp(rightOperand, caseInsensitive ? 'i' : '').test(leftOperand);
          }),
          doesNotMatchRegex: function() {
              return !conditions.matchesRegex.apply(null, arguments);
          },
          lessThan: guardNumberCompare(function(leftOperand, rightOperand) {
              return leftOperand < rightOperand;
          }),
          lessThanOrEqual: guardNumberCompare(function(leftOperand, rightOperand) {
              return leftOperand <= rightOperand;
          }),
          greaterThan: guardNumberCompare(function(leftOperand, rightOperand) {
              return leftOperand > rightOperand;
          }),
          greaterThanOrEqual: guardNumberCompare(function(leftOperand, rightOperand) {
              return leftOperand >= rightOperand;
          }),
          isTrue: function(leftOperand) {
              return leftOperand === true;
          },
          isTruthy: function(leftOperand) {
              return Boolean(leftOperand);
          },
          isFalse: function(leftOperand) {
              return leftOperand === false;
          },
          isFalsy: function(leftOperand) {
              return !leftOperand;
          },
      };

      var valueComparison = function(settings) {
          return conditions[settings.comparison.operator](
              settings.leftOperand,
              settings.rightOperand,
              Boolean(settings.comparison.caseInsensitive)
          );
      };

      var path = function(settings, payload) {
          return getValue(payload, settings.path);
      };

      var container = function(
      ) {
          return {
              buildInfo: {
                  buildDate: '2019-10-22T17:26:28Z',
                  environment: 'development',
                  turbineBuildDate: '2019-06-25T22:25:24Z',
                  turbineVersion: '25.6.0',
              },
              modules: {
                  'send-beacon/src/lib/actions/sendBeacon.js': {
                      displayName: 'Send Beacon',
                      script: function() {
                          return sendBeacon;
                      },
                  },
                  'core/src/lib/actions/transform.js': {
                      displayName: 'Transform Data',
                      script: function() {
                          return transform;
                      },
                  },
                  'core/src/lib/conditions/valueComparison.js': {
                      displayName: 'Value Comparison',
                      script: function() {
                          return valueComparison;
                      },
                  },
                  'core/src/lib/dataElements/path.js': {
                      displayName: 'Path',
                      script: function() {
                          return path;
                      },
                  },
              },
              dataElements: {
                  de2: {
                      modulePath: 'core/src/lib/dataElements/path.js',
                      settings: {
                          path: 'events[0].xdm.environment.browserDetails.viewportWidth',
                      },
                  },
                  dev: {
                      modulePath: 'core/src/lib/dataElements/path.js',
                      settings: {
                          path: 'imsOrg',
                      },
                  },
              },
              extensions: {
                  'send-beacon': {
                      displayName: 'Send Beacon',
                  },
                  core: {
                      displayName: 'Core',
                  },
              },
              company: {
                  orgId: '08364A825824E04F0A494115@AdobeOrg',
              },
              property: {
                  name: 'server',
                  settings: {
                      platform: 'server',
                      undefinedVarsReturnEmpty: false,
                  },
              },
              rules: [
                  {
                      id: 'RL999661363e804f97b7ea2a9f2d7af92c',
                      name: 'Forward Beacon with Condition',
                      conditions: [
                          {
                              modulePath: 'core/src/lib/conditions/valueComparison.js',
                              settings: {
                                  comparison: {
                                      operator: 'greaterThan',
                                  },
                                  leftOperand: '%de2%',
                                  rightOperand: 500,
                              },
                          },
                      ],
                      actions: [
                          {
                              modulePath: 'core/src/lib/actions/transform.js',
                              settings: {
                                  mappings: [
                                      {
                                          sourceKey: 'meta.gateway.imsOrgId',
                                          destinationKey: 'name',
                                      },
                                  ],
                              },
                          },
                          {
                              modulePath: 'send-beacon/src/lib/actions/sendBeacon.js',
                              settings: {
                                  url: url,
                              },
                          },
                      ],
                  },
                  {
                      id: 'RLc053874a75b84b47a8c7f397d2981991',
                      name: 'Forward Beacon 2',
                      actions: [
                          {
                              modulePath: 'core/src/lib/actions/transform.js',
                              settings: {
                                  mappings: [
                                      {
                                          sourceKey: 'identityMap.ECID[0].id',
                                          destinationKey: 'name',
                                      },
                                  ],
                              },
                          },
                          {
                              modulePath: 'send-beacon/src/lib/actions/sendBeacon.js',
                              settings: {
                                  url: url,
                              },
                          },
                      ],
                  },
              ],
          };
      };

      var engineServer = createCommonjsModule(function (module, exports) {

          Object.defineProperty(exports, '__esModule', { value: true });

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          /**
           * Log levels.
           * @readonly
           * @enum {string}
           * @private
           */
          var levels = {
              LOG: 'log',
              INFO: 'info',
              DEBUG: 'debug',
              WARN: 'warn',
              ERROR: 'error'
          };

          /**
           * Rocket unicode surrogate pair.
           * @type {string}
           */
          var ROCKET = '\uD83D\uDE80';

          /**
           * Prefix to use on all messages. The rocket unicode doesn't work on IE 10.
           * @type {string}
           */
          var launchPrefix = ROCKET;

          /**
           * Whether logged messages should be output to the console.
           * @type {boolean}
           */
          var outputEnabled = false;

          /**
           * Processes a log message.
           * @param {string} level The level of message to log.
           * @param {...*} arg Any argument to be logged.
           * @private
           */
          var process = function(level) {
              if (outputEnabled && console) {
                  var logArguments = Array.prototype.slice.call(arguments, 1);
                  logArguments.unshift(launchPrefix);
                  // window.debug is unsupported in IE 10
                  if (level === levels.DEBUG && !console[level]) {
                      level = levels.INFO;
                  }
                  console[level].apply(console, logArguments);
              }
          };

          /**
           * Outputs a message to the web console.
           * @param {...*} arg Any argument to be logged.
           */
          var log = process.bind(null, levels.LOG);

          /**
           * Outputs informational message to the web console. In some browsers a small "i" icon is
           * displayed next to these items in the web console's log.
           * @param {...*} arg Any argument to be logged.
           */
          var info = process.bind(null, levels.INFO);

          /**
           * Outputs debug message to the web console. In browsers that do not support
           * console.debug, console.info is used instead.
           * @param {...*} arg Any argument to be logged.
           */
          var debug = process.bind(null, levels.DEBUG);

          /**
           * Outputs a warning message to the web console.
           * @param {...*} arg Any argument to be logged.
           */
          var warn = process.bind(null, levels.WARN);

          /**
           * Outputs an error message to the web console.
           * @param {...*} arg Any argument to be logged.
           */
          var error = process.bind(null, levels.ERROR);

          var logger = {
              log: log,
              info: info,
              debug: debug,
              warn: warn,
              error: error,
              /**
               * Whether logged messages should be output to the console.
               * @type {boolean}
               */
              get outputEnabled() {
                  return outputEnabled;
              },
              set outputEnabled(value) {
                  outputEnabled = value;
              },
              /**
               * Creates a logging utility that only exposes logging functionality and prefixes all messages
               * with an identifier.
               */
              createPrefixedLogger: function(identifier) {
                  var loggerSpecificPrefix = '[' + identifier + ']';

                  return {
                      log: log.bind(null, loggerSpecificPrefix),
                      info: info.bind(null, loggerSpecificPrefix),
                      debug: debug.bind(null, loggerSpecificPrefix),
                      warn: warn.bind(null, loggerSpecificPrefix),
                      error: error.bind(null, loggerSpecificPrefix)
                  };
              }
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/



          /**
           * Replacing any variable tokens (%myDataElement%, %this.foo%, etc.) with their associated values.
           * A new string, object, or array will be created; the thing being processed will never be
           * modified.
           * @param {*} thing Thing potentially containing variable tokens. Objects and arrays will be
           * deeply processed.
           * @param {HTMLElement} [element] Associated HTML element. Used for special tokens
           * (%this.something%).
           * @param {Object} [event] Associated event. Used for special tokens (%event.something%,
           * %target.something%)
           * @returns {*} A processed value.
           */
          var createReplaceTokens = function(isVar, getVar, undefinedVarsReturnEmpty) {
              var replaceTokensInString;
              var replaceTokensInObject;
              var replaceTokensInArray;
              var replaceTokens;
              var variablesBeingRetrieved = [];

              var getVarValue = function(token, variableName, syntheticEvent) {
                  if (!isVar(variableName)) {
                      return token;
                  }

                  variablesBeingRetrieved.push(variableName);
                  var val = getVar(variableName, syntheticEvent);
                  variablesBeingRetrieved.pop();
                  return val == null && undefinedVarsReturnEmpty ? '' : val;
              };

              /**
               * Perform variable substitutions to a string where tokens are specified in the form %foo%.
               * If the only content of the string is a single data element token, then the raw data element
               * value will be returned instead.
               *
               * @param str {string} The string potentially containing data element tokens.
               * @param element {HTMLElement} The element to use for tokens in the form of %this.property%.
               * @param event {Object} The event object to use for tokens in the form of %target.property%.
               * @returns {*}
               */
              replaceTokensInString = function(str, syntheticEvent) {
                  // Is the string a single data element token and nothing else?
                  var result = /^%([^%]+)%$/.exec(str);

                  if (result) {
                      return getVarValue(str, result[1], syntheticEvent);
                  } else {
                      return str.replace(/%(.+?)%/g, function(token, variableName) {
                          return getVarValue(token, variableName, syntheticEvent);
                      });
                  }
              };

              replaceTokensInObject = function(obj, syntheticEvent) {
                  var ret = {};
                  var keys = Object.keys(obj);
                  for (var i = 0; i < keys.length; i++) {
                      var key = keys[i];
                      var value = obj[key];
                      ret[key] = replaceTokens(value, syntheticEvent);
                  }
                  return ret;
              };

              replaceTokensInArray = function(arr, syntheticEvent) {
                  var ret = [];
                  for (var i = 0, len = arr.length; i < len; i++) {
                      ret.push(replaceTokens(arr[i], syntheticEvent));
                  }
                  return ret;
              };

              replaceTokens = function(thing, syntheticEvent) {
                  if (typeof thing === 'string') {
                      return replaceTokensInString(thing, syntheticEvent);
                  } else if (Array.isArray(thing)) {
                      return replaceTokensInArray(thing, syntheticEvent);
                  } else if (typeof thing === 'object' && thing !== null) {
                      return replaceTokensInObject(thing, syntheticEvent);
                  }

                  return thing;
              };

              return function(thing, syntheticEvent) {
                  // It's possible for a data element to reference another data element. Because of this,
                  // we need to prevent circular dependencies from causing an infinite loop.
                  if (variablesBeingRetrieved.length > 10) {
                      logger.error('Data element circular reference detected: ' +
                          variablesBeingRetrieved.join(' -> '));
                      return thing;
                  }

                  return replaceTokens(thing, syntheticEvent);
              };
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          /**
           * "Cleans" text by trimming the string and removing spaces and newlines.
           * @param {string} str The string to clean.
           * @returns {string}
           */
          var cleanText = function(str) {
              return typeof str === 'string' ? str.replace(/\s+/g, ' ').trim() : str;
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          var cache = {};
          var NAMESPACE = 'com.adobe.reactor.';

          var getNamespacedStorage = function(storageType, additionalNamespace) {
              var finalNamespace = NAMESPACE + (additionalNamespace || '');

              // When storage is disabled on Safari, the mere act of referencing window.localStorage
              // or window.sessionStorage throws an error. For this reason, we wrap in a try-catch.
              return {
                  /**
                   * Reads a value from storage.
                   * @param {string} name The name of the item to be read.
                   * @returns {string}
                   */
                  getItem: function(name) {
                      try {
                          return cache[finalNamespace + name];
                      } catch (e) {
                          return null;
                      }
                  },
                  /**
                   * Saves a value to storage.
                   * @param {string} name The name of the item to be saved.
                   * @param {string} value The value of the item to be saved.
                   * @returns {boolean} Whether the item was successfully saved to storage.
                   */
                  setItem: function(name, value) {
                      try {
                          cache[finalNamespace + name] = value;
                          return true;
                      } catch (e) {
                          return false;
                      }
                  }
              };
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/



          var DATA_ELEMENTS_NAMESPACE = 'dataElements.';

          var dataElementSessionStorage = getNamespacedStorage('sessionStorage', DATA_ELEMENTS_NAMESPACE);
          var dataElementLocalStorage = getNamespacedStorage('localStorage', DATA_ELEMENTS_NAMESPACE);

          var storageDurations = {
              PAGEVIEW: 'pageview',
              SESSION: 'session',
              VISITOR: 'visitor'
          };

          var pageviewCache = {};

          var serialize = function(value) {
              var serialized;

              try {
                  // On some browsers, with some objects, errors will be thrown during serialization. For example,
                  // in Chrome with the window object, it will throw "TypeError: Converting circular structure
                  // to JSON"
                  serialized = JSON.stringify(value);
              } catch (e) {}

              return serialized;
          };

          var setValue = function(key, storageDuration, value) {
              var serializedValue;

              switch (storageDuration) {
                  case storageDurations.PAGEVIEW:
                      pageviewCache[key] = value;
                      return;
                  case storageDurations.SESSION:
                      serializedValue = serialize(value);
                      if (serializedValue) {
                          dataElementSessionStorage.setItem(key, serializedValue);
                      }
                      return;
                  case storageDurations.VISITOR:
                      serializedValue = serialize(value);
                      if (serializedValue) {
                          dataElementLocalStorage.setItem(key, serializedValue);
                      }
                      return;
              }
          };

          var getValue = function(key, storageDuration) {
              var value;

              // It should consistently return the same value if no stored item was found. We chose null,
              // though undefined could be a reasonable value as well.
              switch (storageDuration) {
                  case storageDurations.PAGEVIEW:
                      return pageviewCache.hasOwnProperty(key) ? pageviewCache[key] : null;
                  case storageDurations.SESSION:
                      value = dataElementSessionStorage.getItem(key);
                      return value === null ? value : JSON.parse(value);
                  case storageDurations.VISITOR:
                      value = dataElementLocalStorage.getItem(key);
                      return value === null ? value : JSON.parse(value);
              }
          };

          var dataElementSafe = {
              setValue: setValue,
              getValue: getValue
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/





          var getErrorMessage = function(dataDef, dataElementName, errorMessage, errorStack) {
              return 'Failed to execute data element module ' + dataDef.modulePath + ' for data element ' +
                  dataElementName + '. ' + errorMessage + (errorStack ? '\n' + errorStack : '');
          };

          var isDataElementValuePresent = function(value) {
              return value !== undefined && value !== null;
          };

          var createGetDataElementValue = function(
              moduleProvider,
              getDataElementDefinition,
              replaceTokens,
              undefinedVarsReturnEmpty
          ) {
              return function(name, syntheticEvent) {
                  var dataDef = getDataElementDefinition(name);

                  if (!dataDef) {
                      return undefinedVarsReturnEmpty ? '' : null;
                  }

                  var storageDuration = dataDef.storageDuration;
                  var moduleExports;

                  try {
                      moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);
                  } catch (e) {
                      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
                      return;
                  }

                  if (typeof moduleExports !== 'function') {
                      logger.error(getErrorMessage(dataDef, name, 'Module did not export a function.'));
                      return;
                  }

                  var value;

                  try {
                      value = moduleExports(replaceTokens(dataDef.settings, syntheticEvent), syntheticEvent);
                  } catch (e) {
                      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
                      return;
                  }

                  if (storageDuration) {
                      if (isDataElementValuePresent(value)) {
                          dataElementSafe.setValue(name, storageDuration, value);
                      } else {
                          value = dataElementSafe.getValue(name, storageDuration);
                      }
                  }

                  if (!isDataElementValuePresent(value)) {
                      value = dataDef.defaultValue || '';
                  }

                  if (typeof value === 'string') {
                      if (dataDef.cleanText) {
                          value = cleanText(value);
                      }

                      if (dataDef.forceLowerCase) {
                          value = value.toLowerCase();
                      }
                  }

                  return value;
              };
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          var createModuleProvider = function() {
              var modules = {};

              return {
                  registerModules: function(newModules) {
                      modules = newModules;

                      Object.keys(modules).forEach(function(delegateDescriptorId) {
                          modules[delegateDescriptorId].script = modules[
                              delegateDescriptorId
                              ].script();
                      });
                  },

                  getModuleDefinition: function(modulePath) {
                      return modules[modulePath];
                  },

                  getModuleExports: function(modulePath) {
                      return modules[modulePath].script;
                  }
              };
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          /**
           * Determines if the provided name is a valid variable, where the variable
           * can be a data element, element, event, target, or custom var.
           * @param variableName
           * @returns {boolean}
           */
          var createIsVar = function(getDataElementDefinition) {
              return function(variableName) {
                  var nameBeforeDot = variableName.split('.')[0];

                  return Boolean(
                      getDataElementDefinition(variableName) ||
                      nameBeforeDot === 'this' ||
                      nameBeforeDot === 'event' ||
                      nameBeforeDot === 'target'
                  );
              };
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/



          var specialPropertyAccessors = {
              text: function(obj) {
                  return obj.textContent;
              },
              cleanText: function(obj) {
                  return cleanText(obj.textContent);
              }
          };

          /**
           * This returns the value of a property at a given path. For example, a <code>path<code> of
           * <code>foo.bar</code> will return the value of <code>obj.foo.bar</code>.
           *
           * In addition, if <code>path</code> is <code>foo.bar.getAttribute(unicorn)</code> and
           * <code>obj.foo.bar</code> has a method named <code>getAttribute</code>, the method will be
           * called with a value of <code>"unicorn"</code> and the value will be returned.
           *
           * Also, if <code>path</code> is <code>foo.bar.@text</code> or other supported properties
           * beginning with <code>@</code>, a special accessor will be used.
           *
           * @param host
           * @param path
           * @param supportSpecial
           * @returns {*}
           */
          var getObjectProperty = function(host, propChain, supportSpecial) {
              var value = host;
              var attrMatch;
              for (var i = 0, len = propChain.length; i < len; i++) {
                  if (value == null) {
                      return undefined;
                  }
                  var prop = propChain[i];
                  if (supportSpecial && prop.charAt(0) === '@') {
                      var specialProp = prop.slice(1);
                      value = specialPropertyAccessors[specialProp](value);
                      continue;
                  }
                  if (
                      value.getAttribute &&
                      (attrMatch = prop.match(/^getAttribute\((.+)\)$/))
                  ) {
                      var attr = attrMatch[1];
                      value = value.getAttribute(attr);
                      continue;
                  }
                  value = value[prop];
              }
              return value;
          };

          /**
           * Returns the value of a variable.
           * @param {string} variable
           * @param {Object} [syntheticEvent] A synthetic event. Only required when using %event... %this...
           * or %target...
           * @returns {*}
           */
          var createGetVar = function(getDataElementDefinition, getDataElementValue) {
              return function(variable, syntheticEvent) {
                  var value;

                  if (getDataElementDefinition(variable)) {
                      // Accessing nested properties of a data element using dot-notation is unsupported because
                      // users can currently create data elements with periods in the name.
                      value = getDataElementValue(variable, syntheticEvent);
                  } else {
                      var propChain = variable.split('.');
                      var variableHostName = propChain.shift();

                      if (variableHostName === 'this') {
                          if (syntheticEvent) {
                              // I don't know why this is the only one that supports special properties, but that's the
                              // way it was in Satellite.
                              value = getObjectProperty(syntheticEvent.element, propChain, true);
                          }
                      } else if (variableHostName === 'event') {
                          if (syntheticEvent) {
                              value = getObjectProperty(syntheticEvent, propChain);
                          }
                      } else if (variableHostName === 'target') {
                          if (syntheticEvent) {
                              value = getObjectProperty(syntheticEvent.target, propChain);
                          }
                      }
                  }

                  return value;
              };
          };

          /***************************************************************************************
           * (c) 2018 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          var MODULE_NOT_FUNCTION_ERROR = 'Module did not export a function.';

          var createExecuteDelegateModule = function(moduleProvider, replaceTokens) {
              return function(moduleDescriptor, syntheticEvent, moduleCallParameters) {
                  moduleCallParameters = moduleCallParameters || [];
                  var moduleExports = moduleProvider.getModuleExports(
                      moduleDescriptor.modulePath
                  );

                  if (typeof moduleExports !== 'function') {
                      throw new Error(MODULE_NOT_FUNCTION_ERROR);
                  }

                  var settings = replaceTokens(
                      moduleDescriptor.settings || {},
                      syntheticEvent
                  );

                  moduleCallParameters.unshift(settings);

                  return moduleExports.apply(null, moduleCallParameters);
              };
          };

          var commonjsGlobal$1 = typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};

          /**
           * @this {Promise}
           */
          function finallyConstructor(callback) {
              var constructor = this.constructor;
              return this.then(
                  function(value) {
                      // @ts-ignore
                      return constructor.resolve(callback()).then(function() {
                          return value;
                      });
                  },
                  function(reason) {
                      // @ts-ignore
                      return constructor.resolve(callback()).then(function() {
                          // @ts-ignore
                          return constructor.reject(reason);
                      });
                  }
              );
          }

          function setTimeout() {} // Make setTimeout a noop TEMPORARILY
          function clearTimeout() {} // Make setTimeout a noop TEMPORARILY

          // Store setTimeout reference so promise-polyfill will be unaffected by
          // other code modifying setTimeout (like sinon.useFakeTimers())
          var setTimeoutFunc = setTimeout;

          function isArray(x) {
              return Boolean(x && typeof x.length !== 'undefined');
          }

          function noop() {}

          // Polyfill for Function.prototype.bind
          function bind(fn, thisArg) {
              return function() {
                  fn.apply(thisArg, arguments);
              };
          }

          /**
           * @constructor
           * @param {Function} fn
           */
          function Promise(fn) {
              if (!(this instanceof Promise))
                  throw new TypeError('Promises must be constructed via new');
              if (typeof fn !== 'function') throw new TypeError('not a function');
              /** @type {!number} */
              this._state = 0;
              /** @type {!boolean} */
              this._handled = false;
              /** @type {Promise|undefined} */
              this._value = undefined;
              /** @type {!Array<!Function>} */
              this._deferreds = [];

              doResolve(fn, this);
          }

          function handle(self, deferred) {
              while (self._state === 3) {
                  self = self._value;
              }
              if (self._state === 0) {
                  self._deferreds.push(deferred);
                  return;
              }
              self._handled = true;
              Promise._immediateFn(function() {
                  var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
                  if (cb === null) {
                      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                      return;
                  }
                  var ret;
                  try {
                      ret = cb(self._value);
                  } catch (e) {
                      reject(deferred.promise, e);
                      return;
                  }
                  resolve(deferred.promise, ret);
              });
          }

          function resolve(self, newValue) {
              try {
                  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                  if (newValue === self)
                      throw new TypeError('A promise cannot be resolved with itself.');
                  if (
                      newValue &&
                      (typeof newValue === 'object' || typeof newValue === 'function')
                  ) {
                      var then = newValue.then;
                      if (newValue instanceof Promise) {
                          self._state = 3;
                          self._value = newValue;
                          finale(self);
                          return;
                      } else if (typeof then === 'function') {
                          doResolve(bind(then, newValue), self);
                          return;
                      }
                  }
                  self._state = 1;
                  self._value = newValue;
                  finale(self);
              } catch (e) {
                  reject(self, e);
              }
          }

          function reject(self, newValue) {
              self._state = 2;
              self._value = newValue;
              finale(self);
          }

          function finale(self) {
              if (self._state === 2 && self._deferreds.length === 0) {
                  Promise._immediateFn(function() {
                      if (!self._handled) {
                          Promise._unhandledRejectionFn(self._value);
                      }
                  });
              }

              for (var i = 0, len = self._deferreds.length; i < len; i++) {
                  handle(self, self._deferreds[i]);
              }
              self._deferreds = null;
          }

          /**
           * @constructor
           */
          function Handler(onFulfilled, onRejected, promise) {
              this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
              this.onRejected = typeof onRejected === 'function' ? onRejected : null;
              this.promise = promise;
          }

          /**
           * Take a potentially misbehaving resolver function and make sure
           * onFulfilled and onRejected are only called once.
           *
           * Makes no guarantees about asynchrony.
           */
          function doResolve(fn, self) {
              var done = false;
              try {
                  fn(
                      function(value) {
                          if (done) return;
                          done = true;
                          resolve(self, value);
                      },
                      function(reason) {
                          if (done) return;
                          done = true;
                          reject(self, reason);
                      }
                  );
              } catch (ex) {
                  if (done) return;
                  done = true;
                  reject(self, ex);
              }
          }

          Promise.prototype['catch'] = function(onRejected) {
              return this.then(null, onRejected);
          };

          Promise.prototype.then = function(onFulfilled, onRejected) {
              // @ts-ignore
              var prom = new this.constructor(noop);

              handle(this, new Handler(onFulfilled, onRejected, prom));
              return prom;
          };

          Promise.prototype['finally'] = finallyConstructor;

          Promise.all = function(arr) {
              return new Promise(function(resolve, reject) {
                  if (!isArray(arr)) {
                      return reject(new TypeError('Promise.all accepts an array'));
                  }

                  var args = Array.prototype.slice.call(arr);
                  if (args.length === 0) return resolve([]);
                  var remaining = args.length;

                  function res(i, val) {
                      try {
                          if (val && (typeof val === 'object' || typeof val === 'function')) {
                              var then = val.then;
                              if (typeof then === 'function') {
                                  then.call(
                                      val,
                                      function(val) {
                                          res(i, val);
                                      },
                                      reject
                                  );
                                  return;
                              }
                          }
                          args[i] = val;
                          if (--remaining === 0) {
                              resolve(args);
                          }
                      } catch (ex) {
                          reject(ex);
                      }
                  }

                  for (var i = 0; i < args.length; i++) {
                      res(i, args[i]);
                  }
              });
          };

          Promise.resolve = function(value) {
              if (value && typeof value === 'object' && value.constructor === Promise) {
                  return value;
              }

              return new Promise(function(resolve) {
                  resolve(value);
              });
          };

          Promise.reject = function(value) {
              return new Promise(function(resolve, reject) {
                  reject(value);
              });
          };

          Promise.race = function(arr) {
              return new Promise(function(resolve, reject) {
                  if (!isArray(arr)) {
                      return reject(new TypeError('Promise.race accepts an array'));
                  }

                  for (var i = 0, len = arr.length; i < len; i++) {
                      Promise.resolve(arr[i]).then(resolve, reject);
                  }
              });
          };

          // Use polyfill for setImmediate for performance gains
          Promise._immediateFn =
              // @ts-ignore
              (typeof setImmediate === 'function' &&
                  function(fn) {
                      // @ts-ignore
                      setImmediate(fn);
                  }) ||
              function(fn) {
                  setTimeoutFunc(fn, 0);
              };

          Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
              if (typeof console !== 'undefined' && console) {
                  console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
              }
          };




          var src$2 = Object.freeze({
              default: Promise
          });

          var require$$0 = ( src$2 && Promise ) || src$2;

          // For building Turbine we are using Rollup. For running the turbine tests we are using
          // Karma + Webpack. You need to specify the default import when using promise-polyfill`
          // with Webpack 2+. We need `require('promise-polyfill').default` for running the tests
          // and `require('promise-polyfill')` for building Turbine.

          //var reactorPromise =
          //    (typeof window !== 'undefined' && window.Promise) ||
          //    (typeof commonjsGlobal$1 !== 'undefined' && commonjsGlobal$1.Promise) ||
          //    require$$0.default ||
          //    require$$0;

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/




          var PROMISE_TIMEOUT = 2000;

          var executeRules = function(moduleProvider, replaceTokens, rules, payload) {
              var rulePromises = [];

              (rules || []).forEach(function(rule) {
                  var lastPromiseInQueue = reactorPromise.resolve();
                  var payloadPromise = reactorPromise.resolve(payload);

                  var executeDelegateModule = createExecuteDelegateModule(
                      moduleProvider,
                      replaceTokens
                  );

                  var getModuleDisplayNameByRuleComponent = function(ruleComponent) {
                      var moduleDefinition = moduleProvider.getModuleDefinition(
                          ruleComponent.modulePath
                      );
                      return (
                          (moduleDefinition && moduleDefinition.displayName) ||
                          ruleComponent.modulePath
                      );
                  };

                  var getErrorMessage = function(ruleComponent, errorMessage, errorStack) {
                      var moduleDisplayName = getModuleDisplayNameByRuleComponent(
                          ruleComponent
                      );
                      return (
                          'Failed to execute ' +
                          moduleDisplayName +
                          errorMessage +
                          (errorStack ? '\n' + errorStack : '')
                      );
                  };

                  var logActionError = function(action, e) {
                      logger.error(getErrorMessage(action, e.message, e.stack));
                  };

                  var logConditionError = function(condition, rule, e) {
                      logger.error(getErrorMessage(condition, rule, e.message, e.stack));
                  };

                  var logConditionNotMet = function(condition, rule) {
                      var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

                      logger.log(
                          'Condition ' +
                          conditionDisplayName +
                          ' for rule ' +
                          rule.name +
                          ' not met.'
                      );
                  };

                  var logRuleCompleted = function(rule) {
                      logger.log('Rule "' + rule.name + '" fired.');
                  };

                  var normalizeError = function(e) {
                      if (!e) {
                          e = new Error(
                              'The extension triggered an error, but no error information was provided.'
                          );
                      }

                      if (!(e instanceof Error)) {
                          e = new Error(String(e));
                      }

                      return e;
                  };

                  var isConditionMet = function(condition, result) {
                      return (result && !condition.negate) || (!result && condition.negate);
                  };

                  if (rule.conditions) {
                      rule.conditions.forEach(function(condition) {
                          lastPromiseInQueue = lastPromiseInQueue.then(function() {
                              var timeoutId;

                              return new reactorPromise(function(resolve, reject) {
                                  timeoutId = setTimeout(function() {
                                      // Reject instead of resolve to prevent subsequent
                                      // conditions and actions from executing.
                                      reject(
                                          'A timeout occurred because the condition took longer than ' +
                                          PROMISE_TIMEOUT / 1000 +
                                          ' seconds to complete. '
                                      );
                                  }, PROMISE_TIMEOUT);

                                  reactorPromise.resolve(
                                      executeDelegateModule(condition, payload, [payload])
                                  ).then(resolve, reject);
                              })
                                  .catch(function(e) {
                                      e = normalizeError(e);
                                      logConditionError(condition, rule, e);
                                      return false;
                                  })
                                  .then(function(result) {
                                      clearTimeout(timeoutId);
                                      if (!isConditionMet(condition, result)) {
                                          logConditionNotMet(condition, rule);
                                          return reactorPromise.reject();
                                      }
                                  });
                          });


                      });
                  }

                  if (rule.actions) {
                      lastPromiseInQueue = lastPromiseInQueue.then(function() {
                          return payloadPromise;
                      });

                      rule.actions.forEach(function(action) {
                          lastPromiseInQueue = lastPromiseInQueue.then(function(payload) {
                              var timeoutId;
                              return new reactorPromise(function(resolve, reject) {
                                  timeoutId = setTimeout(function() {
                                      reject(
                                          'A timeout occurred because the action took longer than ' +
                                          PROMISE_TIMEOUT / 1000 +
                                          ' seconds to complete. '
                                      );
                                  }, PROMISE_TIMEOUT);


                                  reactorPromise.resolve(
                                      executeDelegateModule(action, payload, [payload])
                                  ).then(resolve, reject);
                              })
                                  .catch(function(e) {
                                      e = normalizeError(e);
                                      logActionError(action, rule);
                                  })
                                  .then(function(result) {
                                      clearTimeout(timeoutId);
                                      return result;
                                  });
                          });
                      });
                  }

                  lastPromiseInQueue = lastPromiseInQueue
                      .then(function(lastActionResult) {
                          logRuleCompleted(rule);
                          return lastActionResult;
                      })
                      .catch(function() {});

                  rulePromises.push(lastPromiseInQueue);
              });

              return reactorPromise.all(rulePromises);
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/

          /**
           * Creates a function that, when called, will return a configuration object with data element
           * tokens replaced.
           *
           * @param {Object} settings
           * @returns {Function}
           */
          var createGetExtensionSettings = function(replaceTokens, settings) {
              return function() {
                  return settings ? replaceTokens(settings) : {};
              };
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/



          var scopedTurbine = {};


          var hydrateScopedUtilities = function(container, replaceTokens, getDataElementValue) {
              var extensions = container.extensions;
              var buildInfo = container.buildInfo;
              var propertySettings = container.property.settings;

              if (extensions) {
                  Object.keys(extensions).forEach(function(extensionName) {
                      var extension = extensions[extensionName];
                      var getExtensionSettings = createGetExtensionSettings(replaceTokens, extension.settings);

                      var prefixedLogger = logger.createPrefixedLogger(extension.displayName);

                      scopedTurbine[extensionName] = {
                          buildInfo: buildInfo,
                          getDataElementValue: getDataElementValue,
                          getExtensionSettings: getExtensionSettings,
                          logger: prefixedLogger,
                          propertySettings: propertySettings,
                          replaceTokens: replaceTokens
                      };
                  });
              }

              return scopedTurbine;
          };

          /***************************************************************************************
           * (c) 2017 Adobe. All rights reserved.
           * This file is licensed to you under the Apache License, Version 2.0 (the "License");
           * you may not use this file except in compliance with the License. You may obtain a copy
           * of the License at http://www.apache.org/licenses/LICENSE-2.0
           *
           * Unless required by applicable law or agreed to in writing, software distributed under
           * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
           * OF ANY KIND, either express or implied. See the License for the specific language
           * governing permissions and limitations under the License.
           ****************************************************************************************/








          var scopedTurbineVariable = {};
          var moduleProvider = createModuleProvider();

          var initialize = function(container, modules) {
              var undefinedVarsReturnEmpty =
                  container.property.settings.undefinedVarsReturnEmpty;

              var dataElements = container.dataElements || {};

              var getDataElementDefinition = function(name) {
                  return dataElements[name];
              };

              var replaceTokens;

              // We support data elements referencing other data elements. In order to be able to retrieve a
              // data element value, we need to be able to replace data element tokens inside its settings
              // object (which is what replaceTokens is for). In order to be able to replace data element
              // tokens inside a settings object, we need to be able to retrieve data element
              // values (which is what getDataElementValue is for). This proxy replaceTokens function solves the
              // chicken-or-the-egg problem by allowing us to provide a replaceTokens function to
              // getDataElementValue that will stand in place of the real replaceTokens function until it
              // can be created. This also means that createDataElementValue should not call the proxy
              // replaceTokens function until after the real replaceTokens has been created.
              var proxyReplaceTokens = function() {
                  return replaceTokens.apply(null, arguments);
              };

              var getDataElementValue = createGetDataElementValue(
                  moduleProvider,
                  getDataElementDefinition,
                  proxyReplaceTokens,
                  undefinedVarsReturnEmpty
              );

              var isVar = createIsVar(getDataElementDefinition);

              var getVar = createGetVar(getDataElementDefinition, getDataElementValue);

              replaceTokens = createReplaceTokens(isVar, getVar, undefinedVarsReturnEmpty);

              scopedTurbineVariable = hydrateScopedUtilities(
                  container,
                  replaceTokens,
                  getDataElementValue
              );

              moduleProvider.registerModules(container.modules);

              return executeRules.bind(null, moduleProvider, replaceTokens, container.rules);
          };

          var src = {
              initialize: initialize,
              getScopedExtensionUtilities: function getScopedExtensionUtilities(
                  extensionPackageId
              ) {
                  return scopedTurbineVariable[extensionPackageId];
              }
          };

          var src_1 = src.initialize;
          var src_2 = src.getScopedExtensionUtilities;

          exports['default'] = src;
          exports.initialize = src_1;
          exports.getScopedExtensionUtilities = src_2;
      });

      unwrapExports(engineServer);
      var engineServer_1 = engineServer.initialize;
      var engineServer_2 = engineServer.getScopedExtensionUtilities;

      const container$1 = container(url);

      executeRules = engineServer.initialize(container$1);

      var universal = {

      };

      exports.default = universal;

      Object.defineProperty(exports, '__esModule', { value: true });

  })));
