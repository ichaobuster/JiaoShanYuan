//index.js
//获取应用实例
const app = getApp()
const keys = require('../../keys.js')
const QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({
  key: keys.qqMapKey,
})
const cityData = require('../../utils/china-cities.js')

Page({
  data: {
    curCity: { label: 'noData', name: '获取位置' },
    selectedCity: { label: 'noData', name: '获取位置'},
    swiperImgUrls: [
      '/assets/tmp/v2_ph59px.jpg',
      '/assets/tmp/v2_ph59ty.jpg',
      '/assets/tmp/v2_ph59y2.jpg',
      '/assets/tmp/v2_ph59zb.jpg',
    ],
    detailItems: [
      { id: 'nanputuosi', name: '南普陀寺', hot: true, stars: 4.8, starsDetail: [1, 1, 1, 1, 1], location: '西湖区', distance: '30km', image: '/assets/tmp/v2_ph38un.jpg' },
      { id: 'linyinsi', name: '灵隐寺', hot: true, stars: 4.5, starsDetail: [1, 1, 1, 1, 0], location: '思明区', distance: '50km', image: '/assets/tmp/v2_ph4wsx.jpg' },
      { id: 'nanputuosi1', name: '南普陀寺', hot: true, stars: 4.8, starsDetail: [1, 1, 1, 1, 1], location: '西湖区', distance: '30km', image: '/assets/tmp/v2_ph38un.jpg' },
      { id: 'linyinsi1', name: '灵隐寺', hot: true, stars: 4.5, starsDetail: [1, 1, 1, 1, 0], location: '思明区', distance: '50km', image: '/assets/tmp/v2_ph4wsx.jpg' },
    ],
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    // TODO
    this.checkSetting()
  },
  checkSetting: function () {
    const that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          that.authorize()
        } else {
          that.getLocation()
        }
      }, fail(res) {
        that.authorize()
      }
    })
  },
  authorize: function () {
    const that = this
    wx.authorize({
      scope: 'scope.userLocation',
      success() {
        that.getLocation()
      }
    })
  },
  getLocation: function () {
    const that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }, success(mapSdkRes) {
            const cityName = mapSdkRes.result.address_component.city;
            let cities = cityData.cities
            for (let i = 0; i < cities.length; i++) {
              const city = cities[i]
              if (city.name.match(cityName) || cityName.match(city.name)){
                that.setData({
                  curCity: city,
                  selectedCity: city,
                })
                return
              }
            }
          }
        })
      }, fail(res) {
        console.error(res)
      }
    })
  },
  scanCode: function (e) {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.error(res)
      }
    })
  },
  chooseLocation: function (e) {
    let url = '/pages/location/location'
    if (this.data.curCity && this.data.curCity.label !== 'noData'){
      const city = this.data.curCity
      url = `${url}?label=${city.label}&name=${city.name}`
    }
    wx.navigateTo({
      url
    })
  },
  locationChanged: function (nextCity) {
    if (nextCity && this.data.selectedCity.label === nextCity.label) {
      return
    }
    // TODO 刷新数据
    this.setData({
      selectedCity: nextCity,
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    const userInfo = e.detail.userInfo
    app.globalData.userInfo = userInfo
    this.setData({
      userInfo,
      hasUserInfo: true,
      motto: `Hello, ${userInfo.nickName}`,
    })
  }
})
