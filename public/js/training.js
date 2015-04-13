//let's not pollute the global space
var training = {};

training.log = function(text){
  $('#content').prepend(text + "<br>");
};

// ***
// Handles all instances of data we need to remember to pull out
// the labels of the data we have trained, since trained data is
// in the format int 0..K
// ***
training.keywords = {};
training.keyhash = {};
training.keyhash.index = 0;

training.keyhash.add = function(label){
    if(!training.keywords[label]){
        training.keywords[label] = training.keyhash.index;
        training.keyhash.index++;
    }
};

training.keyhash.reset = function(){
    training.keywords = {};
    training.keyhash.index = 0;
};

//***
//
// Will train categories data based on various factors
//
//***

training.trainCategories = function(traindata, iterations){
    training.iterations = iterations || 3;
    var opts = {};
    opts.num_epochs = 20;
    opts.num_folds = 2; 
    opts.num_candidates = 50;
        
    training.log("building up categorical data ...  please wait");
    var net_train_data = [];
    var net_train_labels = [];
    var trainingCategories = [];
    
    traindata.forEach(function(cat, index){
        //Labels must correspond to their indexes
        trainingCategories.push(cat.label);
        
        cat.entries.forEach(function(item){
            net_train_labels.push(index);
            // all dates in the database should be UTC format
             var date = new Date(item.date);
             net_train_data.push(new convnetjs.Vol([
                item.lat, 
                item.lon, 
                item.temp, 
                0,
                date.getUTCMonth()+1, 
                date.getUTCDay(), 
                date.getUTCHours(), 
                date.getUTCMinutes()]));
        });
    });
    
    training.log("Size of training  category data: " + net_train_data.length);
    training.log("Size of training indexes: " + net_train_labels.length);
    training.log("Size of training labels: " + trainingCategories.length);
    
    if (net_train_data.length < 5){
        training.log("sorry, you need to add some more items.  you have too few");
        return null;
    }
    // console.log("\nTraining data: \n");
    // console.log(JSON.stringify(net_train_data));
    // console.log("Labels: " + JSON.stringify(net_train_labels));
    // console.log("Readable Labels" + JSON.stringify(trainingCategories));
    
    var magicNet = new convnetjs.MagicNet(net_train_data, net_train_labels, opts);
    magicNet.onFinishBatch(finishedBatch);
    var intvl = setInterval(function(){magicNet.step()}, 0);
        
    function finishedBatch() {
        training.log("Iteration " + training.iterations + " of " +  training.iterations);
        
         // var predicted_label_soft = magicNet.predict_soft(some_test_vol);
        //console.log("predicting soft label: " + JSON.stringify(predicted_label_soft))
        //console.log("predicting label #" + magicNet.predict(some_test_vol)); 
        
        // training.log("training: " + predicted_label + " / " + JSON.stringify(predicted_label_soft));
            
        if (training.iterations === 0) {
            // var predicted_label = magicNet.predict(some_test_vol);               
            // predicted_label_soft = magicNet.predict_soft(some_test_vol);
            // training.log("final: " + traindata[predicted_label].categoryLabel + " / " + JSON.stringify(predicted_label_soft));
            
            clearInterval(intvl);
            
            var modelData = magicNet.toJSON();
            training.log("Category model is " + JSON.stringify(modelData).length);
            training.log("... posting model ... please wait ...");
            modelData.labelCategories = trainingCategories;
            $.ajax({
                type: "POST",
                url: '/train/categories',
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

training.trainKeywords = function(traindata, iterations){

};
       