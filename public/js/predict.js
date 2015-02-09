var predict = {};

// we will push all our data into this
predict.data = [];

//   basic logging to the user screen
predict.log = function(t){
    $('#content').append(t + "<br>");
};

//   call at document.ready 
predict.start = function(model){
    predict.model = model;
    // var some_test_vol = new convnetjs.Vol([35.646796, 139.710276, 36, 1, 1, 12, 14, 30]);
    navigator.geolocation.getCurrentPosition(predict.keepgoing, predict.positionError, { enableHighAccuracy: true });
    };
      
// callback if we get successfull position lock and we have access to 'pos' variable
predict.keepgoing = function(pos){
    predict.data.push(pos.coords.latitude);
    predict.log("Latitude: " + pos.coords.latitude);
    predict.data.push(pos.coords.longitude);
    predict.log("Longitude: " + pos.coords.longitude);
    
    var url = "https://api.forecast.io/forecast/a693235492de9e1806ef2ea9e25dc814/" + pos.coords.latitude + "," + pos.coords.longitude;
    $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: url,
    })
    .done(function(r){
        if(r.currently && r.currently.temperature){
            predict.data.push(r.currently.temperature);
            predict.datetime(pos);
        }});
  };

// populate the date and time for prediction 
predict.datetime = function(pos){
    var date = new Date(pos.timestamp);
    predict.log("Date: " + date);
    
    // TODO: daysSinceLast variable - for all categories, and get the highest rating
    predict.data.push(0);
    predict.data.push(date.getUTCMonth()+1); 
    predict.data.push(date.getUTCDay()); 
    predict.data.push(date.getUTCHours()); 
    predict.data.push(date.getUTCMinutes());
    makeGuess();
};

// makes a guess based on the trained model 
var makeGuess = function(){
    var magicNet = new convnetjs.MagicNet();
    magicNet.fromJSON(predict.model);
    // items must be in the correct order as we trained them
    var test_vol = new convnetjs.Vol(predict.data);
    predict.log("from data: " + predict.data + " ");
    
    var predicted_label_soft = magicNet.predict_soft(test_vol);
    var predicted_label = magicNet.predict(test_vol);   
    
    // predict.log("categories: " + JSON.stringify(model.labelCategories));
    predict.log("predicting label" + "<br>" + predict.model.labelCategories[predicted_label]);
    $('#myGuess').html(predict.model.labelCategories[predicted_label]);
    console.log("actual values " + JSON.stringify(predicted_label_soft.w));
};

// user chosen not to disclose position
predict.positionError = function(e){
    predict.log("Position is not turned on ... this may have unpredictable results ");
    predict.log("Error: " + e);
    return null;
};
     

