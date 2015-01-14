//let's not pollute the global space
var training = {};

training.log = function(text){
  $('#content').prepend(text + "<br>");
};


training.start = function(traindata, iterations){
    training.iterations = iterations || 3;
    var opts = {};
    opts.num_epochs = 20;
        
    training.log("building sample data");
    var net_train_data = [];
    var net_train_labels = [];
    var trainingCategories = [];
    
    traindata.forEach(function(item, index){
        trainingCategories.push(item.categoryLabel);
        item.data.forEach(function(dataItem){
            net_train_labels.push(index);
            var date = new Date(dataItem.date);
            net_train_data.push(new convnetjs.Vol([
                dataItem.lat, dataItem.lon, dataItem.temp, dataItem.daysSinceLast,
                date.getMonth()+1, 
                date.getDay(), 
                date.getHours(), 
                date.getMinutes()]));
        });
    });
    
    console.log("Size of training data: " + net_train_data.length);
    console.log("Size of training labels: " + net_train_labels.length);
    // console.log("Training data: \n");
    // console.log(JSON.stringify(net_train_data));
    console.log("Labels: " + JSON.stringify(net_train_labels));
    console.log("Readable Labels" + JSON.stringify(trainingCategories));
    
    var magicNet = new convnetjs.MagicNet(net_train_data, net_train_labels, opts);
    magicNet.onFinishBatch(finishedBatch);
    var intvl = setInterval(function(){magicNet.step()}, 0);
        
    function finishedBatch() {
        training.log("training batch complete - iteration " + training.iterations);
        var some_test_vol = new convnetjs.Vol([35.646796, 145.710276, 43.5, 0, 1, 12, 14, 30]);
        
         var predicted_label_soft = magicNet.predict_soft(some_test_vol);
        // console.log("predicting soft label: " + JSON.stringify(predicted_label_soft))
        console.log("predicting label #" + magicNet.predict(some_test_vol)); 
        
        // training.log("training: " + predicted_label + " / " + JSON.stringify(predicted_label_soft));
            
        if (training.iterations === 0) {
            var predicted_label = magicNet.predict(some_test_vol);               
            predicted_label_soft = magicNet.predict_soft(some_test_vol);
            training.log("final: " + traindata[predicted_label].categoryLabel + " / " + JSON.stringify(predicted_label_soft));
            clearInterval(intvl);
            training.log("... posting model ... please wait ...");
            var modelData = magicNet.toJSON();
            modelData.labelCategories = trainingCategories;
            $.ajax({
                type: "POST",
                url: '/train',
                data: JSON.stringify(modelData),
                contentType: 'application/json',
                success: training.log("Server Model Updated."),
                dataType: "json"
            })
            .done(function(r){
                training.log(r.msg);
            });
            } else {
                training.iterations -= 1;
            }
        }
};        
       