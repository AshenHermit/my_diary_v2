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
        
    text = text.replace(new RegExp("\n", "g"), "<br/>")
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

export default utils