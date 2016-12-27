
(function(){
  var client, sys;
  client = require('beanstalk_client').Client;
  sys = require('sys');
  //producer
  client.connect('challenge.aftership.net:11300', function(err, conn) {
    if (err) {
      sys.puts('Producer connection error:', sys, inspect(err));
    } else {

    }
    sys.puts('Producer connected');
    conn.use('FionaWai', function() { //use my githubname as the tube name
    conn.put(0, 0, 60, JSON.stringify({
              "from" : "HKD",
              "to"   : "USD"
              }), function(err, job_id) {
                sys.puts('Producer sent job: ' + job_id);
                }
            );   
    });
    conn.quit;
  });
  client.disconnect;
})();

