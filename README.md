angular-retry
=============

A service for retrying functions on exception

##Summary
Every so often, you run across some action, which just fails, where the best response it to just try it again. This is particularly true when dealing with an external source, like a database or web service, which can have network or other temporary problems, which would have cleared up when you repeat the call seconds later. 

Often, these actions fail by throwing an exception which makes the process of trying the call again rather cumbersome. Having to deal with this a number of times in one application, I decided to wrap the full procedure up in an angular service, which I share here with you.


The full post is available at : http://thaiat.github.io/blog/2014/03/23/automatic-retry-on-exception-in-angular/


