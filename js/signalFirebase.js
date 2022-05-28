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
    this.size = 0;
    return this;
  },
  oCA: function (func) {
    const aaa = this;
    let dataArrr = aaa.dataArr;
    let tempBool = false;

    // const bbb =()=>{
    //   console.log("bbb");
    //   console.log(aaa);
    //   // return aaa;
    //   console.log(this);
    //   return this;
    // }
    console.log(tempBool);
    onChildAdded(this.path, function (dataSnap) {
      dataArrr.push([dataSnap.key, dataSnap.val()]);
      func(dataSnap);
    });
    // $.when(console.log("when")).done(function(){bbb()});
    // if(tempBool){
    //   console.log(this);
    //   return this;
    // }
    // let num = 0;

    // async function test() {
    //   await wait(1);
    //   num = 500;
    //   tempBool = true;
    //   console.log("3000");
    // }
    // test();

    // console.log(tempBool);

    // while (num < 300) {
    //   console.log("false");
    //   if (tempBool == true) {
    //     console.log(this);
    //     return this;
    //   }
    // }

    // for(let i=0;i < 1000000000000000000000000000000000;i++){
    //   if(){
    //     console.log(i);
    //     console.log(this);
    //     return this;
    //   }
    // }
  },

  // logData: function () {
  //   console.log("aaa");
  //   let dataArrr = this.dataArr;
  //   dataArrr.forEach((ele) => {
  //     console.log(ele);
  //     console.log("aaa");
  //   });
  // },

  oCAPre: function (arr) {
    onChildAdded(this.path, function (dataSnap) {
      arr.push([dataSnap.key, dataSnap.val()]);
    });
    return this;
  },

  oCAPost: function (arr) {
    this.dataArr = arr;
    console.log(this);
    return this;
  },

  logData: function () {
    for (let i = 0; i < this.dataArr.length; i++) {
      console.log(this.dataArr[i]);
    }
  },

  show: function (initFunc, mainFunc) {
    let arr = this.dataArr;
    initFunc();
    arr.forEach((ele) => {
      mainFunc(ele[0], ele[1]);
    });
  },

  showCustom: function (initFunc, mainFunc,onLoadBool) {
    console.log("if文前");
    if(onLoadBool){
      let arr = this.dataArr;
      initFunc();
      console.log("if文内");
      arr.forEach((ele) => {
        mainFunc(ele[0], ele[1]);
      });
    }
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

  sortProp: async function (value) {
    const sortRef = query(this.path, orderByChild(value)); //値が小さい順のものを生成する
    let temp = 0;
    let arr = this.dataArr;
    onValue(sortRef, (snapshot) => {
      temp = snapshot.size;
      console.log(snapshot.size);
      snapshot.forEach((childSnapshot) => {
        arr.push([childSnapshot.key, childSnapshot.val()]);
      });
    });
    await wait(1);
    this.size = temp;
    console.log(this);
    // console.log(dataSize);
    // let i = 0;
    // while (i < dataSize) {
    //   i++;
    //   console.log(i);
    //   if (i == dataSize - 1) {
    //     return this;
    //   }
    // }
    // onValue(sortRef, (snapshot) => {
    //   initFunc();
    //   snapshot.forEach((childSnapshot) => {
    //     mainFunc(childSnapshot);
    //   });
    //   return this;
    // });
  },

  sortLog: function () {
    let arr = this.dataArr;
    console.log(arr);
    arr.forEach((ele) => {
      console.log(ele);
    });
    return this;
  },

  sortShow: function (mainFunc) {
    let arr = this.dataArr;
    arr.forEach((ele) => {
      console.log(ele);
      mainFunc(ele[0], ele[1]);
    });
    return this;
  },

  changeShow: async function (
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

  // sortTest

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
  sortDesc: function (value) {
    function compareFunc(a, b) {
      return b[1][`${value}`] - a[1][`${value}`];
    }
    let arr = this.dataArr;
    console.log(arr);
    arr.sort(compareFunc);
    console.log(this);
    return this;
  },

  mapping: function (selector) {
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
