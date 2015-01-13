//let's not pollute the global space
var training = {};

training.log = function(text){
  $('#content').prepend(text + "<br>");
};


training.start = function(categories, traindata, iterations){
    training.iterations = iterations || 3;
    var opts = {};
    opts.num_epochs = 20;
        
    training.log("building sample data");
    var net_train_data = [];
    var net_train_labels = [];
    
    traindata.forEach(function(d){
        var date = new Date(d.date);
        net_train_data.push(new convnetjs.Vol([
            d.lat, d.lon, d.temp,
            date.getMonth()+1, 
            date.getDay(), 
            date.getHours(), 
            date.getMinutes()]));
        net_train_labels.push(d.CategoryId);
    });
    
    console.log("Size of training data: " + traindata.length)
    console.log("Labels: " + JSON.stringify(net_train_labels));
    console.log("Training data: " + JSON.stringify(net_train_data));
    console.log("Categories: " + JSON.stringify(categories));
    //TODO: check for existing model instead of building one from scratch
    var magicNet = new convnetjs.MagicNet(net_train_data, net_train_labels, opts);
    magicNet.onFinishBatch(finishedBatch);
    var intvl = setInterval(function(){magicNet.step()}, 0);
        
    function finishedBatch() {
        training.log("training batch complete - iteration " + training.iterations);
        var some_test_vol = new convnetjs.Vol([35.646796, 139.710276, 53.5, 12, 12, 14, 30]);
        
        var predicted_label_soft = magicNet.predict_soft(some_test_vol);
        console.log("predicting soft label: " + JSON.stringify(predicted_label_soft))
        var predicted_label = magicNet.predict(some_test_vol);   
        console.log("predicting label " + predicted_label);
        
        training.log("training: " + net_train_labels[predicted_label] + " / " + JSON.stringify(predicted_label_soft));
            
        if (training.iterations === 0) {
            console.log(net_train_labels)
            predicted_label = magicNet.predict(some_test_vol);               
            predicted_label_soft = magicNet.predict_soft(some_test_vol);
            training.log("final: " + categories[net_train_labels[predicted_label]] + " / " + JSON.stringify(predicted_label_soft));
            clearInterval(intvl);
            // var jsonz = JSON.stringify(magicNet.toJSON());
            // training.log("length of nets: " + jsonz.length);
            training.log("... posting model ... please wait ...");
            var modelData = magicNet.toJSON();
            modelData.customCategories = categories;
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
       