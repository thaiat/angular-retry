var app = angular.module("myApp", []);

var dependencies = ['$q', '$rootScope'];
var service = function ($q, $rootScope) {

	var sleep = function (interval) {
		// check parameter
		if (!(interval === parseFloat(interval)) || interval < 0)
			throw new Error("interval must be a positive float");

		var deferred = $q.defer();

		// sleep
		setTimeout(function () {
			$rootScope.$apply(function () {
				deferred.resolve(interval);
			});
		}, interval);

		return deferred.promise;
	};

	var toAsync = function (action) {
		if (typeof action !== "function") {
			throw new Error("action must be a function");
		}
		var deferred = $q.defer();
		try {
			var retval = action();
			deferred.resolve(retval);

		} catch (ex) {
			deferred.reject(ex);
		}
		return deferred.promise;
	};

	var retry = function (action, options) {

		retry.DEFAULT_OPTIONS = {
			maxRetry: 3,
			interval: 500,
			intervalMultiplicator: 1.5
		};

		if (typeof action !== "function") {
			throw new Error("action must be a function");
		}
		if (!options) {
			options = retry.DEFAULT_OPTIONS;
		} else {
			for (var k in retry.DEFAULT_OPTIONS) {
				if (retry.DEFAULT_OPTIONS.hasOwnProperty(k) && !(k in options)) {
					options[k] = retry.DEFAULT_OPTIONS[k];
				}
			}
		}

		var resolver = function (remainingTry, interval) {
			var result = toAsync(action);
			if (remainingTry <= 1) {
				return result;
			}
			return result.
			catch (function (e) {
				return sleep(interval).then(function () {
					// recursion
					return resolver(remainingTry - 1, interval * options.intervalMultiplicator);
				});
			});
		}
		return resolver(options.maxRetry, options.interval);
	};

	return {
		sleep: sleep,
		toAsync: toAsync,
		retry: retry
	}

};

app.factory("promiseService", dependencies.concat(service));