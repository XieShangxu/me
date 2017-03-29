$(function(){
	var colorArr = ["#abca08", "#08caa4", "#08b1ca"];
	var ua = window.navigator.userAgent;
	var touch = {}, screenHeight = $(window).height(), screenWidth = $(window).width(), iMaxIndex = 7, isMobile = false;
	var watermelonSvg = new WaterMelon(), svg1done = false, dragonSvg = new Dragon(), svg2done = false,
		wolfmanSvg = new WolfMan(), svg3done = false, packmanSvg = new PackMan(), svg4done = false,
		lampSvg = new Lamp(), svg5done = false;
	var bCanScroll = false, iCurPage = 0, bDoingAnimation = false, bDoingScrolling = false, bAnimating = false, bPolygonsAnimated = false,
		thumbAnimated = false, teamTextAnimated = false, iUncompServContCount = 5, aUncompServCont = [], iUncompTeamContCount = 6,
		aUncompTeamCont = [], isIntroAnimated = false, isToServiceAnimated = false, isToContactusAnimated = false;
	var aTeamMember = [{
		name: "Crow 袁尧",
		title: "Creative Director 创意总监",
		mottoEn: "Try hard to keep an interesting life.",
		mottoCh: "见过世面，闯过江湖的金牌copywirter。左手可做闲情诗赋，风花雪月。右手立转翻云覆雨，逐鹿中原。<br />跑新闻，做编辑，干文指那会儿，接触的都是有身份证的客户，巴黎欧莱雅，资生堂，华润紫云府，武汉保利，深圳万科等等等等等，就算是窝在家里非要体验宅男专栏码字，还有小粉丝天天喊男神，求签名呢。"
	}, {
		name: "Nico 张位蕖",
		title: "Planning Director 策划总监",
		mottoEn: "Waste the life in my favorite way.",
		mottoCh: "美国佛罗里达州立大学信息传播学院高才女硕士，练就的是神级的脑洞大开策划本领。<br />毕业于美国佛罗里达州立大学信息传播学院, 新锐大脑洞策划人。坚信好洞察、好策略不单单只有创意，更来源于对数据、信息的分析、整理和挖掘。谷歌，Burger King，万达，新城，都是合作过的客户。"
	}, {
		name: "Huth Hu 胡思",
		title: "Graphic Design 平面设计",
		mottoEn: "Multiple personality disorder.",
		mottoCh: "资深天蝎设计师，虽不像处女座事儿，但也是美感强迫症患者。大小广告公司都曾摸爬滚打过，什么都忘了，唯一记得的就是创意的兴奋和对视觉美的不妥协。工作时死做，玩耍时作死。"
	}, {
		name: "Summer 夏琳",
		title: "Motion Design 动画设计师",
		mottoEn: "Try hard to keep an interesting life.",
		mottoCh: "资深双鱼手绘师，偶尔神经大条加抽风，严重的选择恐惧症患者外加强迫症。一年半的动画设定设计师经验，练就了天马行空的变态想象力。哪里都好，就是画画的时候喜欢作死，画面必须严谨加创意，差一点？不行，熬夜也要重新画出来。"
	}];
	var bgImgs = ["http://onigvgkly.bkt.clouddn.com/animation/strategyBg.jpg", "http://onigvgkly.bkt.clouddn.com/animation/designBg.jpg", "http://onigvgkly.bkt.clouddn.com/animation/contentBg.jpg", "http://onigvgkly.bkt.clouddn.com/animation/socialMediaBg.jpg", "http://onigvgkly.bkt.clouddn.com/animation/techBg.jpg"];

	// for mobile
	if (/mobile/i.test(ua)) {
		isMobile = true;
		$("html").addClass("mobile");
	}

	function scrollTransDown() {
		bDoingScrolling = true;
		if (iCurPage === 0) {
            $(".header").css({
            	"top" : 0,
            	"opacity" : 1
            });
        } else if (iCurPage >= 1) {
        	if (iCurPage < iMaxIndex - 1) {
        		$(".header").get(0).className = "header green";
        		$(".nav-dots").addClass("show");
        		$(".cur").removeClass("cur");
        		$(".nav-dot").eq(iCurPage - 1).addClass("cur");
        	} else {
        		$(".nav-dots").removeClass("show");
        		$(".cur").removeClass("cur");
        	}
        }
        
        iCurPage++;
		$(".content").css({
			'top' : (-iCurPage * 100) + '%'
		});

		setTimeout(function(){
            bDoingScrolling = false;
            if (iCurPage === iMaxIndex) {
	        	$("body").css({
	        		"position": "relative",
	        		"overflow": "auto"
	        	});
	        	$(".header").get(0).className = "header tcolor";
	        	fadeInAnimation();
	        	teamContentAnimation();
	        } else {
	        	$("body").css({
	        		"position": "fixed",
	        		"overflow": "hidden"
	        	});
	        }
	        if (iCurPage === 1 && !isIntroAnimated) {
	        	$(".intro-en").removeClass("fadein");
	        	setTimeout(function(){
	        		$(".intro-ch").attr("class", "intro-ch");
	        	}, 150);
	        	return;
	        }
        }, 800);
        setTimeout(function(){
        	svgAnimation();
        }, 1000);
	}

	function scrollTransUp() {
		bDoingScrolling = true;
		if (iCurPage === 1) {
			$(".header").css({
				"top" : "-300px",
				"opacity" : 0
			});
		}
		if (iCurPage <= 2) {
			$(".header").get(0).className = "header";
			$(".nav-dots").removeClass("show");
			$(".cur").removeClass("cur");
		} else if (iCurPage <= iMaxIndex) {
			$(".header").get(0).className = "header green";
			$(".cur").removeClass("cur");
			$(".nav-dot").eq(iCurPage - 3).addClass("cur");
			if (iCurPage === iMaxIndex) {
				$(".nav-dots").addClass("show");
			}
		}
		iCurPage--;
		$(".content").css({
			'top' : (-iCurPage * 100) + '%'
		});
        if (iCurPage === iMaxIndex) {
        	$("body").css({
        		"position": "relative",
        		"overflow": "auto"
        	});
        } else {
        	$("body").css({
        		"position": "fixed",
        		"overflow": "hidden"
        	});
        }
        setTimeout(function(){
            bDoingScrolling = false;
            if (iCurPage === 1 && !isIntroAnimated) {
	        	$(".intro-en").removeClass("fadein");
	        	setTimeout(function(){
	        		$(".intro-ch").attr("class", "intro-ch");
	        	}, 150);
	        	return;
	        }
        }, 800);
        setTimeout(function(){
        	svgAnimation();
        }, 1000);
	}

	function fadeInAnimation() {
		if (!teamTextAnimated && !isMobile) {
			$(".info-text").velocity({
				'margin-top': "-400px",
				opacity: 1
			}, {
				duration: 600
			});
			teamTextAnimated = true;
		}
		if (!thumbAnimated && !isMobile) {
    		thumbAnimated = true;
        	$(".rotate-cube").each(function(index, item){
        		var random = Math.round(Math.random() * 300);
        		setTimeout(function(){
        			$(item).addClass("animated");
        		}, random);
        	});
        }
	}

	function serviceContentAnimation() {
		if (isMobile && iUncompServContCount) {
			var scrollTop = $("body").scrollTop() || $("html").scrollTop();
			$(".item-content").each(function(index, item){
				if ($.inArray(index, aUncompServCont) < 0) {
					var offsetTop = $(item).offset().top;
					if (scrollTop + screenHeight >= offsetTop && scrollTop <= offsetTop) {
						$(item).velocity({
							marginTop: '-40px',
							marginBottom: 0,
							opacity: 1
						}, 400);
						aUncompServCont.push(index);
						iUncompServContCount--;
					}
				}
			});
		}
	}

	function teamContentAnimation() {
		if (isMobile && iUncompTeamContCount) {
			var scrollTop = $("body").scrollTop() || $("html").scrollTop();
			$(".thumb").each(function(index, item){
				if ($.inArray(index, aUncompTeamCont) < 0) {
					var offsetTop = $(item).offset().top;
					if (scrollTop + screenHeight >= offsetTop && scrollTop <= offsetTop) {
						$(item).animate({
							marginTop: '80px'
						}, 1000, "swing", function(){
							$(item).css({
								'box-shadow': '0 0 0 20px rgba(171, 202, 6, .3)'
							}).find('.img-box').css({
								'background-position': 'center -220px'
							});
						});
						aUncompTeamCont.push(index);
						iUncompTeamContCount--;
					}
				}
			});
		}
	}

	function scrollTrans(e) {
		if ($(".nav").hasClass("open")) {
			return false;
		}
		if (bAnimating) {
			e.preventDefault();
			return false;
		}
		var delta = e.wheelDelta !== undefined ? e.wheelDelta : -e.detail;
		var scrollTop = $("body").scrollTop() || $("html").scrollTop();
		if (bDoingScrolling === false) {
			if (delta < 0 && iCurPage < iMaxIndex) {
				scrollTransDown();
				return;
			} else if (delta > 0 && iCurPage !== 0) {
				if (scrollTop === 0) {
					scrollTransUp();
					return;
				}
			}
			if (iCurPage === iMaxIndex) {
				var iServiceOffsetTop = $(".service-info").offset().top,
					iContactusOffsetTop = $(".contactus-info").offset().top;
				if (scrollTop < iServiceOffsetTop) {
					$(".header").get(0).className = "header tcolor";
					if (scrollTop < 400) {
						fadeInAnimation();
					}
					if (!isToServiceAnimated && scrollTop + screenHeight > $(".to-service").offset().top + screenHeight / 5) {
						$(".to-service").removeClass("fadein");
						isToServiceAnimated = true;
					}
				} else if (scrollTop < iContactusOffsetTop) {
					$(".header").get(0).className = "header scolor";
				} else {
					$(".header").get(0).className = "header ccolor";
					if (scrollTop >= $(".footer-main").offset().top) {
            $("#video").css({
              "position": "fixed",
              "top": videoYDelta - triangleHeight
            });
          } else {
            $("#video").css({
              "position": "absolute",
              "top": videoYDelta
            });
          }
				}
				if (!isToContactusAnimated && scrollTop + screenHeight > $(".to-contactus").offset().top + screenHeight / 5) {
					$(".to-contactus").removeClass("fadein");
					isToContactusAnimated = true;
				}
			}
			var iPolygonsOffsetTop = $(".polygons").offset().top;
			if (iCurPage === iMaxIndex && scrollTop > 0 && scrollTop + screenHeight >= iPolygonsOffsetTop + 20 && !bPolygonsAnimated) {
				bPolygonsAnimated = true;
				var durition = 200, iCur = 0, total = $(".polygons path").length;
				var scrollInterval = setInterval(function(){
					var $path = $(".contactus-info svg path").eq(iCur)
					$path.css('opacity', $path.attr('opacity') || 1);
					iCur++;
					if (iCur === total) {
						clearInterval(scrollInterval);
					}
				}, durition);
			}
		}
	}

	// for firefox
	if(/firefox/i.test(ua) && document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollTrans, false);
    }

	window.onmousewheel = document.onmousewheel = scrollTrans;

	function swipeDirection(x1, x2, y1, y2) {
        if (y1 - y2 > 20) {
            return "Up";
        } else if (y2 - y1 > 20) {
            return "Down";
        }
	}

	$(document).on("touchstart", function(e) {
		if (bDoingScrolling) {
			return;
		}
		var target = e.target;
		touch = {};
		if ($(target).hasClass("menu-icon") || $(target).hasClass("menu")) return;
		// if ($(".nav").hasClass("open")) return false;
		var point = e.touches ? e.touches[0] : e.originalEvent.touches[0];
	    var x = Number(point.pageX);
	    var y = Number(point.pageY);
	    touch.x1 = x;  
	    touch.y1 = y;  
	}).on("touchmove", function(e) {
		if ($(".nav").hasClass("open")) return false;
		if (iCurPage < iMaxIndex) {
	    	e.preventDefault();
	    }
		if (bDoingScrolling) {
			return;
		}
		var target = e.target;
		if ($(target).hasClass("menu-icon") || $(target).hasClass("menu")) return;
		if ($(".nav").hasClass("open")) return false;
		var point = e.touches ? e.touches[0] : e.originalEvent.touches[0];
	    var x = Number(point.pageX);
	    var y = Number(point.pageY);
	    touch.x2 = x;
	    touch.y2 = y;
		var scrollTop = $("body").scrollTop() || $("html").scrollTop();
	    var direction = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
	    if (iCurPage === iMaxIndex && scrollTop === 0 && direction === "Down") {
	    	e.preventDefault();
	    }
	}).on("touchend", function(e) {
		if (bDoingScrolling) {
			return;
		}
		var target = e.target;
		if ($(target).hasClass("menu-icon") || $(target).hasClass("menu")) return;
		var direction = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
		if ($(".nav").hasClass("open") && direction) {
			return false;
		}
		var scrollTop = $("body").scrollTop() || $("html").scrollTop();
		if (iCurPage < iMaxIndex && direction === "Up") {
			scrollTransDown();
		} else if (iCurPage !== 0 && direction === "Down") {
			if (iCurPage === iMaxIndex && scrollTop > 0) {
				
			} else {
				scrollTransUp();
			}
		}
		if (iCurPage === iMaxIndex && scrollTop > 0) {
			// if (!teamTextAnimated) {
			// 	$(".info-text").velocity({
			// 		'margin-top': 0,
			// 		opacity: 1
			// 	}, {
			// 		duration: 600
			// 	});
			// 	teamTextAnimated = true;
			// }
			var iServiceOffsetTop = $(".service-info").offset().top,
				iContactusOffsetTop = $(".contactus-info").offset().top,
				iPolygonsOffsetTop = $(".polygons").offset().top;
			if (scrollTop < iServiceOffsetTop) {
				$(".header").get(0).className = "header tcolor";
				teamContentAnimation();
				if (!isToServiceAnimated && scrollTop + screenHeight > $(".to-service").offset().top + screenHeight / 5) {
					$(".to-service").removeClass("fadein");
					isToServiceAnimated = true;
				}
			} else if (scrollTop < iContactusOffsetTop) {
				$(".header").get(0).className = "header scolor";
				serviceContentAnimation();
			} else {
				$(".header").get(0).className = "header ccolor";
				if (scrollTop >= $(".footer-main").offset().top) {
          $("#video").css({
            "position": "fixed",
            "top": videoYDelta
          });
        } else {
          $("#video").css({
            "position": "absolute",
            "top": videoYDelta
          });
        }
			}
			if (!isToContactusAnimated && scrollTop + screenHeight > $(".to-contactus").offset().top + screenHeight / 5) {
				$(".to-contactus").removeClass("fadein");
				isToContactusAnimated = true;
			}
			if (scrollTop + screenHeight >= iPolygonsOffsetTop + 20 && !bPolygonsAnimated) {
				bPolygonsAnimated = true;
				var durition = 200, iCur = 0, total = $(".polygons path").length;
				var scrollInterval = setInterval(function(){
					var $path = $(".contactus-info svg path").eq(iCur)
					$path.css('opacity', $path.attr('opacity') || 1);
					iCur++;
					if (iCur === total) {
						clearInterval(scrollInterval);
					}
				}, durition);
			}
		}
	});

	$(".menu").on("click", function(e){
		e.stopPropagation();
		$(this).toggleClass("close");
		$(".nav").toggleClass("open");
		if ($(this).hasClass("close")) {
			$(".header").get(0).className = "header";
		} else {
			if (iCurPage <= 1) {
				$(".header").get(0).className = "header";
			} else if (iCurPage >= 2 && iCurPage < iMaxIndex) {
				$(".header").get(0).className = "header green";
			} else {
				var scrollTop = $("body").scrollTop() || $("html").scrollTop();
					iServiceOffsetTop = $(".service-info").offset().top,
					iContactusOffsetTop = $(".contactus-info").offset().top;
				if (scrollTop < iServiceOffsetTop) {
					$(".header").get(0).className = "header tcolor";
				} else if (scrollTop < iContactusOffsetTop) {
					$(".header").get(0).className = "header scolor";
				} else {
					$(".header").get(0).className = "header ccolor";
				}
			}
		}
	});

	$(".arrow, .navi-arrow, .navi-content").on("click", function(){
		scrollTransDown();
	});

	$(".thumb").on("mouseenter mouseout", function(event){
		if (isMobile) return false;
		if (event.type === "mouseenter") {
			var index = $(this).index(".thumb");
			$(".team-info .info-text").stop().animate({
				"margin-left": "20px",
				"opacity": 0
			}, 200, "swing", function(){
				$(".team-info .title-en").text(aTeamMember[index].name).css("color", "#869e0c");
				$(".team-info .title-ch").text(aTeamMember[index].title).addClass("small").css("color", "#869e0c");
				// $(".team-info .content-en").html(aTeamMember[index].mottoEn);
				$(".team-info .content-ch").html(aTeamMember[index].mottoCh).css("color", "#5a6038");
				$(".team-info .info-text").stop().css("text-align", "right").animate({
					"margin-left": "-20px",
					"opacity": 1
				}, 200);
			});
		} else {
			$(".team-info .info-text").stop().animate({
				"margin-left": "20px",
				"opacity": 0
			}, 200, "swing", function(){
				$(".team-info .title-en").text("MEET OUR TEAM").css("color", "#000");
				$(".team-info .title-ch").text("欢迎来到“怪咖集中营”").removeClass("small").css("color", "#000");
				// $(".team-info .content-en").html("Welcome to the geek camp !<br />There is a group of weird, experienced, and demanding people to provide entertaining, personalized, and quality professional digital interactive promotion plans.<br />If you hate boring template, then get to know us, and let's do something interesting together.");
				$(".team-info .content-ch").html("这里有一群有想法、有经验、有要求的人，<br />可以为你提供有趣、个性、质感的专业互动推广方案。<br />如果你讨厌那些千篇一律批量生产的文案；<br />如果你不希望你的品牌设计呆板无趣或一味“性冷淡”；<br />如果你也盼望自己的企业放下一脸假正经和消费者打成一片；<br />来认识我们吧，让我们一起玩点有趣的！").css("color", "#000");
				$(".team-info .info-text").stop().css("text-align", "center").animate({
					"margin-left": "-20px",
					"opacity": 1
				}, 200);
			});
		}
	});

	$(".to-service .to-arrow").on("click", function(){
		bDoingScrolling = true;
		var top = $(".service-info").offset().top;
		$("html, body").animate({scrollTop: top}, 800, "swing", function(){
			bDoingScrolling = false;
			$(".header").get(0).className = "header scolor";
			serviceContentAnimation();
		});
	});

	$(".to-contactus .to-arrow").on("click", function(){
		$(".cur").removeClass("cur");
		bAnimating = false;
		bDoingScrolling = true;
		var scrollTop = $("body").scrollTop() || $("html").scrollTop();
		var deltaTop = $(this).offset().top - scrollTop + 7;
		$(this).addClass("hidden");
		$(".to-arrow-copy").css('top', deltaTop + 'px').show();
		var top = $(".contactus-info .to-arrow").offset().top;
		var $dom = (/firefox/i.test(ua) || isIE()) ? $("html") : $("body");
		$dom.animate({scrollTop: top - deltaTop + 7}, 800, "swing", function(){
			$(".to-arrow-copy").hide();
			$dom.animate({scrollTop: $(".footer-main").offset().top}, 2500, "swing", function(){
				bDoingScrolling = false;
				$(".to-contactus .to-arrow").removeClass("hidden");
				$(".header").get(0).className = "header ccolor";
			});
			var durition = 200, iCur = 0, total = $(".polygons path").length;
			if (!bPolygonsAnimated) {
				bPolygonsAnimated = true;
				var scrollInterval = setInterval(function(){
					var $path = $(".contactus-info svg path").eq(iCur)
					$path.css('opacity', $path.attr('opacity') || 1);
					iCur++;
					if (iCur === total) {
						clearInterval(scrollInterval);
					}
				}, durition);
			}
		});
	});

	$(".info-imgs .rotate-cube").on("click", function(event){
		event.preventDefault();
	});

	$(".item-iconbox").on("click", function(event){
		if (isMobile) return false;
		bAnimating = true;
		var $parent = $(this).parents(".service-item"),
			$cur = $parent.siblings(".cur");
		if ($cur.length > 0) {
			$cur.find(".service-title").addClass("exception");
			$cur.removeClass("cur");
			$(this).addClass("icon-ani");
			$parent.siblings().find(".item-iconbox").removeClass("icon-ani");
		} else {
			$parent.hasClass("cur") ? $(".item-iconbox").addClass("icon-ani")
									: $(this).addClass("icon-ani").parents(".service-item").siblings().find(".item-iconbox").removeClass("icon-ani");
		}
		var self = this;
		var serviceTop = $(".service-info").offset().top;
		var index = $(this).index(".item-iconbox");
		var scrollTop = $("body").scrollTop() || $("html").scrollTop();
		var top = Math.round($(this).offset().top);
		var height = Math.sqrt(2) * $(this).height();
		$(self).siblings(".item-content").find(".service-title").removeClass("exception");
		var $dom = (/firefox/i.test(ua) || isIE()) ? $("html") : $("body");
		$dom.animate({
			scrollTop: (index === 0 ? $(".service-info").offset().top : Math.round(top + height / 2 - screenHeight / 2))
		}, 400, "swing", function(){
			scrollTop = $("body").scrollTop() || $("html").scrollTop();
			$(self).parents(".service-item").toggleClass("cur");
			var $cur = $(".service-item.cur");
			if ($cur.length == 0) {
				bAnimating = false;
				$(self).siblings(".item-content").find(".service-title").addClass("exception");
			} else {
				var deltaTop = $cur.offset().top - scrollTop;
				var deltaBottom = scrollTop + screenHeight - $cur.offset().top - $cur.outerHeight();
				$cur.find(".item-imgbg").css({
					top: -deltaTop + "px",
					bottom: -deltaBottom + "px"
				});
			}
		});
	});

	function isIE() { //ie?
	    if (!!window.ActiveXObject || "ActiveXObject" in window) {
	        return true;
	    } else {
	        return false;
	    }
	}

	$(".nav li").on("mouseover mouseout click", function(event){
		var self = this;
		if (event.type === "mouseover") {
			var index = $(this).index();
			var bgColor = colorArr[index];
			$(".nav").css("background-color", bgColor);
		} else if (event.type === "mouseout") {
			$(".nav").css("background-color", "#08ca89");
		} else if (event.type === "click") {
			$(".nav-dots").removeClass("show");
			$(".menu").removeClass("close");
			$(".nav").removeClass("open");
			if (iCurPage !== iMaxIndex) {
				$(".content").css({
					'top' : (-iMaxIndex * 100) + '%'
				});
				iCurPage = iMaxIndex;
				setTimeout(navScroll, 800);
			} else {
				navScroll();
			}
		}
		function navScroll(){
			var top, style;
			if ($(self).hasClass("nav-team")) {
				top = $(".team-info").offset().top;
				style = "tcolor";
			} else if ($(self).hasClass("nav-service")) {
				top = $(".service-info").offset().top;
				style = "scolor";
			} else if ($(self).hasClass("nav-contactus")) {
				top = $(".footer-main").offset().top;
				style = "ccolor";
			}
			top -= (iMaxIndex - iCurPage) * screenHeight;
			$(".header").get(0).className = "header";
			$(".header").addClass(style);
			$("body").css({
        		"position": "relative",
        		"overflow": "auto"
        	});
			$("html, body").animate({scrollTop: Math.round(top)}, 1000, "swing", function(){
				if (style === "tcolor") {
					fadeInAnimation();
					teamContentAnimation();
				} else if (style === "scolor") {
					serviceContentAnimation();
				}
			});
		}
	});

	$("#homeBg polygon").on("mouseenter mouseout tap", function(event){
		if (event.type === "mouseenter" || event.type === "tap") {
			var i = Math.floor(Math.random() * 4) + 1;
			$("#homeBg").attr("class", "type" + i);
		} else {
			$("#homeBg").attr("class", "");
		}
	});

	$(".nav-dot").on("click", function() {
		var index = $(this).index();
		$(".cur").removeClass("cur");
		$(this).addClass("cur");
		iCurPage = index + 2;
		$(".content").css({
			'top' : (-iCurPage * 100) + '%'
		});
        setTimeout(function(){
        	svgAnimation();
        }, 1000);
	});

	if (isIE()) {
		$("#video").get(0).play();
	} else {
		$("#video").on("canplaythrough", function(){
			$(this).get(0).play();
		});
	}

	$(".form-subject, .form-message, .form-email").on("change", function(){
    if ($.trim($(this).val())) {
      $(this).removeClass("error");
    }
  });

  $(".form-submit-btn").on("click", function() {
    var subject = $.trim($(".form-subject").val()),
      message = $.trim($(".form-message").val()),
      email = $.trim($(".form-email").val()),
      phone = $.trim($(".form-phone").val());

    if (!subject) {
      $(".form-subject").addClass("error");
      alert("请填写主题");
    } else if (!message) {
      $(".form-message").addClass("error");
      alert("请填写内容");
    } else if (!email) {
      $(".form-email").addClass("error");
      alert("请填写邮箱地址");
    }
    
    if (subject && message && email) {
      // TODO: verify email
      $.ajax({
        url: "./contact.php",
        type: "POST",
        dataType: "JSON",
        data: { subject: subject, message: message, email: email, phone: phone },
        success: function(resp){
          alert("Thanks for contacting Novinsighter!\nWe will get back to you as soon as possible :)");
        },
        error: function(resp){
          alert("Thanks for contacting Novinsighter!\nWe will get back to you as soon as possible :)");
        }
      })
    }
  });

	function svgAnimation() {
		if (iCurPage === 2 && svg1done === false) {
            setTimeout(function(){
                watermelonSvg.doAnimation();
            }, 100);
			svg1done = true;
		} else if (iCurPage === 3 && svg2done === false) {
            setTimeout(function(){
                dragonSvg.doAnimation();
            }, 100);
			svg2done = true;
		} else if (iCurPage === 4 && svg3done === false) {
            setTimeout(function(){
				wolfmanSvg.doAnimation();
            }, 100);
			svg3done = true;
		} else if (iCurPage === 5 && svg4done === false) {
            setTimeout(function(){
				packmanSvg.doAnimation();
            }, 100);
			svg4done = true;
		} else if (iCurPage === 6 && svg5done === false) {
            setTimeout(function(){
				lampSvg.doAnimation();
            }, 100);
			svg5done = true;
		}
	}

	$("#watermelon-svg").on("click", function(){
		watermelonSvg.doAnimation();
	});
	$("#dragon-svg").on("click", function(){
		dragonSvg.doAnimation();
	});
	$("#wolfman-svg").on("click", function(){
		wolfmanSvg.doAnimation();
	});
    $("#packman-svg").on("click", function(){
		packmanSvg.doAnimation();
	});
	$("#lamp-svg").on("click", function(){
		lampSvg.doAnimation();
	});

	// var triangleHeight = Math.round(screenWidth * .6 * Math.tan(25 * Math.PI / 180));
	// $(".tran-triangle").css({
	// 	height: triangleHeight,
	// 	"margin-top": -Math.round(triangleHeight / 4)
	// });
	$(".footer-main").css({
		"min-height": screenHeight
	});

	var overrideHeight = Math.floor(screenWidth * Math.tan(4 * Math.PI / 45));
	$(".service-triangle").css({
		height: overrideHeight + 'px'
	});
	$(".top-left, .top-right").css({
		'margin-bottom': -overrideHeight + 'px'
	});
	$(".bottom-left, .bottom-right").css({
		'margin-top': -overrideHeight + 'px'
	});
	
	var videoYDelta = 0;
	function resizeVideo(){
		var screenWidth = $(window).width(), screenHeight = $(window).height();
		if (16 / 9 > screenWidth / screenHeight) {
			$("#video").css({
				width: "auto",
				top: 0,
				height: screenHeight,
				left: -Math.round((screenHeight * 16 / 9 - screenWidth) / 2)
			});
		} else {
			videoYDelta = -Math.round((screenWidth * 9 / 16 - screenHeight) / 2);
			$("#video").css({
				width: screenWidth,
				top: videoYDelta,
				height: "auto",
				left: 0
			});
		}
	}
	resizeVideo();

	$(window).on("resize", resizeVideo);
	
});