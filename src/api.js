import {debug_posts, debug_data} from './config'
import { client } from './init';
import { default as utils } from "./utils";
require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;

/**
 * Track Struct
 */
export class TrackStruct{
    title = ""
    artist = ""
    embedding_code = ""
    comment = ""

    constructor(){
    }

    static from_raw_data(data){
        data = Object.assign({}, data)
        var track = new TrackStruct()
        Object.assign(track, data)
        track.embedding_code = decodeURI(track.embedding_code)
        return track
    }
    to_raw_data(){
        var data = JSON.parse(JSON.stringify(this))
        data.embedding_code = encodeURI(data.embedding_code)
        return data
    }
}

/**
 * Post (Memory) Struct
 */
export class PostStruct{
    title = "..."
    description = ""
    /**@type {Array<TrackStruct>}*/
    tracks = []
    size = 0.2
    position = 0
    type = 1
    uid = -1

    can_be_first(){
        return this.title.toLowerCase() != "конец" && this.title.toLowerCase() != "the end"
    }

    constructor(){
    }

    static from_raw_data(data){
        data = Object.assign({}, data)
        var post = new PostStruct()
        Object.assign(post, data)
        post.tracks = post.tracks.map(raw=>TrackStruct.from_raw_data(raw))
        return post
    }
    to_raw_data(data){
        var data = JSON.parse(JSON.stringify(this))
        data.tracks = this.tracks.map(track=>track.to_raw_data())
        return data
    }

    /**
     * build post with dummy info, used when no data loaded
     */
    static build_placeholder(){
        var post = new PostStruct()
        return post
    }

}

export class Api{
    posts = []
    lastUpdate = ""
    about = "about"

    DEBUG = false
    access_token = ""
    authorized = false
    /**@type {Dropbox} */
    dbx = null

    constructor(){
        console.log(process.env.NODE_ENV)
    }
    logIn(userdata){
        this.userdata = userdata
        client.logIn(this.userdata)
    }

    authorizeDB(access_token){
        this.dbx = new Dropbox({ accessToken: access_token });
        this.dbx.filesListFolder({path: ''})
        .then((function(response) {
            console.log(response);
            console.log("authorized");
            this.authorized = true
            this.access_token = access_token
        }).bind(this))
        .catch((function(error) {
            console.error(error)
            this.access_token = ""
            this.authorized = false
        }).bind(this));
    }

    executeWithAccessToDB(callback){
        
    }

    mapPostsToRaw(){
        return this.posts.map(post=>post.to_raw_data())
    }
    makeRawDataObject(){
        var lastUpdate = utils.getCurrentDate()
        var posts = this.mapPostsToRaw()
        var raw_data = {"last_update": lastUpdate, "memories": posts, "about": this.about}
        return raw_data
    }
    
    loadPosts(callback){
        // bad, old solution. i wish i had strength to improve it, like in group-captains-tool
        this.getPostsRawData(raw_data=>{
            if(raw_data.about) this.about = raw_data.about
            if(raw_data.last_update) this.lastUpdate = raw_data.last_update
            this.posts = raw_data.memories.map(data=>PostStruct.from_raw_data(data))
            callback(this.posts)
        })
    }

    getPostsRawData(callback){
        if(this.DEBUG){
            var raw_data = JSON.parse(debug_data)
            console.log(raw_data)
            callback(raw_data)
        }else{
            fetch("https://dl.dropbox.com/s/so8ud7sp9lae0vj/memories.json")
            .then(res=>res.json())
            .then(raw_data=>{
                callback(raw_data)
            })
        }
    }
    
    savePosts(posts, callback){
        if(this.DEBUG){
            console.log("cant save memories, app is in debug mode")
            callback()
            return
        }
        if(this.authorized){
            var raw_data = this.makeRawDataObject()
            this.dbx.filesUpload({
                "path": "/memories.json",
                "contents": JSON.stringify(raw_data, null, 2),
                "mode": {".tag": "overwrite"},
                "autorename": false,
                "mute": true,
                "strict_conflict": false
            }).then(function(req){
                console.log("saved");
                if(callback!=null) callback()
            })
        }
    }
}