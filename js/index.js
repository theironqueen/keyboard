var PANEL_TIME = 180;
var PANEL2_TIME = [25,30,30];
var NUMBER = ['0','1','2','3','4','5','6','7','8','9'];
var NUMBER_1_100 = ["12345678910","11121314151617181920","21222324252627282930","31323334353637383940","41424344454647484950","51525354555657585960","61626364656667686970","71727374757677787980","81828384858687888990","919293949596979899100"];
var NUMBER_100_1 = ["100999897969594939291","90898887868584838281","80797877767574737271","70696867666564636261","60595857565554535251","50494847464544434241","40393837363534333231","30292827262524232221","20191817161514131211","10987654321"];
var FINGER_NUMBER = ["0303","1313","2323","3333","4343","5353","6363","7373","8383","9393","3030","3131","3232","3333","3434","3535","3636","3737","3838","3939","0606","1616","2626","3636","4646","5656","6666","7676","8686","9696","6060","6161","6262","6363","6464","6565","6666","6767","6868","6969","0909","1919","2929","3939","4949","5959","6969","7979","8989","9999","9090","9191","9292","9393","9494","9595","9696","9797","9898","9999"];
var blue = "#348fe2",green = "#00acac",red = "#ff5b57";

var RANK_NUMBER = 5;


var startTime = 0;		//时间戳，毫秒级单位

var timer;//panel1监听器
//基本键盘测试单条数据
var singleData = {
	total:0,
	right:0,
	wrong:0,
	targetNum:[],
	inputNum:[]
};
var panel1Chart; //键盘测试图表对象
var totalData = [];
var panel1Obj = [];
var restTime = PANEL_TIME;		//右上角剩余时间，键盘测试



//type 表示是练习的方式，从1-100，100-1， 0303等
//竞速模式，输入完所有数字，比较时间
//计时模式，规定时间内打出的组数
var timer2;//panel2监听器
var panel2Data = {
	type:0,
	modal:0,
	total:0,
	inputNum:[],
	right:0,
	wrong:0,
	time:0
};
//练习的目标，对应三种练习方式
var panel2Target = [];// 固定的目标
var panel2TargetIndex = 0;//当前进行的索引

// var panel2Chart; //基本练习图表对象
//所有键盘测试
var panel2TotalData = [];
//键盘测试中需要数据更新的对象
var panel2Obj = [];
var restTime2 = 0;		//右上角剩余时间，键盘测试



var timer3;//panel3监听器
var panel3TotalData = [];
var panel3Target = [];// 固定的目标
var panel3TargetIndex = 0;//当前进行的索引
//panel3数据 expect是目标平均用时，取选择数据中，平均用时最短的时间
var panel3Data = {
	total:0,
	right:0,
	wrong:0,
	expect:0,
	time:0
};
var panel3Obj = [];
var restTime3 = 0;		//右上角剩余时间，个性化测试

$(document).ready(function(){

	//初始化localStorage
	initLocalStorage();
	
	//初始化图表
	createPanel1Chart(getPanel1Data());
	initPanel2Chart();
	createPanel2Chart(getPanel2Data());

	createPanel3Chart(getPanel3Data());

	$('[data-toggle="popover"]').popover()

	//标签页切换
	$('#main-nav a').click(function (e) {
	  e.preventDefault()
	  $(this).tab('show')
	  createPanel3Chart(getPanel3Data());
	})


	/****************键盘测试相关功能 开始********************/
	$("#panel1-start").bind("click",panel1Start);
	$("#panel1-start").bind("keydown",function(e){
		var key = e.which;
		if (key == 13){
			$("#panel1-start").click();
			return false;
		}
	});
	$("#panel1-input").attr("disabled",true);
	//清空历史数据
	$("#panel1-delete").bind("click",function(){
		totalData = [];
		localStorage.setItem("historyData",JSON.stringify(totalData));
		$("#historyChart1").html("");
		createPanel1Chart(getPanel1Data());
	});
	//测试结束操作方法
	function panel1Finish(){
		// console.log("finish");
		$("#panel1-finish").attr("disabled","disabled");
		$("#panel1-finish").unbind("click");
		$("#panel1-start").bind("click",panel1Start);
		$("#panel1-start").removeAttr("disabled");
		$("#panel1-start").bind("keydown",function(e){
			var key = e.which;
			if (key == 13){
				$("#panel1-start").click();
				return false;
			}
		});

		clearInterval(timer);
		//解绑回车监听
		panel1Obj[4].unbind("keydown");

		//清空数据
		singleData = {
			total:0,
			right:0,
			wrong:0,
			targetNum:[],
			inputNum:[]
		};
		restTime = PANEL_TIME;
		panel1Obj[4].attr("disabled",true);
		panel1Obj[5].html(restTime);
		panel1Obj = [];

	}
	//测试开始操作方法
	function panel1Start(){
		// console.log("start");
		$("#panel1-start").attr("disabled","disabled");
		$("#panel1-start").unbind("click");
		$("#panel1-finish").bind("click",panel1Finish);
		$("#panel1-finish").removeAttr("disabled");
		$("#panel1-start").unbind("keydown");

		panel1Obj.push($("#panel1 tbody tr").eq(0).find("td").eq(1));
		panel1Obj.push($("#panel1 tbody tr").eq(1).find("td").eq(1));
		panel1Obj.push($("#panel1 tbody tr").eq(2).find("td").eq(1));
		panel1Obj.push($("#panel1-target"));
		panel1Obj.push($("#panel1-input"));
		panel1Obj.push($("#panel1-time"));

		//初始化数据
		panel1Obj[0].html(singleData.total);
		panel1Obj[1].html(singleData.right);
		panel1Obj[2].html(singleData.wrong);
		panel1Obj[3].html(getTargetNumber());
		panel1Obj[4].removeAttr("disabled");
		panel1Obj[4].val("");
		//让input获取焦点
		panel1Obj[4].focus();
		panel1Obj[5].html(restTime);
		//开始倒计时
		startTime = new Date();
		timer = setInterval(function() {
                    restTime = restTime-1;
                    panel1Obj[5].html(restTime); 
                    if (restTime == 0){
                    	//一次练习结束，保存数据
                    	totalData.push(singleData)
                    	localStorage.setItem("historyData",JSON.stringify(totalData));
						
						// console.log(localStorage.getItem('historyData'));
						// 更新历史记录
						$("#historyChart1").html("");
						createPanel1Chart(getPanel1Data());
                    	$("#panel1-finish").click();

                    }
                }, 1000);
		//绑定回车键操作
		panel1Obj[4].bind("keydown", inputFix);
	}
	//输入内容比对
	function inputFix(e){
		var key = e.which;
		if (key == 13){
			//获取输入数据
			var tempTime = new Date();
			var input = panel1Obj[4].val();
			var target = panel1Obj[3].html();
			// console.log(input);
			var tempObj = new Object();
			tempObj.text = input;
			//计算每次输入数字组的时间
			tempObj.time = (tempTime - startTime)/1000;
			startTime = tempTime;
			singleData.inputNum.push(tempObj);
			singleData.targetNum.push(target);
			singleData.total++;
			//进行比对
			if(input == target){
				singleData.right++;
				panel1Obj[1].html(singleData.right);
			}else {
				singleData.wrong++;
				panel1Obj[2].html(singleData.wrong);
			}
			//更新数据
			panel1Obj[0].html(singleData.total);
			//开始下一条
			panel1Obj[3].html(getTargetNumber());
			panel1Obj[4].val("");
			panel1Obj[4].focus();
			return false;
		}
	}
	//随机数组生成
	function getTargetNumber(){
		//生成位数
		var num1 = getRandomInt(0,100);
		var length = 9;
		if (num1 >= 95) length = 8;
		//生成随机数
		var result = "";
		for(var i=0;i<length;i++){
			result = result + NUMBER[getRandomInt(0,10)];
		}
		return result;
	}
	function getRandomInt(min, max) {
  		return Math.floor(Math.random() * (max - min)) + min;
	}
	//获得图表数据
	function getPanel1Data(){
		var tempData = [];
		tempData.push(new Array());
		tempData.push(new Array());
		var totalLength = totalData.length;
		for (var i=0;i<totalLength && i<10;i++){
			var temp = new Array();
			temp.push(totalLength-i);
			temp.push(totalData[totalLength-i-1].right);
			tempData[0].push(temp);
			temp = new Array();
			temp.push(totalLength-i);
			temp.push(totalData[totalLength-i-1].total);
			tempData[1].push(temp);
		}
		if(tempData[0].length == 1){
			tempData[0].push([0,0]);
			tempData[1].push([0,0]);
		}
		// console.log(tempData);
		return tempData;
	}
	//创建图一图表
	function createPanel1Chart(historyData){
		function e(e, t, n) {
	        $('<div id="panel1Tooltip" class="flot-tooltip">' + n + "</div>").css({
	            top: t - 45,
	            left: e - 55
	        }).appendTo("body").fadeIn(200)
	    }
	    if ($("#historyChart1").length !== 0) {
	       	    panel1Chart = $.plot($("#historyChart1"), [{
	            data: historyData[0],
	            label: "正确组数",
	            color: red,
	            lines: {
	                show: true,
	                fill: false,
	                lineWidth: 2
	            },
	            points: {
	                show: false,
	                radius: 5,
	                fillColor: "#fff"
	            },
	            shadowSize: 0
	        },{
	            data: historyData[1],
	            label: "输入组数",
	            color: green,
	            lines: {
	                show: true,
	                fill: false,
	                lineWidth: 2
	            },
	            points: {
	                show: false,
	                radius: 5,
	                fillColor: "#fff"
	            },
	            shadowSize: 0
	        }], {
	            xaxis: {
	                tickColor: "#ddd",
	                tickSize: 1
	            },
	            yaxis: {
	                tickColor: "#ddd",
	                tickSize: 5
	            },
	            grid: {
	                hoverable: true,
	                clickable: true,
	                tickColor: "#ccc",
	                borderWidth: 1,
	                borderColor: "#ddd"
	            },
	            legend: {
	                labelBoxBorderColor: "#ddd",
	                margin: 0,
	                noColumns: 1,
	                show: true
	            }
	        });
	        var r = null;
	        $("#historyChart1").bind("plothover",
	        function(t, n, i) {
	            $("#x").text(n.x.toFixed(2));
	            $("#y").text(n.y.toFixed(2));
	            if (i) {
	                if (r !== i.dataIndex) {
	                    r = i.dataIndex;
	                    $("#panel1Tooltip").remove();
	                    var s = i.datapoint[1].toFixed(2);
	                    var o = i.series.label + " " + s;
	                    e(i.pageX, i.pageY, o)
	                }
	            } else {
	                $("#panel1Tooltip").remove();
	                r = null
	            }
	            t.preventDefault()
	        })
	    }
	}

	/****************键盘测试相关功能 结束********************/

	/****************基础练习相关功能 开始********************/
	$("#panel2-start").bind("click",panel2Start);
	$("#panel2-start").bind("keydown",function(e){
		var key = e.which;
		if (key == 13){
			$("#panel2-start").click();
			return false;
		}
	});
	$("#panel2-input").attr("disabled",true);
	//清空历史数据
	$("#panel2-delete").bind("click",function(){
		panel2TotalData = [];
		localStorage.setItem("panel2TotalData",JSON.stringify(panel2TotalData));
		//排行榜
		initPanel2Chart();
	});
	//测试结束操作方法
	function panel2Finish(){
		// console.log("finish");
		//去除finish的事件绑定，以及使自身失效
		$("#panel2-finish").attr("disabled","disabled");
		$("#panel2-finish").unbind("click");
		//启动start按钮
		$("#panel2-start").bind("click",panel2Start);
		$("#panel2-start").removeAttr("disabled");
		$("#panel2-start").bind("keydown",function(e){
			var key = e.which;
			if (key == 13){
				$("#panel2-start").click();
				return false;
			}
		});
		$("#panel2 form.option-form input").removeAttr("disabled");
		//清理数据和计时器
		clearInterval(timer2);
		//解绑回车监听
		panel2Obj[6].unbind("keydown");

		//清空数据
		panel2Data = {
			type:0,
			modal:0,
			total:0,
			inputNum:[],
			right:0,
			wrong:0,
			time:0
		};
		
		panel2Obj[6].attr("disabled",true);
		panel2Obj = [];

	}
	//测试开始操作方法
	function panel2Start(){
		// console.log("start");
		//去除start的事件绑定，以及使自身失效
		$("#panel2-start").attr("disabled","disabled");
		$("#panel2-start").unbind("click");
		//启动finish按钮
		$("#panel2-finish").bind("click",panel2Finish);
		$("#panel2-finish").removeAttr("disabled");
		$("#panel2-start").unbind("keydown");

		$("#panel2 form.option-form input").attr("disabled","disabled");
		//获取类型,练习类型和练习模式
		var tempType = $("input[name='panel2Type']:checked").val();
		var tempModal = $("input[name='panel2Modal']:checked").val();
		// console.log(tempType+"  ****  "+tempModal);
		panel2Data.type = tempType;
		panel2Data.modal = tempModal;
		//确定输入目标
		if (tempType == 0){
			panel2Target = NUMBER_1_100;
		} else if (tempType == 1){
			panel2Target = NUMBER_100_1;
		} else if (tempType == 2){
			panel2Target = FINGER_NUMBER;
		}

		//确定输入模式
		if (tempModal == 0){
			//计时模式
			restTime2 = PANEL2_TIME[tempType];
		}else{
			//竞速模式
			restTime2 = 0;
		}


		//展示元素初始化
		panel2Obj.push($("#panel2-show-table tbody tr").eq(0).find("td").eq(1));
		panel2Obj.push($("#panel2-show-table tbody tr").eq(1).find("td").eq(1));
		panel2Obj.push($("#panel2-show-table tbody tr").eq(2).find("td").eq(1));
		panel2Obj.push($("#panel2-show-table tbody tr").eq(3).find("td").eq(1));
		panel2Obj.push($("#panel2-show-table tbody tr").eq(4).find("td").eq(1));
		panel2Obj.push($("#panel2-target"));
		panel2Obj.push($("#panel2-input"));
		panel2Obj.push($("#panel2-time"));

		//初始化数据
		panel2TargetIndex = 0;
		panel2Obj[0].html(panel2Target.length);
		panel2Obj[1].html(panel2Data.total);
		panel2Obj[2].html(panel2Data.right);
		panel2Obj[3].html(panel2Data.wrong);
		panel2Obj[4].html(panel2Target.length);
		panel2Obj[5].html(panel2Target[panel2TargetIndex]);
		panel2Obj[6].removeAttr("disabled");
		panel2Obj[6].val("");
		//让input获取焦点
		panel2Obj[6].focus();
		panel2Obj[7].html(restTime2); 
		//开始倒计时
		startTime = new Date();
//开始计时模式，或者竞速模式
		if (tempModal == 0){
			//计时模式
			timer2 = setInterval(function(){
				restTime2 = restTime2 - 1;
				panel2Obj[7].html(restTime2); 
				if (restTime2 == 0){
					//时间结束
					panel2Data.time = PANEL2_TIME[panel2Data.type];
					panel2TotalData.push(panel2Data);
					localStorage.setItem("panel2TotalData",JSON.stringify(panel2TotalData));
					// console.log(panel2TotalData);
					//更新排行榜
					createPanel2Chart(getPanel2Data());

					$("#panel2-finish").click();
				}
			}, 1000);
		} else {
			//竞速模式
			timer2 = setInterval(function(){
				restTime2 = restTime2 + 1;
				panel2Obj[7].html(restTime2); 
			}, 1000);
		}

		//绑定回车键操作
		panel2Obj[6].bind("keydown", inputFix2);
	}
	//输入内容比对
	function inputFix2(e){
		var key = e.which;
		if (key == 13){
			//获取输入数据
			var tempTime = new Date();
			var input = panel2Obj[6].val();
			var target = panel2Obj[5].html();

			panel2TargetIndex ++;
			// console.log(input);
			var tempObj = new Object();
			tempObj.text = input;
			tempObj.time = tempTime;
			panel2Data.inputNum.push(tempObj);
			panel2Data.total++;
			
			//进行比对
			if(input == target){
				panel2Data.right++;
			}else {
				panel2Data.wrong++;
			}
			//更新数据
			panel2Obj[1].html(panel2Data.total);
			panel2Obj[2].html(panel2Data.right);
			panel2Obj[3].html(panel2Data.wrong);
			panel2Obj[4].html(panel2Target.length - panel2Data.total);
			
			//判断是否输入完毕。
			if(panel2TargetIndex >= panel2Target.length){
				//输入完毕
				// 保存相关数据
				panel2Data.time = (tempTime - startTime)/1000;
				panel2TotalData.push(panel2Data);
				localStorage.setItem("panel2TotalData",JSON.stringify(panel2TotalData));
				// console.log(panel2TotalData);
				//更新排行榜
				createPanel2Chart(getPanel2Data());
				//调用结束方法
				$("#panel2-finish").click();
			} else {
				//继续下一条
				panel2Obj[5].html(panel2Target[panel2TargetIndex]);
				panel2Obj[6].val("");
				panel2Obj[6].focus();
			}
			
			return false;
		}
	}

	//得到基础练习排行数据
	function getPanel2Data(){
		// 针对panel2TotalData 中数据分类，排序
		//初始化
		var classifyData = new Array();
		for (var i=0;i<6;i++){
			classifyData.push(new Array());
		}
		//对数据分类
		// console.log(panel2TotalData);
		for (var item in panel2TotalData){
			var tempdata = panel2TotalData[item];
			var classify = parseInt(tempdata.modal)*3+parseInt(tempdata.type);
			// console.log(classify);
			var data = {};
			data.right = tempdata.right;
			data.time = tempdata.time;
			classifyData[classify].push(data);
		}
		// console.log(classifyData);
		//对数据进行排序
		for (var i=0;i<6;i++){
			classifyData[i].sort(panel2Sort);
		}
		// console.log(classifyData);
		return classifyData;
	}
	//先比较正确数，正确数大的在前边
	//正确数相同时比较时间,时间短的在前边
	function panel2Sort(a,b){
		if (a.right > b.right){
			return -5;
		} else if (a.right == b.right){
			if (a.time < b.time){
				return -4;
			} else if (a.time == b.time){
				return 0;
			} else {
				return 4;
			}
		} else {
			return 5;
		}
	}
	//初始化排行榜
	function initPanel2Chart(){
		var theadHtml = "<thead><tr><th>No.</th><th>正确数(组)</th><th>时间(秒)</th></tr></thead>";
		for (var i=0;i<6;i++){
			// console.log("#panel2-table-"+parseInt(i/3)+"-"+i%3);
			//选择排行榜表格
			var $tempObj =  $("#panel2-table-"+parseInt(i/3)+"-"+i%3);
			$tempObj.html("");
			var tbodyHtml = "<tbody>";
			for (var j=0;j<RANK_NUMBER;j++){
				tbodyHtml += "<tr><td>"+(j+1)+"</td><td>0</td><td>0</td></tr>";
			}
			tbodyHtml += "</tbody>";
			$tempObj.append(theadHtml+tbodyHtml);
		}

	}
	//更新排行榜数据
	function createPanel2Chart(historyData){
		// 开始更新排行榜
		for (var i=0;i<6;i++){
			var $tempTr =  $("#panel2-table-"+parseInt(i/3)+"-"+i%3).find("tbody tr");
			for (var j=0; j < historyData[i].length && j < RANK_NUMBER; j++){
				var $tempTd = $tempTr.eq(j).find("td");
				$tempTd.eq(1).html(historyData[i][j].right);
				$tempTd.eq(2).html(historyData[i][j].time);
			}
		}
	}


/****************基础练习相关功能 结束********************/

/****************个性化练习相关功能 开始********************/
	


	$("#panel3-start").bind("click",panel3Start);
	$("#panel3-start").bind("keydown",function(e){
		var key = e.which;
		if (key == 13){
			$("#panel3-start").click();
			return false;
		}
	});
	$("#panel3-input").attr("disabled",true);

	$("#panel3-data-save").bind("click",panel3DataSave);

	function panel3Start(){
		//判断有没有选择练习数据
		if (panel3Target.length == 0){
			alert("请先选择练习数据！并且点击确认选择！");
			return;
		}
		//去除start的事件绑定，以及使自身失效
		$("#panel3-start").attr("disabled","disabled");
		$("#panel3-start").unbind("click");
		//启动finish按钮
		$("#panel3-finish").bind("click",panel3Finish);
		$("#panel3-finish").removeAttr("disabled");
		$("#panel3-start").unbind("keydown");

		restTime3 = 0;

		//展示元素初始化
		panel3Obj.push($("#panel3-show-table tbody tr").eq(0).find("td").eq(1));
		panel3Obj.push($("#panel3-show-table tbody tr").eq(1).find("td").eq(1));
		panel3Obj.push($("#panel3-show-table tbody tr").eq(2).find("td").eq(1));
		panel3Obj.push($("#panel3-show-table tbody tr").eq(3).find("td").eq(1));
		panel3Obj.push($("#panel3-show-table tbody tr").eq(4).find("td").eq(1));
		panel3Obj.push($("#panel3-show-table tbody tr").eq(5).find("td").eq(1));
		panel3Obj.push($("#panel3-show-table tbody tr").eq(6).find("td").eq(1));
		panel3Obj.push($("#panel3-target"));
		panel3Obj.push($("#panel3-input"));
		panel3Obj.push($("#panel3-time"));

		//初始化数据
		panel3TargetIndex = 0;
		panel3Obj[0].html(panel3Target.length);
		panel3Obj[1].html(panel3Data.total);
		panel3Obj[2].html(panel3Data.right);
		panel3Obj[3].html(panel3Data.wrong);
		panel3Obj[4].html(panel3Target.length);
		panel3Obj[5].html(panel3Data.expect);
		panel3Obj[6].html(panel3Data.time);


		panel3Obj[7].html(panel3Target[panel3TargetIndex]);
		panel3Obj[8].removeAttr("disabled");
		panel3Obj[8].val("");
		//让input获取焦点
		panel3Obj[8].focus();
		panel3Obj[9].html(restTime3); 
		//开始倒计时
		startTime = new Date();

		timer3 = setInterval(function(){
			restTime3 = restTime3 + 1;
			panel3Obj[9].html(restTime3); 
		}, 1000);

		panel3Obj[8].bind("keydown", inputFix3);
	}
	function panel3Finish(){
		//去除finish的事件绑定，以及使自身失效
		$("#panel3-finish").attr("disabled","disabled");
		$("#panel3-finish").unbind("click");
		//启动start按钮
		$("#panel3-start").bind("click",panel3Start);
		$("#panel3-start").removeAttr("disabled");
		$("#panel3-start").bind("keydown",function(e){
			var key = e.which;
			if (key == 13){
				$("#panel3-start").click();
				return false;
			}
		});
		
		//清理数据和计时器
		clearInterval(timer3);
		//解绑回车监听
		panel3Obj[8].unbind("keydown");

		//清空数据
		panel3Data.total = 0;
		panel3Data.right = 0;
		panel3Data.wrong = 0;
		panel3Data.time = 0;
		
		panel3Obj[8].attr("disabled",true);
		panel3Obj = [];
	}
	//数据选择开始
	function panel3DataStart(){
		//去除start的事件绑定，以及使自身失效
		$("#panel3-data-start").attr("disabled","disabled");
		$("#panel3-data-start").unbind("click");
		//启动finish按钮
		$("#panel3-data-save").bind("click",panel3DataSave);
		$("#panel3-data-save").removeAttr("disabled");

		$("#panel3-data-table input:checkbox").removeAttr("disabled");
		//初始化数据
		panel3Target = [];
	}
	//数据选择确认
	function panel3DataSave(){
		$("#panel3-data-save").attr("disabled","disabled");
		$("#panel3-data-save").unbind("click");
		//启动start按钮
		$("#panel3-data-start").bind("click",panel3DataStart);
		$("#panel3-data-start").removeAttr("disabled");

		$("#panel3-data-table input:checkbox").attr("disabled","disabled");
		//保存选择的数据
		//读取check选项
		var selectIndex = [];
		$("#panel3-data-table input[name='practiceData']:checked").each(function(){
			selectIndex.push($(this).val());
		});
		// console.log(selectIndex);
		var aveTime = 9999;
		for (var i in selectIndex){
			var tempData = panel3TotalData[selectIndex[i]];
			console.log(tempData);
			panel3Target = panel3Target.concat(tempData.practice);
			if (aveTime > tempData.time){
				aveTime = tempData.time;
			}
		}
		panel3Data.expect = aveTime;
		
		$msgShow = $("#panel3-data-show span");

		$msgShow.eq(0).html(selectIndex.length);
		$msgShow.eq(1).html(panel3Target.length);
		$msgShow.eq(2).html(aveTime);


	}
	//输入内容比对
	function inputFix3(e){
		var key = e.which;
		if (key == 13){
			//获取输入数据
			var tempTime = new Date();
			var input = panel3Obj[8].val();
			var target = panel3Obj[7].html();

			panel3TargetIndex++;
			// console.log(input);

			panel3Data.total++;
			panel3Data.time = (((tempTime-startTime)/panel3Data.total)/1000).toFixed(3);
			//进行比对
			if(input == target){
				panel3Data.right++;
			}else {
				panel3Data.wrong++;
			}
			//更新数据
			panel3Obj[1].html(panel3Data.total);
			panel3Obj[2].html(panel3Data.right);
			panel3Obj[3].html(panel3Data.wrong);
			panel3Obj[4].html(panel3Target.length - panel3Data.total);
			panel3Obj[6].html(panel3Data.time);
			//判断是否输入完毕。
			if(panel3TargetIndex >= panel3Target.length){
				//输入完毕
				// 保存相关数据
				
				//调用结束方法
				$("#panel3-finish").click();
			} else {
				//继续下一条
				panel3Obj[7].html(panel3Target[panel3TargetIndex]);
				panel3Obj[8].val("");
				panel3Obj[8].focus();
			}
			
			return false;
		}
	}
	//整理出个性化练习所需要的数据
	function getPanel3Data(){
		// console.log(totalData);
		panel3TotalData = new Array();
		for (var i in totalData){
			var tempData = totalData[i];
			var resultData = {};
			resultData.no = (parseInt(i)+1);
			resultData.total = tempData.total;
			resultData.right = tempData.right;
			resultData.wrong = tempData.wrong;
			// 计算平均用时
			var inputData = tempData.inputNum;
			var totalTime = 0;
			for(var j in inputData){
				totalTime += inputData[j].time;
			}
			var aveTime  = (totalTime/tempData.total).toFixed(3);
			resultData.time = aveTime;
			//获取组数,将输入用时超过平均用时的数字组选出
			var practiceData = new Array();
			
			for (var j in inputData){
				if (inputData[j].time >= aveTime){
					practiceData.push(tempData.targetNum[j]);
				}
			}
			resultData.practice = practiceData;
			// console.log(resultData);
			panel3TotalData.push(resultData);
		}
		return panel3TotalData;
	}
	function createPanel3Chart(historyData){
		//只展示10条数据，倒着展示
		historyData.sort(panel3Sort);
		var dataHtml = "";
		for (var i=0;i<historyData.length && i<10;i++){
			var tempData = historyData[i]
			// console.log(tempData);
			dataHtml += ("<tr><td><input type='checkbox' name='practiceData' value='"
			+i+"' /></td><td>"+tempData.no+"</td><td>"+tempData.total+"</td><td>"+tempData.right+"</td><td>"
			+tempData.wrong+"</td><td>"+tempData.time+"</td><td>"+tempData.practice.length+"</td></tr>");
		}
		//创建表格
		var $panel3Table = $("#panel3-data-table tbody");
		$panel3Table.html("");
		$panel3Table.append(dataHtml);
		console.log(panel3TotalData);
	}
	function panel3Sort(a,b){
		if (a.no > b.no){
			return -5;
		} else {
			return 5;
		}
	}

/****************个性化练习相关功能 结束********************/

	function initLocalStorage(){
		if (window.localStorage) {
	    	console.log('浏览器支持localStorage');
		} else {
		    console.log('浏览器不支持localStorage');
		}
		
		if(localStorage.getItem('historyData') == null){
			//没有创建
			// console.log('没有创建');
			localStorage.setItem("historyData",JSON.stringify(totalData));
		}else{
			//已有创建
			// console.log('已有创建');
			totalData = JSON.parse(localStorage.getItem('historyData'));
		}

		if(localStorage.getItem('panel2TotalData') == null){
			//没有创建
			// console.log('没有创建');
			localStorage.setItem("panel2TotalData",JSON.stringify(panel2TotalData));
		}else{
			//已有创建
			// console.log('已有创建');
			panel2TotalData = JSON.parse(localStorage.getItem('panel2TotalData'));
		}
	}

});


