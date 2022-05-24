"use strict";

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
  onChildRemoved,
  update,
  onChildChanged,
  get,
  child,
  onValue,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  envapiKey,
  envauthDomain,
  envdatabaseURL,
  envprojectId,
  envstorageBucket,
  envmessagingSenderId,
  envappId,
} from "./env.js";

import {sg} from "./signalFirebase.js";

// Your web app's Firebase configuration
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
const dbRef = ref(db, "chat");

// グローバル変数
let divDfArr = []; //map描写の際に使用する配列の変数
let divDf; //map描写の際に使用する変数

//送信イベント
// 送信
$("#send").on("click", function () {
  //空白のまま送信されることを防ぐ
  if (
    $("#uname").val() != "" &&
    $("#age").val() != "" &&
    $("#text").val() != ""
  ) {
    const msg = {
      uname: $("#uname").val(),
      text: $("#text").val(),
      age: Number($("#age").val()),
      deleteFrag: false,
    };
    // 唯一のkeyを取得する
    const newPostRef = push(dbRef);
    set(newPostRef, msg);
    // 送信後に入力欄を空白にする
    $("#uname").val("");
    $("#text").val("");
    $("#age").val("");
  }
});

$("#sendTestKey").on("click", function () {
  set(ref(db, "chat/-N2UnGmxnj_FoPQv-Uw3/testKey"), {
    uname: "testName",
    text: "testText",
  });
});

//データ登録(Enter)
$("#text").on("keydown", function (e) {
  console.log(e); //e変数の中身を確認！！
  if (e.keyCode == 13) {
    //EnterKey=13
    const msg = {
      uname: $("#uname").val(),
      text: $("#text").val(),
      age: Number($("#age").val()),
      deleteFrag: false,
    };
    const newPostRef = push(dbRef); //ユニークKEYを生成
    set(newPostRef, msg); //"chat"にユニークKEYをつけてオブジェクトデータを登録
    $("#uname").val("");
    $("#text").val("");
    $("#age").val("");
  }
});

// 物理削除
// 物理削除 パターン1
$("#deletePhysical").on("click", function () {
  //空白のまま削除されchat配下のデータが全て消されてしまうのを防ぐ
  console.log("物理削除ボタン押せたよ");
  if ($("#deleteKey").val() != "") {
    const deleteKey = $("#deleteKey").val();
    const dbRefDelete = ref(db, "chat/" + deleteKey);
    remove(dbRefDelete);
    // 削除後に入力欄を空白にする
    $("#deleteKey").val("");
  }
});

// 物理削除 パターン2、Fdはphysical Deletionの略
$(document).on("click", 'button[data-btn^="btnFd"]', function () {
  console.log("osetayo");
  console.log($(this).data("btn")); //thisでクリックされたそのものを取得して、そこに付与したdata-btn属性をdebugしている
  console.log($(this).data("btn").slice(5)); //replaceを使うともしkeyにbtnFdが含まれるとバグが起きるので、sliceを用いてbtnFd後の5の位置のみ切り出す
  const deleteKey = $(this).data("btn").slice(5);
  const dbRefDelete = ref(db, "chat/" + deleteKey);
  remove(dbRefDelete);
});

// 論理削除 パターン1
$("#deleteLogical").on("click", function () {
  console.log("理論削除ボタン押した");
  //空白のまま削除されchat配下のデータが全て消されてしまうのを防ぐ
  if ($("#deleteKey").val() != "") {
    const deleteKey = $("#deleteKey").val();
    get(child(ref(db), `chat/${deleteKey}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val()); //debug
          const msg = {
            uname: snapshot.val().uname,
            text: snapshot.val().text,
            deleteFrag: true,
          };
          set(child(ref(db), `chat/${deleteKey}`), msg);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    // 削除後に入力欄を空白にする
    $("#deleteKey").val("");
  }
});

// 論理削除 パターン2、LdはLogical Deletionの略
$(document).on("click", 'button[data-btn^="btnLd"]', function () {
  console.log("osetayo");
  console.log($(this).data("btn")); //thisでクリックされたそのものを取得して、そこに付与したdata-btn属性をdebugしている
  console.log($(this).data("btn").slice(5)); //replaceを使うともしkeyにbtnFdが含まれるとバグが起きるので、sliceを用いてbtnFd後の5の位置のみ切り出す
  const deleteKey = $(this).data("btn").slice(5);
  const dbRefDelete = ref(db, "chat/" + deleteKey);
  remove(dbRefDelete);
});

// 編集・更新 パターン1
$("#update").on("click", function () {
  console.log("更新ボタン押せた"); //debug
  const updateKey = $("#updateKey").val();
  const updateUName = $("#updateUName").val();
  const updateText = $("#updateText").val();
  const postData = {
    uname: updateUName,
    text: updateText,
    deleteFrag: false,
  };
  const updates = {};
  updates["chat/" + updateKey] = postData;
  update(ref(db), updates);
  $("#updateKey").val("");
  $("#updateUName").val("");
  $("#updateText").val("");
});

// 編集・更新 パターン2、Udはupdateの略、UEはupdate endの略
// 編集可能にするための処理
$(document).on("click", 'button[data-btn^="btnUd"]', function () {
  console.log("編集ボタン押せたよ");
  console.log($(this).data("btn")); //thisでクリックされたそのものを取得して、そこに付与したdata-btn属性をdebugしている
  console.log($(this).data("btn").slice(5)); //replaceを使うともしkeyにbtnUdが含まれるとバグが起きるので、sliceを用いてbtnFd後の5の位置のみ切り出す
  const updateKey = $(this).data("btn").slice(5);
  $(this).html("編集終了");
  $(this).removeAttr("data-btn");
  $(this).attr("data-btn", "btnUE" + updateKey);
  console.log($(`div[data-uname=uname${updateKey}]`));
  $(`div[data-uname=uname${updateKey}]`).attr("contenteditable", "true");
  $(`div[data-text=text${updateKey}]`).attr("contenteditable", "true");
});
// 編集中状態を終わらせる処理
$(document).on("click", 'button[data-btn^="btnUE"]', function () {
  console.log("編集終了ボタン押せたよ");
  $(this).html("編集");
  //編集対象のkeyやuname、textを取得
  console.log($(this).data("btn")); //thisでクリックされたそのものを取得して、そこに付与したdata-btn属性をdebugしている
  console.log($(this).data("btn").slice(5)); //replaceを使うともしkeyにbtnUdが含まれるとバグが起きるので、sliceを用いてbtnFd後の5の位置のみ切り出す
  const updateEndKey = $(this).data("btn").slice(5);
  $(this).removeAttr("data-btn");
  $(this).attr("data-btn", "btnUd" + updateEndKey);
  console.log($(`div[data-uname="uname${updateEndKey}"]`).html()); //debug
  const updateUName = $(`div[data-uname="uname${updateEndKey}"]`).html(); //編集後のunameを取得
  const updateText = $(`div[data-text="text${updateEndKey}"]`).html(); //編集後のunameを取得
  //dataを送信
  const postData = {
    uname: updateUName,
    text: updateText,
    deleteFrag: false,
  };
  const updates = {};
  updates["chat/" + updateEndKey] = postData;
  update(ref(db), updates);
  $(`div[data-uname=uname${updateEndKey}]`).attr("contenteditable", "false");
  $(`div[data-text=text${updateEndKey}]`).attr("contenteditable", "false");
});

//受信イベント
//読み込み時と子データ追加時
onChildAdded(dbRef, function (data) {
  console.log("child_addedイベントがトリガーされた");
  console.log(data); //書き足したdebugソース
  const msg = data.val();
  const key = data.key; //ユニークキーの取得

  if (msg.deleteFrag) {
    //deleteFragがtrueで理論削除されている場合は、チャットとして表示しない
    console.log("deleteFragがtrueなので表示しない");
  } else {
    //deleteFragがfalseなので、チャットとして表示する
    // console.log("deleteFragがfalseなので表示する");
    let h = '<div id="';
    h += key;
    h += '">';
    h += '<div data-uname="uname';
    h += key;
    h += '">';
    h += msg.uname;
    h += '</div><div data-text="text';
    h += key;
    h += '">';
    h += msg.text;
    h += "</div><div>";
    h += key;
    h += "</div>";
    h += '<button data-btn="btnFd';
    h += key;
    h += '">';
    h += "物理削除";
    h += "</button>";
    h += '<button data-btn="btnLd';
    h += key;
    h += '">';
    h += "論理削除";
    h += "</button>";
    h += '<button data-btn="btnUd';
    h += key;
    h += '">';
    h += "編集";
    h += "</button>";
    h += "</div>";
    $("#output").append(h);

    if (msg.uname == "taro") {
      // taroの場合、右表示。
      // console.log("taroだよ");
      $("#" + key).attr("class", "chat__right");
    } else {
      //taro以外の場合、左表示
      // console.log("taroじゃない");
      $("#" + key).attr("class", "chat__left");
    }
  }
});

//子データ削除時
onChildRemoved(dbRef, function (data) {
  console.log("chiid_removedイベントがトリガーされた");
  console.log(data); //debug
  const key = data.key; //ユニークキーの取得
  console.log($("#" + key));
  $("#" + key).remove();
});

//子データの変更時
onChildChanged(dbRef, function (data) {
  console.log("child_changedイベントがトリガーされた");
  console.log(data); //debug
  const key = data.key;
  const msg = data.val();
  if (msg.deleteFrag) {
    //deleteKeyがtrueで理論削除されている場合は、チャットとして表示しない
    $("#" + key).remove();
  } else {
    //deleteKeyがfalseで理論削除されてなければ、チャットを編集して表示する
    let updateH = "<p>";
    updateH += msg.uname;
    updateH += "<br>";
    updateH += msg.text;
    updateH += "<br>";
    updateH += key;
    updateH += "</p>";
    updateH += '<button data-btn="btnFd';
    updateH += key;
    updateH += '">';
    updateH += "物理削除";
    updateH += "</button>";
    updateH += '<button data-btn="btnLd';
    updateH += key;
    updateH += '">';
    updateH += "論理削除";
    updateH += "</button>";
    updateH += '<button data-btn="btnUd';
    updateH += key;
    updateH += '">';
    updateH += "編集";
    updateH += "</button>";
    // 該当するチャットのみ編集する
    $("#" + key).html(updateH);
  }
});

//Realtime DB Library関係のJS
//onValueで常にデータベースを描画する処理
onValue(ref(db), (snapshot) => {
  // console.log(snapshot);
  // console.log(snapshot.key);
  // console.log(snapshot.val());
  // console.log(snapshot.val().values);
  // console.log(snapshot.val().entries);
  // for (const [key, value] of Object.entries(snapshot.val())) {
  //   console.log(`${key}と${value}`);
  //   console.log(Object.entries(value));
  // }
  // snapshot.forEach((childSnapshot) => {
  //   console.log(childSnapshot);
  //   console.log(childSnapshot.key);
  //   console.log(childSnapshot.val());
  //   // console.log(childSnapshot.values);
  //   // console.log(childSnapshot.entries);
  //   console.log(Object.entries(childSnapshot.val()));
  //   console.log(Object.values(childSnapshot.val()));
  //   Object.entries(childSnapshot.val()).forEach((k) => {
  //     console.log(`${k.key}と${k.value}`);
  //     console.log(`${k}`);
  //     console.log(`${k[0]}と${k[1]}`);
  //   });
  //   for (const [key, value] of Object.entries(childSnapshot.val())) {
  //     console.log(`${key}と${value}`);
  //     console.log(Object.entries(value));
  //   }
  // });

  //初期化
  $("#map").html("");
  divDfArr = [];
  //描画処理
  saiki(snapshot.val());
});

function saiki(obj) {
  if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      console.log(`${key}と${value}`);
      if (value !== null && typeof value === "object") {
        console.log("objectと判定");
        divDf = `df${key}`;
        uniqueElePush(divDfArr, divDf);
        console.log(divDf);
        $("#map").append(
          `<div id="key${key}"><span>${key}</span><div id="${divDf}" class="map__df"></div></div>` //dfはdisplay:flex;の略
        );
      } else {
        console.log("else到達");
        console.log(divDf);
        $(`#${divDf}`).append(
          `<div class="map__keyAndVal"><span class="map__keyAndVal_key">${key}</span>:<span class="map__keyAndVal_val">${value}</span></div>`
        );
      }
      saiki(value);
    }
  } else {
    console.log(divDfArr);
    giveDivDfClass();
    return;
  }
}

function giveDivDfClass() {
  console.log("giveDivDfClass");
  divDfArr.forEach((ele) => {
    console.log(ele);
    if ($(`#${ele}`).html() == "") {
      $(`#${ele}`).attr("class", "map__leftmost");
      console.log(`${ele}にmap__leftmostクラスを付与`);
    } else {
      $(`#key${ele.slice(2)}`).attr("class", "map__left");
    }
  });
}

// 配列の要素をpushする際にかぶりを無くし、かぶりがあるものがpushされそうになった場合は、末尾に_をつける関数
function uniqueElePush(arr, ele) {
  if (!arr.includes(ele)) {
    arr.push(ele);
    return;
  } else {
    ele = ele + "_";
    uniqueElePush(arr, ele);
  }
}
// uniqueElePush関数のデモ
// let sampleArr = ["aaa", "bbb"];
// uniqueElePush(sampleArr, "aaa");
// console.log(sampleArr); // ["aaa", "bbb", "aaa%"]
// uniqueElePush(sampleArr, "aaa");
// console.log(sampleArr); // ["aaa", "bbb", "aaa%", "aaa%%"]

// class Fonsole extends console {
//   log(log) {
//     document.getElementById("log").innerHTML += log + "<br>";
//   }
// }

// const fonsole = new Fonsole();
// fonsole.log("aaa");

// console.log = function (log) {
//   document.getElementById("log").innerHTML += log + "<br>";
// };

// console.log(console);

let selectedData; //クリック選択されたデータを格納するグローバル変数
let selectedDataKV; //Selected DataがKeyなのかKeyAndValueなのかを格納するグローバル変数
let turn = "write"; //writeもしくはreadを格納し、書き込み処理段階なのか読み込み処理段階なのかを管理する。初期値はwrite

// データのkeyがクリックされた場合のselectedDataへの格納
$("#map").on("click", '[id^="key"]', function () {
  if (turn === "write") {
    console.log("key含んだもの押せたよ");
    let clickedHtml = $(this).attr("id");
    clickedHtml = clickedHtml.slice(3); //頭の3文字(key)を削除する
    console.log(clickedHtml);
    $("#funcW__selectedData").html(clickedHtml + " (※Keyです)");
    selectedData = $(this);
    // // console.log("osetayo");
    // console.log($(this).html());
    // let clickedHtml = $(this).html();
    // clickedHtml = clickedHtml.replace(/<span>/g, "");
    // clickedHtml = clickedHtml.replace(/<\/span>/g, ""); //正規表現のエスケープ処理をしている
    // console.log(clickedHtml);
    // $("#funcW__selectedData").html(clickedHtml);
    // selectedData = $(this);
    // console.log(selectedData.parent());
    // console.log(selectedData.parent().attr("id"));
    // // console.log(.parent().attr('id'));
    $("#funcW__showSet").attr("disabled", false);
    $("#funcW__showUpdate").attr("disabled", true);
    selectedDataKV = "key";
  } else {
    alert("現在は書き込み処理についてではなく読み取り処理中です");
  }
});

// データのJavascript値(keyAndValue)がクリックされた場合のselectedDataへの格納。親要素へのイベントバブリングを停止させている。
$("#map").on("click", ".map__keyAndVal", function (e) {
  if (turn === "write") {
    console.log($(this).html());
    let clickedHtml = $(this).html();
    clickedHtml = clickedHtml.replace(/<span>/g, "");
    clickedHtml = clickedHtml.replace(/<\/span>/g, ""); //正規表現のエスケープ処理をしている
    console.log(clickedHtml);
    $("#funcW__selectedData").html(clickedHtml + " (※Valueです)");
    selectedData = $(this);
    console.log(selectedData.parent());
    console.log(selectedData.parent().attr("id"));
    $("#funcW__showSet").attr("disabled", true);
    $("#funcW__showUpdate").attr("disabled", false);
    selectedDataKV = "keyAndVal";
    e.stopPropagation(); //イベント伝播(バブリング)停止
  } else {
    alert("現在は書き込み処理についてではなく読み取り処理中です");
  }
});

//ボタンを押したら、選択した要素を更新する関数を表示する処理
$("#funcW__showUpdate").on("click", function () {
  if (turn === "write") {
    // DBに書き込むPathを作成するための処理
    makeParentList(selectedData, "map");
    console.log(parentList);
    let keyList = [];
    parentList.forEach((ele) => {
      console.log(ele.slice(0, 3));
      if (ele.slice(0, 3) == "key") {
        keyList.push(ele.slice(3));
      }
    });
    console.log(keyList);
    let path = "";
    keyList.forEach((ele) => {
      path = path + ele + "/";
    });
    console.log(path);
    path = path.slice(0, -1); //末尾の"/"を削除
    console.log(path);

    //hashを生成するための処理
    console.log(selectedData.find(".map__keyAndVal_key"));
    console.log(selectedData.find(".map__keyAndVal_key").html());
    const hashKey = selectedData.find(".map__keyAndVal_key").html();
    $("#funcW__updateFunction").html(
      `update(ref(db, '${path}'), {${hashKey}: "xxxxx"});`
    ); //無理やりchatを書いて対処している
  } else {
    alert("現在は書き込み処理についてではなく読み取り処理中です");
  }
});

let parentList = [];
function makeParentList(htmlEle, destinationId) {
  if (htmlEle.parent().attr("id") !== destinationId) {
    console.log(htmlEle.parent().attr("id"));
    parentList.push(htmlEle.parent().attr("id"));
    console.log("saiki");
    console.log(parentList);
    makeParentList(htmlEle.parent(), destinationId);
  } else {
    console.log(parentList);
    console.log(htmlEle.parent().attr("id"));
    console.log("end");
    return;
  }
}

//ボタンを押したら、要素を新たに書き込むset関数を呼び出す処理

$("#funcW__showSet").on("click", function () {
  if (turn === "write") {
    // DBに書き込むPathを作成するための処理
    makeParentList(selectedData, "map");
    console.log(parentList);
    let keyList = [];
    parentList.forEach((ele) => {
      console.log(ele.slice(0, 3));
      if (ele.slice(0, 3) == "key") {
        keyList.push(ele.slice(3));
      }
    });
    console.log(keyList);
    let path = "";
    keyList.forEach((ele) => {
      path = path + ele + "/";
    });
    console.log(path);

    //set関数を生成するための処理
    $("#funcW__setFunction").html(
      `dbRef = ref(db, 'chat/${path}')<br>
    const newPostRef = push(dbRef); //ユニークKEYを生成<br>
      set(newPostRef, {xxxxx: "xxxxx"}); //任意のHash(Object, 連想配列をset)`
    );
  } else {
    alert("現在は書き込みターンではなく読み取りターンです");
  }
});

$("#funcW_moveToFuncR").on("click", function () {
  turn = "read";
  $("#functions__turn").html("読み込み");
  makeFunRSelecOption();
});

function makeFunRSelecOption() {
  if (selectedDataKV === "key") {
    let h = '<option value="key__select">選択してください</option>';
    h +=
      '<option value="key__dataAdded1">新しく同列に足されたデータのみを読み込む(今後新しくページ読み込みされた際には同列のデータを全て表示する)</option>';
    h +=
      '<option value="key__dataAdded2">新しく同列に足されたデータのみを読み込む(今後新しくページ読み込みされた際にも、都度追加されたデータのみを表示する)</option>';
    h += '<option value="key__sameDirData">同列のデータを全て読み込む</option>';
    $("#funcR__select").html(h);
  }
  if (selectedDataKV === "keyAndVal") {
    let h = '<option value="kav__select">選択してください</option>';
    h +=
      '<option value="kav__dataUpdated">更新されたデータのみを読み込む</option>';
    h +=
      '<option value="kav__sameDirData">更新されたデータと同列のデータを全て読み込む</option>';
    $("#funcR__select").html(h);
  }
}

$("#funcR__button").on("click", function () {
  console.log($("#funcR__select").val());
  showFuncR();
});

function showFuncR() {
  if (
    $("#funcR__select").val() === "key__select" ||
    $("#funcR__select").val() === "kav__select"
  ) {
    alert("選択してください");
  }
  //残り5パターンも記載する
  if ($("#funcR__select").val() === "key__dataAdded1") {
    let h = '<span>onChildAdded(ref(db, "chat"), function(data){</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">  console.log(data);  //datasnapshot形式で返ってくる</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">  console.log(data.key);  //追加されたDataのkeyが返ってくる(ex. -N2UnKkhdOTOXGK4AUVp)</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">  console.log(data.val()); //hash形式でデータが返ってくる</span>';
    h += "<br>";
    h += "<span>});</span>";
    $("#funcR__showFunc").html(h);
  }
  if ($("#funcR__select").val() === "key__dataAdded2") {
    let h = '<span>onChildAdded(ref(db, "chat"), function(data){</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">if(oCABool){</span> //oCABoolはonChildAdded boolの略';
    h +=
      '<span class="funcR__tabTab">  console.log(data);  //datasnapshot形式で返ってくる</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data.key);  //追加されたDataのkeyが返ってくる(ex. -N2UnKkhdOTOXGK4AUVp)</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data.val()); //hash形式でデータが返ってくる</span>';
    h += "<br>";
    h += '<span class="funcR__tab">}</span>';
    h += "<br>";
    h += "<span>});</span>";
    h += "<br>";
    h +=
      "※事前に、let oCABool = false;をページ読み込みと同時に宣言しておき、child_addedイベントが発生する前にtrueに変えておく必要がある";
    $("#funcR__showFunc").html(h);
  }
  if ($("#funcR__select").val() === "key__sameDirData") {
    let h = '<span>onChildAdded(ref(db, "chat"), function(data){</span>';
    h +=
      '<span class="funcR__tab">onValue(ref(db, "chat"), function(snapshot){</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data);  //datasnapshot形式で返ってくる</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data.key);  //追加されたDataのkeyが返ってくる(ex. -N2UnKkhdOTOXGK4AUVp)</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data.val()); //hash形式でデータが返ってくる</span>';
    h += "<br>";
    h += '<span class="funcR__tab">});</span>';
    h += "<span>});</span>";
    h += "※ちゃんと動くか確認が必要";
    $("#funcR__showFunc").html(h);
  }
  if ($("#funcR__select").val() === "kav__dataUpdated") {
    let h = '<span>onChildChanged(ref(db, "chat"), function(data){</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">  console.log(data);  //datasnapshot形式で返ってくる</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">  console.log(data.key);  //追加されたDataのkeyが返ってくる(ex. -N2UnKkhdOTOXGK4AUVp)</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tab">  console.log(data.val()); //hash形式でデータが返ってくる</span>';
    h += "<br>";
    h += "<span>});</span>";
    $("#funcR__showFunc").html(h);
  }
  if ($("#funcR__select").val() === "kav__sameDirData") {
    let h = '<span>onChildChanged(ref(db, "chat"), function(data){</span>';
    h +=
      '<span class="funcR__tab">onChildAdded(ref(db, "chat"), function(data){</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data);  //datasnapshot形式で返ってくる</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data.key);  //追加されたDataのkeyが返ってくる(ex. -N2UnKkhdOTOXGK4AUVp)</span>';
    h += "<br>";
    h +=
      '<span class="funcR__tabTab">  console.log(data.val()); //hash形式でデータが返ってくる</span>';
    h += "<br>";
    h += '<span class="funcR__tab">});</span>';
    h += "<span>});</span>";
    h += "※ちゃんと動くか確認が必要";
    $("#funcR__showFunc").html(h);
  }
}

const wait = (sec) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, sec * 1000);
    //setTimeout(() => {reject(new Error("エラー！"))}, sec*1000);
  });
};

const demo = function (dataSnap) {
  console.log("demo");
  console.log(dataSnap.key);
  $("#ageRank").append(dataSnap.key);
};

const initFuncDemo = function () {
  $("#ageRank2").html("");
};

const mainFuncDemo = function (childSnapshot) {
  console.log(childSnapshot);
  console.log(childSnapshot.key);
  console.log(childSnapshot.val());
  $("#ageRank2").append(
    `<div>${childSnapshot.val().uname}:${childSnapshot.val().age}歳</div>`
  );
};

const initFuncDemo2 = function () {
  $("#textList").html("");
};

const mainFuncDemo2 = function (childSnapshot) {
  console.log(childSnapshot);
  console.log(childSnapshot.key);
  console.log(childSnapshot.val());
  $("#textList").append(
    `<div>${childSnapshot.val().uname}:${childSnapshot.val().text}</div>`
  );
};

const appendDemo = function (data) {
  $("#oCADisplayTest").append(`<div>${data.key}</div>`);
};

const initFuncDemo3 = function () {
  $("#sortChildDisplay").html("");
};

const mainFuncDemo3 = function (childSnapshot) {
  console.log(childSnapshot);
  console.log(childSnapshot.key);
  console.log(childSnapshot.val());
  $("#sortChildDisplay").append(
    `<div>${childSnapshot.val().uname}:${childSnapshot.val().age}歳</div>`
  );
};

// 降順表示させるための処理の例
let size;
let eleNum = 0;
let rankArr = [];
const initFuncDemo4 = function (snapshot) {
  $("#sortChildDisplayDesc").html("");
  size = snapshot.size;
};

const mainFuncDemo4 = function (childSnapshot) {
  eleNum++;
  rankArr.unshift([childSnapshot.val().uname, childSnapshot.val().age]);
  if (eleNum == size) {
    let preNum = 0; //ひとつ前の配列の値。初期値0。そのため全てのデータの値が0という稀有な状況ではエラー
    let rankNum = 0; //表示する順位
    rankArr.forEach((ele) => {
        if (preNum != ele[1]) {
          rankNum++;
        }
      preNum = ele[1];
      $("#sortChildDisplayDesc").append(
        `<div>${rankNum}位:${ele[0]}:${ele[1]}歳</div>`
      );
    });
  }
};

const initFuncDemo5 = function (snapshot) {
  $("#sortChildLineupWithNum").html("");
};

const mainFuncDemo5 = function (key, value, rankNum) {
  console.log(`${key}, ${value.uname},  ${value.age}, ${rankNum}`);
  $("#sortChildLineupWithNum").append(
    `<div>${rankNum}位:${value.uname}:${value.age}歳</div>`
  );
};

const initFuncDemo6 = function (snapshot) {
  $("#sortChildLineupWithNumTest").html("");
};

const mainFuncDemo6 = function (key, value, rankNum) {
  console.log(`${key}, ${value.uname},  ${value.age}, ${rankNum}`);
  $("#sortChildLineupWithNumTest").append(
    `<div>${rankNum}位:${value.uname}:${value.age}歳</div>`
  );
};

sg("chat").oCA(demo);
sg("chat").sortRealtimeChild("age", initFuncDemo, mainFuncDemo);
sg("chat").sortRealtimeChild("text", initFuncDemo2, mainFuncDemo2);
sg("chat").oCADisplay(appendDemo, true, true);
sg("chat").sortChildDisplay("age", initFuncDemo3, mainFuncDemo3, true, false);
sg("chat").sortChildLineupWithNum(
  "age",
  initFuncDemo5,
  mainFuncDemo5,
  "asc",
  true,
  true,
  true
);
sg("chat").sortChildLineupWithNum(
  "age",
  initFuncDemo6,
  mainFuncDemo6,
);
sg("chat").mapping("#mappingTest");
// fb("chat").sort("age", initFuncDemo, mainFuncDemo).oCA(demo); //methodチェーンにするとエラーになる
// fb("chat").sort2();

// const sortRef = query(
//   ref(db, `chat`),
//   orderByChild("age")
// ); //スコアが小さい順のデータベースReferenceを生成する
// console.log(sortRef); //debug
// // 配列とonChildAddedを用いて、scoreが小さい順の配列を作る
// onChildAdded(sortRef, function (data) {
//   console.log(data.key);//debug
//   console.log(data.val());//debug
//   // const hash = {
//   //   key: data.key,
//   //   uname: data.val().uname,
//   //   score: data.val().score,
//   // };
//   // arrScoreDesc.unshift(hash); //unshiftで配列の先頭に追加する
//   $("#ageRank").append(`<div>${data.val().uname}:${data.val().age}歳</div>`); //昇順のデータを降順で表示するためにprependを用いる
// });
