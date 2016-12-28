# Cw8MAgkPCAkABQwCBAMGAw

How it work:

1.download these two .js files to a folder named 'JSHello':
producer_worker.js
consumer_worker.js

2.start your mongodb server by using:
./mongod --dbpath 'your JSHello path'


3.use command (node producer_worker.js) to SEED the data,
(in this case, no need to do this step since I have seeded some into your beanstalkd server)
{
"from" : "HKD",
"to"   : "USD"
}

4.command as belwo to fetch rate data from xe.com and insert it into mongodb :s
 (node consumer_worker.js)

