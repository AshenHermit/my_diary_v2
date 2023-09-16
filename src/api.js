import { Exportable, FC } from 'extripo';
import {debug_posts, debug_data} from './config'
import { client } from './init';
import { default as utils } from "./utils";
import { EventHandler } from 'event-js';
require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;

/**
 * Track Struct
 */
export class TrackStruct extends Exportable{
    constructor(){
        super()
        this.title = ""
        this.artist = ""
        this.embedding_code = ""
        this.comment = ""
    }

    importData(data){
        super.importData(data)
        this.embedding_code = decodeURI(this.embedding_code)
        return this
    }
    exportData(){
        var data = super.exportData()
        data.embedding_code = encodeURI(data.embedding_code)
        return data
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

export class ProjectStruct extends Exportable{
    constructor(){
        super()
        this.configFields({
            post: FC.ignore()
        })
        this.title = ""
        this.description = ""
        this.tags = []
        this.image_url = ""
    }
}

/**
 * Post (Memory) Struct
 */
export class PostStruct extends Exportable{

    notAbsorbing(){
        return this.title.toLowerCase() != "конец" && this.title.toLowerCase() != "the end"
    }

    constructor(){
        super()
        this.configFields({
            tracks: FC.arrayOf(TrackStruct),
            projects: FC.arrayOf(ProjectStruct)
        })
        this.title = "..."
        this.description = ""
        /**@type {Array<TrackStruct>}*/
        this.tracks = []
        this.projects = []
        this.size = 0.2
        this.position = 0
        this.type = 1
        this.uid = -1
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

export class DiaryData extends Exportable{
    constructor(){
        super()
        this.configFields({
            posts: FC.arrayOf(PostStruct)
        })
        this.about = ""
        this.last_update = ""
        this.posts = []
    }
}

window.DiaryData = DiaryData

export class Api{
    posts = []
    lastUpdate = ""
    about = "about"

    DEBUG = false
    access_token = ""
    authorized = false
    /**@type {Dropbox} */
    dbx = null

    data = null

    constructor(){
        console.log(process.env.NODE_ENV)

        this.dataLoaded = new EventHandler(this)
        this.dataSavedEvent = new EventHandler(this)
        this.dataNotSavedEvent = new EventHandler(this)
        this.data = new DiaryData()
    }
    logIn(userdata){
        this.userdata = userdata
        client.logIn(this.userdata)
    }

    authorizeDB(access_token){
        return new Promise((resolve, reject)=>{
            this.dbx = new Dropbox({ accessToken: access_token });
            this.dbx.filesListFolder({path: ''})
            .then((function(response) {
                console.log(response);
                console.log("authorized");
                this.authorized = true
                this.access_token = access_token
                resolve(true)
            }).bind(this))
            .catch((function(error) {
                console.error(error)
                this.access_token = ""
                this.authorized = false
                resolve(false)
            }).bind(this));
        })
    }

    executeWithAccessToDB(callback){
        
    }

    mapPostsToRaw(){
        return this.posts.map(post=>post.to_raw_data())
    }
    makeRawDataObject(){
        var lastUpdate = utils.getCurrentDate()
        var posts = this.mapPostsToRaw()
        var raw_data = {"last_update": lastUpdate, "posts": posts, "about": this.about}
        return raw_data
    }
    
    loadPosts(callback){
        // bad, old solution. i wish i had strength to improve it, like in group-captains-tool
        this.getPostsRawData(raw_data=>{
            this.data = DiaryData.create(raw_data)
            window.posts_fetched_data = raw_data
            if(raw_data.about) this.about = raw_data.about
            if(raw_data.last_update) this.lastUpdate = raw_data.last_update
            this.posts = this.data.posts
            // this.posts = raw_data.posts.map(data=>PostStruct.from_raw_data(data))
            callback(this.posts)
            this.dataLoaded.publish()
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
            }).catch(()=>{
                
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
            var raw_data = this.data.exportData()
            
            this.dbx.filesUpload({
                "path": "/memories.json",
                "contents": JSON.stringify(raw_data, null, 2),
                "mode": {".tag": "overwrite"},
                "autorename": false,
                "mute": true,
                "strict_conflict": false
            }).then((function(req){
                console.log("saved");
                this.dataSavedEvent.publish()
                if(callback!=null) callback()
            }).bind(this)).catch((function(reason){
                this.dataNotSavedEvent.publish()
                console.error(reason)
            }).bind(this))
        }
    }
}