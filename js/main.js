define("main",function(require,exports,module){
    require('preload');
    require('song');
});

define("preload",function(require,exports,module){
    var preload , index = 0;

        preload = new createjs.LoadQueue();
    
        var res = [
            {'src' : "images/img1.jpg" , "id" : "img1"},
            {'src' : "images/img2.jpg" , "id" : "img2"},
            {'src' : "images/img3.jpg" , "id" : "img3"},
            {'src' : "images/img4.jpg" , "id" : "img4"},
            {'src' : "images/img5.jpg" , "id" : "img5"}
        ];
        
        preload.loadManifest(res);
        preload.on("fileload", handleFileLoad);
        preload.on("complete", handleFileComplete);
        preload.on("progress",handleProgress);

    function handleProgress(event){
        $(".progress").html((event.loaded*100).toFixed(0)+"%");
    }
    function handleFileLoad(event) {
        $(".large").eq(index++).html(event.result);
    }
    function handleFileComplete(event){
        require('appSlide');
        require('drag-arrow');
        $(".mask").css("opacity",0).on("webkitTransitionEnd",function(){
            $(this).remove();
        });

    }
});
define("appSlide",function(require,exports,module){
    function getPageElement(event){
        var p = $(event.target).parents(".page");
        if(p.length <= 0){
            return $(event.target);
        }
        if(p.length > 0){
            return p;
        }
    }

    function run(v){
        if(arguments.length < 2){
            this.removeClass("transition0ms").addClass("transition300ms");
        }
        return this.css({
            "transform" : "translate3d(0,"+v+"px,0)",
            "-webkit-transform" : "translate3d(0,"+v+"px,0)"
        });
    }

    function getCss3(elem){
        if(elem.css("-webkit-transform") == "none"){
            return 0;
        }

        return Number(elem.css("-webkit-transform").match(/\-?[0-9]+\.?[0-9]*/g)[2]);
    }


    function appSlide(elem){
        this.ctrl = elem.find(".controller");
        this.page = this.ctrl.find(".page");
        this.init();
        this.events();
    }

    appSlide.prototype = {
        init : function(){
            this.page.first().addClass("animation");
            this.page.css("height",$(window).height())
            this.page.each(function(i){
                $(this).data("pageNum",i+1);
            });
            this.clone();
        },
        clone :  function(){
            this.first = this.page.first().clone();
            this.last = this.page.last().clone();
            this.ctrl.append(this.first);
            this.ctrl.prepend(this.last);
            run.call(this.ctrl,-this.first.height(),0);
        },
        events : function(){
            var _ = this;

            var start_y = 0,
                move_y = 0,
                current_y = 0,
                extent = false;

            _.ctrl.on("touchstart",start);

            function start(event){
                current_y = getCss3(_.ctrl);
                start_y = event.touches[0].clientY;
            }

            _.ctrl.on("touchmove",move);

            function move(event){
                event.preventDefault();
                _.ctrl.removeClass("transition300ms").addClass("transition0ms");
                move_y = event.touches[0].clientY - start_y;
                run.call(_.ctrl,current_y+move_y,0);
                if(Math.abs(move_y) > 150){
                    extent = "力度达到200以上";
                }else{
                    extent = false;
                }
            }

            _.ctrl.on("touchend",end);

            function end(event){
                if(move_y){
                    if(extent){
                        if(move_y < 1){
                            //up
                            if(getPageElement(event).next()[0] == _.first[0]){
                                _.ctrl.off("touchmove",move);
                                run.call(_.ctrl,-(_.page.length+1)*getPageElement(event).height());
                                _.page.eq(0).addClass("animation").siblings().removeClass("animation");
                                _.ctrl.on("webkitTransitionEnd",function(){
                                    _.ctrl.removeClass("transition0ms transition300ms");
                                    run.call(_.ctrl,-1*getPageElement(event).height(),0);
                                    current_y = getCss3(_.ctrl);
                                    _.ctrl.off("webkitTransitionEnd");
                                    _.ctrl.on("touchmove",move);
                                });
                            }else{
                                run.call(_.ctrl,-getPageElement(event).next().data("pageNum")*getPageElement(event).height());
                                getPageElement(event).next().addClass("animation").siblings().removeClass("animation");
                            }
                        }
                        if(move_y > 1){
                            //down
                            if(getPageElement(event).prev()[0] == _.last[0]){
                                _.ctrl.off("touchmove",move);
                                run.call(_.ctrl,-0);
                                _.page.eq(getPageElement(event).prev().data("pageNum")-1).addClass("animation").siblings().removeClass("animation");
                                _.ctrl.on("webkitTransitionEnd",function(){
                                    _.ctrl.removeClass("transition0ms transition300ms");
                                    run.call(_.ctrl,-getPageElement(event).prev().data("pageNum")*getPageElement(event).height(),0);
                                    current_y = getCss3(_.ctrl);
                                    _.ctrl.off("webkitTransitionEnd");
                                    _.ctrl.on("touchmove",move);
                                });
                            }else{
                                run.call(_.ctrl,-getPageElement(event).prev().data("pageNum")*getPageElement(event).height());
                                getPageElement(event).prev().addClass("animation").siblings().removeClass("animation");
                            }
                        }
                    }else{
                        run.call(_.ctrl,-getPageElement(event).data("pageNum")*getPageElement(event).height());
                    }
                    current_y = getCss3(_.ctrl);
                    move_y = 0;
                }

            }
        }
    }

    new appSlide($(".app-y"));

    module.exports = {
        run : run,
        getCss3 : getCss3
    }

});

define("drag-arrow",['appSlide'],function(require,exports,module){
    var a = require('appSlide'),
        b = $(".drag-arrow"),
        c = $(".controller"),
        d = c.find(".page"),
        e = d.length-2,f;

    b.on("touchstart",function(){
        f = c.find(".animation").data("pageNum");
        if(d.eq(f).next()[0] == d.last()[0]){
            a.run.call(c,++f*-d.height());
            c.on("webkitTransitionEnd",function(){
                c.removeClass("transition0ms transition300ms");
                d.eq(1).addClass("animation").siblings().removeClass("animation");
                a.run.call(c,-1*d.height(),0);
                current_y = a.getCss3(c);
                c.off("webkitTransitionEnd");
            });
        }else{
            a.run.call(c,++f*-d.height());
            d.eq(f).addClass("animation").siblings().removeClass("animation");
        }
        
    })
});

define("song",function(require,exports,module){
    var bgm = $(".song");

    if(bgm.length <= 0)
        return;
    var status = true;
    bgm.on("touchstart",function(){
        if(status){
            $(this).find("audio")[0].pause();
            $(this).addClass("song-pause");
            status = false;
        }else{
            $(this).find("audio")[0].play();
            $(this).removeClass("song-pause");
            status = true;
        }
    })
});