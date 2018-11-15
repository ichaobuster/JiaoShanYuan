// pages/index/location.js
const cityData = require('../../utils/china-cities.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 基础数据变量
    internalCities: [],
    internalHotCities: [],
    externalCities: [],
    externalHotCities: [],
    internalScrollList: [],
    externalScrollList: [],
    // UI响应变量
    internal: true,
    cities: [],
    hotCities: [],
    scrollList: [],
    scrollIntoView: '',
    scrollStartIdx: -1,
    scrollStartY: -1,
    // 其他
    scrollerHeight: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const sysInfo = wx.getSystemInfoSync()
    // 根据占用滚动条占用vh和window高度计算滚动条高度
    const scrollerHeight = sysInfo.windowHeight * (0.7) 
    this.setData({
      scrollerHeight,
    })
    this.loadCities('internal', true)
    if (options && options.label && options.name) {
      this.setData({
        curCity: options
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  loadCities: function (type, show) {
    let cityDataSet = {}
    if (type === 'internal') {
      cityDataSet = cityData
    } else {
      // TODO 添加外国城市
    }
    let cities = cityDataSet.cities
    let hotCities = []
    let scrollList = []
    let hasHotCity = false
    if (!cityDataSet.catalog) {
      cities = cities.sort(function (a, b) {
        return a.pinyin > b.pinyin ? 1 : -1;
      })
      let lastChar = ''
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i]
        if (!city) {
          continue
        }
        if (city.hot) {
          hotCities.push(city)
          hasHotCity = true
        }
        const nextChar = city.pinyin.charAt(0).toUpperCase()
        if (lastChar !== nextChar) {
          lastChar = nextChar
          cities.splice(i, 0, { name: nextChar, label: nextChar, catalog: true })
          scrollList.push({ name: nextChar, label: nextChar })
          i++
        }
      }
    } else {
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i]
        if (!city) {
          continue
        }
        if (city.hot) {
          hotCities.push(city)
          hasHotCity = true
        }
        if (city.catalog) {
          scrollList.push({ name: city.name, label: city.name });
        }
      }
    }
    scrollList = [{ name: '热门', label: 'hot' }].concat(scrollList)
    cityDataSet.catalog = true
    if (type === 'internal') {
      this.setData({
        internalCities: cities,
        internalHotCities: hotCities,
        internalList: scrollList,
      });
    } else {
      this.setData({
        externalCities: cities,
        externalHotCities: hotCities,
        externalList: scrollList,
      });
    }

    if (show) {
      this.setData({
        cities,
        hotCities,
        scrollList,
      });
    }

  },

  selectInternal: function (e) {
    if (this.data.internal) {
      return;
    }
    this.setData({
      internal: true,
      cities: this.data.internalCities,
      hotCities: this.data.internalHotCities,
      scrollList: this.data.internalScrollList,
    });
  },
  selectExternal: function (e) {
    if (!this.data.internal) {
      return;
    }
    this.setData({
      internal: false,
      cities: this.data.externalCities,
      hotCities: this.data.externalHotCities,
      scrollList: this.data.externalScrollList,
    });
  },
  chooseCity: function (e) {
    let city = e.currentTarget.dataset.city
    if (city && city.catalog) {
      return
    }
    const pages = getCurrentPages()
    // pages.length - 2 的位置为上一个页面在页面堆栈中的位置
    const prevPage = pages[pages.length - 2]
    // navigateBack 不支持携带参数
    // 所以直接调用主页面方法来切换城市
    prevPage.locationChanged(city)
    wx.navigateBack({
      delta: 1
    })
  },
  filterCities: function (e) {
    const { internal, internalCities, externalCities } = this.data
    const inputValue = e.detail.value
    const cities = internal ? internalCities : externalCities
    if (!inputValue) {
      this.setData({
        cities
      })
      return
    }
    const filteredCities = cities.filter((element) => {
      if (element.catalog) {
        return false
      }
      return element.name.match(inputValue) || element.pinyin.toLowerCase().match(inputValue.toLowerCase());
    })
    this.setData({
      cities: filteredCities
    })
  },
  scrollToCatalog: function (e) {
    const catalog = e.currentTarget.dataset.catalog;
    this.setData({
      scrollIntoView: `catalog-${catalog.label}`
    })
  },
  touchStartScrollList: function (e) {
    const catalog = e.target.dataset.catalog;
    if (!catalog) {
      this.setData({
        scrollStartIdx: -1,
        scrollStartY: -1,
      })
      return
    }
    let scrollStartIdx = -1
    for (let i = 0; i < this.data.scrollList.length; i++) {
      if (this.data.scrollList[i].label === catalog.label) {
        scrollStartIdx = i
        break;
      }
    }
    this.setData({
      scrollStartIdx,
      scrollStartY: e.changedTouches[0].pageY,
      scrollIntoView: `catalog-${catalog.label}`,
    })
  },
  touchMoveScrollList: function (e) {
    const { scrollStartIdx, scrollStartY, scrollList, scrollIntoView, scrollerHeight } = this.data;
    if (scrollStartIdx < 0 || scrollStartY < 0) {
      return
    }
    const pageY = e.changedTouches[0].pageY
    const delta = Math.ceil((pageY - scrollStartY) / (scrollerHeight / scrollList.length))
    let nextIdx = scrollStartIdx + delta
    if (nextIdx >= scrollList.length) {
      nextIdx = scrollList.length - 1
    } else if (nextIdx < 0) {
      nextIdx = 0
    }
    const catalog = scrollList[nextIdx];
    if (catalog && catalog.label !== scrollIntoView) {
      this.setData({
        scrollIntoView: `catalog-${catalog.label}`
      })
    }
  },
})