//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    meritList:[
      { id: 1, type: '建寺', sum: 100, time: '11月1日 8:29', status: 0},
      { id: 2, type: '供斋', sum: 100, time: '5月11日 12:30', status: 1},
      { id: 3, type: '法事预约', sum: 3000, time: '5月1日 8:44', status: 1 }
    ],
  },
  onLoad: function () {
    // TODO
  }
})
