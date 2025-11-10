/// <reference lib="webworker" />
/**
 * @license
 * Copyright 4Ming e.K. All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * LICENSE file at https://kompendia.net/LICENSE.txt
 */

import loader from '@assemblyscript/loader';
import { timer } from 'rxjs';
import { setASModuleExports } from './as-utils';

var wasms = {};
var lastPost;
var buffer;
var blob;
var results;
var anim;

addEventListener('message', async (event) => {
  let msg = event.data;
  let ti0, ti1, tc0, tc1, tm0, arrPtr, dataRef;

  switch (msg.cmd) {
    case 'init':
      lastPost = Date.now();
      await initWorker(msg);

      if (msg.autoStart) {
        doWorker({
          cmd: 'do',
          eid: msg.eid,
          inputs: msg.inputs,
          fps: msg.fps,
          autoStart: msg.autoStart,
        });
      }
      break;
    case 'initcalc':
      lastPost = Date.now();
      await initWorker(msg);

      if (msg.autoStart) {
        doWorker({
          cmd: 'do',
          eid: msg.eid,
          inputs: msg.inputs,
          fps: msg.fps,
          autoStart: msg.autoStart,
        });
      }
      break;
    case 'do':
      doWorker(msg);
      break;
    case 'play':
      doWorker({
        cmd: 'do',
        eid: msg.eid,
        inputs: msg.inputs,
        fps: msg.fps,
        autoStart: msg.autoStart,
      });
      break;
    case 'pause':
      doWorker({
        cmd: 'do',
        eid: msg.eid,
        inputs: msg.inputs,
      });
      break;
    case 'stop':
      if (anim) {
        anim.unsubscribe();
        anim = null;
        lastPost = null;
        return;
      }
      break;
    case 'input':
      inputWorker(msg);
      break;
    default:
      postMessage({ cmd: 'message', value: 'unknown command' });
  }
});

async function initWorker(msg) {
  let ti0, ti1, tc0, tc1, tm0, arrPtr, dataRef;
  if (anim) {
    anim.unsubscribe();
    anim = null;
    lastPost = null;
  }
  const imports = {
    utils: {
      'console.log': (msgPtr) => {
        console.log(`${wasms[msg.eid].__getString(msgPtr)}`);
      },
    },

    env: {
      memory: new WebAssembly.Memory({
        initial: 5,
        maximum: 100,
      }),
      // abort: () => {},
      // table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
    },
  };

  let calc: any = await loadFromIndexedDB('wasms', msg.eid);

  if (calc?.version !== msg.version) {
    const url = `/api/calculations/wasm/${msg.eid}`;
    let res = await fetch(url);
    if (res.status === 200) {
      blob = await res.blob();
      // buffer = await res.arrayBuffer();
      await saveToIndexedDB('wasms', {
        _eid: msg.eid,
        version: msg.version,
        wasm: blob,
      });
    }
  } else {
    blob = calc.wasm;
  }

  if (!blob) return;

  buffer = await blob.arrayBuffer();

  if (!buffer) return;

  let wasm = await loader.instantiate(buffer, imports);
  wasms[msg.eid] = wasm.exports;
  setASModuleExports(wasms[msg.eid]);

  dataRef = wasms[msg.eid].__pin(
    wasms[msg.eid].__newArray(wasms[msg.eid].FLOAT64ARRAY_ID, msg.inputs),
  );

  wasms[msg.eid].makeInput(dataRef);
  wasms[msg.eid].__unpin(dataRef);

  ti0 = performance.now();
  wasms[msg.eid].onInit(msg.vpw, msg.vph);
  ti1 = performance.now();
  tc0 = performance.now();
  arrPtr = wasms[msg.eid].onChanges(0);
  tc1 = performance.now();
  tm0 = Date.now();
  results = wasms[msg.eid].__getFloat64Array(arrPtr);

  postMessage(
    {
      cmd: msg.cmd,
      ti: ti1 - ti0,
      tc: tc1 - tc0,
      eid: msg.eid,
      results: results.buffer,
      tm0: tm0,
    },
    [results.buffer],
  );
  // wasms[msg.eid].__collect();
}
async function doWorker(msg) {
  let ti0, ti1, tc0, tc1, tm0, arrPtr, dataRef;
  lastPost = lastPost || Date.now();
  if ((msg.autoStart || msg.start) && !anim) {
    if (anim) {
      anim.unsubscribe();
      anim = null;
      lastPost = null;
    }
    anim = timer(0, 1000 / msg.fps).subscribe((t) => {
      doFrame(msg);
      // requestAnimationFrame(doFrame(msg));
    });
  } else {
    if (anim) {
      anim.unsubscribe();
      anim = null;
      lastPost = null;
      return;
    }
    const t = Date.now();
    const tDeltaT = t - lastPost;
    lastPost = t;
    const deltaT = tDeltaT / 1000;
    dataRef = wasms[msg.eid].__pin(
      wasms[msg.eid].__newArray(wasms[msg.eid].FLOAT64ARRAY_ID, msg.inputs),
    );
    wasms[msg.eid].makeInput(dataRef);
    wasms[msg.eid].__unpin(dataRef);
    tc0 = performance.now();
    arrPtr = wasms[msg.eid].onChanges(deltaT);
    tc1 = performance.now();
    tm0 = Date.now();
    results = wasms[msg.eid].__getFloat64Array(arrPtr);
    postMessage(
      {
        cmd: msg.cmd,
        tc: tc1 - tc0,
        eid: msg.eid,
        results: results.buffer,
        tm0: tm0,
      },
      [results.buffer],
    );
  }
}
function doFrame(msg) {
  let ti0, ti1, tc0, tc1, tm0, arrPtr, dataRef;
  const t0 = Date.now();
  const tDeltaT = t0 - lastPost;
  lastPost = t0;
  const deltaT = tDeltaT / 1000;
  tc0 = performance.now();
  arrPtr = wasms[msg.eid].onChanges(deltaT);
  results = wasms[msg.eid].__getFloat64Array(arrPtr);
  tc1 = performance.now();
  tm0 = Date.now();
  postMessage(
    {
      cmd: msg.cmd,
      tc: tc1 - tc0,
      eid: msg.eid,
      results: results.buffer,
    },
    [results.buffer],
  );

  return null;
}
async function inputWorker(msg) {
  let ti0, ti1, tc0, tc1, tm0, arrPtr, dataRef;
  dataRef = wasms[msg.eid].__pin(
    wasms[msg.eid].__newArray(wasms[msg.eid].FLOAT64ARRAY_ID, msg.inputs),
  );

  wasms[msg.eid].makeInput(dataRef);
  wasms[msg.eid].__unpin(dataRef);
}

function loadFromIndexedDB(storeName, id) {
  return new Promise(function (resolve, reject) {
    var dbRequest = indexedDB.open('kompendia');

    dbRequest.onerror = function (event) {
      reject(Error('Error text'));
    };

    dbRequest.onupgradeneeded = function (event) {
      // Objectstore does not exist. Nothing to load
      // @ts-ignore
      event.target.transaction.abort();
      reject(Error('Not found'));
    };

    dbRequest.onsuccess = function (event) {
      // @ts-ignore
      var database = event.target.result;
      var transaction = database.transaction([storeName]);
      var objectStore = transaction.objectStore(storeName);
      var objectRequest = objectStore.get(id);

      objectRequest.onerror = function (event) {
        reject(Error('Error text'));
      };

      objectRequest.onsuccess = function (event) {
        if (objectRequest.result) resolve(objectRequest.result);
        else resolve(null);
      };
    };
  });
}

function saveToIndexedDB(storeName, object) {
  return new Promise(function (resolve, reject) {
    if (object._eid === undefined) reject(Error('object has no id.'));
    var dbRequest = indexedDB.open('kompendia');

    dbRequest.onerror = function (event) {
      reject(Error('IndexedDB database error'));
    };

    dbRequest.onupgradeneeded = function (event) {
      // @ts-ignore
      var database = event.target.result;
      // var objectStore = database.createObjectStore(storeName, {keyPath: "id"});
    };

    dbRequest.onsuccess = function (event) {
      // @ts-ignore
      var database = event.target.result;
      var transaction = database.transaction([storeName], 'readwrite');
      var objectStore = transaction.objectStore(storeName);
      var objectRequest = objectStore.put(object); // Overwrite if exists

      objectRequest.onerror = function (event) {
        reject(Error('Error text'));
      };

      objectRequest.onsuccess = function (event) {
        resolve('Data saved OK');
      };
    };
  });
}
