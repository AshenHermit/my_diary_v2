import React from 'react'

var utils = {}

utils.clamp = function(value, min, max){
    return Math.max(min, Math.min(value, max))
}
utils.mod = function(x, y){
    return x - y * Math.floor(x/y)
}
utils.replaceRegexp = function(text, regexp, replace_func){
    var match = text.match(regexp)
    while(match){
        text = text.replace(match[0], replace_func(match.slice(1)))
        match = text.match(regexp)
    }
    return text
}
utils.renderMarkup = function(text){
    // links
	text = this.replaceRegexp(text, 
        /\[(.*)\]\((.*)\)/m, 
        args=>`<a target="_blank" href="${args[1]}">${args[0]}</a>`)
        
    text = this.textToHTML(text)
    return text
}

utils.getPostNearestToPosition = function(posts_array, position){
    var nearest_post = posts_array[0]
    var dist = Math.abs(nearest_post.position - position)
    for (let i = 1; i < posts_array.length; i++) {
        const post = posts_array[i];

        var temp_dist = Math.abs(post.position - position)
        if(temp_dist < dist){
            nearest_post = post
            dist = temp_dist
        }
    }
    return nearest_post
}

utils.getLastPost = function(posts_array){
    var last_post = Array.from(posts_array).sort((x, y)=>{
        if (x.position > y.position) return -1
        if (x.position < y.position) return 1
        return 0
    })[0]
    
    return last_post
}

utils.textToHTML = function(html){
    html = html.replaceAll("\n", "<br>")
    return html
}
utils.HTMLToText = function(html){
    html = html.replaceAll("<br>", "\n")
    return html
}

utils.initializeMouseEvents = function(element, mousedown_callback, mousemove_callback, mouseup_callback){
    element.addEventListener('mousedown', mousedown_callback)
    window.addEventListener('mousemove', mousemove_callback)
    window.addEventListener('mouseup', mouseup_callback)

    element.addEventListener('touchstart', e=>mousedown_callback(e.changedTouches[0]))
    window.addEventListener('touchmove', e=>mousemove_callback(e.changedTouches[0]))
    window.addEventListener('touchend', e=>mouseup_callback(e.changedTouches[0]))
    window.addEventListener('touchcancel', e=>mouseup_callback(e.changedTouches[0]))
}

utils.minDigitsCount = function (num, minCount){
	let str = ""+num
	let add = minCount - str.length
	for(let i=0; i<add; i+=1) str = "0"+str
	return str
}

utils.getCurrentDate = function(){
	let date = new Date()
	var txt = this.minDigitsCount(date.getDate(), 2) + "." + this.minDigitsCount(date.getMonth()+1, 2) + "." + date.getFullYear()
	return txt
}

export default utils