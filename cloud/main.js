// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:


var gNowSchedule;

function S4() 
{   
   // return (((1+Math.random())*0x10000)|0).toString(16).substring(1);  
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);    
}    

function NewGuid() 
{   
   // return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
   return S4()+S4();   
}

function getAllSchedule()
{
	console.log("getAllSchedule!!!!!!!!!!!!!!!!!!!!!!", new Date());
    var query = new AV.Query("Config");
    query.equalTo("Key", "ScheduleId");
    query.find({
    		success: function(results){
    			var o = results[0];
    			var sid = o.get("Content");
    			console.log("getSchedule success! ", sid);
    			var query = new AV.Query(sid);
    			query.find({
    				success: function(results){
    					console.log("query info ", results);
    					gAllSchedule = new Array(results.length);
    					for (var index = 0; index < results.length; index++){
    						var brand = results[index];
						var startTime = brand.get("StartTime");
						var endTime = brand.get("EndTime");
						// startTime.setHours(startTime.getHours());
						// endTime.setHours(endTime.getHours());
    						console.log("starttime is " + startTime + " name is " + brand.get("Brand"));
						gAllSchedule[index]=results[index];
					}
    					// gAllSchedule = results;
			    		// for (var index = 0; index < gAllSchedule.length; index++){
						// var brand = gAllSchedule[index];
						// var startTime = brand.get("StartTime");
						// var endTime = brand.get("EndTime");
						// // startTime.setHours(startTime.getHours());
						// // endTime.setHours(endTime.getHours());
						// console.log("starttime is " + startTime + " name is " + brand.get("Brand"));
					// }
    				},
    				error: function(){
    					console.log("getSchedule1 error");
    				}
    			});
    		},
    		error: function(){
    			console.log("getSchedule2 error");
    		}
    });
}

// getAllSchedule();
// var gAllSchedule = getAllSchedule();
// var gAllSchedule = null;

function getCurrentSchedule(){
	var nowTime = new Date();	
	var nowHours = nowTime.getHours();
	var nowMinutes = nowTime.getMinutes();
	var nowSeconds = nowTime.getSeconds();
	for (var index = 0; index < gAllSchedule.length; index++){
		var brand = gAllSchedule[index];
		var brandName = brand.get("Brand");
		var startTime = brand.get("StartTime");
		var endTime = brand.get("EndTime");
		nowTime.setYear(1900+startTime.getYear());
		nowTime.setMonth(startTime.getMonth());
		nowTime.setDate(startTime.getDate());
		console.log("brandName is ", brandName);
		console.log("startTime is ", startTime);
		console.log("endTime is ", endTime);
		console.log("nowTime is ", nowTime);
		if (nowTime - startTime > 0){
			if (nowTime - endTime < 0){
				console.log("now is in ", brandName);
				return brand;
			}
		}
	}
	return null;
}


AV.Cloud.define("commitAnswer", function(request, response){
	console.log("commitAnswer's request is ", request);
	var selectBrand = request.params["select"];
	console.log("request is ", selectBrand);
	var currentSchedule = getCurrentSchedule();
	if (currentSchedule != null){
		if (selectBrand == currentSchedule.get("Brand")){
			console.log("selection is correct! ", selectBrand);
			response.success("commitAnswer ok");
		}
	}
	else{
		console.log("there is no brand now");
	}
});
    
AV.Cloud.define("getTopRanking", function(request, response){
	var theUser = request.user;
	var query = new AV.Query("_User");
	query.descending("YesterdayScore");
	query.limit(1000);
	query.find({
    		success: function(results){
    			console.log("User is ", results);
    			console.log("length is ", results.length);
    			var ret = {};
    			var top = 3;
			for (var index = 0; index < results.length; index++){
				if (top <= 0)
					break;
				var userData = results[index];
				ret[userData.get("Nickname")] = userData.get("YesterdayScore");
				top--;
			}
			
			response.success(ret);
    		},
    		error: function(){
			console.log("getTopRanking error");
			response.error("getTopRanking error");
		}
   });
});
   
AV.Cloud.define("getRanking", function(request, response){
	var theUser = request.user;
	var query = new AV.Query("_User");
	query.limit(1000);
	query.descending("TotalScore");
	query.find({
    		success: function(results){
    			
			for (var index = 0; index < results.length; index++){
				var userData = results[index];
				//console.log("userdata is ", userData.get("username"), "theuser is ", theUser.get("username"));
				if (userData.get("username") == theUser.get("username")){
					var ret = {};
					for (var index1 = 0; index1 < 6; index1++){
						var i = index + index1;
						if (i < 0 || i >= results.length)
							continue;
						var ud = results[i];
						var subRet = {};
						subRet["SelfRanking"] = i+1;
						if (ud.has("TotalScore")){
							subRet["TotalScore"] = ud.get("TotalScore");
						}
						else{
							subRet["TotalScore"] = 0;
						}
						ret[ud.get("Nickname")] = subRet;
					}
					for (var index1 = 1; index1 < 6; index1++){
						var i = index - index1;
						if (i < 0 || i >= results.length)
							continue;
						var ud = results[i];
						var subRet = {};
						subRet["SelfRanking"] = i+1;
						if (ud.has("TotalScore")){
							subRet["TotalScore"] = ud.get("TotalScore");
						}
						else{
							subRet["TotalScore"] = 0;
						}
						ret[ud.get("Nickname")] = subRet;
					}
					var subRet = {};
					if (userData.has("TotalScore")){
						subRet["TotalScore"] = userData.get("TotalScore");
					}
					else{
						subRet["TotalScore"] = 0;
					}
					subRet["SelfRanking"] = index+1;
					ret[userData.get("Nickname")] = subRet;
					response.success(ret);
					return;
				}
			}
			console.log("getRanking1 error");
			response.error("getRanking1 error");
    		},
    		error: function(){
			console.log("getRanking error");
			response.error("getRanking error");
		}
   });
});

AV.Cloud.define("exchangePrize", function(request, response){
	console.log("exchangePrize's request is ", request);
	var theUser = request.user;
	console.log("get prize before ", request.params);
	var prizeLevel = request.params["prize_level"];
	var prizeIndex = request.params["prize_index"];
	var prizeId = request.params["prize_id"];
	console.log("get prize end");
	var query = new AV.Query("PrizeData");
	query.find({
		success: function(results){
			for (var index = 0; index < results.length; index++){
				var prize = results[index];
				if (prize.get("Id") == prizeId){
					var leftNum = prize.get("LeftNum");
					var needPoint = prize.get("NeedPoint");
					var coupons = prize.get("Coupons");
					var userPoint = theUser.get("TotalScore");
					var exchangePoint = theUser.get("TotalExchangePoint");
					var exchangeRecord = theUser.get("ExchangeRecord");
					if (exchangePoint == null)
					{
						exchangePoint = 0;
					}
					if (exchangeRecord == null)
					{
						exchangeRecord = new Array();
					}
					if (userPoint < needPoint)
					{
						response.error("not enough point");
						console.log("not enough point");
						return;
					}
					if (leftNum <= 0)
					{
						response.error("not enough prize");
						console.log("not enough prize");
						return;
					}
					if (coupons.length <= 0)
					{
						response.error("not enough prize");
						console.log("not enough prize");
						return;
					}
					userPoint -= needPoint;
					exchangePoint += needPoint;
					leftNum = leftNum - 1;
					var guidStr = coupons.pop();
					prize.set("LeftNum", leftNum);
					prize.set("Coupons", coupons);
					prize.save(null, {
								  success: function(epr) {
								    // Execute any logic that should take place after the object is saved.
								    console.log("prize.save");
								    return;
								  },
								  error: function(epr, error) {
								  	response.error("prize.save error ", error.description);
		    							console.log("prize.save error", error.description);
		    							return;
								    // Execute any logic that should take place if the save fails.
								    // error is a AV.Error with an error code and description.
								    // alert('Failed to create new object, with error code: ' + error.description);
								  }
								});
					// var guidStr = NewGuid();
					theUser.set("TotalScore", userPoint);
					theUser.set("TotalExchangePoint", exchangePoint);
					var objj = {"code" : guidStr, "id" : prizeId};
					exchangeRecord.push(objj);
					theUser.set("ExchangeRecord", exchangeRecord);
					theUser.save(null, {
								  success: function(epr) {
								    // Execute any logic that should take place after the object is saved.
								    console.log("theUser.save");
								    return;
								  },
								  error: function(epr, error) {
								  	response.error("theUser.save error ", error.description);
		    							console.log("theUser.save error", error.description);
		    							return;
								    // Execute any logic that should take place if the save fails.
								    // error is a AV.Error with an error code and description.
								    // alert('Failed to create new object, with error code: ' + error.description);
								  }
								});
					var ExchangePrizeRecord = AV.Object.extend("ExchangePrizeRecord");
					var epr = new ExchangePrizeRecord();
					epr.set("UserName", theUser.get("username"));
					epr.set("PrizeLevel", prizeLevel);
					epr.set("PrizeIndex", prizeIndex);
					epr.set("ExchangeID", guidStr);
					epr.save(null, {
					  success: function(epr) {
					    // Execute any logic that should take place after the object is saved.
					    // alert('New object created with objectId: ' + gameScore.id);
					    console.log("exchangePrize Success");
					    // theUser.save();
					    // prize.save();
					    var exchangeRecordRet = {"code" : guidStr, "id" : prizeId};
					    exchangeRecord.push(exchangeRecordRet);
					    var retObj = {"record" : exchangeRecordRet, "id" : prizeId, "guid" : guidStr, "level" : prizeLevel, "index" : prizeIndex, "left" : coupons.length, "total" : userPoint, "exchange" : exchangePoint};
					    response.success(retObj);
					    return;
					  },
					  error: function(epr, error) {
					  	response.error("ExchangePrizeRecord save error ", error.description);
							console.log("ExchangePrizeRecord save error", error.description);
							return;
					    // Execute any logic that should take place if the save fails.
					    // error is a AV.Error with an error code and description.
					    // alert('Failed to create new object, with error code: ' + error.description);
					  }
					});
				}
			}
		},
		error: function(){
			response.error("exchangePrize error");
    			console.log("exchangePrize error");
		}
	});
});

AV.Cloud.define("testCommitAnswer", function(request, response){
	console.log("testCommitAnswer's request is ", request);
	var selectBrand = request.params["select"];
	var sid = request.params["schedule"];
	var today_score = request.params["today"];
	var total_score = request.params["total"];
	console.log("request is ", selectBrand);
	console.log("getSchedule success! ", sid);
	var query = new AV.Query(sid);
	query.limit(1000);
	query.find({
		success: function(results){
			// console.log("testCommitAnswer's success find", results.length);
		var nowTime = new Date();	
		nowTime.setHours(nowTime.getHours()+8);
		console.log("testCommitAnswer's success find", nowTime);
		var nowHours = nowTime.getHours();
		var nowMinutes = nowTime.getMinutes();
		var nowSeconds = nowTime.getSeconds();
		for (var index = 0; index < results.length; index++){
			var brand = results[index];
			var brandName = brand.get("Brand");
			var startTime = brand.get("StartTime");
			var endTime = brand.get("EndTime");
			var times = brand.get("Times");
			var getScore = brand.get("Score");
			nowTime.setYear(1900+startTime.getYear());
			nowTime.setMonth(startTime.getMonth());
			nowTime.setDate(startTime.getDate());
			console.log("brandName is ", brandName, "startTime is ", startTime, "endTime is ", endTime, "nowTime is ", nowTime);
			// console.log("startTime is ", startTime);
			// console.log("endTime is ", endTime);
			// console.log("nowTime is ", nowTime);
			if (nowTime - startTime > 0){
				if (nowTime - endTime < 0){
					console.log("time match! ", brandName);
					if (selectBrand == brandName){
						console.log("now is in ", brandName);
						var theUser = request.user;
						var finishedItem = theUser.get("FinishedItem");
						if (finishedItem == null){
							console.log("finishedItem = new Array()");
							finishedItem = new Array();
						}
						var found = false;
						for (var index1 = 0; index1 < finishedItem.length; index1++){
							var finished = finishedItem[index1];
							if (finished == times){
								console.log("FOUND@@@!!!!!!!!!!!");
								found = true;
								break;
							}
						}
						if (found){
							continue;
						}
						console.log("testCommitAnswer's user is ", theUser);
						var s = 0;
						var tts = 0;
						// if (theUser.has("TotalScore"))
						// {
							// s = theUser.get("TotalScore");
						// }
						// if (theUser.has("TodayScore"))
						// {
							// tts = theUser.get("TodayScore");
						// }
						s = total_score;
						tts = today_score;
						s += getScore;
						tts += getScore;
						theUser.set("TotalScore", s);
						theUser.set("TodayScore", tts);
						finishedItem.push(times);
						theUser.set("FinishedItem", finishedItem);
						theUser.save(null, {
						  success: function(epr) {
						    // Execute any logic that should take place after the object is saved.
						    console.log("theUser.save Success");
						    return;
						  },
						  error: function(epr, error) {
						  	response.error("theUser.save error ", error.description);
    							console.log("theUser.save error", error.description);
    							return;
						    // Execute any logic that should take place if the save fails.
						    // error is a AV.Error with an error code and description.
						    // alert('Failed to create new object, with error code: ' + error.description);
						  }
						});
						console.log("current score is ", s);
						response.success("you selected ", brandName);
						return;
					}
				}
			}
		}
		console.log("find error");
		response.error("find error");
		return;
		},
		error: function(){
			response.error("getSchedule1 error");
			console.log("getSchedule1 error");
		}
	});
}); 

AV.Cloud.define("syncTime", function(request, response){
	console.log("syncTime's request is ", request);
	console.log("request is syncTime");
	var nowTime = new Date();
	var timeObj = {"time" : nowTime};
	response.success(timeObj);
});
       
AV.Cloud.define("testHttp", function(request, response){
	console.log("testHttp's request is ", request);
	console.log("test gAllSchedule in testHttp", gAllSchedule);
	response.success(gAllSchedule);
});    

AV.Cloud.define("testAdjustTime", function(request, response){
	var nowTime = new Date();
	console.log("testAdjustTime", nowTime);
    var query = new AV.Query("Config");
    query.equalTo("Key", "ScheduleId");
    query.find({
    		success: function(results){
    			var o = results[0];
    			var sid = o.get("Content");
    			var query = new AV.Query(sid);
    			query.find({
    				success: function(results){
    					for (var index = 0; index < results.length; index++){
    						var brand = results[index];
						var startTime = brand.get("StartTime");
						var endTime = brand.get("EndTime");
						startTime.setHours(nowTime.getHours());
						startTime.setMinutes(nowTime.getMinutes()+1);
						endTime.setHours(nowTime.getHours());
						endTime.setMinutes(nowTime.getMinutes()+1);
						brand.set("StartTime", startTime);
						brand.set("EndTime", endTime);
						brand.save(null, {
									  success: function(epr) {
									    // Execute any logic that should take place after the object is saved.
									    console.log("brand.save");
									    return;
									  },
									  error: function(epr, error) {
									  	response.error("brand.save error ", error.description);
			    							console.log("brand.save error", error.description);
			    							return;
									    // Execute any logic that should take place if the save fails.
									    // error is a AV.Error with an error code and description.
									    // alert('Failed to create new object, with error code: ' + error.description);
									  }
									});
						// startTime.setHours(startTime.getHours());
						// endTime.setHours(endTime.getHours());
					}
					var queryUser = new AV.Query("_User");
					queryUser.find({
				    		success: function(queryUserResults){
							for (var index = 0; index < queryUserResults.length; index++){
								var userData = queryUserResults[index];
								userData.set("FinishedItem", null);
								userData.save(null, {
						  success: function(epr) {
						    // Execute any logic that should take place after the object is saved.
						    // alert('New object created with objectId: ' + gameScore.id);
						    console.log("userData.save Success");
						    // theUser.save();
						    // prize.save();
						    return;
						  },
						  error: function(epr, error) {
						  	response.error("userData.save error ", error.description);
    							console.log("userData.save error", error.description);
    							return;
						    // Execute any logic that should take place if the save fails.
						    // error is a AV.Error with an error code and description.
						    // alert('Failed to create new object, with error code: ' + error.description);
						  }
						});
							}
							response.success("testAdjustTime OK");
				    		},
				    		error: function(){
							console.log("User get error");
						}
				   });
    				},
    				error: function(){
    					console.log("getSchedule1 error");
    				}
    			});
    		},
    		error: function(){
    			console.log("getSchedule2 error");
    		}
    });
});    

AV.Cloud.cronJob("Clear_Timer", "0 0 0 * * ?", function(){
	var query = new AV.Query("_User");
	query.limit(1000);
	query.find({
    		success: function(results){
    			console.log("User is ", results);
    			console.log("length is ", results.length);
			for (var index = 0; index < results.length; index++){
				var userData = results[index];
				userData.set("FinishedItem", null);
				var ts = userData.get("TodayScore");
				userData.set("YesterdayScore", ts);
				userData.set("TodayScore", 0);
				userData.save(null, {
									  success: function(epr) {
									    // Execute any logic that should take place after the object is saved.
									    console.log("userData.save");
									    return;
									  },
									  error: function(epr, error) {
									  	response.error("userData.save error ", error.description);
			    							console.log("userData.save error", error.description);
			    							return;
									    // Execute any logic that should take place if the save fails.
									    // error is a AV.Error with an error code and description.
									    // alert('Failed to create new object, with error code: ' + error.description);
									  }
									});
			}
    		},
    		error: function(){
			console.log("User get error");
		}
   });
	console.log("AV.Cloud.cronJob");
});

