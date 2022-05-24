"use strict";

//********************************************************************
// signalFirebase v1.0.0 (https://github.com/kyok01/signalFirebase)
// Auther:Kazutaka.Yokoi
// MIT License.
//********************************************************************

// if you use this library, you have to code as below in your javascrit file.
////// import {sg} from './js/signalFirebase.js';
// you have to code Firebase environment variables in your javascript file.
// you have to code Firebase environment variables in your javascript file.
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// To use this library, you must import import {getDatabase,ref,onChildAdded,onChildRemoved,onChildChanged,child,onValue,}

//import SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";

import {
  getDatabase,
  ref,
  onChildAdded,
  onValue,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

// if you make env.js and write environment variables there, please import.
import {
    envapiKey,
    envauthDomain,
    envdatabaseURL,
    envprojectId,
    envstorageBucket,
    envmessagingSenderId,
    envappId,
  } from "./env.js";

// Your web app's Firebase configuration. import env, or write directly.
const firebaseConfig = {
    apiKey: envapiKey,
    authDomain: envauthDomain,
    databaseURL: envdatabaseURL,
    projectId: envprojectId,
    storageBucket: envstorageBucket,
    messagingSenderId: envmessagingSenderId,
    appId: envappId,
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// pausing function
const wait = (sec) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, sec * 1000);
  });
};

//signalFirebase prototype
export const sg = function sg(path) {
  return new sg.prototype.init(path);
};

sg.prototype = {
  init: function (path) {
    this.dataArr = [];
    this.path = ref(db, path);
    return this;
  },
  oCA: function (func) {
    let dataArrr = this.dataArr;
    onChildAdded(this.path, function (dataSnap) {
      dataArrr.push([dataSnap.key, dataSnap.val()]);
      func(dataSnap);
      return this;
    });
  },

  oCADisplay: async function (mainFunc, onLoadBool, RealTimeBool) {
    let dataArrr = this.dataArr;
    if (onLoadBool == false && RealTimeBool == false) {
      alert("error");
    } else {
      onChildAdded(this.path, function (dataSnap) {
        if (onLoadBool) {
          dataArrr.push([dataSnap.key, dataSnap.val()]);
          mainFunc(dataSnap);
          return this;
        }
      });
      await wait(1); //not good coding way
      if (onLoadBool == false && RealTimeBool == true) {
        onLoadBool = true;
      }
      if (onLoadBool == true && RealTimeBool == false) {
        onLoadBool = false;
      }
      // both onLoadBool and RealtimeBool are true, then nothing to code.
    }
  },

  sortRealtimeChild: function (value, initFunc, mainFunc) {
    const sortRef = query(this.path, orderByChild(value)); //値が小さい順のものを生成する
    onValue(sortRef, (snapshot) => {
      initFunc();
      snapshot.forEach((childSnapshot) => {
        mainFunc(childSnapshot);
      });
      return this;
    });
  },

  sortChildDisplay: async function (
    value,
    initFunc,
    mainFunc,
    onLoadBool,
    RealTimeBool
  ) {
    if (onLoadBool == false && RealTimeBool == false) {
      alert("error");
    } else {
      const sortRef = query(this.path, orderByChild(value)); //make value ascending reference
      onValue(sortRef, (snapshot) => {
        if (onLoadBool) {
          initFunc(snapshot);
          snapshot.forEach((childSnapshot) => {
            mainFunc(childSnapshot);
          });
          return this;
        }
      });
      await wait(1); //not good coding way
      if (onLoadBool == false && RealTimeBool == true) {
        onLoadBool = true;
      }
      if (onLoadBool == true && RealTimeBool == false) {
        onLoadBool = false;
      }
      // both onLoadBool and RealtimeBool are true, then nothing to code.
    }
  },
  sortChildLineupWithNum: async function (
    value,
    initFunc,
    mainFunc,
    order = "desc",
    tiedRankBool = true,
    onLoadBool = true,
    RealTimeBool = true
  ) {
    if (onLoadBool == false && RealTimeBool == false) {
      alert("error");
    } else {
      const sortRef = query(this.path, orderByChild(value)); //make value ascending reference
      onValue(sortRef, (snapshot) => {
        if (onLoadBool) {
          initFunc(snapshot);
          const size = snapshot.size;
          let eleNum = 0;
          let rankArr = [];
          snapshot.forEach((childSnapshot) => {
            eleNum++;
            let tempHash = {};
            let tempArr = [];
            for (const [tempKey, tempValue] of Object.entries(
              childSnapshot.val()
            )) {
              tempHash[tempKey] = tempValue;
            }
            tempArr[0] = childSnapshot.key;
            tempArr[1] = tempHash;
            if (order == "desc") {
              rankArr.unshift(tempArr); //move from asc to desc
            }
            if (order == "asc") {
              rankArr.push(tempArr); //keep desc
            }
            if (eleNum == size) {
              let preNum; //former element value
              let rankNum = 0; //ranking number
              rankArr.forEach((ele) => {
                const childKey = ele[0];
                const childValue = ele[1];
                if (tiedRankBool) {
                  if (preNum != childValue[value]) {
                    rankNum++;
                  }
                } else {
                  rankNum++;
                }
                preNum = childValue[value];
                mainFunc(childKey, childValue, rankNum);
              });
            }
          });
          return this;
        }
      });
      await wait(1); //not good coding way
      if (onLoadBool == false && RealTimeBool == true) {
        onLoadBool = true;
      }
      if (onLoadBool == true && RealTimeBool == false) {
        onLoadBool = false;
      }
    }
  },

  mapping: function(selector){
    onValue(this.path, (snapshot) => {
        //initialization
        $(selector).html("");
        let divDfArr = [];
        let divDf;
        //draw
        drawDatarecursive(snapshot.val());

        function drawDatarecursive(obj) {
            if (obj !== null && typeof obj === "object") {
              for (const [key, value] of Object.entries(obj)) {
                if (value !== null && typeof value === "object") {
                  divDf = `df${key}`;
                  uniqueElePush(divDfArr, divDf);
                  $(selector).append(
                    `<div id="key${key}"><span>${key}</span><div id="${divDf}" class="map__df"></div></div>` //dfはdisplay:flex;の略
                  );
                } else {
                  $(`#${divDf}`).append(
                    `<div class="map__keyAndVal"><span class="map__keyAndVal_key">${key}</span>:<span class="map__keyAndVal_val">${value}</span></div>`
                  );
                }
                drawDatarecursive(value);
              }
            } else {
              giveDivDfClass();
              return;
            }
          }
          
          function giveDivDfClass() {
            divDfArr.forEach((ele) => {
              if ($(`#${ele}`).html() == "") {
                $(`#${ele}`).attr("class", "map__leftmost");
              } else {
                $(`#key${ele.slice(2)}`).attr("class", "map__left");
              }
            });
          }
          
          // push unique element to array
          function uniqueElePush(arr, ele) {
            if (!arr.includes(ele)) {
              arr.push(ele);
              return;
            } else {
              ele = ele + "_";
              uniqueElePush(arr, ele);
            }
          }
          // uniqueElePush function demo
          // let sampleArr = ["aaa", "bbb"];
          // uniqueElePush(sampleArr, "aaa");
          // console.log(sampleArr); // ["aaa", "bbb", "aaa_"]
          // uniqueElePush(sampleArr, "aaa");
          // console.log(sampleArr); // ["aaa", "bbb", "aaa_", "aaa__"]
      }); 
  },
};
sg.prototype.init.prototype = sg.prototype;
