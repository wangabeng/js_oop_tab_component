(function () {
  // 1 构造函数
  var Tab = function (el) {
    var _this_ = this;
    this.el = el;
    this.activeIndex = 0; //默认激活的tab索引值为0 每次点击或鼠标移入 都会改变这个索引值
    this.loop = 0;

    // 配置参数 html中的配置参数覆盖此默认配置
    this.config = {
      "fade": false, // 设置渐隐
      "triggerType": "click", // 设置激发方式 只有两种方式 鼠标点击和移入
      "color": "red", // 设置显示内容颜色
      'currentDefault': 0, // 当前显示默认值 默认显示第0个
      "autoPlay": 200 // 设置自动播放时间 如果不自动播放 设置为0或false
    };
    // 重置配置参数
    if (this.config) {
      var dataConfig = this.el.attr('data-config');
      dataConfig = $.parseJSON(dataConfig);
      this.getConfig(this.config, dataConfig);
      // console.log(this.config);
    }
    var config = this.config;

    // 获取tab元素集合 及展示内容集合
    this.tabNavs = this.el.find('.tab-nav li');
    this.showCont = this.el.find('.tab-content');
    this.size = this.tabNavs.length;
    // this.currentIndex = config.currentDefault;

    // 根据不同的配置参数 进行不同的事件绑定
    if (config.triggerType) {
      // 进行事件绑定
      this.tabNavs.on(config.triggerType, function (event, flag) {
        // $(this)指的是被点击的当前tab的包装对象
        if (config.triggerType === 'click' && !flag) {
          // flag不存在 就是自主点击的 此时就把定时器清除.如果点击后 再自动播放
          console.log('cickzifa');
          clearInterval(_this_.timer);
        }
        // console.log($(this).index());
        // 清除定时器
        // clearInterval(_this_.timer);
        // 每点击或鼠标移入 都会重置activeIndex的值
        _this_.activeIndex = $(this).index();
        _this_.loop = _this_.activeIndex;
        _this_.tabNav($(this), _this_.showCont); // 应用原型方法
      });

      // 增加鼠标移出监听事件
      if (!!config.autoPlay) {
        this.tabNavs.on('mouseout', function () {
          _this_.autoPlay();
        });
      }

    }

    // 设置是否自动播放
    if (!!config.autoPlay) {
      this.timer = null;
      this.loop = 0;
      this.onOff = true; // 加一个定时器全局开关 问题 如果解决在定时器工作的时候 鼠标移入或点击 让定时器暂停工作 待鼠标移开后 定时器自动工作
      this.autoPlay(); // 应用原型方法 设置自动播放
    }

  };

  // 2 定义原型方法
  Tab.prototype = {
    // 从html中获取配置参数 覆盖类中定义的默认参数 
    getConfig: function(dataOld, dataNew) {
      // jQuery的extend方法 后面的覆盖前面的数据 dataNew覆盖dataOld
      return $.extend(dataOld, dataNew);
    },

    // 设置鼠标移入或点击自动切换功能
    tabNav: function (cur, showCont) {
      // cur.index() 获取当前索引值
      // 原型方法里可以直接使用原型对象的属性 this.el   this.
      // console.log(this.el);
      // 这里获取类的activeIndex 并赋值
      var currentIndex = cur.index();

      // tab的class .active切换
      cur.addClass('active');
      cur.siblings().removeClass('active');
      // 设置所有展示区showCont的样式
      /*
      *如果配置参数的fade是真 则用fade方法 否则 设置class
      */
      if (this.config.fade) {
        showCont.eq(currentIndex).fadeIn();
        showCont.eq(currentIndex).siblings().fadeOut();
      } else {
        showCont.eq(currentIndex).addClass('current');
        showCont.eq(currentIndex).siblings().removeClass('current');
      }
    },

    // 设置自动播放
    autoPlay: function () {
      // console.log(this);
      var _this_ = this;
      // 自动播放逻辑 设定时器 每隔一定时间 loop加1 让loop的值等于当前的值 同时触发点击事件
      // 设置tab导航元素的自动点击事件
      clearInterval(this.timer);
      this.timer =  setInterval(function () {
        // _this_.tabNavs.trigger(_this_.triggerType_);
        // console.log(_this_.loop);
        _this_.activeIndex = _this_.loop % _this_.size;
        _this_.tabNavs.eq(_this_.activeIndex).trigger(_this_.config.triggerType, ['triggerFlag']);
        _this_.loop++;
      }, 1800);

      // 监听content元素的鼠标移入事件 content内容的鼠标移入时
      _this_.showCont.on('mouseover', function () {
        // 此时清除定时器
        clearInterval(_this_.timer);
      });
      _this_.showCont.on('mouseout', function () {
        // 此时清除定时器
        _this_.autoPlay();
      });
    }
  };

  // 3 初始化 创建实例
/*  function init () {

  }*/

  $.fn.extend({
    tab: function () {
      this.each(function(){
        new Tab($(this));
      }); 
      return $(this);
    } 
  })

  // window.Tab = Tab;
  // window.init = init;

})();

// 遇到的问题 每次自动播放的时候 鼠标移入或点击 应该使自动播放暂时停止 
// 我自己分析 最好的方法 就是不用trigger方法

// 搜索发现 建议最好不要trigger原生的事件 如click等
// 参见 http://www.jb51.net/article/47571.htm
// 所以 
// 一种 解决思路是 trigger非原生事件来替换原生事件
// 还有一种解决思路 参考
// https://www.cnblogs.com/Mrrabbit/p/6999814.html
// 传递参数

/*trigger(tpye[,datea])方法有两个参数，第一个参数是要触发的事件类型，第二个单数是要传递给事件处理函数的附加数据，以数组形式传递。通常可以通过传递一个参数给回调函数来区别这次事件是代码触发的还是用户触发的。

$("#btn").bind("myClick", function (event, message1, message2) { //获取数据
    $("#test").append("p" + message1 + message2 + "</p>");
});
$("#btn").trigger("myClick",["我的自定义","事件"]); //传递两个数据
$(“#btn”).trigger(“myClick”,["我的自定义","事件"]); //传递两个数据*/