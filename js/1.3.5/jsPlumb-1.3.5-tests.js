// jsplumb qunit tests.

var _getContextNode = function() {
	return $("#container");
};

var assertContextExists = function() {
	ok(_getContextNode().length == 1, "context node exists");
};

var assertContextSize = function(elementCount) {
	//equals(_getContextNode().children().length - _divs.length, elementCount, 'context has ' + elementCount + ' children');
};

var assertContextEmpty = function() {
	equals(_getContextNode().children.length, 0, "context empty");
};

var assertEndpointCount = function(elId, count) {
	equals(jsPlumb.getTestHarness().endpointCount(elId), count, elId + " has " + count + (count > 1) ? "endpoints" : "endpoint");
};

var assertConnectionCount = function(endpoint, count) {
	equals(endpoint.connections.length, count, "endpoint has " + count + " connections");
};

var assertConnectionByScopeCount = function(scope, count) {
	equals(jsPlumb.getTestHarness().connectionCount(scope), count, 'Scope ' + scope + " has " + count + (count > 1) ? "connections" : "connection");

};

var _divs = [];
var _addDiv = function(id) {
	var d1 = document.createElement("div");
	_getContextNode().append(d1);
	d1 = jsPlumb.CurrentLibrary.getElementObject(d1);
	jsPlumb.CurrentLibrary.setAttribute(d1, "id", id);
	_divs.push(id);
	return d1;
};

var _cleanup = function() {	
	
	jsPlumb.reset();
	jsPlumb.Defaults.Container = null;
    jsPlumb.Defaults.ConnectionsDetachable = true;
	
	for (var i in _divs) {
		$("#" + _divs[i]).remove();		
	}	
	_divs.splice(0, _divs.length - 1);
};

var testSuite = function(renderMode) {
	
	module("jsPlumb", {teardown: _cleanup});
	
	// setup the container
	var container = document.createElement("div");
	container.id = "container";
	document.body.appendChild(container);

	jsPlumb.setRenderMode(renderMode);

	test(renderMode + ': findIndex method', function() {
		var array = [ 1,2,3, "test", "a string", { 'foo':'bar', 'baz':1 }, { 'ding':'dong' } ];
		equals(jsPlumb.getTestHarness().findIndex(array, 1), 0, "find works for integers");
		equals(jsPlumb.getTestHarness().findIndex(array, "test"), 3, "find works for strings");
		equals(jsPlumb.getTestHarness().findIndex(array, { 'foo':'bar', 'baz':1 }), 5, "find works for objects");
		equals(jsPlumb.getTestHarness().findIndex(array, { 'ding':'dong', 'baz':1 }), -1, "find works properly for objects (objects have different length but some same properties)");
	});
	
	test(renderMode + ': jsPlumb setup', function() {
		ok(jsPlumb, "loaded");
	});
	
	test(renderMode + ': getId', function() {
		var d10 = _addDiv('d10');
		equals(jsPlumb.getTestHarness().getId(d10), "d10");
	});
	
	test(renderMode + ': create a simple endpoint', function() {
		var d1 = _addDiv("d1");
		var e = jsPlumb.addEndpoint($("#d1"), {});
		ok(e, 'endpoint exists');  
		assertEndpointCount("d1", 1);
		ok(e.id != null, "endpoint has had an id assigned");
	});
	
	test(renderMode + ': create and remove a simple endpoint', function() {
		var d1 = _addDiv("d1");
		var ee = jsPlumb.addEndpoint(d1, {uuid:"78978597593"});
		ok(ee != null, "endpoint exists");
		var e = jsPlumb.getEndpoint("78978597593");
		ok(e != null, "the endpoint could be retrieved by UUID");
		ok(e.id != null, "the endpoint has had an id assigned to it");
		assertEndpointCount("d1", 1);
		assertContextSize(1); // one Endpoint canvas.
		jsPlumb.removeEndpoint(d1, ee);	 
		assertEndpointCount("d1", 0);
		e = jsPlumb.getEndpoint("78978597593");
		equals(e, null, "the endpoint has been deleted");
		assertContextSize(0); // no Endpoint canvases.
	});
	
	test(renderMode + ': create two simple endpoints, registered using a selector', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		d1.addClass("window");d2.addClass("window");
		var endpoints = jsPlumb.addEndpoint($(".window"), {});
		equals(endpoints.length, 2, "endpoint added to both windows");  
		assertEndpointCount("d1", 1);
		assertEndpointCount("d2", 1);
	});
	
	test(renderMode + ': create two simple endpoints, registered using an array of element ids', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		d1.addClass("window");d2.addClass("window");
		var endpoints = jsPlumb.addEndpoint(["d1", "d2"], {});
		equals(endpoints.length, 2, "endpoint added to both windows");  
		assertEndpointCount("d1", 1);
		assertEndpointCount("d2", 1);
	});
	
	test(renderMode + ': draggable silently ignored when jquery ui not present', function() {
		var d1 = _addDiv("d1");
		var e = jsPlumb.addEndpoint(d1, {isSource:true});
		ok(e, 'endpoint exists');
	});
	
	test(renderMode + ': droppable silently ignored when jquery ui not present', function() {
		var d1 = _addDiv("d1")
		var e = jsPlumb.addEndpoint(d1, {isTarget:true});
		ok(e, 'endpoint exists');
	});
	
	test(renderMode + ': defaultEndpointMaxConnections', function() {
		var d3 = _addDiv("d3"), d4 = _addDiv("d4");
		var e3 = jsPlumb.addEndpoint(d3, {isSource:true});
		ok(e3.anchor, 'endpoint 3 has an anchor');
		var e4 = jsPlumb.addEndpoint(d4, {isSource:true});
		assertEndpointCount("d3", 1);
		assertEndpointCount("d4", 1);
		assertContextSize(2);						// one canvas for each of our two endpoints.
		ok(!e3.isFull(), "endpoint 3 is not full.");
		jsPlumb.connect({source:d3, target:'d4', sourceEndpoint:e3, targetEndpoint:e4});
		assertConnectionCount(e3, 1);   // we have one connection
		jsPlumb.connect({source:d3, target:'d4', sourceEndpoint:e3, targetEndpoint:e4});
		assertConnectionCount(e3, 1);  // should have refused the connection; default max is 1.
		assertContextSize(3); // now we have one more canvas, for the Connection that was accepted.
	});
	
	test(renderMode + ': specifiedEndpointMaxConnections', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var e5 = jsPlumb.addEndpoint(d5, {isSource:true, maxConnections:3});
		ok(e5.anchor, 'endpoint 5 has an anchor');
		var e6 = jsPlumb.addEndpoint(d6, {isSource:true, maxConnections:2});  // this one has max TWO
		assertEndpointCount("d5", 1); assertEndpointCount("d6", 1);
		assertContextSize(2);
		ok(!e5.isFull(), "endpoint 5 is not full.");
		jsPlumb.connect({sourceEndpoint:e5, targetEndpoint:e6});
		assertConnectionCount(e5, 1);   // we have one connection
		assertContextSize(3);
		jsPlumb.connect({sourceEndpoint:e5, targetEndpoint:e6});
		assertConnectionCount(e5, 2);  // two connections
		assertContextSize(4);
		jsPlumb.connect({sourceEndpoint:e5, targetEndpoint:e6});
		assertConnectionCount(e5, 2);  // should have refused; max is 2, for d4.
		assertContextSize(4);
	});
	
	test(renderMode + ': noEndpointMaxConnections', function() {
		var d3 = _addDiv("d3"), d4 = _addDiv("d4");
		var e3 = jsPlumb.addEndpoint(d3, {isSource:true, maxConnections:-1});
		var e4 = jsPlumb.addEndpoint(d4, {isSource:true, maxConnections:-1});
		jsPlumb.connect({sourceEndpoint:e3, targetEndpoint:e4});
		assertContextSize(3);
		assertConnectionCount(e3, 1);   // we have one connection
		jsPlumb.connect({sourceEndpoint:e3, targetEndpoint:e4});
		assertConnectionCount(e3, 2);  // we have two.  etc (default was one. this proves max is working).
		assertContextSize(4);
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var e5 = jsPlumb.addEndpoint(d3, {isSource:true, maxConnections:-1});
		jsPlumb.connect({sourceEndpoint:e5, targetEndpoint:e4});
		assertConnectionCount(e4, 3);
		assertContextSize(6);
	});
	
	test(renderMode + ': anchors equal', function() {
		var a1 = jsPlumb.makeAnchor([0, 1, 1, 1], null, jsPlumb);
		var a2 = jsPlumb.makeAnchor([0, 1, 1, 1], null, jsPlumb);
		ok(a1.equals(a2), "anchors are the same");
	});
	
	test(renderMode + ': anchors equal with offsets', function() {
		var a1 = jsPlumb.makeAnchor([0, 1, 1, 1, 10, 13], null, jsPlumb);
		var a2 = jsPlumb.makeAnchor([0, 1, 1, 1, 10, 13], null, jsPlumb);
		ok(a1.equals(a2), "anchors are the same");
	});
	
	test(renderMode + ': anchors not equal', function() {
		var a1 = jsPlumb.makeAnchor([0, 1, 0, 1], null, jsPlumb);
		var a2 = jsPlumb.makeAnchor([0, 1, 1, 1], null, jsPlumb);
		ok(!a1.equals(a2), "anchors are different");
	});
	
	test(renderMode + ': anchor not equal with offsets', function() {
		var a1 = jsPlumb.makeAnchor([0, 1, 1, 1, 10, 13], null, jsPlumb);
		var a2 = jsPlumb.makeAnchor([0, 1, 1, 1], null, jsPlumb);
		ok(!a1.equals(a2), "anchors are different");
	});
	
	test(renderMode + ': detach does not fail when no arguments are provided', function() {
		var d3 = _addDiv("d3"), d4 = _addDiv("d4");
		jsPlumb.connect({source:d3, target:d4});
		jsPlumb.detach();	
	});

    // test that detach does not fire an event by default
	test(renderMode + ': jsPlumb.detach should fire detach event by default', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach(conn);
		equals(eventCount, 1);
	});

    // test that detach does not fire an event by default
	test(renderMode + ': jsPlumb.detach should fire detach event by default, using params object', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach({connection:conn});
		equals(eventCount, 1);
	});

    // test that detach fires an event when instructed to do so
	test(renderMode + ': jsPlumb.detach should not fire detach event when instructed to not do so', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach(conn, {fireEvent:false});
		equals(eventCount, 0);
	});
	
	// issue 81
	test(renderMode + ': jsPlumb.detach should fire only one detach event (pass Connection as argument)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach(conn);
		equals(eventCount, 1);
	});
	
	// issue 81
	test(renderMode + ': jsPlumb.detach should fire only one detach event (pass Connection as param in argument)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach({connection:conn});
		equals(eventCount, 1);
	});
	
	// issue 81
	test(renderMode + ': jsPlumb.detach should fire only one detach event (pass source and targets as strings as arguments in params object)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach({source:"d5", target:"d6"});
		equals(eventCount, 1);
	});
	
	// issue 81
	test(renderMode + ': jsPlumb.detach should fire only one detach event (pass source and targets as divs as arguments in params object)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		var conn = jsPlumb.connect({source:d5, target:d6});
		var eventCount = 0;
		jsPlumb.bind("jsPlumbConnectionDetached", function(c) { eventCount++; });
		jsPlumb.detach({source:d5, target:d6, fireEvent:true});
		equals(eventCount, 1);
	});
	
	//TODO make sure you run this test with a single detach call, to ensure that
	// single detach calls result in the connection being removed. detachEveryConnection can
	// just blow away the connectionsByScope array and recreate it.
	test(renderMode + ': jsPlumb.getConnections (simple case, default scope)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		jsPlumb.connect({source:d5, target:d6});
		assertContextSize(3);
		var c = jsPlumb.getConnections();  // will get all connections in the default scope.
		equals(c.length, 1, "there is one connection");
	});
	
	test(renderMode + ': jsPlumb.getConnections (simple case, default scope; detach by element id using params object)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6"), d7 = _addDiv("d7");
		jsPlumb.connect({source:d5, target:d6});
		jsPlumb.connect({source:d6, target:d7});
		assertContextSize(6);
		var c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 2, "there are two connections initially");
		jsPlumb.detach({source:'d5', target:'d6'});
		c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 1, "after detaching one, there is now one connection.");
		assertContextSize(5);
	});

    test(renderMode + ': jsPlumb.getConnections (simple case, default scope; detach by id using params object)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6"), d7 = _addDiv("d7");
		jsPlumb.connect({source:d5, target:d6});
		jsPlumb.connect({source:d6, target:d7});
		assertContextSize(6);
		var c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 2, "there are two connections initially");
		jsPlumb.detach({source:"d5", target:"d6"});
		c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 1, "after detaching one, there is now one connection.");
		assertContextSize(5);
	});

	test(renderMode + ': jsPlumb.getConnections (simple case, default scope; detach by element object using params object)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6"), d7 = _addDiv("d7");
		jsPlumb.connect({source:d5, target:d6});
		jsPlumb.connect({source:d6, target:d7});
		assertContextSize(6);
		var c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 2, "there are two connections initially");
		jsPlumb.detach({source:d5, target:d6});
		c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 1, "after detaching one, there is now one connection.");
		assertContextSize(5);
	});
	
	test(renderMode + ': jsPlumb.getConnections (simple case, default scope; detach by Connection)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6"), d7 = _addDiv("d7");
		var c56 = jsPlumb.connect({source:d5, target:d6});
		var c67 = jsPlumb.connect({source:d6, target:d7});
		assertContextSize(6);
		var c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 2, "there are two connections initially");
		jsPlumb.detach(c56);
		assertContextSize(5);		// check that the connection canvas was removed.
		c = jsPlumb.getConnections();  // will get all connections
		equals(c.length, 1, "after detaching one, there is now one connection.");		
	});

// beforeDetach functionality
	
	test(renderMode + ": jsPlumb.detach; beforeDetach on connect call returns false", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1, target:d2, beforeDetach:function(conn) { return false; }});
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection after detach call was denied");
	});
	
	test(renderMode + ": jsPlumb.detach; beforeDetach on connect call returns true", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1, target:d2, beforeDetach:function(conn) { return true; }});
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[0].connections.length, 0, "source endpoint has no connections after detach call was allowed");
	});

	test(renderMode + ": jsPlumb.detach; beforeDetach on connect call throws an exception; we treat it with the contempt it deserves and pretend it said the detach was ok.", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1, target:d2, beforeDetach:function(conn) { throw "i am badly coded"; }});
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[0].connections.length, 0, "source endpoint has no connections after detach call was allowed");
	});
	
	test(renderMode + ": jsPlumb.detach; beforeDetach on addEndpoint call to source Endpoint returns false", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true, beforeDetach:function(conn) { return false; } }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection after detach call was denied");
	});
	
	test(renderMode + ": jsPlumb.detach; beforeDetach on addEndpoint call to source Endpoint returns true", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true, beforeDetach:function(conn) { return true; } }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[0].connections.length, 0, "source endpoint has no connections after detach call was allowed");
	});
	

	test(renderMode + ": Endpoint.detach; beforeDetach on addEndpoint call to source Endpoint returns false; Endpoint.detach returns false too (the UI needs it to)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true, beforeDetach:function(conn) { return false; } }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection initially");
		var success = e1.detach(c);
		equals(c.endpoints[0].connections.length, 1, "source endpoint has a connection after detach call was denied");
		ok(!success, "Endpoint reported detach did not execute");
	});

	test(renderMode + ": jsPlumb.detach; beforeDetach on addEndpoint call to target Endpoint returns false", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true, beforeDetach:function(conn) { return false; } });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection after detach call was denied");
	});

    test(renderMode + ": jsPlumb.detach; beforeDetach on addEndpoint call to target Endpoint returns false but detach is forced", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true, beforeDetach:function(conn) { return false; } });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detach(c, {forceDetach:true});
        equals(c.endpoints[0].connections.length, 0, "source endpoint has no connections after detach call was denied but forced anyway");
		equals(c.endpoints[1].connections.length, 0, "target endpoint has no connections after detach call was denied but forced anyway");
	});
	
	test(renderMode + ": jsPlumb.detach; beforeDetach on addEndpoint call to target Endpoint returns true", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true, beforeDetach:function(conn) { return true; } });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[1].connections.length, 0, "target endpoint has no connections after detach call was allowed");
	});
	
	test(renderMode + ": jsPlumb.detach; beforeDetach bound to jsPlumb returns false", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true });
		var c = jsPlumb.connect({source:e1,target:e2});
		jsPlumb.bind("beforeDetach", function(connection) {
			ok(connection.sourceId === "d1", "connection is provided and configured with correct source");
			ok(connection.targetId === "d2", "connection is provided and configured with correct target");
			return false;
		});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection after detach call was denied");
	});
	
	test(renderMode + ": jsPlumb.detach; beforeDetach bound to jsPlumb returns true", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true });
		var c = jsPlumb.connect({source:e1,target:e2});
		jsPlumb.bind("beforeDetach", function(connection) {
			ok(connection.sourceId === "d1", "connection is provided and configured with correct source");
			ok(connection.targetId === "d2", "connection is provided and configured with correct target");
			return true;
		});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detach(c);
		equals(c.endpoints[1].connections.length, 0, "target endpoint has no connections after detach call was denied");
	});
	
	test(renderMode + ": jsPlumb.detachAllConnections ; beforeDetach on addEndpoint call to target Endpoint returns false but we should detach anyway", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true, beforeDetach:function(conn) { return false; } });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detachAllConnections(d1);
		equals(c.endpoints[1].connections.length, 0, "target endpoint has no connections after detachAll was called");
	});

	test(renderMode + ": jsPlumb.detachEveryConnection ; beforeDetach on addEndpoint call to target Endpoint returns false but we should detach anyway", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true, beforeDetach:function(conn) { return false; } });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		jsPlumb.detachEveryConnection();
		equals(c.endpoints[1].connections.length, 0, "target endpoint has no connections after detachEveryConnection was called");
	});

	test(renderMode + ": Endpoint.detachAll ; beforeDetach on addEndpoint call to target Endpoint returns false but we should detach anyway", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, { isSource:true }),
		e2 = jsPlumb.addEndpoint(d2, { isTarget:true, beforeDetach:function(conn) { return false; } });
		var c = jsPlumb.connect({source:e1,target:e2});
		equals(c.endpoints[1].connections.length, 1, "target endpoint has a connection initially");
		e1.detachAll();
		equals(c.endpoints[1].connections.length, 0, "target endpoint has no connections after detachAllConnections was called");
	});
	
// ******** end of beforeDetach tests **************

// detachEveryConnection/detachAllConnections fireEvent overrides tests

    test(renderMode + ": jsPlumb.detachEveryConnection fires events", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"), connCount = 0;
        jsPlumb.bind("jsPlumbConnection", function() { connCount++; });
        jsPlumb.bind("jsPlumbConnectionDetached", function() { connCount--; });
        jsPlumb.connect({source:d1, target:d2});
        jsPlumb.connect({source:d1, target:d2});
        equals(connCount, 2, "two connections registered");
        jsPlumb.detachEveryConnection();
        equals(connCount, 0, "no connections registered");
    });

    test(renderMode + ": jsPlumb.detachEveryConnection doesn't fire events when instructed not to", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"), connCount = 0;
        jsPlumb.bind("jsPlumbConnection", function() { connCount++; });
        jsPlumb.bind("jsPlumbConnectionDetached", function() { connCount--; });
        jsPlumb.connect({source:d1, target:d2});
        jsPlumb.connect({source:d1, target:d2});
        equals(connCount, 2, "two connections registered");
        jsPlumb.detachEveryConnection({fireEvent:false});
        equals(connCount, 2, "two connections registered");
    });

     test(renderMode + ": jsPlumb.detachAllConnections fires events", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"), connCount = 0,
            e1 = jsPlumb.addEndpoint(d1), e2 = jsPlumb.addEndpoint(d2);
        jsPlumb.bind("jsPlumbConnection", function() { connCount++; });
        jsPlumb.bind("jsPlumbConnectionDetached", function() { connCount--; });
        jsPlumb.connect({source:d1, target:d2});
        jsPlumb.connect({source:d1, target:d2});
        equals(connCount, 2, "two connections registered");
        jsPlumb.detachAllConnections("d1");
        equals(connCount, 0, "no connections registered");
    });

    test(renderMode + ": jsPlumb.detachAllConnections doesn't fire events when instructed not to", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"), connCount = 0,
            e1 = jsPlumb.addEndpoint(d1), e2 = jsPlumb.addEndpoint(d2);
        jsPlumb.bind("jsPlumbConnection", function() { connCount++; });
        jsPlumb.bind("jsPlumbConnectionDetached", function() { connCount--; });
        jsPlumb.connect({source:d1, target:d2});
        jsPlumb.connect({source:d1, target:d2});
        equals(connCount, 2, "two connections registered");
        jsPlumb.detachAllConnections("d1", {fireEvent:false});
        equals(connCount, 2, "two connections registered");
    });
	
	test(renderMode + ': jsPlumb.getConnections (scope testScope)', function() {
		var d5 = _addDiv("d5"), d6 = _addDiv("d6");
		jsPlumb.connect({source:d5, target:d6, scope:'testScope'});
		var c = jsPlumb.getConnections("testScope");  // will get all connections in testScope	
		equals(c.length, 1, "there is one connection");
		equals(c[0].sourceId, 'd5', "the connection's source is d5");
		equals(c[0].targetId, 'd6', "the connection's source is d6");
		c = jsPlumb.getConnections();  // will get all connections in default scope; should be none.
		equals(c.length, 0, "there are no connections in the default scope");
	});
	
	test(renderMode + ': jsPlumb.getAllConnections (filtered by scope)', function() {
		var d8 = _addDiv("d8"), d9 = _addDiv("d9"), d10 = _addDiv('d10');
		jsPlumb.connect({source:d8, target:d9, scope:'testScope'});
		jsPlumb.connect({source:d9, target:d10}); // default scope
		var c = jsPlumb.getAllConnections();  // will get all connections	
		equals(c[jsPlumb.getDefaultScope()].length, 1);
		equals(c['testScope'].length, 1);	
		// now supply a list of scopes
		c = jsPlumb.getConnections();  	
		equals(c.length, 1);
		c = jsPlumb.getConnections("testScope");
		equals(c.length, 1, "there is one connection in 'testScope'");
	});
	
	test(renderMode + ': jsPlumb.getConnections (filtered by scope and sourceId)', function() {
		var d8 = _addDiv("d8"), d9 = _addDiv("d9"), d10 = _addDiv('d10');
		jsPlumb.connect({source:d8, target:d9, scope:'testScope'});
		jsPlumb.connect({source:d9, target:d8, scope:'testScope'});
		jsPlumb.connect({source:d9, target:d10}); // default scope
		var c = jsPlumb.getConnections({scope:'testScope', source:'d8'});  // will get all connections with sourceId 'd8'	
		equals(c.length, 1, "there is one connection in 'testScope' from d8");	
	});
	
	test(renderMode + ': jsPlumb.getConnections (filtered by scope, source id and target id)', function() {
		var d11 = _addDiv("d11"), d12 = _addDiv("d12"), d13 = _addDiv('d13');
		jsPlumb.connect({source:d11, target:d12, scope:'testScope'});
		jsPlumb.connect({source:d12, target:d13, scope:'testScope'});
		jsPlumb.connect({source:d11, target:d13, scope:'testScope'});
		var c = jsPlumb.getConnections({scope:'testScope', source:'d11', target:'d13'});  
		equals(c.length, 1, "there is one connection from d11 to d13");	
	});
	
	test(renderMode + ': jsPlumb.getConnections (filtered by a list of scopes)', function() {
		var d11 = _addDiv("d11"), d12 = _addDiv("d12"), d13 = _addDiv('d13');
		jsPlumb.connect({source:d11, target:d12, scope:'testScope'});
		jsPlumb.connect({source:d12, target:d13, scope:'testScope2'});
		jsPlumb.connect({source:d11, target:d13, scope:'testScope3'});
		var c = jsPlumb.getConnections({scope:['testScope','testScope3']});  
		equals(c['testScope'].length, 1, 'there is one connection in testScope');
		equals(c['testScope3'].length, 1, 'there is one connection in testScope3');
		equals(c['testScope2'], null, 'there are no connections in testScope2');
	});
	
	test(renderMode + ': jsPlumb.getConnections (filtered by a list of scopes and source ids)', function() {
		var d11 = _addDiv("d11"), d12 = _addDiv("d12"), d13 = _addDiv('d13');
		jsPlumb.connect({source:d11, target:d12, scope:'testScope'});
		jsPlumb.connect({source:d13, target:d12, scope:'testScope'});
		jsPlumb.connect({source:d12, target:d13, scope:'testScope2'});
		jsPlumb.connect({source:d11, target:d13, scope:'testScope3'});
		var c = jsPlumb.getConnections({scope:['testScope','testScope3'], source:['d11']});  
		equals(c['testScope'].length, 1, 'there is one connection in testScope');
		equals(c['testScope3'].length, 1, 'there is one connection in testScope3');
		equals(c['testScope2'], null, 'there are no connections in testScope2');
	});
	
	test(renderMode + ': jsPlumb.getConnections (filtered by a list of scopes, source ids and target ids)', function() {
		jsPlumb.detachEveryConnection();
		var d11 = _addDiv("d11"), d12 = _addDiv("d12"), d13 = _addDiv('d13'), d14=_addDiv("d14"), d15=_addDiv("d15");
		jsPlumb.connect({source:d11, target:d12, scope:'testScope'});
		jsPlumb.connect({source:d13, target:d12, scope:'testScope'});
		jsPlumb.connect({source:d11, target:d14, scope:'testScope'});
		jsPlumb.connect({source:d11, target:d15, scope:'testScope'});
		jsPlumb.connect({source:d12, target:d13, scope:'testScope2'});
		jsPlumb.connect({source:d11, target:d13, scope:'testScope3'});
		assertContextSize(18);
		var c = jsPlumb.getConnections({scope:['testScope','testScope3'], source:['d11'], target:['d14', 'd15']});  
		equals(c['testScope'].length, 2, 'there are two connections in testScope');
		equals(c['testScope3'], null, 'there are no connections in testScope3');
		equals(c['testScope2'], null, 'there are no connections in testScope2');
		var anEntry = c['testScope'][0];
		ok(anEntry.endpoints[0] != null, "Source endpoint is set");
		ok(anEntry.endpoints[1] != null, "Target endpoint is set");
		equals(anEntry.source.attr("id"), "d11", "Source is div d11");
		equals(anEntry.target.attr("id"), "d14", "Target is div d14");
	});
	
	test(renderMode + ': getEndpoints, one Endpoint added by addEndpoint, get Endpoints by selector', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		jsPlumb.addEndpoint(d1);
		var e = jsPlumb.getEndpoints(d1);
		equals(e.length, 1, "there is one endpoint for element d1");
	});
	
	test(renderMode + ': getEndpoints, one Endpoint added by addEndpoint, get Endpoints by id', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		jsPlumb.addEndpoint(d1);
		var e = jsPlumb.getEndpoints("d1");
		equals(e.length, 1, "there is one endpoint for element d1");
	});
	
	test(renderMode + ': connection event listeners', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var returnedParams = null/*, returnedParams2 = null*/;
		jsPlumb.bind("jsPlumbConnection", function(params) {
				returnedParams = $.extend({}, params);
		});
		var c = jsPlumb.connect({source:d1, target:d2});
		ok(returnedParams != null, "new connection listener event was fired");
		ok(returnedParams.connection != null, 'connection is set');
		equals(returnedParams.sourceId, "d1", 'sourceid is set');
		equals(returnedParams.targetId, "d2", 'targetid is set');
		equals(returnedParams.source.attr("id"), "d1", 'source is set');
		equals(returnedParams.target.attr("id"), "d2" , 'target is set');
		ok(returnedParams.sourceEndpoint != null, "source endpoint is not null");
		ok(returnedParams.targetEndpoint != null, "target endpoint is not null");
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
			returnedParams = $.extend({}, params);
		});
		jsPlumb.detach(c);
		ok(returnedParams.connection != null, 'connection is set');
		//jsPlumb.detachAll("d1");
		//ok(returnedParams2 != null, "removed connection listener event was fired");
	});
	
	test(renderMode + ': detach event listeners (detach by connection)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
		});
		var conn = jsPlumb.connect({source:d1, target:d2});
		jsPlumb.detach(conn);
		ok(returnedParams != null, "removed connection listener event was fired");
		ok(returnedParams.connection != null, "removed connection listener event passed in connection");
	});
	
	test(renderMode + ': detach event listeners (detach by element ids)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
		});
		var conn = jsPlumb.connect({source:d1, target:d2});
		jsPlumb.detach({source:"d1",target:"d2"});
		ok(returnedParams != null, "removed connection listener event was fired");
	});
	
	test(renderMode + ': detach event listeners (detach by elements)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
			});
		var conn = jsPlumb.connect({source:d1, target:d2});
		jsPlumb.detach({source:d1,target:d2});
		ok(returnedParams != null, "removed connection listener event was fired");
	});
	
	test(renderMode + ': detach event listeners (via Endpoint.detach method)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, {});
		var e2 = jsPlumb.addEndpoint(d2, {});
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
			});
		var conn = jsPlumb.connect({sourceEndpoint:e1, targetEndpoint:e2});
		assertContextSize(3);
		e1.detach(conn);
		ok(returnedParams != null, "removed connection listener event was fired");
		assertContextSize(2);
	});
	
	test(renderMode + ': detach event listeners (via Endpoint.detachFrom method)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, {});
		var e2 = jsPlumb.addEndpoint(d2, {});
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
			});
		jsPlumb.connect({sourceEndpoint:e1, targetEndpoint:e2});
		assertContextSize(3);
		e1.detachFrom(e2);
		ok(returnedParams != null, "removed connection listener event was fired");
		assertContextSize(2);
	});
	
	test(renderMode + ': detach event listeners (via Endpoint.detachAll method)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, {});
		var e2 = jsPlumb.addEndpoint(d2, {});
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
			});
		jsPlumb.connect({sourceEndpoint:e1, targetEndpoint:e2});
		assertContextSize(3);
		e1.detachAll();
		ok(returnedParams != null, "removed connection listener event was fired");
		assertContextSize(2);
	});
	
	test(renderMode + ': detach event listeners (via jsPlumb.deleteEndpoint method)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, {});
		var e2 = jsPlumb.addEndpoint(d2, {});
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
			});
		jsPlumb.connect({sourceEndpoint:e1, targetEndpoint:e2});
		assertContextSize(3);
		jsPlumb.deleteEndpoint(e1);
		ok(returnedParams != null, "removed connection listener event was fired");
		assertContextSize(1);
	});
	
	test(renderMode + ': detach event listeners (ensure cleared by jsPlumb.reset)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var returnedParams = null;
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				returnedParams = $.extend({}, params);
			});
		var conn = jsPlumb.connect({source:d1, target:d2});
		jsPlumb.detach({source:d1,target:d2, fireEvent:true});
		ok(returnedParams != null, "removed connection listener event was fired");
		returnedParams = null;
		
		jsPlumb.reset();
		var conn = jsPlumb.connect({source:d1, target:d2});
		jsPlumb.detach(d1,d2);
		ok(returnedParams == null, "connection listener was cleared by jsPlumb.reset()");
	});
	
	test(renderMode + ': connection events that throw errors', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var returnedParams = null, returnedParams2 = null;
		jsPlumb.bind("jsPlumbConnection", function(params) {
				returnedParams = $.extend({}, params);
				throw "oh no!";
			});
		jsPlumb.connect({source:d1, target:d2});
		var d3 = _addDiv("d3"), d4 = _addDiv("d4");
		jsPlumb.connect({source:d3, target:d4});
		ok(returnedParams != null, "new connection listener event was fired; we threw an error, jsPlumb survived.");
	});
	
	test(renderMode + ": Endpoint.detachFrom", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var conn = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertConnectionCount(e16, 1);
		assertConnectionCount(e17, 1);
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		e16.detachFrom(e17);	
		assertContextSize(2);				// the endpoint canvases should remain
		// but the connection should be gone, meaning not registered by jsPlumb and not registered on either Endpoint:
		assertConnectionCount(e16, 0);
		assertConnectionCount(e17, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);  
	});
	
	test(renderMode + ": Endpoint.detachFromConnection", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var conn = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertConnectionCount(e16, 1);
		assertConnectionCount(e17, 1);
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		e16.detachFromConnection(conn);	
		assertContextSize(3);				// all canvases should remain; the connection was not removed.
		// but endpoint e16 should have no connections now.
		assertConnectionCount(e16, 0);
		assertConnectionCount(e17, 1);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);  
	});
	
	test(renderMode + ": Endpoint.detachAll", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"), d18 = _addDiv("d18");
		var e16 = jsPlumb.addEndpoint($("#d16"), {isSource:true,maxConnections:-1});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint($("#d17"), {isSource:true});
		var e18 = jsPlumb.addEndpoint($("#d18"), {isSource:true});
		jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e18});
		assertConnectionCount(e16, 2);
		assertConnectionCount(e17, 1);
		assertConnectionCount(e18, 1);
		assertContextSize(5);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 2);  
		e16.detachAll();
		assertConnectionCount(e16, 0);
		assertConnectionCount(e17, 0);
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
	});
	
	test(renderMode + ": Endpoint.detach", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var conn = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertConnectionCount(e16, 1);
		assertConnectionCount(e17, 1);
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		e16.detach(conn);	
		assertContextSize(2);				// the endpoint canvases should remain
		// but the connection should be gone, meaning not registered by jsPlumb and not registered on either Endpoint:
		assertConnectionCount(e16, 0);
		assertConnectionCount(e17, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);  
	});
	
	test(renderMode + ": Endpoint.isConnectedTo", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var conn = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		equals(e16.isConnectedTo(e17), true, "e16 and e17 are connected");  
	});
	
	test(renderMode + ": setting endpoint uuid", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"), d18 = _addDiv("d18");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		equals(e16.getUuid(), uuid, "endpoint's uuid was set correctly");
	});
	
	test(renderMode + ": jsPlumb.getEndpoint (by uuid)", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e = jsPlumb.getEndpoint(uuid);
		equals(e.getUuid(), uuid, "retrieved endpoint by uuid");
	});
	
	test(renderMode + ": jsPlumb.deleteEndpoint (by uuid, simple case)", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e = jsPlumb.getEndpoint(uuid);
		equals(e.getUuid(), uuid, "retrieved endpoint by uuid");
		jsPlumb.deleteEndpoint(uuid);
		var f = jsPlumb.getEndpoint(uuid);
		equals(f, null, "endpoint has been deleted");
		var ebe = jsPlumb.getTestHarness().endpointsByElement["d16"];
		equals(ebe.length, 0, "no endpoints registered for element d16 anymore");
		assertContextSize(0);
	});
	
	test(renderMode + ": jsPlumb.deleteEndpoint (by uuid, connections too)", function() {
		// create two endpoints (one with a uuid), add them to two divs and then connect them.
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true,maxConnections:-1});
		jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		// check that the connection was ok.
		equals(e16.connections.length, 1, "e16 has one connection");
		equals(e17.connections.length, 1, "e17 has one connection");
		assertContextSize(3);
		
		// delete the endpoint that has a uuid.  verify that the endpoint cannot be retrieved and that the connection has been removed, but that
		// element d17 still has its Endpoint.
		jsPlumb.deleteEndpoint(uuid);
		var f = jsPlumb.getEndpoint(uuid);
		equals(f, null, "endpoint has been deleted");
		equals(e16.connections.length, 0, "e16 has no connections");
		equals(e17.connections.length, 0, "e17 has no connections");
		var ebe = jsPlumb.getTestHarness().endpointsByElement["d16"];
		equals(ebe.length, 0, "no endpoints registered for element d16 anymore");
		ebe = jsPlumb.getTestHarness().endpointsByElement["d17"];
		equals(ebe.length, 1, "element d17 still has its Endpoint");
		assertContextSize(1);
		
		// now delete d17's endpoint and check that it has gone.
		jsPlumb.deleteEndpoint(e17);
		f = jsPlumb.getEndpoint(e17);
		equals(f, null, "endpoint has been deleted");
		ebe = jsPlumb.getTestHarness().endpointsByElement["d17"];
		equals(ebe.length, 0, "element d17 no longer has any Endpoints");
		assertContextSize(0);
	});
	
	test(renderMode + ": jsPlumb.deleteEndpoint (by reference, simple case)", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e = jsPlumb.getEndpoint(uuid);
		equals(e.getUuid(), uuid, "retrieved endpoint by uuid");
		jsPlumb.deleteEndpoint(e16);
		var f = jsPlumb.getEndpoint(uuid);
		equals(f, null, "endpoint has been deleted");
		assertContextSize(0);
	});
	
	test(renderMode + ": jsPlumb.deleteEndpoint (by reference, connections too)", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true,maxConnections:-1});
		jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		equals(e16.connections.length, 1, "e16 has one connection");
		equals(e17.connections.length, 1, "e17 has one connection");
		assertContextSize(3);
		
		jsPlumb.deleteEndpoint(e16);
		var f = jsPlumb.getEndpoint(uuid);
		equals(f, null, "endpoint has been deleted");
		equals(e16.connections.length, 0, "e16 has no connections");
		equals(e17.connections.length, 0, "e17 has no connections");
		assertContextSize(1);
	});
	
	test(renderMode + ": jsPlumb.deleteEveryEndpoint", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true,maxConnections:-1});
		assertContextSize(2);
		var e = jsPlumb.getEndpoint(uuid);
		equals(e.getUuid(), uuid, "retrieved endpoint by uuid");
		
		jsPlumb.deleteEveryEndpoint();
		
		var f = jsPlumb.getEndpoint(uuid);
		equals(f, null, "endpoint e16 has been deleted");
		var g = jsPlumb.getEndpoint(e17);
		equals(g, null, "endpoint e17 has been deleted");
		assertContextSize(0);
	});
	
	test(renderMode + ": jsPlumb.deleteEveryEndpoint (connections too)", function() {
		var uuid = "14785937583175927504313";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true,maxConnections:-1, uuid:uuid});
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true,maxConnections:-1});
		jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertContextSize(3);
		var e = jsPlumb.getEndpoint(uuid);
		equals(e.getUuid(), uuid, "retrieved endpoint by uuid");
		
		jsPlumb.deleteEveryEndpoint();
		
		var f = jsPlumb.getEndpoint(uuid);
		equals(f, null, "endpoint e16 has been deleted");
		var g = jsPlumb.getEndpoint(e17);
		equals(g, null, "endpoint e17 has been deleted");
		assertContextSize(0);								// no canvases. so all connection canvases have been cleaned up too.
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
	});
	
	test(renderMode + ": jsPlumb.addEndpoint (simple case)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {anchor:[0,0.5,0,-1]});
		var e17 = jsPlumb.addEndpoint(d17, {anchor:"TopCenter"});
		assertContextSize(2);
		equals(e16.anchor.x, 0);
		equals(e16.anchor.y, 0.5);
		equals(e17.anchor.x, 0.5);
		equals(e17.anchor.y, 0);
	});
	
	test(renderMode + ": jsPlumb.addEndpoint (tooltip)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"), 
			e16 = jsPlumb.addEndpoint(d16, {tooltip:"FOO"}),
			e17 = jsPlumb.addEndpoint(d17, {tooltip:"BAZ"});
		assertContextSize(2);
		equals(e16.canvas.getAttribute("title"), "FOO");
		equals(e17.canvas.getAttribute("title"), "BAZ");
	});
	
	test(renderMode + ": jsPlumb.addEndpoint (simple case, dynamic anchors)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {anchors:[[0,0.5,0,-1], [1,0.5,0,1]]});
		var e17 = jsPlumb.addEndpoint(d17, {anchors:["TopCenter", "BottomCenter"]});
		assertContextSize(2);
		equals(e16.anchor.isDynamic, true, "Endpoint 16 has a dynamic anchor");
		equals(e17.anchor.isDynamic, true, "Endpoint 17 has a dynamic anchor");
	});
	
	test(renderMode + ": jsPlumb.addEndpoint (simple case, two arg method)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true, isTarget:false}, {anchor:[0,0.5,0,-1]});
		var e17 = jsPlumb.addEndpoint(d17, {isTarget:true, isSource:false}, {anchor:"TopCenter"});
		assertContextSize(2);
		equals(e16.anchor.x, 0);
		equals(e16.anchor.y, 0.5);
		equals(false, e16.isTarget);
		equals(true, e16.isSource);
		equals(e17.anchor.x, 0.5);
		equals(e17.anchor.y, 0);
		equals(true, e17.isTarget);
		equals(false, e17.isSource);
	});
	
	
	test(renderMode + ": jsPlumb.addEndpoints (simple case)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoints(d16, [{isSource:true, isTarget:false, anchor:[0,0.5,0,-1] }, { isTarget:true, isSource:false, anchor:"TopCenter" }]);
		assertContextSize(2);
		equals(e16[0].anchor.x, 0);
		equals(e16[0].anchor.y, 0.5);
		equals(false, e16[0].isTarget);
		equals(true, e16[0].isSource);
		equals(e16[1].anchor.x, 0.5);
		equals(e16[1].anchor.y, 0);
		equals(true, e16[1].isTarget);
		equals(false, e16[1].isSource);
	});
	
	test(renderMode + ": jsPlumb.addEndpoints (with reference params)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var refParams = {anchor:"RightMiddle"};
		var e16 = jsPlumb.addEndpoints(d16, [{isSource:true, isTarget:false}, { isTarget:true, isSource:false }], refParams);
		assertContextSize(2);
		equals(e16[0].anchor.x, 1);
		equals(e16[0].anchor.y, 0.5);
		equals(false, e16[0].isTarget);
		equals(true, e16[0].isSource);
		equals(e16[1].anchor.x, 1);
		equals(e16[1].anchor.y, 0.5);
		equals(true, e16[1].isTarget);
		equals(false, e16[1].isSource);
	});
	
	test(renderMode + ": jsPlumb.addEndpoint (simple case, dynamic anchors, two arg method)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true, isTarget:false}, {anchors:[[0,0.5,0,-1], [1,0.5,0,1]]});
		var e17 = jsPlumb.addEndpoint(d17, {isTarget:true, isSource:false}, {anchors:["TopCenter", "BottomCenter"]});
		assertContextSize(2);
		equals(e16.anchor.isDynamic, true, "Endpoint 16 has a dynamic anchor");
		equals(e17.anchor.isDynamic, true, "Endpoint 17 has a dynamic anchor");
	});
	
	test(renderMode + ": jsPlumb.makeTarget (simple case)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true, isTarget:false}, {anchors:[[0,0.5,0,-1], [1,0.5,0,1]]});
		jsPlumb.makeTarget(d17, { isTarget:true,anchor:"TopCenter"  });
		equals(true, jsPlumb.CurrentLibrary.hasClass(d17, "ui-droppable"));
	});

	test(renderMode + ": jsPlumb.makeTarget (specify two divs in an array)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		jsPlumb.makeTarget([d16, d17], { isTarget:true,anchor:"TopCenter"  });
		equals(true, jsPlumb.CurrentLibrary.hasClass(d16, "ui-droppable"));
		equals(true, jsPlumb.CurrentLibrary.hasClass(d17, "ui-droppable"));
	});
	
	test(renderMode + ": jsPlumb.makeTarget (specify two divs by id in an array)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		jsPlumb.makeTarget(["d16", "d17"], { isTarget:true,anchor:"TopCenter"  });
		equals(true, jsPlumb.CurrentLibrary.hasClass(d16, "ui-droppable"));
		equals(true, jsPlumb.CurrentLibrary.hasClass(d17, "ui-droppable"));
	});
	
	test(renderMode + ": jsPlumb.makeTarget (specify divs by selector)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		d16.addClass("FOO");d17.addClass("FOO");
		jsPlumb.makeTarget($(".FOO"), { isTarget:true,anchor:"TopCenter"  });
		equals(true, jsPlumb.CurrentLibrary.hasClass(d16, "ui-droppable"));
		equals(true, jsPlumb.CurrentLibrary.hasClass(d17, "ui-droppable"));
	});
	
	test(renderMode + ': jsPlumb.connect (between two Endpoints)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e = jsPlumb.addEndpoint(d1, {});
		var e2 = jsPlumb.addEndpoint(d2, {});
		ok(e, 'endpoint e exists');
		ok(e2, 'endpoint e2 exists');
		assertContextSize(2);				// should have a canvas for each endpoint now.  
		assertEndpointCount("d1", 1);
		assertEndpointCount("d2", 1);
		var c = jsPlumb.connect({target:'d2', sourceEndpoint:e, targetEndpoint:e2});
		assertEndpointCount("d1", 1);		// no new endpoint should have been added
		assertEndpointCount("d2", 1); 		// no new endpoint should have been added
		assertContextSize(3);				// now we should also have a canvas for the connection.
		ok(c.id != null, "connection has had an id assigned");
	});
	
	test(renderMode + ': jsPlumb.connect (Endpoint connectorTooltip parameter)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e = jsPlumb.addEndpoint(d1, {connectorTooltip:"FOO"});
		var e2 = jsPlumb.addEndpoint(d2, {});
		var c = jsPlumb.connect({target:'d2', sourceEndpoint:e, targetEndpoint:e2});
		equals(c.connector.canvas.getAttribute("title"), "FOO", "connector canvas has label attribute set");
	});
	
	test(renderMode + ': jsPlumb.connect (tooltip parameter)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e = jsPlumb.addEndpoint(d1, {});
		var e2 = jsPlumb.addEndpoint(d2, {});
		var c = jsPlumb.connect({target:'d2', sourceEndpoint:e, targetEndpoint:e2, tooltip:"FOO"});
		equals(c.connector.canvas.getAttribute("title"), "FOO", "connector canvas has label attribute set");
	});
	
	test(renderMode + ': jsPlumb.connect (between two Endpoints, and dont supply any parameters to the Endpoints.)', function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e = jsPlumb.addEndpoint(d1);
		var e2 = jsPlumb.addEndpoint(d2);
		ok(e, 'endpoint e exists');
		ok(e2, 'endpoint e2 exists');
		assertContextSize(2);				// should have a canvas for each endpoint now.  
		assertEndpointCount("d1", 1);
		assertEndpointCount("d2", 1);
		jsPlumb.connect({target:'d2', sourceEndpoint:e, targetEndpoint:e2});
		assertEndpointCount("d1", 1);		// no new endpoint should have been added
		assertEndpointCount("d2", 1); 		// no new endpoint should have been added
		assertContextSize(3);				// now we should also have a canvas for the connection.
	});
	
	test(renderMode + ': jsPlumb.connect (by endpoint)', function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertContextSize(3);
	});
	
	test(renderMode + ': jsPlumb.connect (cost)', function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var c = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17, cost:567});
		assertContextSize(3);
		equals(c.getCost(), 567, "connection cost is 567");
	});
	
	test(renderMode + ': jsPlumb.connect (default cost)', function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var c = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertContextSize(3);
		equals(c.getCost(), undefined, "default connection cost is 1");
	});
	
	test(renderMode + ': jsPlumb.connect (set cost)', function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var c = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertContextSize(3);
		equals(c.getCost(), undefined, "default connection cost is 1");
		c.setCost(8989);
		equals(c.getCost(), 8989, "connection cost is 8989");
	});
	
	test(renderMode + ': jsPlumb.connect two endpoints (connectionCost)', function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true, connectionCost:567});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var c = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertContextSize(3);
		equals(c.getCost(), 567, "connection cost is 567");
	});
	
	test(renderMode + ': jsPlumb.connect two endpoints (change connectionCost)', function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {isSource:true, connectionCost:567});
		ok(e16.anchor, 'endpoint 16 has an anchor');
		var e17 = jsPlumb.addEndpoint(d17, {isSource:true});
		var c = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		assertContextSize(3);
		equals(c.getCost(), 567, "connection cost is 567");
		e16.setConnectionCost(23);
		var c2 = jsPlumb.connect({sourceEndpoint:e16, targetEndpoint:e17});
		equals(c.getCost(), 567, "connection cost is 23 after change on endpoint");
	});
	
	test(renderMode + ": jsPlumb.connect (two Endpoints - that have been already added - by UUID)", function() {
		var srcEndpointUuid = "14785937583175927504313", dstEndpointUuid = "14785937583175927534325";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e1 = jsPlumb.addEndpoint("d16", {isSource:true, maxConnections:-1, uuid:srcEndpointUuid});
		var e2 = jsPlumb.addEndpoint("d17", {isSource:true, maxConnections:-1, uuid:dstEndpointUuid});
		jsPlumb.connect({ uuids:  [ srcEndpointUuid, dstEndpointUuid  ] });
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		assertContextSize(3);
	});
	
	test(renderMode + ": jsPlumb.connect (two Endpoints - that have not been already added - by UUID)", function() {
		var srcEndpointUuid = "14785937583175927504313", dstEndpointUuid = "14785937583175927534325";
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		jsPlumb.connect({ uuids:  [ srcEndpointUuid, dstEndpointUuid  ], source:d16, target:d17 });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		var e1 = jsPlumb.getEndpoint(srcEndpointUuid);
		ok(e1 != null, "endpoint with src uuid added");
		ok(e1.canvas != null);
		var e2 = jsPlumb.getEndpoint(dstEndpointUuid);
		ok(e2 != null, "endpoint with target uuid added");
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
	});
	
	test(renderMode + ": jsPlumb.connect (two Endpoints - that have been already added - by endpoint reference)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e1 = jsPlumb.addEndpoint("d16", {isSource:true, maxConnections:-1});
		var e2 = jsPlumb.addEndpoint("d17", {isSource:true, maxConnections:-1});
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
		assertContextSize(3);
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
	});
	
	test(renderMode + ": jsPlumb.connect (two elements)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		jsPlumb.connect({ source:d16, target:d17 });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
	});
	
	test(renderMode + ": jsPlumb.connect (Connector test, straight)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
	});
	
	test(renderMode + ": jsPlumb.connect (Connector test, bezier, no params)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:"Bezier" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Bezier, "Bezier connector chosen for connection");
		equals(conn.connector.majorAnchor, 150, "Bezier connector chose 150 curviness");
	});
	
	test(renderMode + ": jsPlumb.connect (Connector test, bezier, curviness as int)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:["Bezier", { curviness:200 }] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Bezier, "Canvas Bezier connector chosen for connection");
		equals(conn.connector.majorAnchor, 200, "Bezier connector chose 200 curviness");
	});
	
	test(renderMode + ": jsPlumb.connect (Connector test, bezier, curviness as named option)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:["Bezier", {curviness:300}] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Bezier, "Bezier connector chosen for connection");
		equals(conn.connector.majorAnchor, 300, "Bezier connector chose 300 curviness");
	});
	
	test(renderMode + ": jsPlumb.connect (anchors registered correctly; source and target anchors given, as arrays)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:"Straight", anchors:[[0.3,0.3,1,0], [0.7,0.7,0,1]] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Canvas Straight connector chosen for connection");
		equals(0.3, conn.endpoints[0].anchor.x, "source anchor x");
		equals(0.3, conn.endpoints[0].anchor.y, "source anchor y");
		equals(0.7, conn.endpoints[1].anchor.x, "target anchor x");
		equals(0.7, conn.endpoints[1].anchor.y, "target anchor y");
	});
	
	test(renderMode + ": jsPlumb.connect (anchors registered correctly; source and target anchors given, as strings)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:"Straight", anchors:["LeftMiddle", "RightMiddle"] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(0, conn.endpoints[0].anchor.x, "source anchor x");
		equals(0.5, conn.endpoints[0].anchor.y, "source anchor y");
		equals(1, conn.endpoints[1].anchor.x, "target anchor x");
		equals(0.5, conn.endpoints[1].anchor.y, "target anchor y");
	});
	
	test(renderMode + ": jsPlumb.connect (anchors registered correctly; source and target anchors given, as arrays)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:"Straight", anchors:[[0.3,0.3,1,0], [0.7,0.7,0,1]] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(0.3, conn.endpoints[0].anchor.x, "source anchor x");
		equals(0.3, conn.endpoints[0].anchor.y, "source anchor y");
		equals(0.7, conn.endpoints[1].anchor.x, "target anchor x");
		equals(0.7, conn.endpoints[1].anchor.y, "target anchor y");
	});
	
	
	test(renderMode + ": jsPlumb.connect (two argument method in which some data is reused across connections)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"), d18 = _addDiv("d18"), d19 = _addDiv("d19");
		var sharedData = { connector:"Straight", anchors:[[0.3,0.3,1,0], [0.7,0.7,0,1]] };
		var conn = jsPlumb.connect({ source:d16, target:d17}, sharedData);
		var conn2 = jsPlumb.connect({ source:d18, target:d19}, sharedData);
		assertContextSize(6);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 2);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(conn2.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(0.3, conn.endpoints[0].anchor.x, "source anchor x");
		equals(0.3, conn.endpoints[0].anchor.y, "source anchor y");
		equals(0.7, conn.endpoints[1].anchor.x, "target anchor x");
		equals(0.7, conn.endpoints[1].anchor.y, "target anchor y");
		equals(0.3, conn2.endpoints[0].anchor.x, "source anchor x");
		equals(0.3, conn2.endpoints[0].anchor.y, "source anchor y");
		equals(0.7, conn2.endpoints[1].anchor.x, "target anchor x");
		equals(0.7, conn2.endpoints[1].anchor.y, "target anchor y");
	});
	
	test(renderMode + ": jsPlumb.connect (Connector as string test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
	});
	
	test(renderMode + ": jsPlumb.connect (Endpoint test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, endpoint:"Rectangle" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.endpoints[0].endpoint.constructor, jsPlumb.Endpoints[renderMode].Rectangle, "Rectangle endpoint chosen for connection source");
		equals(conn.endpoints[1].endpoint.constructor, jsPlumb.Endpoints[renderMode].Rectangle, "Rectangle endpoint chosen for connection target");
	});
	
	test(renderMode + ": jsPlumb.connect (Endpoint as string test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, endpoint:"Rectangle" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.endpoints[0].endpoint.constructor, jsPlumb.Endpoints[renderMode].Rectangle, "Rectangle endpoint chosen for connection source");
		equals(conn.endpoints[1].endpoint.constructor, jsPlumb.Endpoints[renderMode].Rectangle, "Rectangle endpoint chosen for connection target");
	});
	
	test(renderMode + ": jsPlumb.connect (Endpoints test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, endpoints:["Rectangle", "Dot" ] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.endpoints[0].endpoint.constructor, jsPlumb.Endpoints[renderMode].Rectangle, "Rectangle endpoint chosen for connection source");
		equals(conn.endpoints[1].endpoint.constructor, jsPlumb.Endpoints[renderMode].Dot, "Dot endpoint chosen for connection target");
	});
	
	test(renderMode + ": jsPlumb.connect (Blank Endpoint specified via 'endpoint' param)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, endpoint:"Blank" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.endpoints[0].endpoint.constructor, jsPlumb.Endpoints[renderMode].Blank, "Blank endpoint chosen for connection source");
		equals(conn.endpoints[1].endpoint.constructor, jsPlumb.Endpoints[renderMode].Blank, "Blank endpoint chosen for connection target");
	});
	
	test(renderMode + ": jsPlumb.connect (Blank Endpoint specified via 'endpoints' param)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, endpoints:["Blank", "Blank" ] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.endpoints[0].endpoint.constructor, jsPlumb.Endpoints[renderMode].Blank, "Blank endpoint chosen for connection source");
		equals(conn.endpoints[1].endpoint.constructor, jsPlumb.Endpoints[renderMode].Blank, "Blank endpoint chosen for connection target");
	});
	
	test(renderMode + ": jsPlumb.connect (Endpoint as string test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var conn = jsPlumb.connect({ source:d16, target:d17, endpoints:["Rectangle", "Dot" ] });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(conn.endpoints[0].endpoint.constructor, jsPlumb.Endpoints[renderMode].Rectangle, "Rectangle endpoint chosen for connection source");
		equals(conn.endpoints[1].endpoint.constructor, jsPlumb.Endpoints[renderMode].Dot, "Dot endpoint chosen for connection target");
	});
	
	test(renderMode + ": jsPlumb.connect (by Endpoints, connector test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {});
		var e17 = jsPlumb.addEndpoint(d17, {});
		var conn = jsPlumb.connect({ sourceEndpoint:e16, targetEndpoint:e17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(e16.connections[0].connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
	});
	
	test(renderMode + ": jsPlumb.connect (by Endpoints, connector as string test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var e16 = jsPlumb.addEndpoint(d16, {});
		var e17 = jsPlumb.addEndpoint(d17, {});
		var conn = jsPlumb.connect({ sourceEndpoint:e16, targetEndpoint:e17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(e16.connections[0].connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
	});
	
	test(renderMode + ": jsPlumb.connect (by Endpoints, anchors as string test)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var a16 = "TopCenter", a17 = "BottomCenter";
		var e16 = jsPlumb.addEndpoint(d16, {anchor:a16});
		var e17 = jsPlumb.addEndpoint(d17, {anchor:a17});
		var conn = jsPlumb.connect({ sourceEndpoint:e16, targetEndpoint:e17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(e16.connections[0].connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(e16.anchor.x, 0.5, "endpoint 16 is at top center");equals(e16.anchor.y, 0, "endpoint 16 is at top center");
		equals(e17.anchor.x, 0.5, "endpoint 17 is at bottom center");equals(e17.anchor.y, 1, "endpoint 17 is at bottom center");
	});
	
	test(renderMode + ": jsPlumb.connect (by Endpoints, endpoints create anchors)", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17");
		var a16 = [0,0.5,0,-1], a17 = [1,0.0,-1,-1];
		var e16 = jsPlumb.addEndpoint(d16, {anchor:a16});
		var e17 = jsPlumb.addEndpoint(d17, {anchor:a17});
		var conn = jsPlumb.connect({ sourceEndpoint:e16, targetEndpoint:e17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(e16.connections[0].connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(e16.anchor.x, a16[0]);equals(e16.anchor.y, a16[1]);
		equals(e17.anchor.x, a17[0]);equals(e17.anchor.y, a17[1]);
		equals(e16.anchor.getOrientation()[0], a16[2]); equals(e16.anchor.getOrientation()[1], a16[3]);
		equals(e17.anchor.getOrientation()[0], a17[2]); equals(e17.anchor.getOrientation()[1], a17[3]);
	});
	
	test(renderMode + ": jsPlumb.connect (by Endpoints, endpoints create dynamic anchors; anchors specified by 'anchor')", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {anchor:[[0,0.5,0,-1], [1,0.5,0,1]]});
		var e17 = jsPlumb.addEndpoint(d17, {anchor:["TopCenter", "BottomCenter"]});
		var conn = jsPlumb.connect({ sourceEndpoint:e16, targetEndpoint:e17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(e16.connections[0].connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(e16.anchor.isDynamic, true, "Endpoint 16 has a dynamic anchor");
		equals(e17.anchor.isDynamic, true, "Endpoint 17 has a dynamic anchor");
	});
	
	test(renderMode + ": jsPlumb.connect (by Endpoints, endpoints create dynamic anchors; anchors specified by 'anchors')", function() {
		var d16 = _addDiv("d16"), d17 = _addDiv("d17"); 
		var e16 = jsPlumb.addEndpoint(d16, {anchors:[[0,0.5,0,-1], [1,0.5,0,1]]});
		var e17 = jsPlumb.addEndpoint(d17, {anchors:["TopCenter", "BottomCenter"]});
		var conn = jsPlumb.connect({ sourceEndpoint:e16, targetEndpoint:e17, connector:"Straight" });
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		equals(e16.connections[0].connector.constructor, jsPlumb.Connectors[renderMode].Straight, "Straight connector chosen for connection");
		equals(e16.anchor.isDynamic, true, "Endpoint 16 has a dynamic anchor");
		equals(e17.anchor.isDynamic, true, "Endpoint 17 has a dynamic anchor");
	});
	
	test(renderMode + ": jsPlumb.connect (connect by element, default endpoint, supplied dynamic anchors)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var anchors = [ [0.25, 0, 0, -1], [1, 0.25, 1, 0], [0.75, 1, 0, 1], [0, 0.75, -1, 0] ];
		jsPlumb.connect({source:d1, target:d2, dynamicAnchors:anchors});                // auto connect with default endpoint and provided anchors
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		jsPlumb.detach({source:d1, target:d2});
		// this changed in 1.3.5, because auto generated endpoints are now removed by detach.  so i added the test below this one
		// to check that the deleteEndpointsOnDetach flag is honoured.
		assertEndpointCount("d1", 0);assertEndpointCount("d2", 0);
		assertContextSize(2);
	});
	
	test(renderMode + ": jsPlumb.connect (connect by element, default endpoint, supplied dynamic anchors, delete on detach false)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var anchors = [ [0.25, 0, 0, -1], [1, 0.25, 1, 0], [0.75, 1, 0, 1], [0, 0.75, -1, 0] ];
		jsPlumb.connect({
			source:d1, 
			target:d2, 
			dynamicAnchors:anchors,
			deleteEndpointsOnDetach:false
		});                // auto connect with default endpoint and provided anchors
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		jsPlumb.detach({source:d1, target:d2});
		// this changed in 1.3.5, because auto generated endpoints are now removed by detach.  so i added this test
		// to check that the deleteEndpointsOnDetach flag is honoured.
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		assertContextSize(2);
	});
	
	test(renderMode + ": jsPlumb.connect (connect by element, supplied endpoint and dynamic anchors)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var endpoint = { isSource:true };
		var e1 = jsPlumb.addEndpoint(d1, endpoint);
		var e2 = jsPlumb.addEndpoint(d2, endpoint);
		var anchors = [ "TopCenter", "BottomCenter" ];
		jsPlumb.connect({sourceEndpoint:e1, targetEndpoint:e2, dynamicAnchors:anchors});
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		assertContextSize(3);
		jsPlumb.detach({source:d1, target:d2});
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		assertContextSize(2);
	});
	
	test(renderMode + ": jsPlumb.connect (connect by element, supplied endpoints using 'source' and 'target' (this test is identical to the one above apart from the param names), and dynamic anchors)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var endpoint = { isSource:true };
		var e1 = jsPlumb.addEndpoint(d1, endpoint);
		var e2 = jsPlumb.addEndpoint(d2, endpoint);
		var anchors = [ "TopCenter", "BottomCenter" ];
		jsPlumb.connect({source:e1, target:e2, dynamicAnchors:anchors});
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		assertContextSize(3);
		jsPlumb.detach({source:d1, target:d2});
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		assertContextSize(2);
	});

    test(renderMode + " detachable parameter defaults to true on jsPlumb.connect", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            c = jsPlumb.connect({source:d1, target:d2});
        equals(c.isDetachable(), true, "connections detachable by default");
    });

    test(renderMode + " detachable parameter set to false on jsPlumb.connect", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            c = jsPlumb.connect({source:d1, target:d2, detachable:false});
        equals(c.isDetachable(), false, "connection detachable");
    });

    test(renderMode + " setDetachable on initially detachable connection", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            c = jsPlumb.connect({source:d1, target:d2});
        equals(c.isDetachable(), true, "connection initially detachable");
        c.setDetachable(false);
        equals(c.isDetachable(), false, "connection not detachable");
    });

    test(renderMode + " setDetachable on initially not detachable connection", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            c = jsPlumb.connect({source:d1, target:d2, detachable:false });
        equals(c.isDetachable(), false, "connection not initially detachable");
        c.setDetachable(true);
        equals(c.isDetachable(), true, "connection now detachable");
    });

    test(renderMode + " jsPlumb.Defaults.ConnectionsDetachable", function() {
        jsPlumb.Defaults.ConnectionsDetachable = false;
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            c = jsPlumb.connect({source:d1, target:d2});
        equals(c.isDetachable(), false, "connections not detachable by default (overrode the defaults)");
        jsPlumb.Defaults.ConnectionsDetachable = true;
    });
	
	
	test(renderMode + ": jsPlumb.connect (testing for connection event callback)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var connectCallback = null, detachCallback = null;
		jsPlumb.bind("jsPlumbConnection", function(params) {
				connectCallback = $.extend({}, params);
			});
		jsPlumb.bind("jsPlumbConnectionDetached", function(params) {
				detachCallback = $.extend({}, params);
			});
		jsPlumb.connect({source:d1, target:d2});                // auto connect with default endpoint and anchor set
		ok(connectCallback != null, "connect callback was made");
		assertContextSize(3);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertEndpointCount("d1", 1);assertEndpointCount("d2", 1);
		jsPlumb.detach({source:d1, target:d2});
		assertContextSize(2);
		ok(detachCallback != null, "detach callback was made");
	});
	
	test(renderMode + ": jsPlumb.connect (setting cssClass on Connector)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1,target:d2,cssClass:"CSS"});
		var has = function(clazz) { 
			var cn = c.connector.canvas.className,
				cns = cn.constructor == String ? cn : cn.baseVal; 
			
			return cns.indexOf(clazz) != -1; 
		};		
		ok(has("CSS"), "custom cssClass set correctly");
		ok(has(jsPlumb.connectorClass), "basic connector class set correctly");
	});
	
	test(renderMode + ": jsPlumb.connect (overlays, long-hand version)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var imageEventListener = function() { };
		var arrowSpec = {width:40,length:40,location:0.7, foldback:0, paintStyle:{lineWidth:1, strokeStyle:"#000000"}};
		var connection1 = jsPlumb.connect({
		source:d1, 
	   	target:d2, 
	   	anchors:["BottomCenter", [ 0.75,0,0,-1 ]], 
	   	overlays : [ ["Label",{label:"CONNECTION 1", location:0.3}],
					["Arrow",arrowSpec ] ]
		});
		equals(2, connection1.overlays.length);
		equals(jsPlumb.Overlays[renderMode].Label, connection1.overlays[0].constructor);
		
		equals(jsPlumb.Overlays[renderMode].Arrow, connection1.overlays[1].constructor);
		equals(0.7, connection1.overlays[1].loc);
		equals(40, connection1.overlays[1].width);
		equals(40, connection1.overlays[1].length);
	});
	
	test(renderMode + ": jsPlumb.connect (overlays, long-hand version, IDs specified)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var imageEventListener = function() { };
		var arrowSpec = { 
				width:40,
				length:40,
				location:0.7, 
				foldback:0, 
				paintStyle:{lineWidth:1, strokeStyle:"#000000"},
				id:"anArrow"
		};
		var connection1 = jsPlumb.connect({
		source:d1, 
	   	target:d2, 
	   	anchors:["BottomCenter", [ 0.75,0,0,-1 ]], 
	   	overlays : [ ["Label",{label:"CONNECTION 1", location:0.3, id:"aLabel"}],
					["Arrow",arrowSpec ] ]
		});
		equals(2, connection1.overlays.length);
		equals(jsPlumb.Overlays[renderMode].Label, connection1.overlays[0].constructor);
		equals("aLabel", connection1.overlays[0].id);
		
		equals(jsPlumb.Overlays[renderMode].Arrow, connection1.overlays[1].constructor);
		equals(0.7, connection1.overlays[1].loc);
		equals(40, connection1.overlays[1].width);
		equals(40, connection1.overlays[1].length);
		equals("anArrow", connection1.overlays[1].id);
	});
	
	test(renderMode + ": jsPlumb.connect (remove single overlay by id)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var arrowSpec = { 
				width:40,
				length:40,
				location:0.7, 
				foldback:0, 
				paintStyle:{lineWidth:1, strokeStyle:"#000000"},
				id:"anArrow"
		};
		var connection1 = jsPlumb.connect({
		source:d1, 
	   	target:d2, 
	   	anchors:["BottomCenter", [ 0.75,0,0,-1 ]], 
	   	overlays : [ ["Label",{label:"CONNECTION 1", location:0.3, id:"aLabel"}],
					["Arrow",arrowSpec ] ]
		});
		equals(2, connection1.overlays.length);
		connection1.removeOverlay("aLabel");
		equals(1, connection1.overlays.length);
		equals("anArrow", connection1.overlays[0].id);
	});
	
	test(renderMode + ": jsPlumb.connect (remove multiple overlays by id)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var arrowSpec = { 
				width:40,
				length:40,
				location:0.7, 
				foldback:0, 
				paintStyle:{lineWidth:1, strokeStyle:"#000000"},
				id:"anArrow"
		};
		var connection1 = jsPlumb.connect({
		source:d1, 
	   	target:d2, 
	   	anchors:["BottomCenter", [ 0.75,0,0,-1 ]], 
	   	overlays : [ ["Label",{label:"CONNECTION 1", location:0.3, id:"aLabel"}],
					["Arrow",arrowSpec ] ]
		});
		equals(2, connection1.overlays.length);
		connection1.removeOverlays("aLabel", "anArrow");
		equals(0, connection1.overlays.length);
	});
	
	test(renderMode + ": jsPlumb.connect (overlays, short-hand version)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var imageEventListener = function() { };
		var loc = { location:0.7 };
		var arrowSpec = { width:40,length:40, foldback:0, paintStyle:{lineWidth:1, strokeStyle:"#000000"} };
		var connection1 = jsPlumb.connect({
		source:d1, 
	   	target:d2, 
	   	anchors:["BottomCenter", [ 0.75,0,0,-1 ]], 
	   	overlays : [ ["Label",  {label:"CONNECTION 1", location:0.3}],
					["Arrow", arrowSpec, loc] ]
		});
		equals(2, connection1.overlays.length);
		equals(jsPlumb.Overlays[renderMode].Label, connection1.overlays[0].constructor);
		
		equals(jsPlumb.Overlays[renderMode].Arrow, connection1.overlays[1].constructor);
		equals(0.7, connection1.overlays[1].loc);
		equals(40, connection1.overlays[1].width);
		equals(40, connection1.overlays[1].length);
	});
	
	test(renderMode + ": jsPlumb.connect (removeAllOverlays)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var imageEventListener = function() { };
		var loc = { location:0.7 };
		var arrowSpec = { width:40,length:40, foldback:0, paintStyle:{lineWidth:1, strokeStyle:"#000000"} };
		var connection1 = jsPlumb.connect({
		source:d1, 
	   	target:d2, 
	   	anchors:["BottomCenter", [ 0.75,0,0,-1 ]], 
	   	overlays : [ ["Label",  {label:"CONNECTION 1", location:0.3}],
					["Arrow", arrowSpec, loc] ]
		});
		equals(2, connection1.overlays.length);
		equals(jsPlumb.Overlays[renderMode].Label, connection1.overlays[0].constructor);
		
		equals(jsPlumb.Overlays[renderMode].Arrow, connection1.overlays[1].constructor);
		equals(0.7, connection1.overlays[1].loc);
		equals(40, connection1.overlays[1].width);
		equals(40, connection1.overlays[1].length);
		
		connection1.removeAllOverlays();
		equals(0, connection1.overlays.length);
	});
	
	test(renderMode + ": jsPlumb.connect, specify arrow overlay using string identifier only", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var conn = jsPlumb.connect({source:d1,target:d2,overlays:["Arrow"]});
		equals(jsPlumb.Overlays[renderMode].Arrow, conn.overlays[0].constructor);
	});
	
	test(renderMode + ": Connection.getOverlay method, existing overlay", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var conn = jsPlumb.connect({source:d1,target:d2,overlays:[ [ "Arrow", { id:"arrowOverlay" } ] ] });
		var overlay = conn.getOverlay("arrowOverlay");
		ok(overlay != null);
	});
	
	test(renderMode + ": Connection.getOverlay method, non-existent overlay", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var conn = jsPlumb.connect({source:d1,target:d2,overlays:[ [ "Arrow", { id:"arrowOverlay" } ] ] });
		var overlay = conn.getOverlay("IDONTEXIST");
		ok(overlay == null);
	});
	
	test(renderMode + ": Overlay.setVisible method", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var conn = jsPlumb.connect({source:d1,target:d2,overlays:[ [ "Arrow", { id:"arrowOverlay" } ] ] });
		var overlay = conn.getOverlay("arrowOverlay");
		ok(overlay.isVisible());
		overlay.setVisible(false);
		ok(!overlay.isVisible());
		overlay.setVisible(true);
		ok(overlay.isVisible());
	});
	
	// this test is for the original detach function; it should stay working after i mess with it
	// a little.
	test(renderMode + ": jsPlumb.detach (by element ids)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1);
		var e2 = jsPlumb.addEndpoint(d2);
		var e3 = jsPlumb.addEndpoint(d1);
		var e4 = jsPlumb.addEndpoint(d2);
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
		jsPlumb.connect({ sourceEndpoint:e3, targetEndpoint:e4 });  // make two connections to be sure this works ;)
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		assertConnectionCount(e3, 1);
		assertConnectionCount(e4, 1);
		
		jsPlumb.detach({source:"d1", target:"d2"});
		
		assertConnectionCount(e1, 0);
		assertConnectionCount(e2, 0);
		assertConnectionCount(e3, 0);
		assertConnectionCount(e4, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
	});
	
	// detach is being made to operate more like connect - by taking one argument with a whole 
	// bunch of possible params in it.  if two args are passed in it will continue working
	// in the old way.
	test(renderMode + ": jsPlumb.detach (params object, using element ids)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1);
		var e2 = jsPlumb.addEndpoint(d2);
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		jsPlumb.detach({source:"d1", target:"d2"});
		assertConnectionCount(e1, 0);
		assertConnectionCount(e2, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
	});
/*
    test(renderMode + ": jsPlumb.detach (params object, using target only)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3"),
		    e1 = jsPlumb.addEndpoint(d1, {maxConnections:2}),
		    e2 = jsPlumb.addEndpoint(d2),
            e3 = jsPlumb.addEndpoint(d3);
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
        jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e3 });
		assertConnectionCount(e1, 2);
		assertConnectionCount(e2, 1);
        assertConnectionCount(e3, 1);
		jsPlumb.detach({target:"d2"});
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 0);
        assertConnectionCount(e3, 1);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
	});
*/
	test(renderMode + ": jsPlumb.detach (params object, using element objects)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1);
		var e2 = jsPlumb.addEndpoint(d2);
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertContextSize(3);
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		jsPlumb.detach({source:d1, target:d2});
		assertConnectionCount(e1, 0);
		assertConnectionCount(e2, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
		assertContextSize(2);
	});
	
	test(renderMode + ": jsPlumb.detach (source and target as endpoint UUIDs)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1, {uuid:"abcdefg"});
		ok(jsPlumb.getEndpoint("abcdefg") != null, "e1 exists");	
		var e2 = jsPlumb.addEndpoint(d2, {uuid:"hijklmn"});
		ok(jsPlumb.getEndpoint("hijklmn") != null, "e2 exists");
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertContextSize(3);
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		jsPlumb.detach({uuids:["abcdefg", "hijklmn"]});
		assertConnectionCount(e1, 0);
		assertConnectionCount(e2, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
		assertContextSize(2);
	});
	
	test(renderMode + ": jsPlumb.detach (sourceEndpoint and targetEndpoint supplied)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1);
		var e2 = jsPlumb.addEndpoint(d2);
		jsPlumb.connect({ sourceEndpoint:e1, targetEndpoint:e2 });
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 1);
		assertContextSize(3);
		assertConnectionCount(e1, 1);
		assertConnectionCount(e2, 1);
		jsPlumb.detach({ sourceEndpoint:e1, targetEndpoint:e2 });
		assertConnectionCount(e1, 0);
		assertConnectionCount(e2, 0);
		assertConnectionByScopeCount(jsPlumb.getDefaultScope(), 0);
		assertContextSize(2);
	});
	
	test(renderMode + ": jsPlumb.makeDynamicAnchors (longhand)", function() {
		var anchors = [jsPlumb.makeAnchor([0.2, 0, 0, -1], null, jsPlumb), jsPlumb.makeAnchor([1, 0.2, 1, 0], null, jsPlumb), 
					   jsPlumb.makeAnchor([0.8, 1, 0, 1], null, jsPlumb), jsPlumb.makeAnchor([0, 0.8, -1, 0], null, jsPlumb) ];				   				
		var dynamicAnchor = jsPlumb.makeDynamicAnchor(anchors);
		var a = dynamicAnchor.getAnchors();
		equals(a.length, 4, "Dynamic Anchors has four anchors");
		for (var i = 0; i < a.length; i++)
			ok(a[i].compute.constructor == Function, "anchor " + i + " well formed");
	});
	
	test(renderMode + ": jsPlumb.makeDynamicAnchors (shorthand)", function() {
		var anchors = [[0.2, 0, 0, -1], [1, 0.2, 1, 0], 
					   [0.8, 1, 0, 1], [0, 0.8, -1, 0] ];				   				
		var dynamicAnchor = jsPlumb.makeDynamicAnchor(anchors);
		var a = dynamicAnchor.getAnchors();
		equals(a.length, 4, "Dynamic Anchors has four anchors");
		for (var i = 0; i < a.length; i++)
			ok(a[i].compute.constructor == Function, "anchor " + i + " well formed");
	});
	
	test(renderMode + ": Connection.isVisible/setVisible", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c1 = jsPlumb.connect({source:d1,target:d2});
		equals(true, c1.isVisible(), "Connection is visible after creation.");
		c1.setVisible(false);
		equals(false, c1.isVisible(), "Connection is not visible after calling setVisible(false).");
		equals($(c1.connector.canvas).css("display"), "none");
		c1.setVisible(true);
		equals(true, c1.isVisible(), "Connection is visible after calling setVisible(true).");
		equals($(c1.connector.canvas).css("display"), "block");
	});
	
	test(renderMode + ": Endpoint.isVisible/setVisible basic test (no connections)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1);
		equals(true, e1.isVisible(), "Endpoint is visible after creation.");
		e1.setVisible(false);
		equals(false, e1.isVisible(), "Endpoint is not visible after calling setVisible(false).");
		equals($(e1.canvas).css("display"), "none");
		e1.setVisible(true);
		equals(true, e1.isVisible(), "Endpoint is visible after calling setVisible(true).");
		equals($(e1.canvas).css("display"), "block");
	});
	
	test(renderMode + ": Endpoint.isVisible/setVisible (one connection, other Endpoint's visibility should track changes in the source, because it has only this connection.)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var e1 = jsPlumb.addEndpoint(d1), e2 = jsPlumb.addEndpoint(d2);
		equals(true, e1.isVisible(), "Endpoint is visible after creation.");
		var c1 = jsPlumb.connect({source:e1, target:e2});
		e1.setVisible(false);
		equals(false, e1.isVisible(), "Endpoint is not visible after calling setVisible(false).");
		equals(false, e2.isVisible(), "other Endpoint is not visible either.");
		equals(false, c1.isVisible(), "connection between the two is not visible either.");
		
		e1.setVisible(true);
		equals(true, e1.isVisible(), "Endpoint is visible after calling setVisible(true).");
		equals(true, e2.isVisible(), "other Endpoint is visible too");
		equals(true, c1.isVisible(), "connection between the two is visible too.");
	});
	
	test(renderMode + ": Endpoint.isVisible/setVisible (one connection, other Endpoint's visibility should not track changes in the source, because it has another connection.)", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		var e1 = jsPlumb.addEndpoint(d1), e2 = jsPlumb.addEndpoint(d2, { maxConnections:2 }), e3 = jsPlumb.addEndpoint(d3);
		equals(true, e1.isVisible(), "Endpoint is visible after creation.");
		var c1 = jsPlumb.connect({source:e1, target:e2});
		var c2 = jsPlumb.connect({source:e2, target:e3});
		
		e1.setVisible(false);
		equals(false, e1.isVisible(), "Endpoint is not visible after calling setVisible(false).");
		equals(true, e2.isVisible(), "other Endpoint should still be visible.");
		equals(true, e3.isVisible(), "third Endpoint should still be visible.");
		equals(false, c1.isVisible(), "connection between the two is not visible either.");
		equals(true, c2.isVisible(), "other connection is visible.");
		
		e1.setVisible(true);
		equals(true, e1.isVisible(), "Endpoint is visible after calling setVisible(true).");
		equals(true, e2.isVisible(), "other Endpoint is visible too");
		equals(true, c1.isVisible(), "connection between the two is visible too.");
		equals(true, c2.isVisible(), "other connection is visible.");
	});
	
	// tests of the functionality that allows a user to specify that they want elements appended to the document body
	test(renderMode + " jsPlumb.Defaults.Container, specified with a selector", function() {
		jsPlumb.Defaults.Container = $("body");
		equals(0, $("#container")[0].childNodes.length);
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		equals(2, $("#container")[0].childNodes.length);  // the divs we added have been added to the 'container' div.
		// but we have told jsPlumb to add its canvas to the body, so this connect call should not add another few elements to the container:
		jsPlumb.connect({source:d1, target:d2});
		equals(2, $("#container")[0].childNodes.length);
	});
	
	// tests of the functionality that allows a user to specify that they want elements appended to some specific container.
	test(renderMode + " jsPlumb.Defaults.Container, specified with DOM element", function() {		
		jsPlumb.Defaults.Container = document.getElementsByTagName("body")[0];
		equals(0, $("#container")[0].childNodes.length);
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");		
		equals(2, $("#container")[0].childNodes.length, "two divs added to the container");  // the divs we added have been added to the 'container' div.
		// but we have told jsPlumb to add its canvas to the body, so this connect call should not add another few elements to the container:
		var bodyElementCount = $("body")[0].childNodes.length;
		jsPlumb.connect({source:d1, target:d2});
		equals(2, $("#container")[0].childNodes.length, "still only two children in container; elements were added to the body by jsPlumb");
		// test to see if 3 elements have been added
		equals(bodyElementCount + 3, $("body")[0].childNodes.length, "3 new elements added to the document body");
	});
	
	test(renderMode + " container specified to connect call, with a selector", function() {
		equals(0, $("#container")[0].childNodes.length);
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		equals(2, $("#container")[0].childNodes.length);  // the divs we added have been added to the 'container' div.
		var bodyElementCount = $("body")[0].childNodes.length;
		// but here we tell jsPlumb to add its elements to the body, so this connect call should not add another few elements to the container:
		jsPlumb.connect({source:d1, target:d2, container:$("body")});
		equals(2, $("#container")[0].childNodes.length);
		equals(bodyElementCount + 3, $("body")[0].childNodes.length, "3 new elements added to the document body");
	});
	
	test(renderMode + " container specified to connect call, with a string ID", function() {
		equals(0, $("#container")[0].childNodes.length);
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		equals(3, $("#container")[0].childNodes.length, "container has divs we added");  // the divs we added have been added to the 'container' div.
		var d3ElementCount = $("#d3")[0].childNodes.length;
		// but here we tell jsPlumb to add its elements to "d3", so this connect call should not add another few elements to the container:
		jsPlumb.connect({source:d1, target:d2, container:"d3"});
		equals(3, $("#container")[0].childNodes.length, "container still has only the divs we added");
		equals(d3ElementCount + 3, $("#d3")[0].childNodes.length, "3 new elements added to div d3");
	});	
	
	test(renderMode + " container specified to addEndpoint call, with a selector", function() {
		equals(0, $("#container")[0].childNodes.length);
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		equals(2, $("#container")[0].childNodes.length);  // the divs we added have been added to the 'container' div.
		var bodyElementCount = $("body")[0].childNodes.length;
		// but here we tell jsPlumb to add its elements to the body, so this connect call should not add another few elements to the container:
		jsPlumb.addEndpoint(d1, {container:$("body")});
		equals(2, $("#container")[0].childNodes.length);
		equals(bodyElementCount + 1, $("body")[0].childNodes.length, "1 new element added to the document body");
	});
	
	test(renderMode + " container specified to addEndpoint call, with a string ID", function() {
		equals(0, $("#container")[0].childNodes.length);
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3");
		equals(3, $("#container")[0].childNodes.length, "container has divs we added");  // the divs we added have been added to the 'container' div.
		var d3ElementCount = $("#d3")[0].childNodes.length;
		// but here we tell jsPlumb to add its elements to "d3", so this connect call should not add another few elements to the container:
		jsPlumb.addEndpoint(d1, { container:"d3" });
		equals(3, $("#container")[0].childNodes.length, "container still has only the divs we added");
		equals(d3ElementCount + 1, $("#d3")[0].childNodes.length, "1 new element added to div d3");
	});

    test(renderMode + " detachable defaults to true when connection made between two endpoints", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            e1 = jsPlumb.addEndpoint(d1), e2 = jsPlumb.addEndpoint(d2),
            c = jsPlumb.connect({source:e1, target:e2});
        equals(c.isDetachable(), true, "connection not detachable");
    });

    test(renderMode + " connection detachable when target endpoint has connectionsDetachable set to true", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            e1 = jsPlumb.addEndpoint(d1), e2 = jsPlumb.addEndpoint(d2, {connectionsDetachable:true}),
            c = jsPlumb.connect({source:e1, target:e2});
        equals(c.isDetachable(), true, "connection detachable because connectionsDetachable was set on target endpoint");
    });

    test(renderMode + " connection detachable when source endpoint has connectionsDetachable set to true", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
            e1 = jsPlumb.addEndpoint(d1, {connectionsDetachable:true}), e2 = jsPlumb.addEndpoint(d2),
            c = jsPlumb.connect({source:e1, target:e2});
        equals(c.isDetachable(), true, "connection detachable because connectionsDetachable was set on source endpoint");
    });
	
	test(renderMode + " Connector has 'type' member set", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		
		var c = jsPlumb.connect({source:d1, target:d2});
		equals(c.connector.type, "Bezier", "Bezier connector has type set");
		
		var c2 = jsPlumb.connect({source:d1, target:d2, connector:"Straight"});
		equals(c2.connector.type, "Straight", "Straight connector has type set");
		
		var c3 = jsPlumb.connect({source:d1, target:d2, connector:"Flowchart"});
		equals(c3.connector.type, "Flowchart", "Flowchart connector has type set");
	});
	
	test(renderMode + " Endpoints have 'type' member set", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		
		var c = jsPlumb.connect({source:d1, target:d2});
		equals(c.endpoints[0].type, "Dot", "Dot endpoint has type set");
		
		var c2 = jsPlumb.connect({source:d1, target:d2, endpoints:["Rectangle", "Blank"]});
		equals(c2.endpoints[1].type, "Blank", "Blank endpoint has type set");
		equals(c2.endpoints[0].type, "Rectangle", "Rectangle endpoint has type set");		
	});
	
	test(renderMode + " Overlays have 'type' member set", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		
		var c = jsPlumb.connect({
			source:d1, 
			target:d2,
			overlays:[ "Arrow", "Label", "PlainArrow", "Diamond" ]
		});
		equals(c.overlays[0].type, "Arrow", "Arrow overlay has type set");
		equals(c.overlays[1].type, "Label", "Label overlay has type set");
		equals(c.overlays[2].type, "PlainArrow", "PlainArrow overlay has type set");
		equals(c.overlays[3].type, "Diamond", "Diamond overlay has type set");		
	});
	
	test(renderMode + " jsPlumb.hide, original one-arg version", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
		e = { isSource:true, isTarget:true, maxConnections:-1 },
		e1 = jsPlumb.addEndpoint(d1, e),
		e2 = jsPlumb.addEndpoint(d2, e),
		c1 = jsPlumb.connect({source:e1, target:e2});
		
		equals(true, c1.isVisible(), "Connection 1 is visible after creation.");
		equals(true, e1.isVisible(), "endpoint 1 is visible after creation.");
		equals(true, e2.isVisible(), "endpoint 2 is visible after creation.");
		
		jsPlumb.hide(d1);
		
		equals(false, c1.isVisible(), "Connection 1 is no longer visible.");
		equals(true, e1.isVisible(), "endpoint 1 is still visible.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
		
		jsPlumb.show(d1);
		
		equals(true, c1.isVisible(), "Connection 1 is visible again.");
	});
	
	test(renderMode + " jsPlumb.hide, two-arg version, endpoints should also be hidden", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
		e = { isSource:true, isTarget:true, maxConnections:-1 },
		e1 = jsPlumb.addEndpoint(d1, e),
		e2 = jsPlumb.addEndpoint(d2, e),
		c1 = jsPlumb.connect({source:e1, target:e2});
		
		equals(true, c1.isVisible(), "Connection 1 is visible after creation.");
		equals(true, e1.isVisible(), "endpoint 1 is visible after creation.");
		equals(true, e2.isVisible(), "endpoint 2 is visible after creation.");
		
		jsPlumb.hide("d1", true);
		
		equals(false, c1.isVisible(), "Connection 1 is no longer visible.");
		equals(false, e1.isVisible(), "endpoint 1 is no longer visible.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
		
		jsPlumb.show(d1);  // now show d1, but do not alter the endpoints. e1 should still be hidden
		
		equals(true, c1.isVisible(), "Connection 1 is visible again.");
		equals(false, e1.isVisible(), "endpoint 1 is no longer visible.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
	});
	
	test(renderMode + " jsPlumb.show, two-arg version, endpoints should become visible", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
		e = { isSource:true, isTarget:true, maxConnections:-1 },
		e1 = jsPlumb.addEndpoint(d1, e),
		e2 = jsPlumb.addEndpoint(d2, e),
		c1 = jsPlumb.connect({source:e1, target:e2});
				
		jsPlumb.hide("d1", true);
		
		equals(false, c1.isVisible(), "Connection 1 is no longer visible.");
		equals(false, e1.isVisible(), "endpoint 1 is no longer visible.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
		
		jsPlumb.show(d1, true);  // now show d1, and alter the endpoints. e1 should be visible.
		
		equals(true, c1.isVisible(), "Connection 1 is visible again.");
		equals(true, e1.isVisible(), "endpoint 1 is visible again.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
	});
	
	test(renderMode + " jsPlumb.show, two-arg version, endpoints should become visible, but not all connections, because some other endpoints are  not visible.", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"), d3 = _addDiv("d3"),
		e = { isSource:true, isTarget:true, maxConnections:-1 },
		e1 = jsPlumb.addEndpoint(d1, e),
		e11 = jsPlumb.addEndpoint(d1, e),
		e2 = jsPlumb.addEndpoint(d2, e),
		e3 = jsPlumb.addEndpoint(d3, e),
		c1 = jsPlumb.connect({source:e1, target:e2}),
		c2 = jsPlumb.connect({source:e11, target:e3});
			
		// we now have d1 connected to both d3 and d2.  we'll hide d1, and everything on d1 should be hidden.
		
		jsPlumb.hide("d1", true);
		
		equals(false, c1.isVisible(), "connection 1 is no longer visible.");
		equals(false, c2.isVisible(), "connection 2 is no longer visible.");
		equals(false, e1.isVisible(), "endpoint 1 is no longer visible.");
		equals(false, e11.isVisible(), "endpoint 1 is no longer visible.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
		equals(true, e3.isVisible(), "endpoint 3 is still visible.");
		
		// now, we will also hide d3. making d1 visible again should NOT result in c2 becoming visible, because the other endpoint
		// for c2 is e3, which is not visible.
		jsPlumb.hide(d3, true);
		equals(false, e3.isVisible(), "endpoint 3 is no longer visible.");
		
		jsPlumb.show(d1, true);  // now show d1, and alter the endpoints. e1 should be visible, c1 should be visible, but c2 should not.
		
		equals(true, c1.isVisible(), "Connection 1 is visible again.");
		equals(false, c2.isVisible(), "Connection 2 is not visible.");
		equals(true, e1.isVisible(), "endpoint 1 is visible again.");
		equals(true, e11.isVisible(), "endpoint 11 is visible again.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
		equals(false, e3.isVisible(), "endpoint 3 is still not visible.");
	});
	
	/*
	test(renderMode + " jsPlumb.hide, two-arg version, endpoints should also be hidden", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
		e = { isSource:true, isTarget:true, maxConnections:-1 },
		e1 = jsPlumb.addEndpoint(d1, e),
		e2 = jsPlumb.addEndpoint(d2, e),
		c1 = jsPlumb.connect({source:e1, target:e2});
		
		equals(true, c1.isVisible(), "Connection 1 is visible after creation.");
		equals(true, e1.isVisible(), "endpoint 1 is visible after creation.");
		equals(true, e2.isVisible(), "endpoint 2 is visible after creation.");
		
		jsPlumb.hide("d1", true);
		
		equals(false, c1.isVisible(), "Connection 1 is no longer visible.");
		equals(false, e1.isVisible(), "endpoint 1 is no longer visible.");
		equals(true, e2.isVisible(), "endpoint 2 is still visible.");
	});
	
	/**
	 * test for issue 132: label leaves its element in the DOM after it has been 
	 * removed from a connection. 
	 */
	test(renderMode + " label cleans itself up properly", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1,target:d2, overlays:[
		    [ "Label", {id:"label", cssClass:"foo"}]                                                    		    
		]});
		ok($(".foo").length == 1, "label element exists in DOM");
		c.removeOverlay("label");
		ok($(".foo").length == 0, "label element does not exist in DOM");
	});
	
	test(renderMode + " arrow cleans itself up properly", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1,target:d2, overlays:[
		    [ "Arrow", {id:"arrow"}]                                                    		    
		]});
		ok(c.getOverlay("arrow") != null, "arrow overlay exists");
		c.removeOverlay("arrow");
		ok(c.getOverlay("arrow") == null, "arrow overlay has been removed");
	});
	
	test(renderMode + " label overlay getElement function", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1,target:d2, overlays:[
		    [ "Label", {id:"label"}]                                                    		    
		]});
		ok(c.getOverlay("label").getElement() != null, "label overlay exposes element via getElement method");
	});
	
	test(renderMode + " label overlay provides getLabel and setLabel methods", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1,target:d2, overlays:[
		    [ "Label", {id:"label", label:"foo"}]                                                    		    
		]});
		var o = c.getOverlay("label"), e = o.getElement();
		ok(e.innerHTML == "foo", "label text is set to original value");
		o.setLabel("baz");
		ok(e.innerHTML == "baz", "label text is set to new value 'baz'");
		ok(o.getLabel() === "baz", "getLabel function works correctly with String");
		// now try functions
		var aFunction = function() { return "aFunction"; };
		o.setLabel(aFunction);
		ok(e.innerHTML == "aFunction", "label text is set to new value from Function");
		ok(o.getLabel() === aFunction, "getLabel function works correctly with Function");
	});
	
	test(renderMode + " parameters object works for Endpoint", function() {
		var d1 = _addDiv("d1"),
		f = function() { alert("FOO!"); },
		e = jsPlumb.addEndpoint(d1, {
			isSource:true,
			parameters:{
				"string":"param1",
				"int":4,
				"function":f
			}
		});
		ok(e.getParameter("string") === "param1", "getParameter(String) works correctly");
		ok(e.getParameter("int") === 4, "getParameter(int) works correctly");
		ok(e.getParameter("function") == f, "getParameter(Function) works correctly");
	});
	
	test(renderMode + " parameters object works for Connection", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
		f = function() { alert("FOO!"); };
		var c = jsPlumb.connect({
			source:d1,
			target:d2,
			parameters:{
				"string":"param1",
				"int":4,
				"function":f
			}
		});
		ok(c.getParameter("string") === "param1", "getParameter(String) works correctly");
		ok(c.getParameter("int") === 4, "getParameter(int) works correctly");
		ok(c.getParameter("function") == f, "getParameter(Function) works correctly");
	});
	
	test(renderMode + " parameters set on Endpoints and Connections are all merged, and merged correctly at that.", function() {
		var d1 = _addDiv("d1"),
		d2 = _addDiv("d2"),
		e = jsPlumb.addEndpoint(d1, {
			isSource:true,
			parameters:{
				"string":"sourceEndpoint",
				"int":0,
				"function":function() { return "sourceEndpoint"; }
			}
		}),
		e2 = jsPlumb.addEndpoint(d2, {
			isTarget:true,
			parameters:{
				"int":1,
				"function":function() { return "targetEndpoint"; }
			}
		}),
		c = jsPlumb.connect({source:e, target:e2, parameters:{
			"function":function() { return "connection"; }
		}});
		
		ok(c.getParameter("string") === "sourceEndpoint", "getParameter(String) works correctly");
		ok(c.getParameter("int") === 1, "getParameter(int) works correctly");
		ok(c.getParameter("function")() == "connection", "getParameter(Function) works correctly");		
	});
	
	// anchor manager tests.  a new and more comprehensive way of managing the paint, introduced in 1.3.5
	test(renderMode + " anchorManager registers standard connection", function() {
		var d1 = _addDiv("d1"), d2 = _addDiv("d2");
		var c = jsPlumb.connect({source:d1, target:d2});
		equals(jsPlumb.anchorManager.get("d1")["standard"].length, 1);
		equals(jsPlumb.anchorManager.get("d1")["endpoints"].length, 1);		
		equals(jsPlumb.anchorManager.get("d2")["standard"].length, 1);
		equals(jsPlumb.anchorManager.get("d2")["endpoints"].length, 1);				
		var c2 = jsPlumb.connect({source:d1, target:d2});
		equals(jsPlumb.anchorManager.get("d1")["standard"].length, 2);
		equals(jsPlumb.anchorManager.get("d2")["standard"].length, 2);
		equals(jsPlumb.anchorManager.get("d1")["endpoints"].length, 2);
		equals(jsPlumb.anchorManager.get("d2")["endpoints"].length, 2);				
	});
	
	// anchor manager tests.  a new and more comprehensive way of managing the paint, introduced in 1.3.5
	test(renderMode + " anchorManager registers dynamic anchor connection, and removes it.", function() {
		var d3 = _addDiv("d3"), d4 = _addDiv("d4");
		var c = jsPlumb.connect({source:d3, target:d4, anchors:["AutoDefault", "AutoDefault"]});

		equals(jsPlumb.anchorManager.get("d3")["standard"].length, 1);
		
		var c2 = jsPlumb.connect({source:d3, target:d4});
		equals(jsPlumb.anchorManager.get("d3")["standard"].length, 2);
		equals(jsPlumb.anchorManager.get("d4")["standard"].length, 2);		

		equals(jsPlumb.anchorManager.get("d3")["endpoints"].length, 2);			
		jsPlumb.detach(c);
		equals(jsPlumb.anchorManager.get("d3")["standard"].length, 1);						
	});
	
	// anchor manager tests.  a new and more comprehensive way of managing the paint, introduced in 1.3.5
	test(renderMode + " anchorManager registers continuous anchor connection, and removes it.", function() {
		var d3 = _addDiv("d3"), d4 = _addDiv("d4");
		var c = jsPlumb.connect({source:d3, target:d4, anchors:["Continuous", "Continuous"]});

		equals(jsPlumb.anchorManager.get("d3")["standard"].length, 0);
		equals(jsPlumb.anchorManager.get("d3")["continuous"].length, 1);		
		equals(jsPlumb.anchorManager.get("d4")["standard"].length, 0);
		equals(jsPlumb.anchorManager.get("d4")["continuous"].length, 1);							
	
		jsPlumb.detach(c);
		equals(jsPlumb.anchorManager.get("d3")["continuous"].length, 0);		
		equals(jsPlumb.anchorManager.get("d4")["continuous"].length, 0);	
		
		jsPlumb.reset();
		equals(jsPlumb.anchorManager.get("d4")["continuousAnchorEndpoints"].length, 0);	
	});
	
// ------------- utility functions - math stuff, mostly --------------------------

    var tolerance = 0.00000005, withinTolerance = function(v1, v2, msg) {
        if (Math.abs(v1 - v2) < tolerance) ok(true, msg + "; expected " + v1 + " and got it");
        else {
            ok(false, msg + "; expected " + v1 + " got " + v2);
        }
    };
    test(renderMode + " jsPlumb.util.gradient, segment 1", function() {
		var p1 = [2,2], p2 = [3,1], m = jsPlumb.util.gradient(p1,p2);
		equals(m, -1, "gradient calculated correctly for simple case");
	});
	test(renderMode + " jsPlumb.util.normal, segment 1", function() {
		var p1 = [2,2], p2 = [3,1], m = jsPlumb.util.normal(p1,p2);
		equals(m, 1, "normal calculated correctly for simple case");
	});
	test(renderMode + " jsPlumb.util.gradient, segment 2", function() {
		var p1 = [2,2], p2 = [3,3], m = jsPlumb.util.gradient(p1,p2);
		equals(m, 1, "gradient calculated correctly for simple case");
	});
	test(renderMode + " jsPlumb.util.normal, segment 2", function() {
		var p1 = [2,2], p2 = [3,3], m = jsPlumb.util.normal(p1,p2);
		equals(m, -1, "normal calculated correctly for simple case");
	});
    test(renderMode + " jsPlumb.util.gradient, segment 3", function() {
		var p1 = [2,2], p2 = [1,3], m = jsPlumb.util.gradient(p1,p2);
		equals(m, -1, "gradient calculated correctly for simple case");
	});
	test(renderMode + " jsPlumb.util.normal, segment 3", function() {
		var p1 = [2,2], p2 = [1,3], m = jsPlumb.util.normal(p1,p2);
		equals(m, 1, "normal calculated correctly for simple case");
	});
    test(renderMode + " jsPlumb.util.gradient, segment 4", function() {
		var p1 = [2,2], p2 = [1,1], m = jsPlumb.util.gradient(p1,p2);
		equals(m, 1, "gradient calculated correctly for simple case");
	});
	test(renderMode + " jsPlumb.util.normal, segment 4", function() {
		var p1 = [2,2], p2 = [1,1], m = jsPlumb.util.normal(p1,p2);
		equals(m, -1, "normal calculated correctly for simple case");
	});
    test(renderMode + "jsPlumb.util.pointOnLine, segment 1", function() {
       var p1 = {x:2,y:2}, p2={x:3, y:1},
           target = jsPlumb.util.pointOnLine(p1, p2, Math.sqrt(2));
        withinTolerance(p2.x, target.x, "x is calculated correctly");
        withinTolerance(p2.y, target.y, "y is calculated correctly");
    });
    test(renderMode + "jsPlumb.util.pointOnLine, segment 2", function() {
       var p1 = {x:2,y:2}, p2={x:3, y:3},
           target = jsPlumb.util.pointOnLine(p1, p2, Math.sqrt(2));
        withinTolerance(p2.x, target.x, "x is calculated correctly");
        withinTolerance(p2.y, target.y, "y is calculated correctly");
    });
    test(renderMode + "jsPlumb.util.pointOnLine, segment 3", function() {
       var p1 = {x:2,y:2}, p2={x:1, y:3},
           target = jsPlumb.util.pointOnLine(p1, p2, Math.sqrt(2));
        withinTolerance(p2.x, target.x, "x is calculated correctly");
        withinTolerance(p2.y, target.y, "y is calculated correctly");
    });
    test(renderMode + "jsPlumb.util.pointOnLine, segment 4", function() {
       var p1 = {x:2,y:2}, p2={x:1, y:1},
           target = jsPlumb.util.pointOnLine(p1, p2, Math.sqrt(2));
        withinTolerance(p2.x, target.x, "x is calculated correctly");
        withinTolerance(p2.y, target.y, "y is calculated correctly");
    });
    test(renderMode + "jsPlumb.util.perpendicularLineTo, segment 1", function() {
        var p1 = {x:2, y:2}, p2={x:3, y:1}, m = jsPlumb.util.gradient(p1, p2),
            l = jsPlumb.util.perpendicularLineTo(p1, p2, 2 * Math.sqrt(2));

        withinTolerance(4, l[0].x, "point 1 x is correct");
        withinTolerance(2, l[0].y, "point 1 y is correct");

        withinTolerance(2, l[1].x, "point 2 x is correct");
        withinTolerance(0, l[1].y, "point 2 y is correct");
    });
	test(renderMode + "jsPlumb.util.perpendicularLineTo, segment 2", function() {
        var p1 = {x:2, y:2}, p2={x:3, y:3}, m = jsPlumb.util.gradient(p1, p2),
            l = jsPlumb.util.perpendicularLineTo(p1, p2, 2 * Math.sqrt(2));

        withinTolerance(4, l[0].x, "point 1 x is correct");
        withinTolerance(2, l[0].y, "point 1 y is correct");

        withinTolerance(2, l[1].x, "point 2 x is correct");
        withinTolerance(4, l[1].y, "point 2 y is correct");
    });
    test(renderMode + "jsPlumb.util.perpendicularLineTo, segment 3", function() {
        var p1 = {x:2, y:2}, p2={x:1, y:3}, m = jsPlumb.util.gradient(p1, p2),
            l = jsPlumb.util.perpendicularLineTo(p1, p2, 2 * Math.sqrt(2));

        withinTolerance(2, l[0].x, "point 1 x is correct");
        withinTolerance(4, l[0].y, "point 1 y is correct");

        withinTolerance(0, l[1].x, "point 2 x is correct");
        withinTolerance(2, l[1].y, "point 2 y is correct");
    });
    test(renderMode + "jsPlumb.util.perpendicularLineTo, segment 4", function() {
        var p1 = {x:2, y:2}, p2={x:1, y:1}, m = jsPlumb.util.gradient(p1, p2),
            l = jsPlumb.util.perpendicularLineTo(p1, p2, 2 * Math.sqrt(2));

        withinTolerance(2, l[0].x, "point 1 x is correct");
        withinTolerance(0, l[0].y, "point 1 y is correct");

        withinTolerance(0, l[1].x, "point 2 x is correct");
        withinTolerance(2, l[1].y, "point 2 y is correct");
    });
    test(renderMode + "jsPlumb.util.setImage on Endpoint", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
        e = {
            endpoint:[ "Image", { src:"../../img/endpointTest1.png" } ]
        },
        ep = jsPlumb.addEndpoint(d1, e);
        ep.setImage("../../img/littledot.png");
    });
    test(renderMode + "jsPlumb.util.setImage on Endpoint, with supplied onload", function() {
        var d1 = _addDiv("d1"), d2 = _addDiv("d2"),
        e = {
            endpoint:[ "Image", {
                src:"../../img/endpointTest1.png",
                onload:function(imgEp) {
                    equals("../../img/endpointTest1.png", imgEp.img.src);
                }
            } ]
        },
        ep = jsPlumb.addEndpoint(d1, e);
        ep.setImage("../../img/littledot.png", function(imgEp) {
            equals("../../img/littledot.png", imgEp.img.src);
        });
    });
    
    test(renderMode + "attach endpoint to table when desired element was td", function() {
        var table = document.createElement("table"),
            tr = document.createElement("tr"),
            td = document.createElement("td");
        table.appendChild(tr); tr.appendChild(td);
        document.body.appendChild(table);
        var ep = jsPlumb.addEndpoint(td);
        equals(ep.canvas.parentNode.tagName.toLowerCase(), "table");
    });

    

	/**
	 * leave this test at the bottom!
	 */
	test(renderMode + ': unload test', function() {
		jsPlumb.unload();
		var contextNode = $("._jsPlumb_context");
		ok(contextNode.length == 0, 'context node unloaded');
	});
};
