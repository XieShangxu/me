function calCircleCenter(x1, y1, x2, y2, r, direction) {
	var deltaX = x2 - x1,
		deltaY = y2 - y1,
		ratio = deltaY / deltaX,
		ratiorR = -deltaX / deltaY,
		sumX = x1 + x2,
		sumY = y1 + y2,
		complex = ( deltaY - sumX * ratiorR ) / 2;

	// 一元二次方程组系数
	var a = 1 + ratiorR * ratiorR;
	var b = -a * sumX;
	var c = complex * complex + x1 * x1 - r * r;

	var centerP = {};
	centerP.angle = 2 * Math.asin( Math.sqrt( deltaX * deltaX + deltaY * deltaY ) / ( 2 * r) ) * 180 / Math.PI;
	if (direction) {
		centerP.x = ( Math.sqrt( b * b - 4 * a * c ) - b ) / ( 2 * a );
	} else {
		centerP.x = ( -b - Math.sqrt( b * b - 4 * a * c ) ) / ( 2 * a );
	}
	centerP.y = ratiorR * ( centerP.x - sumX / 2 ) + sumY / 2;

	return centerP;
}

function generatePointsInCircle(x1, y1, x2, y2, r, n, direction, kk) {
	var circleInfo = calCircleCenter(x1, y1, x2, y2, r, direction);
	var circleX = circleInfo.x, circleY = circleInfo.y;
	var dividedAngle = circleInfo.angle / n;
	if (kk) {
		dividedAngle = -dividedAngle;
	}

	var pointsArr = [{
		x : x1,
		y : y1
	}];
	for (var i = 1; i < n; i++) {
		var sinAng = Math.sin( dividedAngle * i * Math.PI / 180 ),
		cosAng = Math.cos( dividedAngle * i * Math.PI / 180 );
		var newX = Math.round( ( ( x1 - circleX ) * cosAng - ( y1 - circleY ) * sinAng + circleX ) * 10 ) / 10;
		var newY = Math.round( ( ( x1 - circleX ) * sinAng + ( y1 - circleY ) * cosAng + circleY ) * 10 ) / 10;
		pointsArr.push({
			x : newX,
			y : newY
		});
	}
	pointsArr.push({
		x : x2,
		y : y2
	})

	return pointsArr;
}

function generatePaths(n, dArr, kArr, arr) {
	var i = 0, j = 0, paths = [], sHtml = "", pathStrArr = [];
	for (i = 0; i < arr.length; i++) {
		dArr[i] = ( dArr[i] === undefined ? dArr[0] : dArr[i] );
		kArr[i] = ( kArr[i] === undefined ? kArr[0] : kArr[i] );
		var points = generatePointsInCircle(arr[i].x1, arr[i].y1, arr[i].x2, arr[i].y2, arr[i].r, n, dArr[i], kArr[i]);
		paths.push(points);
	}
	for (i = 0; i < n + 1; i++) {
		var pathStr = "M";
		for (j = 0; j < arr.length; j++) {
			pathStr += paths[j][i].x + ',' + paths[j][i].y + ( j === (arr.length - 1) ? 'z' : 'L' );
		}
		pathStrArr.push(pathStr);
	}
	return pathStrArr;
}

// animation related
function parsePath(str) {
	var coordArr = str.match(/[MLl]-?\d+\.*\d*,?-?\d+\.*\d*/g);
	var pointsArr = [];
	var newPath = "";
	for (var i = 0; i < coordArr.length; i++) {
		if (coordArr[i][0] === "l") {
			var coordStr = coordArr[i].substr(1);
			var point = parseCoord(coordStr);
			point.x = Math.round( ( pointsArr[i - 1].x + point.x ) * 10 ) / 10;
			point.y = Math.round( ( pointsArr[i - 1].y + point.y ) * 10 ) / 10;
			pointsArr.push(point);
			newPath += "L" + point.x + "," + point.y;
		} else {
			pointsArr.push(parseCoord(coordArr[i].substr(1)));
			newPath += coordArr[i];
		}
	}
	newPath += "z";
	var obj = {
		path : newPath,
		points : pointsArr
	};
	return obj;
}

function parseCoord(str) {
	// example : "-1.5,0.6" or "3.4-8.6"
	var point = {}, coord;
	if (str.indexOf(",") > 0) {
		coord = str.split(",");
	} else {
		coord = str.match(/-?\d+\.*\d*/g);
	}
	point.x = parseFloat(coord[0], 10);
	point.y = parseFloat(coord[1], 10);
	return point;
}

function changePolygon2Path(str) {
	return "M" + $.trim(str).replace(/[\s\t\n]+/g, "L") + "Z";
}

function generateColors(res, des, n) {
	res = res.toLowerCase();
	des = des.toLowerCase();
	var resR = parseInt( res.substr(0, 2), 16 ),
		resG = parseInt( res.substr(2, 2), 16 ),
		resB = parseInt( res.substr(4, 2), 16 ),
		desR = parseInt( des.substr(0, 2), 16 ),
		desG = parseInt( des.substr(2, 2), 16 ),
		desB = parseInt( des.substr(4, 2), 16 );
	var colors = [];
	for (var i = 0; i <= n; i++) {
		var newR = Math.round( ( desR - resR ) / n * i ) + resR,
			newG = Math.round( ( desG - resG ) / n * i ) + resG,
			newB = Math.round( ( desB - resB ) / n * i ) + resB;
		var color = "#" + newR.toString(16) + newG.toString(16) + newB.toString(16);
		colors.push(color);
	}
	return colors;
}

function createPaths(res, des, rArr) {
	var resPoints = parsePath(res).points;
	var desPoints = parsePath(des).points;
	var pointsArr = [];
	if (!rArr) {
		rArr = [];
	}
	for (var i = 0; i < resPoints.length; i++) {
		rArr[i] = rArr[i] ? rArr[i] : 115;
		var pointObj = {
			x1 : resPoints[i].x,
			y1 : resPoints[i].y,
			x2 : desPoints[i].x,
			y2 : desPoints[i].y,
			r : rArr[i]
		};
		pointsArr.push(pointObj);
	}
	return pointsArr;
}

function playFrams(ele, pathsArr, colorsArr, total, easeType, easeinParam, easeinPower, easeoutParam, easeoutPower) {
	var i, j, counter = 0, timeoutDurition = 0, easeParam, easePower;
	if (easeType === "easein") {
		easeParam = easeinParam;
		easePower = easeinPower;
	} else if (easeType === "easeout") {
		easeParam = easeoutParam;
		easePower = easeoutPower;
	}
	for (counter = 0; counter <= total; counter++) {
		var durition;
		if (easeType === "easein") {
			durition = easeParam * Math.pow(counter, easePower);
		} else if (easeType === "easeout") {
			durition = 80 - easeParam * Math.pow(counter, easePower);
		}
		setTimeout((function(i, d){
			return function(){
				for (j = 0; j < pathsArr.length; j++) {
					if (colorsArr[0]) {
						Snap(ele.node.childNodes[2 * j + 1]).animate({
							fill : ( colorsArr[j] ? colorsArr[j] : colorsArr[0] )[i],
							d : pathsArr[j][i]
						}, d, mina.linear);
					} else {
						Snap(ele.node.childNodes[2 * j + 1]).animate({
							d : pathsArr[j][i]
						}, d, mina.linear);
					}
				}
			}
		})(counter, durition), timeoutDurition);
		timeoutDurition += durition;
	}
}

function WaterMelon() {
	this.svg = Snap("#watermelon-svg"),
	this.lineA = this.svg.select("#watermelon-LineA"),
	this.lineB = this.svg.select("#watermelon-LineB"),
	this.lineC = this.svg.select("#watermelon-LineC"),
	this.lineD = this.svg.select("#watermelon-LineD"),
	this.skin = this.svg.select("#watermelon-skin"),
	this.skinPattern = this.svg.select("#watermelon-skinPattern"),
	this.skinActionList = [["M212.1,13L196.3,41.9L197.1,126.3L209.8,41.9Z", "M132.8,61.3L119.1,173c0,0,29.3-48.5,30.2-49C150.2,123.4,132.8,61.3,132.8,61.3z", "M288.1,44.2L276,111.4L356.8,133.6Z", "M305.4,37.8L295.2,71.7L329,91.5L332.7,63.4Z", "M316.5,109.7L301.5,150.8L315.7,181.8L322.2,195.9L336,163.5Z", "M321.4,272.5L337.5,333L365.2,278.6L341.4,217.2Z", "M77,145.8L96.2,182.2L86.6,222.9L71.3,192.7Z", "M96.2,221.4L128.9,262.3L127.5,299.4L86.6,248.8Z", "M142.6,233L177.6,275.1L181.7,326.9L136.2,315.9Z", "M139.6,279.9L153.7,299L159,329.2L122.8,295.6Z", "M290.2,262.3L263.3,308.9L323.1,302.3L319.7,251.8Z", "M233,296.7L189.6,323.2L233,329.2L274.7,306.7Z", "M334.9,181L358.7,266.6L378.2,176.6L345.3,118.2Z", "M351.6,141.4L354.1,214.8L354.3,317.9L370.9,215.6Z", "M323.1,60.6L329.6,109.7L357.7,84.2Z", "M246.4,63L215.6,161.7L231,209.5L248.7,145.5Z", "M136,130.6L129.5,251.1L163.6,311.1L172.7,178.2Z", "M145.7,336.2L187.7,377.2L206.2,338.4L173.5,260.4Z", "M231.5,13c-4.1,2.4-8.5,21.6-8.5,21.6l3.5,54.3l7.9-58.5L231.5,13z", "M288.1,20.9L316.5,34.6L318.4,38L328.1,55.8L297.4,51.4L254,20.2Z", "M343.8,60.6L352.6,90.2L307.9,70.7L297.4,37.2L313.3,33.1Z", "M265.4,269.5L269,311.7L282.6,358.5L294.6,363.5L292.2,325.1L289.1,277.9Z", "M147.4,88.2L122.6,180.3L148.8,210.7L174.5,140.8Z", "M282.8,100.2L307,152.8L288.1,209.4L236.2,239.6Z", "M102.9,168c1.5,3.1,33.7,96,33.7,96l-35.3,95.2L91.7,256l-1.9-63.7L102.9,168z", "M172,81.8c-1.3,3.2,15.5,49.4,15.5,49.4l-39.3,103.6l0.2-99.7l5.1-68.4L172,81.8z", "M128.5,150.3L141.1,211L125.4,316.9L92.2,230Z", "M106.3,88.7L77,120.4L77.2,175.9L100.2,205Z", "M247.9,54.1L283.7,80.2L287.1,161.5L263.3,194.5Z", "M288.1,20.9L316.1,48.3L301.5,150.8L280,59.9L275.4,27.7Z", "M184.3,34.2L136.1,62.8L117.7,124.4L152.8,75.3Z", "M119.8,58.2L109,81.8L96.2,130.5L115.6,202.1Z", "M61.8,204.5L69,283.3L96.2,221.4L87.2,165.1L81.4,123.5Z", "M239.3,118.7L228.3,146.5L219.3,194.5L234.4,285.5L251.4,149.2Z", "M285,25.2L260.6,87.2L274.7,147.5L293.7,63.3Z", "M225,80.4L197.6,71L185,109.4L192.1,190.1L234,106.3Z", "M343.8,100.2c2.1,3.4,35,48,35,48l-3.8,22.6l-18.2,21.1L343.8,100.2z", "M342.2,189.4L332,250.8L300.6,311.4L303.5,227.5Z", "M178.2,120.6L155.7,203c0,0,18.5,67.4,17.4,68.4c-1.1,1,28.3-60.7,28.3-60.7L178.2,120.6z", "M270.1,81.2L245.8,175.9L255.9,257.2L281.8,165.1Z", "M285.8,203.6L293.1,304.6L331.2,367.4L318.9,268.2Z", "M253.2,212.4L275.4,260.4L287.8,303.7L256.7,382L238.4,284.6Z", "M208.8,132.9L194.8,194.5L204.8,274.3L231.4,183.4Z", "M231.7,189.2L205,190.6L208.2,244.7L217.9,313Z", "M285,170.1L231.7,189.2L231.4,246.8L242.3,317.8L281.1,221.3Z"],
		["M199.9,291.3L184,301.9L184.8,332.6L197.5,301.9Z", "M123.9,156.5l-13.7,111.7c0,0,29.3-48.5,30.2-49C141.3,218.6,123.9,156.5,123.9,156.5z", "M298.7,145L286.6,212.2L356.2,280.1Z", "M283.8,241.2L273.7,275L307.4,294.9L311.1,266.7Z", "M316.5,109.7L301.5,150.8L315.7,181.8L322.2,195.9L336,163.5Z", "M323.1,312.1L339.2,372.6L354.3,317.9L340.4,295.6Z", "M74.1,326.6L93.2,363L83.6,385.7L68.3,373.6Z", "M96.2,221.4L128.9,262.3L127.5,299.4L86.6,248.8Z", "M142.6,233L177.6,275.1L181.7,326.9L136.2,315.9Z", "M139.6,279.9L153.7,299L159,329.2L122.8,295.6Z", "M290.2,262.3L263.3,308.9L323.1,302.3L319.7,251.8Z", "M233,296.7L189.6,323.2L233,329.2L274.7,306.7Z", "M344.5,279.5L358.7,311.6L376.6,293.3L364.4,193.2Z", "M363.1,265.6L356,278.6L356.2,381.7L372.8,279.4Z", "M328.4,250.6L334.9,299.6L363,274.1Z", "M225.9,184.6L195,231.6L210.4,254.4L228.1,223.9Z", "M147.2,194.5L129.5,251.1L163.6,311.1L184.4,256.7Z", "M148.6,387.1L190.6,428.1L209,389.3L176.4,311.3Z", "M231.5,290.3c-4.1,0.9-8.5,8.1-8.5,8.1l3.5,20.4l7.9-21.9L231.5,290.3z", "M298.9,98.7L326.3,173L328.1,185.2L337.9,248.7L307.2,233.1L290.2,177.6Z", "M363.8,233.5L372.6,263L327.9,243.6L317.4,210.1L333.3,205.9Z", "M265.4,269.5L269,311.7L282.6,358.5L294.6,363.5L292.2,325.1L289.1,277.9Z", "M127.5,282L105.4,314.7L144.4,376.2L163.9,326.5Z", "M289.3,207.9L313.5,260.5L294.6,317.1L242.7,347.3Z", "M102.9,168c1.5,3.1,33.7,96,33.7,96l-35.3,95.2L91.7,256l-1.9-63.7L102.9,168z", "M169.6,321.6c-1.3,3.2,11.8,64.2,11.8,64.2l-43,2.9l-8.9-25.1l22.1-26.3L169.6,321.6z", "M115,221.3L127.5,282L111.8,387.9L78.7,300.9Z", "M108.9,203.9L79.6,235.6L79.7,291.2L102.7,320.2Z", "M254.7,350.4L290.5,361.3L293.9,395.3L270,409.1Z", "M303.5,246.7L331.5,274.1L317.7,391.7L296.2,300.8L290.7,253.5Z", "M154.1,135.5L105.9,164.1L111.8,234.9L136.1,184.2Z", "M122.2,78.7L111.4,102.3L98.6,151L118,222.6Z", "M42.6,307.9L61.3,365.4L88.5,303.4L79.5,247.2L62.2,227Z", "M262.8,230.9L251.8,258.7L242.8,306.6L257.9,397.6L275,261.4Z", "M292.4,296.6L268.1,325.8L282.2,354.2L301.2,314.5Z", "M223.7,249.4L196.3,245.1L183.7,262.5L190.8,299.2L232.6,261.1Z", "M343.8,199.4c2.1,3.4,35,48,35,48L375,270l-18.2,21.1L343.8,199.4z", "M342.2,189.4L332,250.8L300.6,311.4L303.5,227.5Z", "M139.9,370.1l-29.1,24.5c0,0,24.4,13.5,23.3,14.5c-1.1,1,42.5-6.5,42.5-6.5L139.9,370.1z", "M269.1,325.4L244.8,363.9L254.9,396.9L280.8,359.5Z", "M294.5,290.7L298.6,382L335.3,408.8L323,309.6Z", "M253.2,212.4L275.4,260.4L287.8,303.7L256.7,382L238.4,284.6Z", "M213.5,272.6L199.6,334.1L209.6,413.9L236.2,323Z", "M220.5,256.9L193.9,258.2L197,312.4L206.7,380.6Z", "M286.4,260.2L233.2,279.4L232.9,337L243.7,408L282.6,311.5Z"],
		["M196.1,394.7L180.3,398.6L181.1,409.8L193.8,398.6Z", "M140.2,375.2l-13.7,34.6c0,0,29.3-15,30.2-15.2C157.5,394.4,140.2,375.2,140.2,375.2z", "M299.8,388L287.6,405.2L357.3,422.5Z", "M276.4,406.1L266.2,423.7L300,434L303.7,419.4Z", "M306.9,394.2L291.9,407.1L306.1,416.8L312.6,421.2L326.4,411.1Z", "M321.5,387L351.6,402.3L380.2,390.8L355.8,376.9Z", "M77,363.8L117.1,374.6L83.6,385.7L68.3,373.6Z", "M98.8,381.9L131.6,397.9L130.2,412.4L89.3,392.6Z", "M142.6,297.2L177.6,310.5L181.7,326.9L136.2,323.4Z", "M124.7,374.6L138.9,393.6L144.1,423.9L108,390.2Z", "M270.8,406.3L243.8,422.6L303.6,420.3L300.2,402.6Z", "M229.7,393L186.3,407.7L229.7,411.1L271.3,398.5Z", "M367.8,379.2L407,390.9L440.4,385.5L404.1,373.1Z", "M372.6,391.7L323.8,402.5L354.3,409.7L400,417.2Z", "M332.2,374.7L338.8,423.8L366.8,398.3Z", "M233.3,392.5L202.5,413L217.9,422.9L235.6,409.6Z", "M124.5,386.1L156.2,420.5L224.8,422.8L197,387.3Z", "M148.6,387.1L192.2,413.9L254.9,396.9L168,379.7Z", "M243.8,394.8c-4.1,0.9-8.5,8.1-8.5,8.1l3.5,20.4l7.9-21.9L243.8,394.8z", "M285,389.4L312.4,401.9L314.3,404L324,414.7L293.3,412L276.4,402.7Z", "M376,378.7L404.7,389.9L361.8,413.2L329,400.8L335.6,385.7Z", "M259,405.5L262.6,413.8L276.2,423L288.2,424L285.8,416.4L282.7,407.1Z", "M117.1,374.6L61.9,384.6L138.7,413.5L163.5,394.7Z", "M343.3,388L302,428.6L242.4,430.1L196.3,391.5Z", "M95.8,375.9c1.5,3.1,32.9,36.2,32.9,36.2l-37.5,8.7l-46.8-25.2l24.4-21.2L95.8,375.9z", "M174.7,385.7c-1.3,3.2,48.3,22.2,48.3,22.2l-76.4,1.7l-8.9-25.1l10.9,2.6L174.7,385.7z", "M104.3,402.6L147.2,397.6L100.8,421.7L48.4,397.6Z", "M82.3,391.7L55,379.7L43.6,400.1L96.3,408.4Z", "M310.7,387.3L297.3,422.2L263.1,423.2L251.1,398.4Z", "M365.2,397.7L336.4,424.3L219.6,404.4L311.5,387.7L359.1,384.6Z", "M168.2,382.3L120,396L125.9,429.9L150.1,405.7Z", "M92.4,380.6L85.2,384.1L79.7,392.9L108.7,411.3Z", "M9.8,409.2L67.6,418.9L122.8,413.9L89.3,403.3L52.6,397.6Z", "M261.4,407.2L250.4,409.4L241.4,413.3L256.5,420.7L273.6,409.7Z", "M288.7,414.7L264.3,424.4L278.5,433.8L297.4,420.7Z", "M221.7,407.7L194.3,406.7L181.7,410.5L188.8,418.5L230.6,410.2Z", "M360.1,379.2c2.1,1,35,13.5,35,13.5l-3.8,6.4l-18.2,5.9L360.1,379.2z", "M392,397.4L332,414.2L263.8,411.6L341,378.5Z", "M133.5,378.1l-29.1,24.5c0,0,24.4,13.5,23.3,14.5c-1.1,1,42.5-6.5,42.5-6.5L133.5,378.1z", "M297.5,411.8L254.6,396.4L224.6,413.5L266.8,430.6Z", "M332.1,388.2L338.7,413.3L398.7,420.7L378.6,393.5Z", "M213.8,399.2L236.1,404.8L248.5,409.8L217.4,418.9L199.1,407.6Z", "M213.5,390.1L199.6,400.5L209.6,413.9L236.2,398.6Z", "M157.9,407.7L131.2,407.8L134.4,413.5L144.1,420.7Z", "M307.2,409.2L284.9,391.9L228.1,401.2L158.8,417.1L256.4,416.1Z"]];
	this.skinPatternActionList = [["M260.9,13L174.3,31.8L150.6,63.3L197.8,36.2Z", "M172.1,39.2L112.7,85.3L111.9,114.5L120.1,137.4L144.4,84.2Z", "M176.4,74L165.9,135.3L138.4,172.1L156.2,99.2Z", "M109.4,144.8L81.3,213L111.1,243Z", "M140.9,142.8L154.3,191L136.7,246.1L119,185.7Z", "M107,199.1L107,242.1L125.5,300.1L129.3,242.7Z", "M111.7,152.8L111.7,193.9L134.6,216.2L137,176.2Z", "M129.6,248.2L132.6,293.3L146.4,348.1L154.6,284.5L145.4,246.6Z", "M104.7,260.4L103.1,300.4L129.6,297.7Z", "M135.1,278.7L145.7,336.2L179.2,367.4L159,314.7Z", "M285.7,84.8L321.1,128L322.8,184.9L294.4,108.1Z", "M313.6,94.1L325,158.2L314.8,202.3L309.5,136.5L311.9,96.5Z", "M342.2,137.8L365.2,188.4L343.9,235.2L335.2,187.6Z", "M348.8,194.8L361.8,258.7L336,312.2L341,242.5Z", "M329.4,207.1L345.5,288.8L311.4,308.1L307.5,229.3Z", "M247,367.4L280.7,341.3L288.8,299.3L266.8,274.4Z", "M327,248.4L300.1,301.9L297.4,350.3L317.2,321Z", "M255.3,12.2L226.9,47.6L224.8,83.3L229,137.7L237.4,65.7Z", "M178.7,122.4L186.5,158.8L208.8,131L221.6,79.3L193.7,86.7Z", "M184.5,132.5L190.1,178.8L199.1,223.7L204,166.3Z", "M179.7,189.7L172.9,230.8L175.4,267.7L185,304.1L191.8,224.7Z", "M186,138.9L167.6,180.5L183.6,206.2L202,175.4Z", "M182.7,223.1L185.7,250.2L177.6,275.1L209.8,295.5L202.8,235.2Z", "M187,334.5L199.4,368.2L209.2,329.1L197.8,285.6Z", "M210.6,187.5L220.3,219L202.9,259.6L198.7,178.3Z", "M264.6,83.7L283.8,136.2L266.1,182.7L263.7,102.7L260.8,78.9Z", "M277.9,155.6L279.2,211.3L290.1,272.9L302.6,210.1L302.3,176.3Z", "M288.6,214L295.4,266.8L276.2,304.7Z", "M279.5,231.6L284.6,279.7L268.6,333.4L264.7,272.5L267.9,236Z", "M263.5,236.3L250.8,284.1L255.8,321L272.7,275.7Z", "M240,281.9L230.2,359.2L246.3,294Z"],
		["M206.1,195.7L171.8,277.4L183.9,314.9L188.9,260.7Z", "M166,152.9L106.9,199.3L106.2,228.5L114.5,251.3L138.6,198Z", "M176.4,74L165.9,135.3L138.4,172.1L156.2,99.2Z", "M75,336L98.2,405.9L140.4,409.3Z", "M140.9,142.8L154.3,191L136.7,246.1L119,185.7Z", "M107,199.1L107,242.1L125.5,300.1L129.3,242.7Z", "M111.7,152.8L111.7,193.9L134.6,216.2L137,176.2Z", "M128.8,289.2L131.8,334.3L145.6,389.1L153.8,325.5L144.6,287.6Z", "M104.7,260.4L103.1,300.4L129.6,297.7Z", "M123.8,392.8L154.3,409.5L191,399.4L155.4,391.4Z", "M298.8,131.3L319.4,183.2L303.7,237.9L300,156.2Z", "M315.2,256L326.7,284.3L316.4,303.7L311.1,274.7L313.5,257.1Z", "M342.2,242L365.2,292.6L343.9,339.3L335.2,291.7Z", "M348.8,293.6L361.8,357.5L336,411L341,341.3Z", "M324.3,264.2L340.4,345.9L306.3,365.2L302.4,286.5Z", "M245.5,419.4L301.1,407.2L314.5,387.5L278.1,375.8Z", "M327,248.4L300.1,301.9L297.4,350.3L317.2,321Z", "M255.1,157.3L226.8,182.2L224.6,207.5L228.9,245.8L237.2,195Z", "M163.6,230L171.4,258.7L193.7,236.8L206.4,195.9L178.5,201.8Z", "M184.5,225.1L190.1,271.4L199.1,316.3L204,258.9Z", "M179.3,260.4L172.5,301.5L175,338.4L184.6,374.9L191.4,295.4Z", "M167.2,215.1L148.8,256.8L164.8,282.4L183.2,251.7Z", "M185.2,343.3L189.9,359.6L178.5,374.4L225.1,387.2L214.2,350.8Z", "M196,385.5L160.3,389.1L195.6,408.3L240.6,408.3Z", "M210.6,187.5L220.3,219L202.9,259.6L198.7,178.3Z", "M264.6,83.7L283.8,136.2L266.1,182.7L263.7,102.7L260.8,78.9Z", "M277.9,155.6L279.2,211.3L290.1,272.9L302.6,210.1L302.3,176.3Z", "M288.6,214L295.4,266.8L276.2,304.7Z", "M282,260.2L287.1,308.3L271.1,362L267.2,301.1L270.4,264.6Z", "M259.3,300.9L246.6,348.7L251.6,385.6L268.4,340.3Z", "M280.5,392.9L202.6,395.7L269.6,401Z"],
		["M195.8,387L192.3,408.5L202.1,422L197.1,405.4Z", "M239,427.3L195.7,415.5L173.7,423L157.8,432.5L201.2,428.1Z", "M224.4,401.2L164.1,416.7L119.4,406.7L193.2,393.1Z", "M61.9,375.2L96.9,401.7L139.1,405Z", "M218.6,404.1L172.7,414L119,409.1L176.6,396.3Z", "M62.8,419.1L104,431.3L164.8,430.1L110.9,410Z", "M113.8,435.6L154.1,444.1L178.4,437L139.5,427.5Z", "M121.5,391.2L124.4,400.2L138.2,411.1L146.4,398.4L137.2,390.9Z", "M93.2,391.8L126.9,413.4L138,389.2Z", "M123.8,392.8L154.3,409.5L191,399.4L155.4,391.4Z", "M370.1,387.6L311.5,390.1L300.9,414.8L353.9,393.9Z", "M319.6,391.4L331,406.9L320.8,417.5L315.5,401.7L317.9,392Z", "M300,398.3L317.3,406.3L291.5,418.1L287.8,409.3Z", "M389.4,378.7L362.9,422.9L304.2,425.9L352.1,395.4Z", "M342.8,380.4L342.4,399.5L306.3,411.4L317.8,390.7Z", "M245.5,419.4L301.1,414.3L314.5,405.9L278.1,401Z", "M378.8,403.7L319.3,396.9L272.9,411L307.2,419.5Z", "M194.2,394.2L224.5,416.8L249.6,413.7L286.3,401.6L234.8,403.9Z", "M170.8,405.3L178.7,414.3L200.9,407.4L213.7,394.7L185.8,396.5Z", "M243,403.9L196.3,402.4L150.6,404.5L206.6,418Z", "M169.2,399.8L154.9,405.7L160.1,411L180.3,416.2L194.7,404.8Z", "M163,403.5L144.6,413.3L160.6,419.3L179,412.1Z", "M191.8,404.5L169.2,399.8L181.9,411.5L239.9,416.3L217.9,406.7Z", "M212.2,385.2L176.5,388.7L211.8,408L256.8,407.9Z", "M271.8,411.9L240.7,422.9L199.4,407.3L280.4,399.6Z", "M316.4,396.4L264.2,416.3L217.4,399.2L297.4,395.8L321.2,392.6Z", "M290,387L285.3,402.3L289.4,418.3L308.5,399.5L311.8,390.1Z", "M284.2,391.6L291,409.2L271.8,421.9Z", "M337.3,407.5L290.1,417.9L234.9,407.8L295,397.3L331.6,396.5Z", "M281.4,398L258.2,416.3L253.9,426.8L280.3,408.3Z", "M280.5,392.9L202.6,395.7L269.6,401Z"]];
}

WaterMelon.prototype.init = function() {

};

WaterMelon.prototype.reset  = function() {
    var aInitSkin = ["M212.1,13L157.4,35.4L194.8,68.8L229.6,44.7Z", "M128.9,46.1l-42.3,81.6c0,0,43.8-17.5,44.7-18C132.2,109.1,128.9,46.1,128.9,46.1z", "M288.1,44.2L276,111.4L356.8,133.6Z", "M305.4,37.8L295.2,71.7L329,91.5L332.7,63.4Z", "M316.5,109.7L301.5,150.8L315.7,181.8L322.2,195.9L336,163.5Z", "M268.4,214.5L272.5,304.6L350.9,248L327.1,186.5Z", "M77,145.8L96.2,182.2L86.6,222.9L71.3,192.7Z", "M96.2,221.4L128.9,262.3L127.5,299.4L86.6,248.8Z", "M142.6,233L177.6,275.1L181.7,326.9L136.2,315.9Z", "M139.6,279.9L153.7,299L159,329.2L122.8,295.6Z", "M290.2,262.3L263.3,308.9L323.1,302.3L319.7,251.8Z", "M233,296.7L189.6,323.2L233,329.2L274.7,306.7Z", "M334.9,181L332.4,244.8L378.2,176.6L345.3,118.2Z", "M304.5,25.2L317.1,109.2L312.7,171L367.4,109Z", "M323.1,60.6L329.6,109.7L357.7,84.2Z", "M237,36.2L151.1,122.9L172.2,188L259.7,114.5Z", "M115.9,129.8L129.5,251.1L193.5,275.5L191.1,161.3Z", "M114.3,292.2L228.3,335.7L279.3,290.1L176.7,239.8Z", "M243.2,13c-4.1,2.4-41.9,13.1-41.9,13.1l7.5,21.8l25.7-17.5L243.2,13z", "M288.1,20.9L316.5,34.6L318.4,38L328.1,55.8L297.4,51.4L254,20.2Z", "M343.8,60.6L352.6,90.2L307.9,70.7L297.4,37.2L313.3,33.1Z", "M308.9,75L312.6,117.2L326.2,163.9L338.2,168.9L335.8,130.6L332.7,83.3Z", "M144.9,81.2L120.1,173.3L146.3,203.7L172,133.8Z", "M282.8,100.2L307,152.8L288.1,209.4L236.2,239.6Z", "M106.8,162.3c1.5,3.1,33.7,96,33.7,96l5.3,65.6l-63.1-74l10.9-63.3L106.8,162.3z", "M201.7,29.2c-1.3,3.2-50.4,88.4-50.4,88.4l-46.1,47l14.5-96.1l54.9-33.2L201.7,29.2z", "M116.4,111L128.9,171.7L131,243.8L80.1,190.7Z", "M106.3,88.7L77,120.4L77.2,175.9L100.2,205Z", "M247.9,54.1L283.7,80.2L287.1,161.5L263.3,194.5Z", "M255.4,13.3L314,47.9L312.6,117.2L259.5,53.1L240.3,18.8Z", "M202.6,13.3L150.8,20.2L110,69.5L164.4,50.4Z", "M142.3,42.3L97.2,61.7L63.9,129.4L86.4,165.4Z", "M61.8,150.7L80.7,256L110,210.4L96.1,147.3L67.6,124.3Z", "M258.4,20.2L186,54.9L185,93.6L210.6,124.3L245.8,58.2Z", "M285,25.2L231.7,43.4L245.8,103.7L293.7,63.3Z", "M270.1,11.9L231.7,5.3L164.6,34.6L244.1,39.2L285,25.2Z", "M343.8,100.2c2.1,3.4,35,48,35,48l-3.8,22.6l-18.2,21.1L343.8,100.2z", "M362.6,199.9L352.4,261.3L300.2,293.5L323.8,238Z", "M230.8,29.7L164.9,67c0,0-31.1,62.6-32.2,63.7c-1.1,1,64.5-18.2,64.5-18.2L230.8,29.7z", "M270.1,81.2L223.1,110.4L226.9,207.9L281.8,165.1Z", "M281.3,95.1L288.1,209.4L342.1,203.7L352.6,134.8Z", "M253.2,212.4L298.1,251.9L287.8,303.7L197.7,322.3L250.1,213.2Z", "M237.3,127.3L167.6,183.4L181.1,234.7L231.4,183.4Z", "M255.4,165.1L206.2,186.9L182,252.4L220,254.6Z", "M285,170.1L231.7,189.2L201.3,260.4L224.8,279.9L272,210.8Z"];
	var aInitSkinPattern = ["M260.9,13L174.3,31.8L150.6,63.3L197.8,36.2Z", "M172.1,39.2L112.7,85.3L111.9,114.5L120.1,137.4L144.4,84.2Z", "M197.8,36.2L163.6,80.9L125.8,96.9L161.2,58.2Z", "M114.7,101.9L86.6,170.1L116.4,200.1Z", "M131,93.6L144.4,141.7L111.9,181L109,136.4Z", "M101.4,175.9L101.4,219L140.7,256.7L131,191.9Z", "M111.7,152.8L111.7,193.9L134.6,216.2L137,176.2Z", "M123.8,228L126.7,273.2L154.3,302.5L148.7,264.4L139.6,226.5Z", "M111.7,217.3L110.1,257.3L136.6,254.6Z", "M135.1,278.7L170.3,326L201.4,339.2L173.4,292Z", "M284.3,15.4L328.1,55.8L340,84.7L293.1,38.8Z", "M315.7,54.1L339.2,88.8L329,132.9L311.6,96.5L314,56.5Z", "M335.8,83.9L358.8,134.5L337.5,181.3L328.8,133.6Z", "M346,152.7L362.4,207.5L310.1,257.3L326.6,195.6Z", "M343.8,203.3L350,253.2L305.2,271.2L313.5,221.2Z", "M206.4,340.7L272.4,322.4L288.3,292.8L289.4,277.3Z", "M327,248.4L282.6,280.2L278.1,309L310.8,291.6Z", "M255.3,12.2L213.4,61.1L213.1,68.2L212.1,96.1L237.4,65.7Z", "M178.7,122.4L186.5,158.8L208.8,131L221.6,79.3L193.7,86.7Z", "M184.5,132.5L190.1,178.8L214.9,194.5L214.1,146.7Z", "M190.3,165.1L183.6,206.2L186,243.1L204.8,256L202.4,200.1Z", "M186,138.9L167.6,180.5L183.6,206.2L202,175.4Z", "M182.7,223.1L185.7,250.2L177.6,275.1L209.8,295.5L202.8,235.2Z", "M187.9,301.1L200.3,334.8L204.7,288.9L198.7,252.2Z", "M210.6,187.5L220.3,219L202.9,259.6L198.7,178.3Z", "M268.6,16.9L287.8,69.4L284.3,95.7L267.7,35.9L264.8,12.2Z", "M276.7,67.9L283.2,126.6L280.5,170.2L301.3,122.3L301,88.5Z", "M290.3,137.2L297.1,190L268.5,206.3Z", "M279.5,185L284.6,233L260.2,254L258.4,222.9L259.7,188.3Z", "M266,225.8L238,266.5L230.4,303.1L261.4,266Z", "M240,281.9L206.4,340.7L246.3,294Z"];
    var that = this, i = 0, l, aSkin = that.skinActionList; aSkinP = that.skinPatternActionList;
	// reset skin
	for (i = 0, l = aInitSkin.length; i < l; i++) {
		var skin = Snap(that.skin.node.childNodes[2 * i + 1]);
		skin.attr({
			d : aInitSkin[i]
		});
	}
	for (i = 0, l = aInitSkinPattern.length; i < l; i++) {
		var skinP = Snap(that.skinPattern.node.childNodes[2 * i + 1]);
		skinP.attr({
			d : aInitSkinPattern[i]
		});
	}
    Snap(this.lineA.node.childNodes[1]).attr({
        d : "M333.2,29.7L323.1,56.5L307.4,81.2L340,56.5Z",
        transform : "matrix(0,0,0,0,323.7,55.45)"
    });
    Snap(this.lineB.node.childNodes[1]).attr({
        d : "M157.4,8.1c0,0-22.6,3.5-23.2,5.2c-0.6,1.6-22.5,51.7-22.5,51.7l12,75.5l30.5,34.5l-19.1-65.8l-3.7-49.3l12.9-44.5L157.4,8.1z",
        transform : "matrix(0,0,0,0,134.55,91.55)"
    });
    Snap(this.lineC.node.childNodes[1]).attr({
        d : "M78.7,53.9c-1.9,9.7-8.9,51.3,50.2,51.3c0,0-22.7-14.9-29.5-22.3C82.6,64.7,78.7,53.9,78.7,53.9z",
        transform : "matrix(0,0,0,0,103.1656,79.55)"
    });
    Snap(this.lineD.node.childNodes[1]).attr({
        d : "M330.1,185.2L394.2,163.9L409.7,147.1L395.6,123.5L395.6,137.2L391,149.2L371.1,163.9Z",
        transform : "matrix(0,0,0,0,369.9,154.35)"
    });
};

WaterMelon.prototype.lineAAnimation = function() {
	var lineA = Snap(this.lineA.node.childNodes[1]);
	lineA.animate({
		transform : "s1"
	}, 100, mina.linear, function(){
		lineA.animate({
			d : "M333.2,29.7L287.4,111.1L165.5,167.2L300.9,114.5Z"
		}, 100, mina.linear, function(){
			lineA.animate({
				d : "M272.8,122.2L229,137.7L134.8,167.1L228.5,142.7Z"
			}, 100, mina.linear, function(){
				lineA.animate({
					transform : "s0"
				}, 100, mina.linear);
			});
		});
	});
};

WaterMelon.prototype.lineBAnimation = function() {
	var lineB = Snap(this.lineB.node.childNodes[1]);
	lineB.animate({
		transform : "s1"
	}, 100, mina.linear, function(){
		lineB.animate({
			d : "M157.4,8.1c0,0-19.8,2.4-20.4,4c-0.6,1.6-0.4,132.4-0.4,132.4l106.5,112.8l70.8,21.3l-106.7-77.7l-62.9-74.7l-4.8-113L157.4,8.1z"
		}, 100, mina.linear, function(){
			lineB.animate({
				d : "M178.6,183c0,0,12.8,21.3,13.3,23c1.2,3.2,24,24.4,24,24.4l60.7,41.6l75.9,18.6l-71.3-25.1l-49.6-30.5l-30.2-23.9L178.6,183z"
			}, 100, mina.linear, function(){
				lineB.animate({
					transform : "s0"
				}, 100, mina.linear);
			});
		});
	});
};

WaterMelon.prototype.lineCAnimation = function() {
	var lineC = Snap(this.lineC.node.childNodes[1]);
	lineC.animate({
		transform : "s1"
	}, 100, mina.linear, function(){
		lineC.animate({
			d : "M78.7,53.9c-1.9,9.7,38.5,88.2,140.4,79.6c0,0-79.7-14.5-98.1-31S78.7,53.9,78.7,53.9z"
		}, 100, mina.linear, function(){
			lineC.animate({
				d : "M128,110.4c1.6,4.3,10.1,30.1,112,21.6c0,0-41.6-1-70.7-4.3C144.7,124.9,128,110.4,128,110.4z"
			}, 100, mina.linear, function(){
				lineC.animate({
					transform : "s0"
				}, 100, mina.linear);
			});
		});
	});
};

WaterMelon.prototype.lineDAnimation = function() {
	var lineD = Snap(this.lineD.node.childNodes[1]);
	lineD.animate({
		transform : "s1"
	}, 100, mina.linear, function(){
		lineD.animate({
			d : "M202.4,188.4L293.7,207.9L417.4,146.8L395.6,123.5L404.2,139.6L399.1,152.2L295.9,197.1Z"
		}, 100, mina.linear, function(){
			lineD.animate({
				d : "M186.8,186.4L249.5,203.7L293.7,207.9L330.2,192.7L304.6,199.9L290.9,201L259.2,199.9Z"
			}, 100, mina.linear, function(){
				lineD.animate({
					transform : "s0"
				}, 100, mina.linear);
			});
		});
	});
};

WaterMelon.prototype.cutAnimation = function() {
	var that = this;
	that.lineAAnimation();
	setTimeout(that.lineBAnimation.bind(that), 400);
	setTimeout(that.lineCAnimation.bind(that), 800);
	setTimeout(that.lineDAnimation.bind(that), 1200);
};

WaterMelon.prototype.fallAnimation = function() {
	var that = this, i = 0, l, aSkin = that.skinActionList; aSkinP = that.skinPatternActionList;
	// skin animation
	for (i = 0, l = aSkin[0].length; i < l; i++) {
		var skin = Snap(that.skin.node.childNodes[2 * i + 1]);
		skin.animate({
			d : aSkin[0][i]
		}, 200, mina.linear);
	}
	for (i = 0, l = aSkinP[0].length; i < l; i++) {
		var skinP = Snap(that.skinPattern.node.childNodes[2 * i + 1]);
		skinP.animate({
			d : aSkinP[0][i]
		}, 200, mina.linear);
	}
	setTimeout(function(){
		for (i = 0, l = aSkin[1].length; i < l; i++) {
			var skin = Snap(that.skin.node.childNodes[2 * i + 1]);
			skin.animate({
				d : aSkin[1][i]
			}, 300, mina.linear);
		}
		for (i = 0, l = aSkinP[1].length; i < l; i++) {
			var skinP = Snap(that.skinPattern.node.childNodes[2 * i + 1]);
			skinP.animate({
				d : aSkinP[1][i]
			}, 300, mina.linear);
		}
	}, 150);
	setTimeout(function(){
		for (i = 0, l = aSkin[2].length; i < l; i++) {
			var skin = Snap(that.skin.node.childNodes[2 * i + 1]);
			skin.animate({
				d : aSkin[2][i]
			}, 400, mina.linear);
		}
		for (i = 0, l = aSkinP[2].length; i < l; i++) {
			var skinP = Snap(that.skinPattern.node.childNodes[2 * i + 1]);
			skinP.animate({
				d : aSkinP[2][i]
			}, 400, mina.linear);
		}
	}, 400);
};

WaterMelon.prototype.doAnimation = function() {
	var that = this;
    that.reset();
	that.cutAnimation();
	setTimeout(that.fallAnimation.bind(that), 1500);
};

function Dragon() {
	this.svg = Snap("#dragon-svg"),
	this.head = this.svg.select("#dragon-head"),
	this.brush = this.svg.select("#dragon-brush"),
	this.frontLeg1 = this.svg.select("#dragon-leg-frontOne"),
	this.frontLeg2 = this.svg.select("#dragon-leg-frontTwo"),
	this.backLeg1 = this.svg.select("#dragon-leg-backOne"),
	this.backLeg2 = this.svg.select("#dragon-leg-backTwo"),
	this.tail = this.svg.select("#dragon-tail"),
	this.eyeWhite = this.svg.select("#dragon-eyeWhite"),
	this.pupil = this.svg.select("#dragon-pupil"),
    this.lightening1 = this.svg.select("#dragon-lightening1"),
    this.lightening2 = this.svg.select("#dragon-lightening2"),
    this.lightening3 = this.svg.select("#dragon-lightening3"),
    this.wholeBody = this.svg.select("#dragon-wholeBody");
}

Dragon.prototype.init = function() {

};

Dragon.prototype.reset = function() {
	var that = this, pupilNodes = that.pupil.node.childNodes, eyeNodes = that.eyeWhite.node.childNodes;
    that.brush.attr({
        opacity : 1,
        transform : "t0,0"
    });
    Snap(pupilNodes[1]).attr({
        opacity : "0",
        fill : "#78CAB9",
        transform : "r0,290.8,149.3"
    });
    Snap(pupilNodes[3]).attr({
        opacity : "0",
        fill : "#78CAB9",
        transform : "r0,258,131.6"
    });
    Snap(eyeNodes[1]).attr({
        fill : "#edfcf3"
    });
    Snap(eyeNodes[3]).attr({
        fill : "#edfcf3"
    });
    that.wholeBody.attr({
        fill : "#78CAB9"
    });
    $("#dragon-wholeBody").show();
};

Dragon.prototype.brushAnimation = function() {
    var that = this, oBrushTop = Snap(that.brush.node.childNodes[3]);
    var brushPathArr = ["M46.2,98.9c0,0,2.9-4.2,4.7-5.1c1.8-1,3.8,0.1,6.1,0c2.4-0.1,2.2-2.7,3.8-3.1c1.6-0.4,2.8,0,3-0.7c0.3-0.7,2.8-6.4,4-6.3c0.9,0,2.2,5,2.4,8.2c0.1,1,1.2,6.1,1.4,7l3.8,5.3c0,0-17.5,0.7-20-0.5S46.2,98.9,46.2,98.9z",
    	"M46.2,98.9c0,0,2.9-4.2,4.7-5.1c1.8-1,3.8,0.1,6.1,0c2.4-0.1,2.2-2.7,3.8-3.1c1.6-0.4,2.8,0,3-0.7c0.3-0.7,2.8-6.4,4-6.3c0.9,0,1.3,6.3,1.5,9.5c0.1,1,0.4,6.5,0.6,7.5l2.5,8.1c0,0-14.5-2.6-17-3.8S46.2,98.9,46.2,98.9z"]
    that.brush.attr({
        opacity : 1
    }).animate({
        transform : "t220,35"
    }, 800, mina.easein);
    setTimeout(function(){
        that.brush.animate({
            transform : "t220,45"
        }, 200, mina.linear);
        oBrushTop.animate({
            d : brushPathArr[0]
        }, 200, mina.linear);
        Snap(that.pupil.node.childNodes[1]).animate({
            opacity : "1"
        }, 200, mina.easeout);
    }, 800);
    setTimeout(function(){
        that.brush.animate({
            transform : "t220,35"
        }, 200, mina.linear);
        oBrushTop.animate({
            d : brushPathArr[1]
        }, 200, mina.linear);
    }, 1000);
    setTimeout(function(){
        that.brush.animate({
            transform : "t185,15"
        }, 200, mina.linear);
    }, 1200);
    setTimeout(function(){
        that.brush.animate({
            transform : "t185,22"
        }, 200, mina.linear);
        oBrushTop.animate({
            d : brushPathArr[0]
        }, 200, mina.linear);
        Snap(that.pupil.node.childNodes[3]).animate({
            opacity : "1"
        }, 200, mina.easeout);
    }, 1400);
    setTimeout(function(){
        that.brush.animate({
            transform : "t185,-200",
            opacity : 0
        }, 400, mina.linear);
        oBrushTop.animate({
            d : brushPathArr[1]
        }, 200, mina.linear);
    }, 1600);
};

Dragon.prototype.lighteningAnimation = function() {
    var that = this, pupilNodes = that.pupil.node.childNodes, eyeNodes = that.eyeWhite.node.childNodes;
    that.lightening1.animate({
        opacity : 1
    }, 200, mina.easeout);
    that.wholeBody.animate({
        fill : "#fff"
    }, 200, mina.easeout);
    Snap(eyeNodes[1]).animate({
        fill : "#fff"
    }, 200, mina.easeout);
    Snap(eyeNodes[3]).animate({
        fill : "#fff"
    }, 200, mina.easeout);
    Snap(pupilNodes[1]).animate({
        fill : "#fff"
    }, 200, mina.easeout);
    Snap(pupilNodes[3]).animate({
        fill : "#fff"
    }, 200, mina.easeout);
    setTimeout(function(){
        that.lightening1.animate({
            opacity : 0
        }, 500, mina.linear);
    }, 200);
    setTimeout(function(){
        that.lightening2.animate({
            opacity : 1
        }, 200, mina.easeout);
    }, 600);
    setTimeout(function(){
        that.lightening2.animate({
            opacity : 0
        }, 500, mina.easein);
    }, 800);
    setTimeout(function(){
        that.lightening3.animate({
            opacity : 1
        }, 200, mina.easeout);
    }, 1200);
    setTimeout(function(){
        that.lightening3.animate({
            opacity : 0
        }, 500, mina.easeout);
    }, 1400);
    setTimeout(function(){
        that.wholeBody.animate({
            fill : "#78CAB9"
        }, 100, mina.easein, function(){
            $("#dragon-wholeBody").hide();
            Snap(pupilNodes[1]).animate({
                fill : "#000"
            }, 200, mina.easeout);
            Snap(pupilNodes[3]).animate({
                fill : "#000"
            }, 200, mina.easeout);
        });
    }, 1800);
};

Dragon.prototype.bodyAnimation = function() {
	var that = this;
    that.head.animate({
        transform : "r8,320,240"
    }, 200, mina.linear);
    setTimeout(function(){
        that.head.animate({
            transform : "r-6,320,240"
        }, 400, mina.linear);
    }, 200);
    setTimeout(function(){
        that.head.animate({
            transform : "r0,320,240"
        }, 200, mina.linear);
    }, 600);
    // front leg 1
    setTimeout(function(){
        that.frontLeg1.animate({
            transform : "r8,170,350"
        }, 200, mina.linear);
        setTimeout(function(){
            that.frontLeg1.animate({
                transform : "r-6,170,350"
            }, 400, mina.linear);
        }, 200);
        setTimeout(function(){
            that.frontLeg1.animate({
                transform : "r0,170,350"
            }, 200, mina.linear);
        }, 600);
    }, 200);
    // front leg 2
    setTimeout(function(){
        that.frontLeg2.animate({
            transform : "r-8,275,430"
        }, 200, mina.linear);
        setTimeout(function(){
            that.frontLeg2.animate({
                transform : "r6,275,430"
            }, 400, mina.linear);
        }, 200);
        setTimeout(function(){
            that.frontLeg2.animate({
                transform : "r0,275,430"
            }, 200, mina.linear);
        }, 600);
    }, 300);
    // back leg 1
    setTimeout(function(){
        that.backLeg1.animate({
            transform : "r8,520,415"
        }, 200, mina.linear);
        setTimeout(function(){
            that.backLeg1.animate({
                transform : "r-6,520,415"
            }, 400, mina.linear);
        }, 200);
        setTimeout(function(){
            that.backLeg1.animate({
                transform : "r0,520,415"
            }, 200, mina.linear);
        }, 600);
    }, 400);
    // back leg 2
    setTimeout(function(){
        that.backLeg2.animate({
            transform : "r-8,580,415"
        }, 200, mina.linear);
        setTimeout(function(){
            that.backLeg2.animate({
                transform : "r6,580,415"
            }, 400, mina.linear);
        }, 200);
        setTimeout(function(){
            that.backLeg2.animate({
                transform : "r0,580,415"
            }, 200, mina.linear);
        }, 600);
    }, 350);
    // tail
    setTimeout(function(){
        that.tail.animate({
            transform : "r-8,480,285"
        }, 200, mina.linear);
        setTimeout(function(){
            that.tail.animate({
                transform : "r6,480,285"
            }, 400, mina.linear);
        }, 200);
        setTimeout(function(){
            that.tail.animate({
                transform : "r0,480,285"
            }, 200, mina.linear);
        }, 600);
    }, 440);
};

Dragon.prototype.eyeAnimation = function() {
	var that = this, pupilNodes = that.pupil.node.childNodes;
    Snap(pupilNodes[1]).animate({
        transform : "r360,290.8,149.3"
    }, 600, mina.linear);
	Snap(pupilNodes[3]).animate({
        transform : "r360,258,131.6"
    }, 600, mina.linear);
};

Dragon.prototype.doAnimation = function() {
    var that = this;
    that.reset();
	that.brushAnimation();
    setTimeout(that.lighteningAnimation.bind(that), 2000);
    setTimeout(that.bodyAnimation.bind(that), 4300);
    setTimeout(that.eyeAnimation.bind(that), 5000);
};

function WolfMan() {
	this.easeinPower = 1.4;
	this.easeinParam = 10;
	this.easeoutPower = 0.6;
	this.easeoutParam = 20;
	this.svg = Snap("#wolfman-svg"),
	this.sun = this.svg.select("#wolfman-sun"),
	this.moon = this.svg.select("#wolfman-moon"),
	this.head = this.svg.select("#wolfman-head"),
	this.neck = this.svg.select("#wolfman-neck"),
	this.body = this.svg.select("#wolfman-body"),
	this.leftArm = this.svg.select("#wolfman-leftArm"),
	this.rightArm = this.svg.select("#wolfman-rightArm"),
	this.short = this.svg.select("#wolfman-short"),
	this.leftLeg = this.svg.select("#wolfman-leftLeg"),
	this.rightLeg = this.svg.select("#wolfman-rightLeg");
}

WolfMan.prototype.init = function() {
};

WolfMan.prototype.reset = function() {
	var that = this, headNodes = that.head.node.childNodes, neckNodes = that.neck.node.childNodes,
		bodyNodes = that.body.node.childNodes, leftArmNodes = that.leftArm.node.childNodes,
		rightArmNodes = that.rightArm.node.childNodes, shortNodes = that.short.node.childNodes,
		leftLegNodes = that.leftLeg.node.childNodes, rightLegNodes = that.rightLeg.node.childNodes;
	that.sun.attr({
		opacity : 1,
		transform : "r0,0,0"
	});
	that.moon.attr({
		opacity : 0,
		transform : "r120,300,500"
	});
	Snap(headNodes[1]).attr({
		d : "M404.7,119.5l-18.3,5.2l-0.8,4.4l-1.3,7.3l-2.6,3.9l-3.5,7.1l5.9,4.4l-0.7,7l-0.5,5.1l17.8,8.7l14.8-8.1l6.6-4.5l2.5-16.6l0.7-17.2L404.7,119.5z",
		fill : "#D1C195"
	});
	Snap(headNodes[3]).attr({
		d : "M391.4,136.8L403.2,140.6L388.1,142.3L383.6,141.1L384.5,136.2Z",
		fill : "#BA9F77"
	});
	Snap(neckNodes[1]).attr({
		d : "M401.7,167.1l1.4,6.3l1.7,8.7l10.7,0l19.5,0l-10.7-17.4l-3.4-8.7l-9.4,2.1L401.7,167.1z",
		fill : "#D1C195"
	});
	Snap(bodyNodes[1]).attr({
		d : "M406.9,175.4L428.5,171.9L447.7,188.8L444.4,208.3L395.8,237.2L388.9,212.4Z",
		fill : "#D1C195"
	});
	Snap(bodyNodes[3]).attr({
		d : "M395.2,230.7L445.2,203.8L449,218.7L441.3,247.6L404.4,269.2L400.6,248Z",
		fill : "#D1C195"
	});
	Snap(bodyNodes[5]).attr({
		d : "M404.4,263.9L422.8,248.7L441.3,248.5L436.6,273.7L421.3,287.6L407.9,285.9Z",
		fill : "#D1C195"
	});
	Snap(leftArmNodes[1]).attr({
		d : "M429.5,191.6L435.5,220.1L462.6,246.2L476.1,244.8L458.3,208.4L448.1,189.9Z",
		fill : "#D1C195"
	});
	Snap(leftArmNodes[3]).attr({
		d : "M457.2,244.8L457.2,292.6L462.6,302.6L470.3,290.3L474.2,242L466.5,233Z",
		fill : "#D1C195"
	});
	Snap(leftArmNodes[5]).attr({
		d : "M472.8,293.2L469.6,314.2L463.6,316.9L457.2,319.9L454.8,313.7L452.4,307.7L455.3,302.6L457.8,298.2L465.9,285.3Z",
		fill : "#D1C195"
	});
	Snap(rightArmNodes[1]).attr({
		d : "M395.7,231.5L391,247.4L396.6,256.3L406.6,249.9L408.7,221Z",
		fill : "#D1C195"
	});
	Snap(rightArmNodes[3]).attr({
		d : "M390,249.6L371.5,273.8L375,284.2L407.4,261.1L401.1,244.3Z",
		fill : "#D1C195"
	});
	Snap(rightArmNodes[5]).attr({
		d : "M373.6,272.1L363.1,273.4L353,283.9L357.5,292.9L360.1,294.5L365.1,297.6L368,295.6L371.9,292.8L374.7,290.8L381.3,282.8L381.3,276.5Z",
		fill : "#D1C195"
	});
	Snap(shortNodes[1]).attr({
		d : "M408.1,287.1L431,277.5L437.5,268L438.9,283.6L423.5,296.6L400.3,296.6L403.5,292.7Z",
		fill : "#3E4149"
	});
	Snap(shortNodes[3]).attr({
		d : "M377.2,326.2L387.5,335.9L400.3,333.8L413.4,318.9L431,305.9L419.6,287.1L404.1,287.7L392.8,299.7Z",
		fill : "#3E4149"
	});
	Snap(shortNodes[5]).attr({
		d : "M438.9,275.2L454.7,287.1L452.3,317.5L460.7,349.7L438.9,353.2L427.3,327.7L417.2,305.9L423.8,283.8Z",
		fill : "#3E4149"
	});
	Snap(leftLegNodes[1]).attr({
		d : "M455.2,349.7L467.4,358.6L473.4,404.3L468,411.6L440.2,359.5L437.4,346.3Z",
		fill : "#D3C996"
	});
	Snap(leftLegNodes[3]).attr({
		d : "M472.6,416.3L466,419.5L454.7,424.9L441.1,422.5L458.6,410L474.2,403.3Z",
		fill : "#D3C996"
	});
	Snap(rightLegNodes[1]).attr({
		d : "M391.7,331.9L399.6,346.7L391.7,378.9L382.1,385.9L377.8,333.6L380.1,322.7Z",
		fill : "#D3C996"
	});
	Snap(rightLegNodes[3]).attr({
		d : "M391.3,388L384.7,391.2L373.4,396.7L359.9,394.2L377.3,381.7L392.9,375.1Z",
		fill : "#D3C996"
	});
};

WolfMan.prototype.sunAnimation = function() {
	this.sun.animate({
		opacity : 0,
		transform : "r-60,800,600"
	}, 800, mina.easeout);
};

WolfMan.prototype.moonAnimation = function(fnCallBack) {
	this.moon.animate({
		opacity : 1,
		transform : "r0,300,500"
	}, 2000, mina.easein, fnCallBack.bind(this));
};

WolfMan.prototype.headAnimation = function() {
	var total = 10;
	var colors1 = generateColors("D1C195", "7B9B8D", total);
	var colors2 = generateColors("BA9F77", "5A756B", total);
	var facePointsArr = createPaths("M404.7,119.5l-18.3,5.2l-0.8,4.4l-1.3,7.3l-2.6,3.9l-3.5,7.1l5.9,4.4l-0.7,7l-0.5,5.1l17.8,8.7l14.8-8.1l6.6-4.5l2.5-16.6l0.7-17.2L404.7,119.5z", "M321.2,251.7l10.2,16l4.7-0.5l7.1-0.8l4.5,1.4l7.8,1.3l2.5-6.9l6.9-1.3l5-1l3.3-19.6l-12-11.9l-6.1-5l-16.6,2.3l-16.7,4.2L321.2,251.7z");
	var eyePointsArr = createPaths("M391.4,136.8L403.2,140.6L388.1,142.3L383.6,141.1L384.5,136.2Z", 
									"M338.5,258.6L336.3,247L341.1,261.3L342,265.7L340.2,265.3Z");
	var facePaths = generatePaths(total, [true], [true], facePointsArr);
	var eyePaths = generatePaths(total, [true], [true], eyePointsArr);
	playFrams(this.head, [facePaths, eyePaths], [colors1, colors2], total, "easeout", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.neckAnimation = function() {
	var total = 10;
	var colors1 = generateColors("D1C195", "7B9B8D", total);
	var neckPointsArr = createPaths("M401.7,167.1l1.4,6.3l1.7,8.7l10.7,0l19.5,0l-10.7-17.4l-3.4-8.7l-9.4,2.1L401.7,167.1z", 
									"M363.2,244.7l13.4,0.7l3.6-10l28.5-22.2l-25.3-1.1l-26.2,9.3l-2.8,10.9l-2.6,9.9L363.2,244.7z");
	var neckPaths = generatePaths(total, [true], [true], neckPointsArr);
	playFrams(this.neck, [neckPaths], [colors1], total, "easeout", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.bodyAnimation = function() {
	var total = 10;
	var colors1 = generateColors("D1C195", "7B9B8D", total);
	var bodyTopPointsArr = createPaths("M406.9,175.4L428.5,171.9L447.7,188.8L444.4,208.3L395.8,237.2L388.9,212.4Z", 
										"M371.2,252.5L373.4,230.7L412.3,208.9L439.5,223.3L428.1,279.1L402.4,279.3Z");
	var bodyMiddlePointsArr = createPaths("M395.2,230.7L445.2,203.8L449,218.7L441.3,247.6L404.4,269.2L400.6,248Z", 
										"M398.8,271.4L432.5,225.8L441.3,232.2L446.8,265L423.6,302.3L411,286.6Z");
	var bodyBottomPointsArr = createPaths("M404.4,263.9L422.8,248.7L441.3,248.5L436.6,273.7L421.3,287.6L407.9,285.9Z", 
										"M414.9,283.5L433.4,264.8L448.3,261.6L448.3,287.2L435.9,303.7L422.4,304.5Z");
	var bodyTopPaths = generatePaths(total, [true], [true], bodyTopPointsArr);
	var bodyMiddlePaths = generatePaths(total, [true], [true], bodyMiddlePointsArr);
	var bodyBottomPaths = generatePaths(total, [true], [true], bodyBottomPointsArr);
	playFrams(this.body, [bodyTopPaths, bodyMiddlePaths, bodyBottomPaths], [colors1], total, "easeout", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.leftArmAnimation = function() {
	var total = 10;
	var colors1 = generateColors("D1C195", "7B9B8D", total);
	var leftArm1PointsArr = createPaths("M429.5,191.6L435.5,220.1L462.6,246.2L476.1,244.8L458.3,208.4L448.1,189.9Z",
										"M416.2,217.3L410.1,238.8L431.4,283.9L448.2,267.7L443.9,239.5L438.2,221.6Z");
	var leftArm2PointsArr = createPaths("M457.2,244.8L457.2,292.6L462.6,302.6L470.3,290.3L474.2,242L466.5,233Z", 
										"M430.8,267.7L410.1,280.8L409.1,286.1L414.9,291.4L448.2,283.3L445,267.7Z");
	var leftArm3PointsArr = createPaths("M472.8,293.2L469.6,314.2L463.6,316.9L457.2,319.9L454.8,313.7L452.4,307.7L455.3,302.6L457.8,298.2L465.9,285.3Z",
										"M418.7,290.8L397.5,292.4L393.2,286.8L389.2,281.6L393.9,278.4L400,274.2L410.4,277.2L416.6,279.4L424.8,282.3Z");
	var dArr = [false, true, true, false, false, false];
	var kArr = [false, false, false, false, false, false];
	var leftArm1Paths = generatePaths(total, [false], [false], leftArm1PointsArr);
	var leftArm2Paths = generatePaths(total, dArr, kArr, leftArm2PointsArr);
	var leftArm3Paths = generatePaths(total, [true], [false], leftArm3PointsArr);
	playFrams(this.leftArm, [leftArm1Paths, leftArm2Paths, leftArm3Paths], [colors1], total, "easeout", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.rightArmAnimation = function() {
	var total = 10;
	var colors1 = generateColors("D1C195", "7B9B8D", total);
	var rightArm1PointsArr = createPaths("M395.7,231.5L391,247.4L396.6,256.3L406.6,249.9L408.7,221Z", 
										"M376.7,257.3L389.1,268.4L398,265.3L398.8,253.7L383.1,242Z");
	var rightArm2PointsArr = createPaths("M390,249.6L371.5,273.8L375,284.2L407.4,261.1L401.1,244.3Z", 
										"M380.7,271.5L391.3,289.4L402.7,281.7L398.2,260.1L380.3,259.2Z");
	var rightArm3PointsArr = createPaths("M373.6,272.1L363.1,273.4L353,283.9L357.5,292.9L360.1,294.5L365.1,297.6L368,295.6L371.9,292.8L374.7,290.8L381.3,282.8L381.3,276.5Z", "M397,279.8L390.9,279.4L384.5,282.2L380.2,288.8L376.5,294.4L389.4,301.7L397.3,298L405.3,294.3L404.6,290.4L403.9,286.8L403,281.9Z");
	var dArr = [false, false, true, true, false, false];
	var dArr2 = [true, true, false, false, false, true, true, true, false, true, true];
	var rightArm1Paths = generatePaths(total, [false], [false], rightArm1PointsArr);
	var rightArm2Paths = generatePaths(total, dArr, [false], rightArm2PointsArr);
	var rightArm3Paths = generatePaths(total, dArr2, [true], rightArm3PointsArr);
	playFrams(this.rightArm, [rightArm1Paths, rightArm2Paths, rightArm3Paths], [colors1], total, "easeout", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.shortAnimation = function() {
	var total = 10;
	var short1PointsArr = createPaths("M408.1,287.1L431,277.5L437.5,268L438.9,283.6L423.5,296.6L400.3,296.6L403.5,292.7Z", 
										"M413.7,298.3L436.6,288.7L443.1,279.3L444.5,294.8L429.1,307.9L405.8,307.9L409.1,303.9Z");
	var short2PointsArr = createPaths("M377.2,326.2L387.5,335.9L400.3,333.8L413.4,318.9L431,305.9L419.6,287.1L404.1,287.7L392.8,299.7Z", 
										"M379.4,328.6L387.2,343.5L403.4,340.3L416.8,332L437.6,324.1L431.3,303.1L412.6,298.2L396.9,310.4Z");
	var short3PointsArr = createPaths("M438.9,275.2L454.7,287.1L452.3,317.5L460.7,349.7L438.9,353.2L427.3,327.7L417.2,305.9L423.8,283.8Z",
										"M449.8,284.7L463.8,297.1L454.3,326.5L455.2,364.1L433.2,363L426.7,334.2L421.8,312.2L434.1,293.6Z");
	var short1Paths = generatePaths(total, [false], [false], short1PointsArr);
	var short2Paths = generatePaths(total, [false], [false], short2PointsArr);
	var short3Paths = generatePaths(total, [true], [true], short3PointsArr);
	playFrams(this.short, [short1Paths, short2Paths, short3Paths], [], total, "easeout", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.leftLegAnimation = function() {
	var that = this, leftLegNodes = that.leftLeg.node.childNodes;
	Snap(leftLegNodes[1]).animate({
		fill : "#7B9B8D",
		d : "M447.3,343.3L459.5,352.1L470.6,410.6L461.4,414.2L431.7,353.3L429.5,339.8Z"
	}, 400, mina.easeout);
	Snap(leftLegNodes[3]).animate({
		fill : "#7B9B8D",
		d : "M469,416.4L462.4,419.5L451.1,425L437.5,422.6L455,410L470.6,403.4Z"
	}, 400, mina.easeout);
};

WolfMan.prototype.rightLegAnimation = function() {
	var that = this, rightLegNodes = that.rightLeg.node.childNodes;
	Snap(rightLegNodes[1]).animate({
		fill : "#7B9B8D",
		d : "M391.4,336.1L399.2,350.8L391.4,383L381.8,390L380.2,342.7L381.1,330.2Z"
	}, 400, mina.easeout);
	Snap(rightLegNodes[3]).animate({
		fill : "#7B9B8D",
		d : "M391,393.6L384.4,396.8L373.1,402.2L359.5,399.8L377,387.3L392.6,380.7Z"
	}, 400, mina.easeout);
};

WolfMan.prototype.headAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7B9B8D", "505E5B", total);
	var colors2 = generateColors("5A756B", "374547", total);
	var facePointsArr = createPaths("M321.2,251.7L331.4,267.7L336.1,267.2L343.2,266.4L347.7,267.8L355.5,269.1L358,262.2L364.9,260.9L369.9,259.9L373.2,240.3L361.2,228.4L355.1,223.4L338.5,225.7L321.8,229.9L321.2,251.7z", "M336.6,84.9L336.6,84.9L331.8,96.2L343.9,113.1L334,106.2L334.3,109.6L348.2,130.1L360.1,150.6L390.6,150.6L420.4,150.6L417.6,138.4L426,133.3L408.7,127L381.9,100L364,100.9Z");
	var eyePointsArr = createPaths("M338.5,258.6L336.3,247L341.1,261.3L342,265.7L340.2,265.3Z", 
									"M363.6,109.6L360.8,104.1L366.1,109.8L367.2,111.8L365.7,112.5Z");
	var facePaths = generatePaths(total, [true], [false], facePointsArr);
	var eyePaths = generatePaths(total, [true], [false], eyePointsArr);
	playFrams(this.head, [facePaths, eyePaths], [colors1, colors2], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.neckAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7B9B8D", "505E5B", total);
	var neckPointsArr = createPaths("M363.2,244.7l13.4,0.7l3.6-10l28.5-22.2l-25.3-1.1l-26.2,9.3l-2.8,10.9l-2.6,9.9L363.2,244.7z", 
									"M359.9,151L364.6,166.7L369.2,192.2L402.3,178.2L433.5,165L425.4,151.8L418.2,140.1L376.8,142.8L359.9,151Z");
	var neckPaths = generatePaths(total, [true], [false], neckPointsArr);
	playFrams(this.neck, [neckPaths], [colors1], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.bodyAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7B9B8D", "505E5B", total);
	var bodyTopPointsArr = createPaths("M371.2,252.5L373.4,230.7L412.3,208.9L439.5,223.3L428.1,279.1L402.4,279.3Z", 
										"M356.1,213.7L374.2,174.7L430.3,164L456.9,185.4L448.8,226.1L372.3,243.8Z");
	var bodyMiddlePointsArr = createPaths("M398.8,271.4L432.5,225.8L441.3,232.2L446.8,265L423.6,302.3L411,286.6Z", 
										"M374.2,235.8L428.4,206.1L448.8,215L448.8,237.3L385.8,265.5L377.9,251.4Z");
	var bodyBottomPointsArr = createPaths("M414.9,283.5L433.4,264.8L448.3,261.6L448.3,287.2L435.9,303.7L422.4,304.5Z", 
										"M390.6,256.6L418.4,237.3L448.8,237.3L442.1,278.3L423,290.1L397.1,288.3Z");
	var dArr = [false, true, false, true, true, true];
	var bodyTopPaths = generatePaths(total, [true], [false], bodyTopPointsArr);
	var bodyMiddlePaths = generatePaths(total, [true], [false], bodyMiddlePointsArr);
	var bodyBottomPaths = generatePaths(total, [true], [false], bodyBottomPointsArr);
	playFrams(this.body, [bodyTopPaths, bodyMiddlePaths, bodyBottomPaths], [colors1], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.leftArmAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7B9B8D", "505E5B", total);
	var leftArm1PointsArr = createPaths("M416.2,217.3L410.1,238.8L431.4,283.9L448.2,267.7L443.9,239.5L438.2,221.6Z", 
										"M438.7,195.3L443.1,223.7L482.5,249.8L507.3,238.6L476.8,197.9L445.6,173.1Z");
	var leftArm2PointsArr = createPaths("M430.8,267.7L410.1,280.8L409.1,286.1L414.9,291.4L448.2,283.3L445,267.7Z", 
										"M476,245.8L499.3,284.5L508.5,288.6L509.2,272.9L506.4,237.5L487.6,226.9Z");
	var leftArm3PointsArr = createPaths("M418.7,290.8L397.5,292.4L393.2,286.8L389.2,281.6L393.9,278.4L400,274.2L410.4,277.2L416.6,279.4L424.8,282.3Z", 
										"M508.9,273L523.7,288.2L523.7,306.1L501.3,319.4L490.9,306.1L501.3,306.1L501.3,295.8L492.3,288.8L492.3,272Z");
	var dArr = [false, true, true, false, false, false];
	var dArr2 = [false, false, true, true, true, true, true, true, false];
	var leftArm1Paths = generatePaths(total, [false], [true], leftArm1PointsArr);
	var leftArm2Paths = generatePaths(total, dArr, [true], leftArm2PointsArr);
	var leftArm3Paths = generatePaths(total, dArr2, [true], leftArm3PointsArr);
	playFrams(this.leftArm, [leftArm1Paths, leftArm2Paths, leftArm3Paths], [colors1], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.rightArmAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7B9B8D", "505E5B", total);
	var rightArm1PointsArr = createPaths("M376.7,257.3L389.1,268.4L398,265.3L398.8,253.7L383.1,242Z", 
										"M373.8,259.1L385.2,272.2L399.9,259.1L395.7,211.1L373,221.2Z");
	var rightArm2PointsArr = createPaths("M380.7,271.5L391.3,289.4L402.7,281.7L398.2,260.1L380.3,259.2Z", 
										"M373,252.8L348.8,279.5L353.7,290.3L382.2,278.7L389.4,265.6Z");
	var rightArm3PointsArr = createPaths("M397,279.8L390.9,279.4L384.5,282.2L380.2,288.8L376.5,294.4L389.4,301.7L397.3,298L405.3,294.3L404.6,290.4L403.9,286.8L403,281.9Z", 					"M362.9,276.4L349.7,276.4L324.6,286.3L326.7,305.1L335.5,314.2L343.8,314.2L340.7,311.7L342.3,307.9L335.8,303.5L340.3,294.3L352.1,295.7L363.1,290.3Z");
	var dArr = [false, false, false, true, true];
	var dArr1 = [true, true, false, false, false];
	var dArr2 = [true, true, false, false, false, false, false, false, false, false, false, false];
	var rightArm1Paths = generatePaths(total, dArr, [false], rightArm1PointsArr);
	var rightArm2Paths = generatePaths(total, dArr1, [false], rightArm2PointsArr);
	var rightArm3Paths = generatePaths(total, dArr2, [false], rightArm3PointsArr);
	playFrams(this.rightArm, [rightArm1Paths, rightArm2Paths, rightArm3Paths], [colors1], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.shortAnimation2 = function() {
	var total = 10;
	var short1PointsArr = createPaths("M413.7,298.3L436.6,288.7L443.1,279.3L444.5,294.8L429.1,307.9L405.8,307.9L409.1,303.9Z", 
										"M404.3,279.3L432.6,276.3L442.7,268.1L439.5,285.4L418.4,294.5L392.7,287.2L397.5,283.9Z");
	var short2PointsArr = createPaths("M379.4,328.6L387.2,343.5L403.4,340.3L416.8,332L437.6,324.1L431.3,303.1L412.6,298.2L396.9,310.4Z", 
										"M395.4,285.9L360.9,308.4L381.8,324.1L400.5,324.1L418.7,314.3L439.9,302.8L436.4,282.2L421.7,277.2Z");
	var short3PointsArr = createPaths("M449.8,284.7L463.8,297.1L454.3,326.5L455.2,364.1L433.2,363L426.7,334.2L421.8,312.2L434.1,293.6Z",
										"M436.4,273.1L456,281.3L465.6,307.3L476.6,331.7L445.9,339.8L429,321.9L410.2,301.9L419.3,277Z");
	var short1Paths = generatePaths(total, [false], [true], short1PointsArr);
	var short2Paths = generatePaths(total, [true], [false], short2PointsArr);
	var short3Paths = generatePaths(total, [true], [false], short3PointsArr);
	playFrams(this.short, [short1Paths, short2Paths, short3Paths], [], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.leftLegAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7A9A8C", "505E5B", total);
	var colors2 = generateColors("79998B", "505E5B", total);
	var leftLeg1PointsArr = createPaths("M447.3,343.3L459.5,352.1L470.6,410.6L461.4,414.2L431.7,353.3L429.5,339.8Z", 
										"M456.8,322.1L490.9,337.7L510.7,375.7L500,382.1L451.5,354.5L443.4,334.3Z");
	var leftLeg2PointsArr = createPaths("M472.6,416.3L466,419.5L454.7,424.9L441.1,422.5L458.6,410L474.2,403.3Z", 
										"M517.7,378.5L508.2,387.6L491,420.1L465.4,409.4L491,378.5L508.2,367.8Z");
	var dArr = [false, false, false, false, true, false];
	var dArr2 = [false, false, false, false, false, false];
	var leftLeg1Paths = generatePaths(total, dArr, [true], leftLeg1PointsArr);
	var leftLeg2Paths = generatePaths(total, dArr2, [true], leftLeg2PointsArr);
	playFrams(this.leftLeg, [leftLeg1Paths, leftLeg2Paths], [colors1, colors2], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.rightLegAnimation2 = function() {
	var total = 10;
	var colors1 = generateColors("7A9A8C", "505E5B", total);
	var colors2 = generateColors("79998B", "505E5B", total);
	var rightLeg1PointsArr = createPaths("M391.4,336.1L399.2,350.8L391.4,383L381.8,390L380.2,342.7L381.1,330.2Z", 
										"M371.9,309.9L397.9,326L409.2,359.3L395.3,360.1L358.6,330.7L359.4,313Z");
	var rightLeg2PointsArr = createPaths("M391,393.6L384.4,396.8L373.1,402.2L359.5,399.8L377,387.3L392.6,380.7Z", 
										"M407,353.9L413.2,353.9L416.6,362.9L393.4,390.3L356.3,390.3L390.7,362.9L394,353.9Z");
	var dArr = [false, false, false, false, true, false];
	var rightLeg1Paths = generatePaths(total, [false], [true], rightLeg1PointsArr);
	var rightLeg2Paths = generatePaths(total, dArr, [true], rightLeg2PointsArr);
	playFrams(this.rightLeg, [rightLeg1Paths, rightLeg2Paths], [colors1, colors2], total, "easein", this.easeinParam, this.easeinPower, this.easeoutParam, this.easeoutPower);
};

WolfMan.prototype.prepareWholeBodyAnimation = function() {
	var that = this;
	that.headAnimation();
	that.neckAnimation();
	that.bodyAnimation();
	that.leftArmAnimation();
	that.rightArmAnimation();
	that.shortAnimation();
	that.leftLegAnimation();
	that.rightLegAnimation();
	setTimeout(that.strechWholeBodyAnimation.bind(that), 1200);
};

WolfMan.prototype.strechWholeBodyAnimation = function() {
	var that = this;
	that.headAnimation2();
	that.neckAnimation2();
	that.bodyAnimation2();
	that.leftArmAnimation2();
	that.rightArmAnimation2();
	that.shortAnimation2();
	that.leftLegAnimation2();
	that.rightLegAnimation2();
};

WolfMan.prototype.doAnimation = function() {
	this.reset();
	this.sunAnimation();
	this.moonAnimation(this.prepareWholeBodyAnimation);
};

function PackMan() {
	this.svg = Snap("#packman-svg"),
	this.table = this.svg.select("#packman-table"),
	this.tableSide = this.svg.select("#packman-tableSide"),
	this.foot = this.svg.select("#packman-foot"),
	this.packman = this.svg.select("#packman-packman"),
	this.cherry = this.svg.select("#packman-cherry");
}

PackMan.prototype.init = function() {

};

PackMan.prototype.reset = function() {
    this.table.attr({
        transform : "matrix(1,0,0,1,0,0)"
    });
    this.tableSide.attr({
		transform : "matrix(1,0,0,0,0,350)"
	});
	this.foot.attr({
		transform : "matrix(1,0,0,0,0,250)"
	});
    this.packman.attr({
		transform : "matrix(1,0,0,1,0,0)"
	});
	this.cherry.attr({
        opacity : 1
    });
};

PackMan.prototype.tableAnimation = function() {
	this.table.animate({
		transform : "matrix(1,0,0,0,0,225)"
	}, 880, mina.linear);
	this.tableSide.animate({
		transform : "matrix(1,0,0,1,0,0)"
	}, 1000, mina.linear);
	this.foot.animate({
		transform : "matrix(1,0,0,1,0,0)"
	}, 1000, mina.linear);
};

PackMan.prototype.packmanAnimation = function() {
	var that = this, isAnimationFinished = false, isMouseOpen = true, packmanNodes = that.packman.node.childNodes;
	var packmanPathArr = ["M38.8,189.1L46.6,184.1L65.6,172.8L65.6,172.8L56.3,163.8L41.7,161L28.2,170.4L24.7,183.3L30.6,194.4Z",
						"M64.4,192.6L64.4,192.6L46.6,181.1L36.8,175.9L27.2,178.7L25.2,185.1L27.2,192.6L39.1,200.2L55.7,200.2Z",
						"M38.8,189.1L46.6,184.1L67.4,180.4L65.6,172.8L56.3,163.8L41.7,161L28.2,170.4L24.7,183.3L30.6,194.4Z",
						"M64.4,192.6L67.4,180.4L46.6,181.1L36.8,175.9L27.2,178.7L25.2,185.1L27.2,192.6L39.1,200.2L55.7,200.2Z"]
	setTimeout(function() {
		that.packman.animate({
			transform : "matrix(1,0,0,1,380,0)"
		}, 1800, mina.linear);
	}, 200);
	setTimeout(function() {
		that.cherry.attr({
			opacity : 0
		});
		isAnimationFinished = true;
	}, 1900);
	var packmanInterval = setInterval(function() {
		if (isAnimationFinished === true) {
			setTimeout(function() {
				Snap(packmanNodes[1]).animate({
					d : packmanPathArr[0]
				}, 200, mina.linear);
				Snap(packmanNodes[3]).animate({
					d : packmanPathArr[1]
				}, 200, mina.linear);
			}, 1);
			clearInterval(packmanInterval);
		}
		if (isMouseOpen === true) {
			Snap(packmanNodes[1]).animate({
				d : packmanPathArr[2]
			}, 200, mina.linear);
			Snap(packmanNodes[3]).animate({
				d : packmanPathArr[3]
			}, 200, mina.linear);
			isMouseOpen = false;
		} else {
			Snap(packmanNodes[1]).animate({
				d : packmanPathArr[0]
			}, 200, mina.linear);
			Snap(packmanNodes[3]).animate({
				d : packmanPathArr[1]
			}, 200, mina.linear);
			isMouseOpen = true;
		}
	}, 200);
};

PackMan.prototype.doAnimation = function() {
	var that = this;
    that.reset();
	setTimeout(that.tableAnimation.bind(that), 500);
	setTimeout(that.packmanAnimation.bind(that), 1800);
};

function Lamp() {
	this.easeinPower = 1.4;
	this.easeinParam = 10;
	this.easeoutPower = 0.6;
	this.easeoutParam = 20;
	this.d1 = 800;
	this.d2 = 800;
	this.svg = Snap("#lamp-svg"),
	this.head = this.svg.select("#lamp-head"),
	this.body = this.svg.select("#lamp-body"),
	this.leftArm = this.svg.select("#lamp-leftArm"),
	this.rightArm = this.svg.select("#lamp-rightArm"),
	this.jacket = this.svg.select("#lamp-jacket"),
	this.hat = this.svg.select("#lamp-hat");
}

Lamp.prototype.init = function() {

};

Lamp.prototype.reset = function() {
	var that = this, i, hatNodes = that.hat.node.childNodes, headNodes = that.head.node.childNodes, jacketNodes = that.jacket.node.childNodes,
		bodyNodes = that.body.node.childNodes, leftArmNodes = that.leftArm.node.childNodes, rightArmNodes = that.rightArm.node.childNodes;
	var hatPathArr = [
		"M124.6,36.9L153.7,18.7L169.9,15.1L197.2,19L248.5,65.8L239.7,49.9L145.3,35.8L124.6,36.9z",
		"M117.1,38.4L105.5,51.3L91.4,67.1L102.1,81.8L122.7,84.4L169.7,68.7L195.2,70.3L224.2,73.7L233,79.9L248.5,65.8L239.7,49.9L227.1,38L217.8,29.4L188.2,29.4L161.6,29.4L142.6,33.2Z",
		"M104.4,82.3L113.1,56.9L131.4,35.3L134.4,35.3L119.4,53.1L112.9,63.9L105.5,82.4Z",
		"M153.6,31L137.8,57.8L136.7,79.7L140.5,57.6L155,31Z",
		"M194.5,29.4L181.9,51.7L182.8,68.2L184.5,69.3L184.5,52.9L194.5,32.3Z",
		"M220.4,31.7L206.3,49.3L200.5,70.9L207.7,50.5L220.4,31.7z",
		"M232.6,43.2L219.6,55.4L211.9,72.3L213.3,72.3L219.6,57.7Z",
		"M244.7,58.8L229.8,66.4L227.1,75.7L228.4,76.7L230.9,67.7Z",
		"M93,69.3L100.8,82.4L122.7,84.4L169.7,68.7L199,70.8L220.4,73.2L224.2,73.7L233,79.9L238.5,74.9L228.1,64.4L215.9,61.9L197.5,55.4L164.8,58.8L119.4,72.3Z",
		"M163.8,44.4l3.9-4.3l6.5,0l2.5,4.8l-1.1,4.5l-5.7,2l-4.2-2L163.8,44.4z",
		"M171,40.8L168.1,40.8L165.2,44.7L166.7,48.2L168.1,48.2L168.1,44.5L171.5,43.2Z"
	];
	var headPathArr = [
		"M103.8,107.3L117.6,69.3L160.9,57.1L181.8,58L212.6,65.6L231.6,107.3L219,134.6L164.8,144.5L105.5,132.9Z",
		"M165.4,89.9L173.4,89.4L186.9,88.5L204,95.8L210.4,99.6L217.2,104.1L222.5,105.8L226.2,108.6L229.5,110.7L227.9,116.8L224,123.9L199.3,126.2L184.2,121.4L170.8,116.8L164,115.4L160.8,117.1L134.1,123.7L116.8,126.2L106.6,121.1L103.2,113L101.5,106.3L104.6,103.8L108,103.5L117.1,100.8L128,96.3L144.5,89.9L160.8,89.9Z"
	];
	var jacketPathArr = [
		"M246.9,125.4L261.6,131.3L270.6,146.6L246.9,205.8L250.6,239.4L238.5,249.3L190,249.3L200.4,193.4L215.9,163.1L232.6,140.2Z",
		"M102.3,124L79.8,135.3L51.5,152.5L76.9,183.6L86.7,212.3L86.7,240.2L90.6,254.2L98.8,264.8L151.5,249.3L141.7,208L134.4,187.4L119.4,157.4Z"
	];

	this.hat.attr({
		opacity : 0,
		transform : "t0,50s0.9"
	});
	for (i = 0; i < hatPathArr.length; i++) {
		Snap(hatNodes[2 * i + 1]).attr({
			d : hatPathArr[i]
		});
	}

	this.head.attr({
		opacity : 0,
		transform : "t0,50s0.9"
	});
	for (i = 0; i < headPathArr.length; i++) {
		Snap(headNodes[2 * i + 1]).attr({
			d : headPathArr[i]
		});
	}

	this.jacket.attr({
		opacity : 0,
		transform : "t0,10s0.8"
	});
	for (i = 0; i < jacketPathArr.length; i++) {
		Snap(jacketNodes[2 * i + 1]).attr({
			d : jacketPathArr[i]
		});
	}

	Snap(bodyNodes[1]).attr({
		transform : "matrix(0,0,0,0,148,282.15)"
	});
	Snap(bodyNodes[3]).attr({
		transform : "matrix(0,0,0,0,162.2,341.7)"
	});
	Snap(bodyNodes[5]).attr({
		transform : "matrix(0,0,0,0,176.6,383.05)"
	});
	Snap(bodyNodes[7]).attr({
		transform : "matrix(0,0,0,0,197.45,409.55)"
	});

	that.leftArm.attr({
		opacity : 0,
		transform : "t-20,0s0.9"
	});
	Snap(leftArmNodes[1]).attr({
		d : "M258.4,145.5L273.6,170.3L284.1,200L253.2,246.4L240.1,193.1Z"
	});
	Snap(leftArmNodes[3]).attr({
		d : "M284.1,212.7L253.2,229.6L253.2,282.5L283.8,296.1L307.6,242.2Z",
		transform : "matrix(1,0,0,1,0,0)"
	});
	Snap(leftArmNodes[5]).attr({
		d : "M265.1,309.8L281.8,300.8L284.1,288.5L267.6,277.3L257.8,289.5L259.5,304.2Z",
		transform : "matrix(1,0,0,1,0,0)"
	});

	that.rightArm.attr({
		opacity : 0,
		transform : "t20,0s0.9"
	});
	Snap(rightArmNodes[1]).attr({
		d : "M61.4,149L34.7,165.3L25.6,205.1L59.6,223.4L82.4,198.7L61.4,149z"
	});
	Snap(rightArmNodes[3]).attr({
		d : "M53.9,233.6L28,222.3L10.7,250L22.1,283.6L58,286.5L61.7,245.1L53.9,233.6z",
		transform : "matrix(1,0,0,1,0,0)"
	});
	Snap(rightArmNodes[5]).attr({
		d : "M39.6,306.1L47.7,318.5L65.2,324.1L68.3,318.5L65.2,312.1L61.2,301.7L52.2,295.4Z",
		transform : "matrix(1,0,0,1,0,0)"
	});
};

Lamp.prototype.headAnimation = function() {
	var that = this, headNodes = that.head.node.childNodes;
	that.head.animate({
		opacity : "1",
		transform : "t0,0s1"
	}, that.d1, mina.linear);
	Snap(headNodes[1]).animate({
		d : "M109.9,100.8L121.4,60.6L165.8,41.7L191.1,41.7L217.8,54.8L237.8,100.8L246,137.6L177.9,148.3L96.8,127Z"
	}, that.d1, mina.easein);
	Snap(headNodes[3]).animate({
		d : "M171.3,89.3L179.6,82.9L192.9,80.3L210.1,89.3L215.5,97.5L227.6,110L245,104L237.6,88.5L239.7,89.3L252.7,102.8L247.7,112.8L218.4,123.8L190.3,114.9L173.6,108.7L171.3,101.2L166.9,110.5L140.3,117.2L113.6,123.8L98.9,104L101,92.3L109.9,88.4L106.7,94.1L111.5,104L126.1,98.9L134.1,89.7L149.7,79.2L166.9,83.3Z"
	}, that.d1, mina.easein);
};

Lamp.prototype.jacketAnimation = function() {
	var that = this;
	that.jacket.animate({
		opacity : 1,
		transform : "t0,0s1"
	}, that.d1, mina.linear);
};

Lamp.prototype.bodyAnimation = function() {
	var that = this, bodyNodes = that.body.node.childNodes;
	Snap(bodyNodes[7]).animate({
		transform : "s1",
		d : "M187.5,378.7L187.1,366.5L187.3,366.4L195.5,328.7L183,312.3L118.5,323.8L125,355.7L141.2,372.7L148.8,380.1L185.8,399.4L197,406Z"
	}, 2500, mina.easein);
	setTimeout(function(){
		Snap(bodyNodes[5]).animate({
			transform : "s1",
			d : "M121.5,273.4L102.3,286.9L111.9,338.5L149.3,346.7L207.5,318L211.6,281.2L173,265.6Z"
		}, 1900, mina.easein);
	}, 600);
	setTimeout(function(){
		Snap(bodyNodes[3]).animate({
			transform : "s1",
			d : "M226.9,213.4L244,256.3L209.7,297.3L113.5,283.9L79.8,240.2L91.5,213.4L129.7,205.8L166.5,212.5L192.7,209.6Z"
		}, 1500, mina.easein);
	}, 1000);
	setTimeout(function(){
		Snap(bodyNodes[1]).animate({
			transform : "s1",
			d : "M103.7,127.1L81.8,141L51.5,173.8L112.3,258.2L188.5,258.2L227.6,258.2L263.8,228.7L288.4,172.1L246.9,125.4L178.3,118Z"
		}, 1100, mina.easein);
	}, 1400);
	setTimeout(function(){
		that.hatAnimation();
		that.headAnimation();
		that.jacketAnimation();
		that.leftArmAnimation();
		that.rightArmAnimation();
		setTimeout(that.bowAnimation.bind(that), 1500);
	}, 1800);
};

Lamp.prototype.leftArmAnimation = function() {
	var that = this, leftArmNodes = that.leftArm.node.childNodes;
	var leftArmPathArr = [
		"M256,141.6L302.6,170.2L319,253.8L278.1,290.7L240.1,222.6Z",
		"M307.8,241.9L264.2,267.7L262.7,336.1L294.7,329.6L316.7,252.5Z",
		"M267.2,357L292.1,336.1L293.9,324.4L266.1,321.1L261.5,344.7L253.2,355.5Z"
	];
	that.leftArm.animate({
		opacity : 1,
		transform : "t0,0s1"
	}, that.d1, mina.linear);
	for (var i = 0; i < leftArmPathArr.length; i++) {
		Snap(leftArmNodes[2 * i + 1]).animate({
			d : leftArmPathArr[i]
		}, that.d1, mina.easein);
	}
};

Lamp.prototype.rightArmAnimation = function() {
	var that = this, rightArmNodes = that.rightArm.node.childNodes;
	var rightArmPathArr = [
		"M57.1,149L41.2,163.2L19,256.6L73.5,287.8L91.6,213.5L57.1,149z",
		"M61.2,252.7L24.2,233.1L16.5,265.6L47.4,335.2L72.7,320.7L70.6,259.6L61.2,252.7z",
		"M47.4,335.1L67.8,350.4L85.6,350.4L83.5,344.5L78,342.7L75.5,329.5L70.9,314.4Z"
	];
	that.rightArm.animate({
		opacity : 1,
		transform : "t0,0s1"
	}, that.d1, mina.linear);
	for (var i = 0; i < rightArmPathArr.length; i++) {
		Snap(rightArmNodes[2 * i + 1]).animate({
			d : rightArmPathArr[i]
		}, that.d1, mina.easein);
	}
};

Lamp.prototype.hatAnimation = function() {
	var that = this;
	that.hat.animate({
		opacity : "1",
		transform : "t0,0s1"
	}, that.d1, mina.linear);
};

Lamp.prototype.pop2BodyAnimation = function() {
	var that = this, bodyNodes = that.body.node.childNodes;
	var bodyPathArr = [
		"M103.7,127.1L81.8,141L51.5,173.8L112.3,258.2L188.5,258.2L227.6,258.2L263.8,228.7L288.4,172.1L246.9,125.4L178.3,118Z",
		"M226.9,213.4L244,256.3L209.7,297.3L113.5,283.9L79.8,240.2L91.5,213.4L129.7,205.8L166.5,212.5L192.7,209.6Z",
		"M121.5,273.4L102.3,286.9L111.9,338.5L149.3,346.7L207.5,318L211.6,281.2L173,265.6Z",
		"M187.5,378.7L187.1,366.5L187.3,366.4L195.5,328.7L183,312.3L118.5,323.8L125,355.7L141.2,372.7L148.8,380.1L185.8,399.4L197,406Z"
	];
	for (var i = 0; i < bodyPathArr.length; i++) {
		Snap(bodyNodes[2 * i + 1]).animate({
			d : bodyPathArr[i]
		}, that.d1, mina.easein);
	}
};

Lamp.prototype.hatAnimation2 = function() {
	var that = this, hatNodes = that.hat.node.childNodes;
	var hatPathArr = [
		"M108.8,81.8L117.8,67.7L145.8,59.5L198.9,61.8L217,79.7L209.5,108.8L117.8,108.8L108.8,81.8z",
		"M108.8,81.8L89.6,100.6L86.1,122.3L114.3,133.7L161.5,135L184.7,135L213.2,129.2L227.6,123.4L241.5,112.2L217,79.7L213,93.1L201.2,103.2L179.8,108.2L153.5,107.9L125.3,105.6L113.5,94.9Z",
		"M101.9,128.9L106.6,111.8L116.2,97.1L117.8,97.1L109.9,109.2L106.4,116.5L102.5,129Z",
		"M146.5,106.1L143.1,125.8L148.6,137.1L144.9,124.6L147.4,105.6Z",
		"M176.3,105.5L174.5,124.6L180.5,135.1L182.1,135.2L176.7,124.4L177.2,107.4Z",
		"M187.7,104.2L187.5,118.8L197.6,133.1L190.2,119.3L187.7,104.2z",
		"M204.3,103.2L204.9,116.9L212.4,128.9L214.7,128.6L207.2,116.8Z",
		"M214.7,83.6L214.8,108L231.2,119.3L233.1,118L217.3,107.4Z",
		"M88.4,114.4L86.1,122.3L114.3,133.7L165.8,136.2L193.9,133.1L215.7,128.2L222.3,125.5L241.5,112.2L236.5,105.6L226.1,114.3L213,119.6L194.3,125.7L164.2,128.7L114.8,127.4Z",
		"M155.8,121L159.7,118.1L166.2,118.1L168.7,121.3L167.6,124.3L161.9,125.6L157.7,124.3L155.8,121z",
		"M163.2,118.4L160.1,118.6L156.7,120.9L157.4,122.2L158.9,122.2L160.3,121.2L162.9,119.7Z"
	];

	for (var i = 0; i < hatPathArr.length; i++) {
		Snap(hatNodes[2 * i + 1]).animate({
			d : hatPathArr[i]
		}, that.d2, mina.easein);
	}
};

Lamp.prototype.headAnimation2 = function() {
	var that = this, headNodes = that.head.node.childNodes;
	Snap(headNodes[1]).animate({
		d : "M88.1,128.8L105.3,108L155.5,92L185,94.7L213.4,102.6L237.6,122.9L243.1,157.4L165.2,174.2L82.6,160.1Z"
	}, that.d2, mina.easein);
	Snap(headNodes[3]).animate({
		d : "M160.8,149L167.8,145L182.3,144.6L199.5,147.2L205.7,149L216,151.6L240.8,150.6L233.9,146L236,146.3L249.1,150.2L244,153.1L213.4,158.7L179.6,159.1L165.2,154.6L160.7,150.7L153.5,155.6L128.5,160.4L101,157.2L84.3,150.7L84.9,147.1L93.8,146L90.6,147.7L95.4,150.5L113.2,150.1L123.5,147.4L139.1,144.3L156.3,145.5Z"
	}, that.d2, mina.easein);
};

Lamp.prototype.jacketAnimation2 = function() {
	var that = this, jacketNodes = that.jacket.node.childNodes;
	Snap(jacketNodes[1]).animate({
		d : "M222.9,124.7L235.5,126.9L270.6,146.6L260.7,222L238.6,240.6L228.5,252.8L186.5,241.4L200.4,193.4L215.9,163.1L225.8,141.7Z"
	}, that.d2, mina.easein);
	Snap(jacketNodes[3]).animate({
		d : "M97.8,122.9L72.2,132.4L53,139.8L72.3,182.5L77,212L79.4,222.1L83.2,236.1L88.3,247.3L140.3,243.1L137.1,206.9L129.8,186.3L114.8,156.3Z"
	}, that.d2, mina.easein);
};

Lamp.prototype.bodyAnimation2 = function() {
	var that = this, bodyNodes = that.body.node.childNodes;
	Snap(bodyNodes[1]).animate({
		d : "M95.9,124.6L53.3,138.5L53.3,187.3L101,254.9L161.2,259.5L218.7,254.6L260.6,223.1L268.6,147.7L235.5,126.9L166.9,119.8Z"
	}, that.d2, mina.easein);
	Snap(bodyNodes[3]).animate({
		d : "M223.7,231.6L237.6,266.5L206.8,299.7L110.3,302.1L83.2,272L88.4,231.6L126.5,223.9L159.5,222L192.3,225.1Z"
	}, that.d2, mina.easein);
};

Lamp.prototype.leftArmAnimation2 = function() {
	var that = this, leftArmNodes = that.leftArm.node.childNodes;
	Snap(leftArmNodes[1]).animate({
		d : "M218.7,128.8L266.8,154.9L306.4,238.3L249.3,247.3L207.3,210.7Z"
	}, that.d2, mina.easein);
	Snap(leftArmNodes[3]).animate({
		transform : "r66,305,240"
	}, that.d2, mina.easein);
	Snap(leftArmNodes[5]).animate({
		transform : "r66,305,240"
	}, that.d2, mina.easein);	
};

Lamp.prototype.rightArmAnimation2 = function() {
	var that = this, rightArmNodes = that.rightArm.node.childNodes;
	Snap(rightArmNodes[1]).animate({
		d : "M55.2,139.2L19.4,188.2L36.4,269L95.9,254.7L96.2,194.7L55.2,139.2z"
	}, that.d2, mina.easein);
	Snap(rightArmNodes[3]).animate({
		transform : "r-47,80,240t12,-10"
	}, that.d2, mina.easein);
	Snap(rightArmNodes[5]).animate({
		transform : "r-53,80,240t8,-13"
	}, that.d2, mina.easein);
};

Lamp.prototype.bowAnimation = function() {
	this.hatAnimation2();
	this.headAnimation2();
	this.jacketAnimation2();
	this.bodyAnimation2();
	this.leftArmAnimation2();
	this.rightArmAnimation2();
};

Lamp.prototype.doAnimation = function() {
	this.reset();
	this.bodyAnimation();
};