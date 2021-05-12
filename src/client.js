import React from 'react'
import { Api, PostStruct, TrackStruct } from "./api";
import { default as utils } from "./utils";
import { debug_memories } from "./config";
import {MainContent} from './components/main_content'
import {YearCircle} from './components/year_circle'
import {MusicMenu} from './components/music_menu'
import {isMobile} from 'react-device-detect'

class EditModeFields{
    post_title = ""
    post_description = ""
    post_position = 0
    post_size = 0
    post_tracks_count = 0

    get_array(count, preffix, keys){
        var array = []
        var thisCopy = Object.assign({}, this)
        for (let i = 0; i < count; i++) {
            var item = {}
            keys.forEach(key=>{item[key] = thisCopy[preffix+"_"+i+"_"+key]})
            array.push(item)
        }
        return array
    }

    onchange_callback = function(fields){}
    onchange(){
        this.onchange_callback(this)
    }
}

export class Client{
    /** @param {Api} api */
    constructor(api){
        this.api = api

        /**@type {MusicMenu} */
        this.music_menu_component = null
        /**@type {MainContent} */
        this.main_content_component = null
        /**@type {YearCircle} */
        this.year_circle_component = null
        /**@type {React.Component} */
        this.topbar_component = null

        /**@type {PostStruct} */
        this.active_post = {}
        
        /**@type {Array<PostStruct>} */
        this.posts = []

        this.is_in_edit_mode = false
        /**@type {EditModeFields} */
        this.edit_mode_fields = new EditModeFields()
        this.edit_mode_fields.onchange_callback = this.onEditModeFieldsChange.bind(this)
    }

    addPlaceholderPost(){
        var post = PostStruct.build_placeholder()
        post.position = 0
        post.title = "memories are loading..."
        post.description = "please wait"
        post.size = 1
        this.posts.push(post)
    }

    initialize(){
        this.addPlaceholderPost()
        this.year_circle_component.setPosts(this.posts)
        this.year_circle_component.setActivePost(this.posts[0], true)
        if(isMobile) this.hideMusicMenu()

        this.api.loadPosts(posts=>{
            this.posts = posts
            this.year_circle_component.setPosts(this.posts)
            this.year_circle_component.setActivePost(utils.getLastPost(this.posts), true)
        })

        this.remove000WebhostElements()
    }

    /** @param {PostStruct} post*/
    setActivePost(post){
        this.active_post = post
        this.edit_mode_fields.post_tracks_count = this.active_post.tracks.length
        this.main_content_component.setActivePost(this.active_post)
        this.music_menu_component.setActivePost(this.active_post)
        
    }

    saveActivePost(){
        if(this.is_in_edit_mode){
            this.active_post.title = this.edit_mode_fields.post_title
            this.active_post.description = this.edit_mode_fields.post_description
            this.active_post.size = this.edit_mode_fields.post_size
            this.active_post.position = this.edit_mode_fields.post_position
            var tracks = this.edit_mode_fields.get_array(this.edit_mode_fields.post_tracks_count, 
                                                        "post_track", ["title", "artist", "embedding_code"])
            this.active_post.tracks = tracks.map(info=>{
                var track = new TrackStruct()
                track.artist = info.artist
                track.embedding_code = info.embedding_code
                track.title = info.title
                return track
            })
            // this.exitEditMode()
            this.api.savePosts(this.posts)
        }
    }
    
    createPost(position){
        var post = new PostStruct()
        post.position = position
        this.posts.push(post)
        this.year_circle_component.checkNearestPost()
    }

    deletePost(post){
        var idx = this.posts.indexOf(post)
        this.posts.splice(idx, 1)
        this.year_circle_component.checkNearestPost()
    }

    createPostOnViewPos(){
        this.createPost(this.year_circle_component.view_position_target)
    }
    deleteActivePost(){
        this.deletePost(this.active_post)
    }

    addTrackInEditMode(){
        this.edit_mode_fields.post_tracks_count += 1
        this.music_menu_component.forceUpdate()
    }
    deleteTrackInFromEditMode(id){
        for (let i = id+1; i < this.edit_mode_fields.post_tracks_count; i++) {
            this.edit_mode_fields["post_track_"+(i-1)+"_title"] = this.edit_mode_fields["post_track_"+(i)+"_title"]
            this.edit_mode_fields["post_track_"+(i-1)+"_artist"] = this.edit_mode_fields["post_track_"+(i)+"_artist"]
            this.edit_mode_fields["post_track_"+(i-1)+"_embedding_code"] = this.edit_mode_fields["post_track_"+(i)+"_embedding_code"]
        }
        this.edit_mode_fields.post_tracks_count -= 1
        this.music_menu_component.forceUpdate() // this resets all track fields, NOT GOOD
    }

    showMusicMenu(){
        this.music_menu_component.show()
    }
    hideMusicMenu(){
        this.music_menu_component.hide()
    }
    toggleMusicMenu(){
        if(this.music_menu_component.is_shown){
            this.hideMusicMenu()
        }else{
            this.showMusicMenu()
        }
    }

    onEditModeFieldsChange(fields){
        this.year_circle_component.view_position_target = fields.post_position
    }

    enterEditMode(){
        if(!this.api.authorized){
            var access_token = prompt("please, enter a dropbox access token", "")
            this.api.authorizeDB(access_token)
        }
        this.is_in_edit_mode = true
        this.music_menu_component.forceUpdate()
        this.main_content_component.forceUpdate()
        this.topbar_component.forceUpdate()
    }
    exitEditMode(){
        this.is_in_edit_mode = false
        this.year_circle_component.setActivePost(this.active_post)
        this.music_menu_component.forceUpdate()
        this.main_content_component.forceUpdate()
        this.topbar_component.forceUpdate()

        this.year_circle_component.view_position_target = this.active_post.position
    }
    toggleEditMode(){
        if (this.is_in_edit_mode){
            this.exitEditMode()
        }else{
            this.enterEditMode()
        }
    }

    remove000WebhostElements(){
        setTimeout(() => {
            try{
                var link_el = document.querySelector('img[alt="www.000webhost.com"]').parentNode.parentNode
                var script_el = link_el.nextSibling
                document.body.removeChild(link_el)
                document.body.removeChild(script_el)
            }catch(e){
                console.error(e)
            }
        }, (10));
        
    }
}