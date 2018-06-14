/**
 * Created by 小灰 on 2018/4/12.
 */
var Helper = {
    isToEnd: function($viewport, $content){
        return $viewport.height() + $viewport.scrollTop() +10 > $content.height()
    },

    createNode: function(movie){
        var template = `<div class="item">
            <a href="#">
            <div class="cover">
            <img src="" alt="">
            </div>
            <div class="detail">
            <h2></h2>
            <div class="extra"><span class="score"></span>分 / <span class="collect"></span>收藏</div>
        <div class="extra"><span class="year"></span> / <span class="type"></span></div>
        <div class="extra">导演: <span class="director"></span></div>
        <div class="extra">主演: <span class="actor"></span></div>
        </div>
        </a>
        </div>`

        var $node = $(template);
        $node.find('a').attr('href', movie.alt);
        $node.find('.cover img').attr('src', movie.images.medium );
        $node.find('.detail h2').text(movie.title);
        $node.find('.score').text(movie.rating.average );
        $node.find('.collect').text(movie.collect_count );
        $node.find('.year').text(movie.year);
        $node.find('.type').text(movie.genres.join(' / '));

        $node.find('.director').text(function(){
            var directorsArr = [];
            movie.directors.forEach(function(e){
                directorsArr.push(e.name);
            });
            return directorsArr.join('、');
        });

        $node.find('.actor').text(function(){
            var actorArr = [];
            movie.casts.forEach(function(e){
                actorArr.push(e.name)
            });
            return actorArr.join('、')
        });
        return $node
    }
};

var Top250Page = {

    init: function(){
        this.$container = $('#top250');
        this.$content = this.$container.find('.container');
        this.index = 0;
        this.isFinish = false;
        this.isLoading = false;

        this.bind();
        this.start();
    },

    bind: function(){
        var e= this;
        this.$container.scroll(function(){
            if(!e.isFinish && Helper.isToEnd(e.$container, e.$content)){
                e.start();
            }
        })
    },

    start: function(){
        var e = this;
        this.getData(function(data){
            e.render(data);
        })
    },

    getData: function(callback){
        var e = this;
        if(e.isLoading) return;
        e.isLoading = true;
        e.$container.find('.loading').show();
        $.ajax({
            url: '//api.douban.com/v2/movie/top250',
            data: {
                start: e.index||0
            },
            dataType: 'jsonp'
        }).done(function(ret){
            console.log(ret);
            e.index += 20;
            if(e.index >= ret.total){
                e.isFinish = true
            }
            callback&&callback(ret)
        }).fail(function(){
            alert('数据异常');
        }).always(function(){
            e.isLoading = false
            e.$container.find('.loading').hide()
        })
    },

    render: function(data){
        var e = this;
        data.subjects.forEach(function(movie){
            e.$content.append(Helper.createNode(movie))
        })
    }
};

var BeiMeiPage = {
    init: function(){
        this.$container = $('#beimei');
        this.$content = this.$container.find('.container');
        this.start();
    },

    start: function(){
        var e = this;
        this.getData(function(data){
            e.render(data)
        })
    },

    getData: function(callback){
        var e = this;
        e.$container.find('.loading').show();
        $.ajax({
            url: '//api.douban.com/v2/movie/us_box',
            dataType: 'jsonp'
        }).done(function(ret){
            callback&&callback(ret)
            console.log(ret);
        }).fail(function(){
            alert('数据异常');
        }).always(function(){
            e.$container.find('.loading').hide()
        })
    },

    render: function(data){
        var e  = this;
        data.subjects.forEach(function(item){
            e.$content.append(Helper.createNode(item.subject))
        })
    }
};

var SearchPage = {

    init: function(){
        this.$container = $('#search')
        this.$input = this.$container.find('input')
        this.$btn = this.$container.find('.button')
        this.$content = this.$container.find('.search-result')
        this.bind()
    },

    bind: function(){
        var e   = this
        this.$btn.click(function(){
            e.getData(e.$input.val(), function(data){
                console.log(data)
                e.render(data)
            })
        })
    },

    getData: function(keyword, callback){
        var e = this;
        e.$container.find('.loading').show()
        $.ajax({
            url: '//api.douban.com/v2/movie/search',
            data: {
                q: keyword
            },
            dataType: 'jsonp'
        }).done(function(ret){
            callback&&callback(ret)
        }).fail(function(){
            console.log('数据异常')
        }).always(function(){
            e.$container.find('.loading').hide()
        })
    },

    render: function(data){
        var e = this;
        data.subjects.forEach(function(movie){
            e.$content.append(Helper.createNode(movie))
        })
    }
};


var App = {

    init: function(){
        this.bind()
        Top250Page.init()
        BeiMeiPage.init()
        SearchPage.init()
    },

    bind: function(){
        $('footer>div').click(function(){
            $(this).addClass('active')
                .siblings()
                .removeClass('active')
            $currentPage = $('main>section')
                .hide().eq($(this).index())
                .fadeIn()
        });

        window.ontouchmove = function(e){
            e.preventDefault()
        };

        $('section').each(function(){
            this.ontouchmove = function(e){
                e.stopPropagation()
            }
        })
    }
};

App.init();
