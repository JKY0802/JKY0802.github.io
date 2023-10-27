//动态标题
var OriginTitile = document.title;
var titleTime;
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    //离开当前页面时标签显示内容
    document.title = '👀不要走嘛~';
    clearTimeout(titleTime);
  } else {
    //返回当前页面时标签显示内容
    document.title = '🐖欢迎你回来～';
    //两秒后变回正常标题
    titleTime = setTimeout(function () {
      document.title = OriginTitile;
    }, 2000);
  }
});

setInterval(() => {
  // let create_time = Math.round(new Date('2021-10-15 00:00:00').getTime() / 1000); //在此行修改建站时间
  // 有苹果用户发现safari浏览器不能正常运行，百度了一下发现是格式化的问题，改成下面这种应该就可以了。感谢反馈。
  let create_time = Math.round(new Date('2021/10/15 00:00:00').getTime() / 1000); //在此行修改建站时间
  let timestamp = Math.round((new Date().getTime()) / 1000);
  let second = timestamp - create_time;
  let time = new Array(0, 0, 0, 0, 0);

  var nol = function(h) {
      return h > 9 ? h : '0' + h;
  }
  if (second >= 365 * 24 * 3600) {
      time[0] = parseInt(second / (365 * 24 * 3600));
      second %= 365 * 24 * 3600;
  }
  if (second >= 24 * 3600) {
      time[1] = parseInt(second / (24 * 3600));
      second %= 24 * 3600;
  }
  if (second >= 3600) {
      time[2] = nol(parseInt(second / 3600));
      second %= 3600;
  }
  if (second >= 60) {
      time[3] = nol(parseInt(second / 60));
      second %= 60;
  }
  if (second >= 0) {
      time[4] = nol(second);
  }
  let currentTimeHtml = ""
  if (time[0] != 0) {
      currentTimeHtml += ' 本站已运行 ' + time[0] + ' 年 '
  }
  currentTimeHtml += time[1] + ' 天 ' + time[2] + ' 时 ' + time[3] + ' 分 ' + time[4] + ' 秒 ';
  document.getElementById("runtime").innerHTML = currentTimeHtml;
}, 1000);
