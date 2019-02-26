/**
 *
 * order/index.js
 *
 * @create 2017-1-15
 * @author Young
 *
 * @update  Young 2017-02-04
 *
 */
var app = getApp(), 
core = app.requirejs('core'),
order = app.requirejs('biz/order');
var util = require('../../utils/util.js')
Page({
    data: {
        icons: app.requirejs('icons'),
        status: '',
        list:[],
        page:1,
        code: false,
        cancel:order.cancelArray,
        cancelindex:0
    },
    onLoad: function (options) {
        app.checkAuth();
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            options: options,
            status: options.status || ''
        });
        app.url(options);
        this.get_list();
    },
    get_list: function () {
        var $this = this;
        $this.setData({loading: true});
        core.get('order/get_list', {page: $this.data.page, status: $this.data.status, merchid: 0}, function (list) {
          console.log(list);
            if (list.error==0){
                list.list.map((v,i) =>{
                  v.price = parseInt(v.price)
                })
                $this.setData({loading:false,show:true,total:list.total,empty:true});
                if(list.list.length>0){
                    $this.setData({
                        page: $this.data.page+1,
                        list: $this.data.list.concat(list.list)
                    });
                }
                if(list.list.length<list.pagesize) {
                    $this.setData({
                        loaded: true
                    });
                }
            }else{
                core.toast(list.message,'loading')
            }
        },this.data.show);
      console.log($this.data.list);
    },

  get_updata_list: function () {
    var $this = this;
    $this.setData({ loading: true });
    core.get('order/get_list', { page: 1, status: $this.data.status, merchid: 0 }, function (list) {
      console.log(list);
      if (list.error == 0) {
        $this.setData({ loading: false, show: true, total: list.total, empty: true });
        if (list.list.length > 0) {
          $this.setData({
            list: list.list
          });
        }
        
      }
    });
    console.log($this.data.list);
  },
    selected: function (e) {
        var status = core.data(e).type;
        this.setData({
            list:[],
            page:1,
            status: status,
            empty: false
        });
        this.get_list();
    },
    onReachBottom:function(){
        if (this.data.loaded || this.data.list.length==this.data.total) {
            return;
        }
        this.get_list();
    },
    code: function (e) {
        var $this=this,orderid=core.data(e).orderid;
        core.post('verify/qrcode',{id:orderid},function (json) {
            if (json.error==0){
                $this.setData({
                    code: true,
                    qrcode: json.url
                })
            }else{
                core.alert(json.message);
            }
        },true);
    },
    close: function () {
        this.setData({
            code: false
        })
    },
    cancel:function (e) {
        var orderid = core.data(e).orderid;
        order.cancel(orderid,e.detail.value,'/pages/order/index?status='+this.data.status);
    },
  delete: function (e) {
    var type = core.data(e).type, orderid = core.data(e).orderid;
    console.log(type,orderid);
    order.delete(orderid, type, '/pages/order/index', this);
  },
    finish:function (e) {
        var type = core.data(e).type,orderid = core.data(e).orderid;;
        order.finish(orderid,'/pages/order/index');
    },
    onShareAppMessage: function () {
        return core.onShareAppMessage();
    },
  payOrder:function(e){
    console.log(this.data.list);
    var list=this.data.list;
    var type = core.pdata(e).type;
    console.log(e, type);
    var id=e.target.dataset.id;
    var did=e.target.dataset.did;
    var $this=this;
    // $this.get_updata_list(); //刷新页面
    var payinfo=list[did].payinfo.payinfo;
    // core.post('order/create/submit', {id:id}, function (ret) {
      // $this.setData({
      //   submit: false
      // }); 
      // if (ret.error != 0) {
      //   core.alert(ret.message);
      //   return;
      // } else {
        // console.log(ret)
        // if (ret.wechat.success) {
          core.pay(payinfo, function (res) {
            if (res.errMsg == "requestPayment:ok") {
              $this.get_updata_list(); //刷新页面
                    var date = new Date()
                    // sensors.setOnceProfile({
                    //   first_order_time: util.formatTime(date)
                    // })
                    // sensors.setProfile({
                    //   latest_order_time: util.formatTime(date)
                    // })
                //  app.sensors.track('PayOrder', {
                //     order_id: list[did].id ,
                //     product_id_list: list[did].nogift,
                //     order_name: list[did].goods[0].title,
                //     gender: wx.getStorageSync("userInfo").gender == 1 ? "男" : "女",
                //     order_phone: wx.getStorageSync("address").telNumber,
                //     order_province: wx.getStorageSync("address").userName,
                //     order_city: wx.getStorageSync("address").cityName,
                //     order_district: wx.getStorageSync("address").detailInfo,
                //     order_address: wx.getStorageSync("address").full_region,
                //     order_price: list[did].goods[0].price,
                //     transp_cost: "",
                //     service_cost: "",
                // });
             
              // $this.complete(type)
              // $this.setData({coupon: true})
              // wx.navigateTo({
              // url:'/pages/order/pay/index?id='+res.orderid
              // });
            }
          });
        // }
      // }

    // }, true)
  },
  checkexpress: function (e) {
    let expressid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order/express/index?id='+expressid,
    })
  }
});