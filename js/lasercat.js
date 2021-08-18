var LaserCatConfig = {
	mode:			['cat','bigard','renaud','domenech'][Math.floor(Math.random()*['cat','bigard','renaud','domenech'].length)],
	//mode: 			'cat',
	debug:			false,
	path_sounds:	window.location.href+'/sounds/',
	path_img:		window.location.href+'/img/',
	cat: {
		start:		'cat/start-stop.mp3',
		stop:		'cat/start-stop.mp3',
		laserStart:	'cat/laser-start.mp3',
		laserLoop:	'cat/laser-loop.mp3',
		imgHead:	'cat/head.png',
		imgBody:	'cat/body.png',
		head:		{x: 230,	y: 135},
		leftEye:	{x: -8,		y: -52},
		rightEye:	{x: 52,		y: -52}
	},
	bigard: {
		start:		'bigard/start.mp3',
		stop:		'bigard/stop.mp3',
		laserStart:	'bigard/laser-start.mp3',
		laserLoop:	'bigard/laser-loop.mp3',
		imgHead:	'bigard/head.png',
		imgBody:	'bigard/body.png',
		head:		{x: 205,	y: 130},
		leftEye:	{x: -25,	y: -10},
		rightEye:	{x: 32,		y: -20}
	},
	renaud: {
		start:		'renaud/start.mp3',
		stop:		'renaud/stop.mp3',
		laserStart:	'renaud/laser-start.mp3',
		laserLoop:	'renaud/laser-loop.mp3',
		imgHead:	'renaud/head.png',
		imgBody:	'renaud/body.png',
		head:		{x: 155,	y: 65},
		leftEye:	{x: 240,	y: 100},
		rightEye:	{x: 250,	y: 100}
	},
	domenech: {
		start:		'domenech/start.mp3',
		stop:		'domenech/stop.mp3',
		laserStart:	'domenech/laser-start.mp3',
		laserLoop:	'domenech/laser-loop.mp3',
		imgHead:	'domenech/head.png',
		imgBody:	'domenech/body.png',
		head:		{x: 285,	y: 105},
		leftEye:	{x: 30,		y: 8},
		rightEye:	{x: 90,		y: 13}
	}
};

var LaserCat2 = {
	laserLoop : null,	
	active : false,
	canvas : null,
	context : null,
	catImage : null,
	shoot : false,
	alpha : 0,
	laserGain : 0,
	catReveal : 0,
	transition : false,
	now : 0,
	target : {
		x: 0,
		y: 0
	},
	catPos : {
		x: 0,
		y: 0,
		angle: 0
	},
	catHeadPos : {
		x: LaserCatConfig[LaserCatConfig.mode].head.x,
		y: LaserCatConfig[LaserCatConfig.mode].head.y,
		angle: 0,
		parent: null,
	},
	leftEye : {
		x: LaserCatConfig[LaserCatConfig.mode].leftEye.x,
		y: LaserCatConfig[LaserCatConfig.mode].leftEye.y,
		parent: null,
	},
	rightEye : {
		x: LaserCatConfig[LaserCatConfig.mode].rightEye.x,
		y: LaserCatConfig[LaserCatConfig.mode].rightEye.y,
		parent: null,
	},
	
	loadMode : function(mode){
		if(mode === undefined){
			mode = ['cat','bigard','renaud','domenech'][Math.floor(Math.random()*['cat','bigard','renaud','domenech'].length)];
		}
		LaserCatConfig.mode = mode;
		
		LaserCat2.catHeadPos.x = LaserCatConfig[LaserCatConfig.mode].head.x;
		LaserCat2.catHeadPos.y = LaserCatConfig[LaserCatConfig.mode].head.y;
		
		LaserCat2.leftEye.x = LaserCatConfig[LaserCatConfig.mode].leftEye.x;
		LaserCat2.leftEye.y = LaserCatConfig[LaserCatConfig.mode].leftEye.y;
		
		LaserCat2.rightEye.x = LaserCatConfig[LaserCatConfig.mode].rightEye.x;
		LaserCat2.rightEye.y = LaserCatConfig[LaserCatConfig.mode].rightEye.y;
		
		LaserCat2.Sounds.files.start.path 		= LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].start;
		LaserCat2.Sounds.files.stop.path 		= LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].stop;
		LaserCat2.Sounds.files.laserHit.path 	= LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].laserStart;
		LaserCat2.Sounds.files.laserBeam.path 	= LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].laserLoop;
		
		console.log(mode);
	},
	
	init:function(){
		this.catHeadPos.parent = this.catPos;
		this.leftEye.parent = this.catHeadPos;
		this.rightEye.parent = this.catHeadPos;
	},	
	
	Sounds : {
		audioContext: null,
		pendingFiles: 0,
		globalGain: 0,
		loaded: false,
		enabled: true,
		files : {
			'start': {
				'path': LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].start,
				'loop': false,
				'loopTime': [0.1, 1.1],
				'pitchSpread': [0.5, 1.4],
				'loaded': false
			},
			'stop': {
				'path': LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].stop,
				'loop': false,
				'loopTime': [0.1, 1.1],
				'pitchSpread': [0.85, 1.1],
				'loaded': false
			},			
			'laserHit': {
				'path': LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].laserStart,
				'loop': false,
				'pitchSpread': [0.85, 1.1],
				'loaded': false
			},
			'laserBeam': {
				'path': LaserCatConfig.path_sounds + LaserCatConfig[LaserCatConfig.mode].laserLoop,
				'loop': true,
				'loopTime': [0.1, 4],
				'loaded': false
			}
		},
		
		init : function(onReady) {
			if ('undefined' === typeof AudioContext) {
				this.enabled = false;
				return;
			}
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			this.audioContext = new AudioContext();
			if (this.audioContext.state === 'suspended') {
				 this.audioContext.resume();
			}
			this.globalGain = this.audioContext.createGain();
			this.globalGain.connect(this.audioContext.destination);

			for (var itm in LaserCat2.Sounds.files) {
				if (this.files.hasOwnProperty(itm) && !this.files[itm].loaded) {

					LaserCat2.Sounds.pendingFiles++;

					this.loadBuffer(this.files[itm].path, itm, function (buff, name) {
						LaserCat2.Sounds.files[name].buffer = buff;
						LaserCat2.Sounds.files[name].loaded = true;
						LaserCat2.Sounds.pendingFiles--;
						if (LaserCat2.Sounds.pendingFiles <= 0) {
							onReady();
						}
					});
				}
			}

			if (LaserCat2.Sounds.pendingFiles <= 0) {
				// nothing to load, fire the ready callback immediately.
				onReady();
			}
		},
		
		loadBuffer: function(url, name, callback) {
			var request = new XMLHttpRequest();

			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			request.onload = function () {
				LaserCat2.Sounds.audioContext.decodeAudioData(request.response, function (buffer) {
					callback(buffer, name);
				});
			};

			request.send();
		},
		
		shutdown: function() {
			LaserCat2.Sounds.globalGain.disconnect();
			LaserCat2.Sounds.audioContext.close();
		},
		
		isLoaded: function () {
			return this.loaded;
		},
		
		initialize: function (onReady) {
			this.init(onReady);
			this.loaded = true;
		},
		
		getSound: function (sound) {
			if (this.files[sound]) {
				var source = this.audioContext.createBufferSource();

				source.buffer = this.files[sound].buffer;
				source.loop = this.files[sound].loop;

				if (this.files[sound].loopTime) {
					source.loopStart = this.files[sound].loopTime[0];
					source.loopEnd = this.files[sound].loopTime[1];
				}

				source.gain = this.audioContext.createGain();
				source.connect(source.gain);
				source.gain.connect(this.globalGain);

				return {
					setGain: function (value) {
						source.gain.gain.value = value;
					},
					stop: function () {
						source.stop();
					},
					start: function () {
						source.start(0);
					}
				};
			}
		},
		
		playSound: function (sound) {
			if (this.files[sound]) {
				if (this.audioContext.state === 'suspended') {
					this.audioContext.resume();
				}
				var source = this.audioContext.createBufferSource();

				source.buffer = this.files[sound].buffer;
				source.gain = this.audioContext.createGain();
				source.connect(source.gain);

				if (this.files[sound].pitchSpread) {
					source.playbackRate.value = Math.random() * (this.files[sound].pitchSpread[1] - this.files[sound].pitchSpread[0]) + this.files[sound].pitchSpread[0];
				}

				source.gain.connect(this.globalGain);

				source.start(0);

				return source;
			}
		}
	},
		
	makeStuff : function () {
		this.canvas = document.createElement('canvas');

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.context = this.canvas.getContext('2d');

		document.body.appendChild(this.canvas);

		this.canvas.style.position = 'fixed';
		this.canvas.style.top = '0px';
		this.canvas.style.left = '0px';
		this.canvas.style.width = window.innerWidth + 'px';
		this.canvas.style.height = window.innerHeight + 'px';
		this.canvas.style.zIndex = '25000';
		this.canvas.style.backgroundColor = 'transparent';

		this.canvas.addEventListener('mousemove', function (e) {
			// if(self.shoot && !self.transition){
			LaserCat2.target.x = e.clientX;
			LaserCat2.target.y = e.clientY;
			//}
		});
		this.canvas.addEventListener('touchmove', function (e) {
			// if(self.shoot && !self.transition){
			LaserCat2.target.x = e.touches[0].clientX;
			LaserCat2.target.y = e.touches[0].clientY;
			//}
		});

		this.canvas.addEventListener('mouseout', function (e) {
			if(LaserCat2.laserLoop !== null){
				LaserCat2.shoot = false;
				LaserCat2.laserLoop.setGain(0);
			}
		});
		this.canvas.addEventListener('touchleave', function (e) {
			if(LaserCat2.laserLoop !== null){
				LaserCat2.shoot = false;
				LaserCat2.laserLoop.setGain(0);
			}
		});

		this.canvas.addEventListener('mousedown', function (e) {
			LaserCat2.target.x = e.clientX;
			LaserCat2.target.y = e.clientY;
			if (!LaserCat2.transition) {

				if (!LaserCat2.shoot) {
					LaserCat2.Sounds.playSound('laserHit');
					LaserCat2.laserLoop.setGain(1);
				}
				LaserCat2.shoot = true;

			}
			e.preventDefault();
		});

		this.canvas.addEventListener('touchstart', function (e) {
			LaserCat2.target.x = e.touches[0].clientX;
			LaserCat2.target.y = e.touches[0].clientY;
			if (!LaserCat2.transition) {

				if (!LaserCat2.shoot) {
					LaserCat2.Sounds.playSound('laserHit');
					LaserCat2.laserLoop.setGain(1);
				}
				LaserCat2.shoot = true;

			}
			e.preventDefault();
		});

		this.canvas.addEventListener('mouseup', function (e) {
			LaserCat2.shoot = false;
			LaserCat2.laserLoop.setGain(0);
		});
		this.canvas.addEventListener('touchend', function (e) {
			LaserCat2.shoot = false;
			LaserCat2.laserLoop.setGain(0);
			
		});
		

		
		window.addEventListener('keyup', function (e) {
			if (e.key === 'Escape') {
				LaserCat2.toggle();
			}
		});
		
		window.addEventListener('resize', function () {
			LaserCat2.resize();
		});

		this.cat = document.createElement('img');
		this.cat.src = LaserCatConfig.path_img + LaserCatConfig[LaserCatConfig.mode].imgBody;

		this.catHead = document.createElement('img');
		this.catHead.src = LaserCatConfig.path_img + LaserCatConfig[LaserCatConfig.mode].imgHead;


		this.active = true;


		requestAnimationFrame(function () {
			LaserCat2.animate();
		});
	},
	
	resize : function () {
		if (this.active) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight ;

			this.canvas.style.width = window.innerWidth + 'px';
			this.canvas.style.height = window.innerHeight + 'px';
		}
	},
	
	getWorldCoords : function (coords) {
		var node = coords;

		var output = {
			x: 0,
			y: 0
		};

		do {

			var parentAngle = (node.parent) ? node.parent.angle : 0;

			var rotatedX = Math.cos(parentAngle) * node.x - Math.sin(parentAngle) * node.y;
			var rotatedY = Math.sin(parentAngle) * node.x + Math.cos(parentAngle) * node.y;

			output.x += rotatedX;
			output.y += rotatedY;

			node = node.parent;

		} while (node);

		output.y += window.innerHeight - this.catReveal;

		return output;
	},
	
	animate : function () {

		var translatedHead = this.getWorldCoords(this.catHeadPos);

		this.catHeadPos.angle = Math.atan2(this.target.y - translatedHead.y, this.target.x - translatedHead.x);
		this.catHeadPos.angle *= 0.1;
		this.catHeadPos.angle = Math.max(-0.48, this.catHeadPos.angle);
		this.catHeadPos.angle = Math.min(0.03, this.catHeadPos.angle);

		var leftEye = this.getWorldCoords(this.leftEye);
		var rightEye = this.getWorldCoords(this.rightEye);


		var ctx = this.context;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.save();

		ctx.translate(0, window.innerHeight - this.catReveal);


		ctx.drawImage(this.cat, this.catPos.x, this.catPos.y, 400, 312);


		ctx.save();
		ctx.translate(this.catHeadPos.x, Math.floor(this.catHeadPos.y));
		ctx.rotate(this.catHeadPos.angle);
		ctx.drawImage(this.catHead, -120, -120, 240, 240);
		ctx.restore();

		ctx.restore();

		if(LaserCatConfig.debug){
			ctx.fillStyle = 'green';
			ctx.fillRect(translatedHead.x, translatedHead.y, 10, 10);

			ctx.fillStyle = 'blue';
			ctx.fillRect(leftEye.x-5, leftEye.y-5, 10, 10);
			ctx.fillRect(rightEye.x-5, rightEye.y-5, 10, 10);
		}

		if (this.active) {

			this.catReveal += (312 - this.catReveal) * 0.25;

			if (this.catReveal > 311) {
				this.catReveal = 312;
				this.transition = false;
			}

			if (this.shoot) {
				this.laserGain += (1 - this.laserGain) * 0.3;
				this.alpha += (0.5 - this.alpha) * 0.7;
			} else {
				this.laserGain += (0.0 - this.laserGain) * 0.1;
				this.alpha += (0 - this.alpha) * 0.3;
			}

			for (var i = 0; i < 3; i++) {

				var r1 = 255;
				var b1 = Math.floor(Math.random() * r1);

				ctx.strokeStyle = 'rgba(' + r1 + ', ' + b1 + ', 15, ' + this.alpha + ')';

				ctx.fillStyle = ctx.strokeStyle;
				ctx.beginPath();
				ctx.arc(leftEye.x, leftEye.y, Math.random() * 20 + 5, 0, 2 * Math.PI);
				ctx.arc(rightEye.x, rightEye.y, Math.random() * 20 + 5, 0, 2 * Math.PI);
				ctx.fill();

				ctx.lineWidth = Math.random() * 15 + 3;
				ctx.beginPath();

				ctx.moveTo(leftEye.x, leftEye.y);
				ctx.lineTo(this.target.x + Math.random() * 20 - 10, this.target.y + Math.random() * 20 - 10);

				ctx.moveTo(rightEye.x, rightEye.y);
				ctx.lineTo(this.target.x + Math.random() * 20 - 10, this.target.y + Math.random() * 20 - 10);
				ctx.stroke();
			}

			for (var j = 0; j < 30; j++) {
				var r2 = 255;
				var b2 = Math.floor(Math.random() * r2);

				ctx.strokeStyle = 'rgba(' + r2 + ', ' + b2 + ', 15, ' + this.alpha + ')';

				ctx.lineWidth = Math.random() * 5 + 1;
				ctx.beginPath();
				ctx.moveTo(this.target.x, this.target.y);
				ctx.lineTo(this.target.x + Math.random() * 200 - 100, this.target.y + Math.random() * 200 - 100);
				ctx.stroke();
			}

			for (var k = 0; k < 8; k++) {
				ctx.fillStyle = ctx.strokeStyle;
				ctx.beginPath();
				ctx.arc(this.target.x + Math.random() * 60 - 30, this.target.y + Math.random() * 60 - 30, Math.random() * 30 + 5, 0, 2 * Math.PI);
				ctx.fill();
			}

			requestAnimationFrame(function () {
				LaserCat2.animate();
			});

		} else {
			this.laserGain += (0 - this.laserGain) * 0.1;
			if (this.catReveal > 0.5) {
				this.catReveal += (0 - this.catReveal) * 0.1;

				requestAnimationFrame(function () {
					LaserCat2.animate();
				});

			} else {
				this.Sounds.shutdown();
				this.cleanUp();
				this.transition = false;
				this.catReveal = 0;
			}
		}
		if (this.Sounds.isLoaded() && (this.laserLoop)) {
			this.laserLoop.setGain(this.laserGain);
		}
	},
	
	cleanUp : function () {
		document.body.removeChild(this.canvas);
	},
	
	addDoubleTapEvent : function(){	
		var lastLap = 0;
		window.addEventListener('touchend', function (e) {
			var curTime = new Date().getTime();
			var tapLen = curTime - lastLap;
			if (tapLen < 200 && tapLen > 0) {			  
			  e.preventDefault();
			  LaserCat2.toggle();
			}
			lastLap = curTime;			
		});
		
		window.addEventListener('dblclick', function (e) {
			LaserCat2.toggle();
		});
	},

	toggle : function () {
		if (this.transition) {
			return;
		}


		this.transition = true;
		this.active = !this.active;
		if (this.active) {
			this.Sounds.initialize(function () {
				LaserCat2.init();
				LaserCat2.Sounds.playSound('start');
				LaserCat2.laserLoop = LaserCat2.Sounds.getSound('laserBeam');
				LaserCat2.laserLoop.setGain(0.0);
				LaserCat2.laserLoop.start(0);
				LaserCat2.makeStuff();
				LaserCat2.resize();
			});

		} else {
			this.active = false;
			this.Sounds.playSound('stop');
		}
	}
};