describe("Service : promiseService", function () {
	var service;
	var $rootScope;
	var $httpbackend;
	var $http;

	beforeEach(module("myApp"));

	beforeEach(inject(function ($injector) {
		service = $injector.get("promiseService");
		$timeout = $injector.get("$timeout");
		$rootScope = $injector.get("$rootScope");
		$httpBackend = $injector.get("$httpBackend");
		$http = $injector.get("$http");

	}));

	it("should_be_defined", function () {
		expect(service).toBeDefined();
	});

	it("sleep_with_not_integer_interval_should_throw_exception", function () {
		expect(function () {
			service.sleep("invalid");
		}).toThrow(new Error("interval must be a positive float"));
	});

	it("sleep_with_not_positive_integer_interval_should_throw_exception", function () {
		expect(function () {
			service.sleep(-2);
		}).toThrow(new Error("interval must be a positive float"));
		$rootScope.$apply();
	});

	it("sleep_with_positive_integer_interval_should_succeed", function (done) {
		var interval = 100;
		service.sleep(interval).then(function (result) {
			expect(result).toEqual(interval);
			done();
		});
		$rootScope.$apply();
	});

	it("toAsync_with_invalid_parameter_function_should_throw_exception", function () {
		expect(function () {
			service.toAsync("invalid");
		}).toThrow(new Error("action must be a function"));
	});

	it("toAsync_with_valid_sync_function_should_succeed", function (done) {
		spyOn(mockHelper, 'addOne').and.callThrough();
		var action = function () {
			return mockHelper.addOne(100);
		};

		service.toAsync(action).then(function (result) {
			expect(result).toBe(101);
			expect(mockHelper.addOne).toHaveBeenCalledWith(100);
			done();
		});
		$rootScope.$apply();
	});

	it("toAsync_with_valid_async_function_should_succeed", function (done) {
		spyOn(mockHelper, 'getUrl').and.callThrough();
		$httpBackend.when('GET', '/dummy').respond(mockHelper.dummyResponse);
		var action = function () {
			return mockHelper.getUrl();
		};
		service.toAsync(action).then(function (result) {
			expect(mockHelper.getUrl).toHaveBeenCalled();
			expect(result.data).toEqual(mockHelper.dummyResponse);
			done();
		});

		$httpBackend.flush();
		$rootScope.$apply();
	});

	it("toAsync_with_faulty_sync_function_should_succeed", function (done) {
		spyOn(mockHelper, 'faultyFn').and.callThrough();
		var action = function () {
			return mockHelper.faultyFn();
		};
		service.toAsync(action).then(null, function (rejection) {
			expect(mockHelper.faultyFn).toHaveBeenCalled();
			expect(rejection.message).toBe("I'm a faulty function");
			done();
		});
		$rootScope.$apply();
	});

	it("retry_with_invalid_parameter_function_should_throw_exception", function () {
		expect(function () {
			service.retry("invalid");
		}).toThrow(new Error("action must be a function"));

	});

	it("retry_with_faulty_sync_function_should_succeed", function (done) {
		spyOn(mockHelper, 'faultyFn').and.callThrough();
		var action = function () {
			return mockHelper.faultyFn();
		};
		var promise = service.retry(action);
		promise.then(null, function (rejection) {
			expect(mockHelper.faultyFn).toHaveBeenCalled();
			expect(mockHelper.faultyFn.calls.count()).toBe(3);
			expect(rejection.message).toBe("I'm a faulty function");
			done();
		});
		$rootScope.$apply();

	});

	it("retry_with_faulty_sync_function_and_options_should_succeed", function (done) {
		spyOn(mockHelper, 'faultyFn').and.callThrough();
		var action = function () {
			return mockHelper.faultyFn();
		};
		var promise = service.retry(action, {
			maxRetry: 5
		});
		promise.then(null, function (rejection) {

			expect(mockHelper.faultyFn).toHaveBeenCalled();
			expect(mockHelper.faultyFn.calls.count()).toBe(5);
			expect(rejection.message).toBe("I'm a faulty function");
			done();
		});
		$rootScope.$apply();

	});

	it("retry_with_valid_sync_function_should_succeed", function (done) {
		spyOn(mockHelper, 'addOne').and.callThrough();
		var action = function () {
			return mockHelper.addOne(100);
		};
		var promise = service.retry(action);
		promise.then(function (result) {
			expect(result).toBe(101);
			expect(mockHelper.addOne).toHaveBeenCalled();
			expect(mockHelper.addOne.calls.count()).toBe(1);
			done();
		});
		$rootScope.$apply();
	});

	it("retry_with_valid_async_function_should_succeed", function (done) {
		spyOn(mockHelper, 'getUrl').and.callThrough();
		$httpBackend.when('GET', '/dummy').respond(mockHelper.dummyResponse);
		var action = function () {
			return mockHelper.getUrl();
		};
		var promise = service.retry(action);
		promise.then(function (result) {
			expect(mockHelper.getUrl).toHaveBeenCalled();
			expect(result.data).toEqual(mockHelper.dummyResponse);
			done();
		});
		$httpBackend.flush();
		$rootScope.$apply();
	});
	var mockHelper = {
		faultyFn: function () {
			throw new Error("I'm a faulty function");
		},

		addOne: function (value) {
			return value + 1;
		},

		getUrl: function () {
			return $http.get("/dummy");
		},

		dummyResponse: {
			"id": 1,
			"content": "Hello World"
		}
	};

});