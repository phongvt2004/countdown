/**
 * Jscii - Image to ASCII converter
 * http://enotionz.github.com/jscii/
 * Author: Dominick Pham (@enotionz | http://dph.am)
 */

 function Ascii() {

	navigator.getUserMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;

	/**
	 * value to character mapping from dark to light
	 * add more characters and they will be accounted for automatically
	 * note: the extra &nbsp; is to account for the value range inclusive of 100%
	 */
	var chars = ['@','#','$','=','*','!',';',':','~','-',',','.','&nbsp;', '&nbsp;'];
	var charLen = chars.length-1;
	function getChar(val) { return chars[parseInt(val*charLen, 10)]; }

	/**
	 * log when getUserMedia or when video metadata loading fail
	 */
	function logError(err) { if(console && console.log) console.log('Error!', err); return false; }

	/**
	 * Options:
	 * el        - DOM node (img or video)
	 * container - if supplied, ascii string will automatically be set on container innerHTML during a render
	 * fn        - function, callback to fire during a render with ascii string as arguments[0]
	 * width     - hi-res images/videos must be resized down, specify width and jscii will figure out height
	 * color     - enable color ascii (highly experimental)
	 * interval  - integer - for videos only, this is the interval between each render
	 * webrtc    - bool, default false, only applicable if 'el' is a video
	 */
	function Jscii(params) {
		var self = this;

		var el = this.el = params.el;
		this.container = params.container;
		this.fn = typeof params.fn === 'function' ? params.fn : null;
		this.width = typeof params.width === 'number' ? params.width : 150;
		this.color = !!params.color;

		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		var nodeName = el.nodeName;
		console.log(nodeName)
		if(nodeName === 'IMG') {
			el.addEventListener('load', function(){ self.render(); });
		} else if(nodeName === 'VIDEO') {
			this.interval = typeof params.interval === 'number' ? params.interval : 15;
			this.webrtc = !!params.webrtc;

			if(this.webrtc) {
				if(typeof navigator.getUserMedia !== 'function') {
					return logError((el.innerHTML = 'Error: browser does not support WebRTC'));
				}
				navigator.getUserMedia({video: true, audio: false}, function(localMediaStream){
					self.mediaStream = localMediaStream;
					el.src = (window.URL || window.webkitURL).createObjectURL(localMediaStream);
				}, logError);
			}
			el.addEventListener('loadeddata', function() { self.play(); });
		}
	}

	/**
	 * start rendering, for video type only
	 */
	Jscii.prototype.play = function() {
		var self = this;
		self.pause().videoTimer = setInterval(function() {
			if(self.mediaStream || !self.webrtc) self.render();
		}, self.interval);
		return self;
	};

	/**
	 * pause rendering, for video type only
	 */
	Jscii.prototype.pause = function() {
		if(this.videoTimer) clearInterval(this.videoTimer);
		return this;
	};

	/**
	 * getter/setter for output dimension
	 */
	Jscii.prototype.dimension = function(width, height) {
		if(typeof width === 'number' && typeof height === 'number') {
			this._scaledWidth = this.canvas.width = width;
			this._scaledHeight = this.canvas.height = height;
			return this;
		} else {
			return { width: this._scaledWidth, height: this._scaledHeight };
		}
	};

	/**
	 * gets context image data, perform ascii conversion, append string to container
	 */
	Jscii.prototype.render = function() {
		var el = this.el, nodeName = el.nodeName, ratio;
		var dim = this.dimension(), width, height;
		if(!dim.width || !dim.height) {
			ratio = nodeName === 'IMG' ? el.height/el.width : el.videoHeight/el.videoWidth;
			this.dimension(this.width*1.8, parseInt(this.width*ratio*1.5, 10));
			dim = this.dimension();
		}
		width = dim.width;
		height = dim.height;

		// might take a few cycles before we
		if(!width || !height) return;

		this.ctx.drawImage(this.el, 0, 0, width, height);
		this.imageData = this.ctx.getImageData(0, 0, width, height).data;
		var asciiStr = this.getAsciiString();
		if(this.container) this.container.innerHTML = asciiStr;
		if(this.fn) this.fn(asciiStr);
	};

	/**
	 * given a picture/frame's pixel data and a defined width and height
	 * return the ASCII string representing the image
	 */
	Jscii.prototype.getAsciiString = function() {
		var dim = this.dimension(), width = dim.width, height = dim.height;
		var len = width*height, d = this.imageData, str = '';

		// helper function to retrieve rgb value from pixel data
		var getRGB = function(i) { return [d[i=i*4], d[i+1], d[i+2]]; };

		for(var i=0; i<len; i++) {
			if(i%width === 0) str += '\n';
			var rgb = getRGB(i);
			var val = Math.max(rgb[0], rgb[1], rgb[2])/255;
			if(this.color) str += '<font style="color: rgb('+rgb.join(',')+')">'+getChar(val)+'</font>';
			else str += getChar(val);
		}
		return str;
	};

	window.Jscii = Jscii;

};

function checkVideo() {
	let media = document.querySelector('#video')

	if(media.paused) {
		$('#play').text('Play')
    } else {
		$('#play').text('Pause')
	}
}

function playVideo() {
	let media = document.querySelector('#video')
    
    if(media.paused) {
        media.play()
		checkVideo()
    } else {
		media.pause()
		checkVideo()
	}
}

function checkTypeVideo() {
	if(document.querySelector('#ascii-video').hasAttribute('hidden')) {
		$('#change').text('Normal Video')
	} else {
		$('#change').text('Ascii Video')
	}
}

function changeVideo() {
	if(!document.querySelector('#ascii-video').hasAttribute('hidden')) {
		document.querySelector('#ascii-video').setAttribute('hidden', '')
		document.querySelector('#video').removeAttribute('hidden')
		checkTypeVideo()
	} else {
		document.querySelector('#video').setAttribute('hidden', '')
		document.querySelector('#ascii-video').removeAttribute('hidden')
		checkTypeVideo()
	}
}

function HappyNewYear(){
    console.log('ok')
	document.querySelector('title').innerText = 'Happy New Year'
    $('#countdown').remove()
    $('h2').text('HAPPY NEW YEAR')
    $('h2').css('top', '20%')
    $('.wrap').append(`
    <video class="video" id ="video" id="jscii-element-video" loop autoplay>
        <source src="./static/video/main.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
        Your browser does not support video
	</video>
    <pre hidden class="video" id="ascii-video"></pre>
    <div id="play" onclick="playVideo()"></div>
    <div id="change" onclick="changeVideo()"></div>
    `)
     checkVideo()
     checkTypeVideo()
    Ascii()
    var videoJscii = new Jscii({
        container: document.getElementById('ascii-video'),
        el: document.getElementById('video')
    });
    videoJscii.play()
}

let lunarNewYear = new Date('Jan 31 2022 15:38:00:00 GMT+0700 (Indochina Time)')
let afterLunarNewYear = new Date('Jan 31 2022 15:38:00:10 GMT+0700 (Indochina Time)')
if (new Date() >= lunarNewYear) {
    HappyNewYear()
} else {
	$('h2').text('COUNTDOWN')
}
setInterval(() => {
    let date = new Date()
    if(date >= lunarNewYear && date < afterLunarNewYear) {
        HappyNewYear()
    }
}, 0)

checkVideo()
checkTypeVideo()
