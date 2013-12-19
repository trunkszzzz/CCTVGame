// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:


var gNowSchedule;

function getAllSchedule()
{
	console.log("getAllSchedule!!!!!!!!!!!!!!!!!!!!!!");
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
    					return results;
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

var gAllSchedule = getAllSchedule();

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
    
AV.Cloud.define("testCommitAnswer", function(request, response){
	// console.log("testCommitAnswer's request is ", request);
	var selectBrand = request.params["select"];
	console.log("request is ", selectBrand);
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
    					console.log("testCommitAnswer's success find", results);
					var nowTime = new Date();	
					var nowHours = nowTime.getHours();
					var nowMinutes = nowTime.getMinutes();
					var nowSeconds = nowTime.getSeconds();
					for (var index = 0; index < results.length; index++){
						var brand = results[index];
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
								var theUser = request["user"];
								console.log("testCommitAnswer's user is ", theUser);
								var s = theUser["TotalScore"];
								console.log("current score is ", s);
								s += 1;
								request.params["user"]["TotalScore"] = s;
								response.success("you selected ", brandName);
								break;
							}
						}
					}
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

