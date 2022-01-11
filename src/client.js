import React from 'react'
import { Api, PostStruct, TrackStruct } from "./api";
import { default as utils } from "./utils";
import { debug_memories } from "./config";
import {MainContent} from './components/main_content'
import {YearCircle} from './components/year_circle'
import {MusicMenu} from './components/music_menu'
import {isMobile} from 'react-device-detect'
import { AboutPanel } from './components/about_panel';
import { EventHandler } from 'event-js';
import { searchParams } from './searchParams';

// TODO: not object oriented enough
// quite awful logic

export class Client{
    /** @param {Api} api */
    constructor(api){
        this.app_name = "Hermit's Diary"

        this.api = api

        /**@type {MusicMenu} */
        this.music_menu_component = null
        /**@type {AboutPanel} */
        this.about_panel_component = null
        /**@type {MainContent} */
        this.main_content_component = null
        /**@type {YearCircle} */
        this.year_circle_component = null
        /**@type {React.Component} */
        this.topbar_component = null
        /**@type {React.Component} */
        this.footer_component = null

        /**@type {PostStruct} */
        this.active_post = {}
        
        /**@type {Array<PostStruct>} */
        this.posts = []
        this.next_post_uid = 0

        this.is_in_edit_mode = false
        /**@type {EditModeFields} */
        this.edit_mode_post = new PostStruct()
    }

    updateWindowTitle(){
        var title = this.app_name
        if(this.active_post){
            title += " - " + this.active_post.title
        }
        document.title = title
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
        searchParams.updateParams()
        
        this.addPlaceholderPost()
        this.year_circle_component.setPosts(this.posts)
        this.setActivePost(this.posts[0], false, true)
        if(isMobile) this.hideMusicMenu()
        this.hideAboutPanel()
        
        this.api.loadPosts(posts=>{
            this.posts = posts
            this.next_post_uid = Math.max(...this.posts.map(x=>x.uid))+1
            this.year_circle_component.setPosts(this.posts)
            console.log(searchParams.post_uid)
            if(searchParams.post_uid!=-1){
                this.setActivePost(this.posts.find(x=>x.uid == searchParams.post_uid))
            }else{
                this.setActivePost(utils.getLastPost(this.posts))
            }
            this.footer_component.forceUpdate()
            this.about_panel_component.forceUpdate()
        })
        
        this.remove000WebhostElements()
        this.updateWindowTitle()
    }

    /** @param {PostStruct} post*/
    setActivePost(post, replaceSearchParams=true, scrollAnyway=false){
        this.active_post = post
        var post_to_set = post
        if(this.is_in_edit_mode){
            this.edit_mode_post = PostStruct.from_raw_data(this.active_post.to_raw_data())
            post_to_set = this.edit_mode_post
        }
        this.main_content_component.setActivePost(post_to_set)
        this.music_menu_component.setActivePost(post_to_set)
        this.year_circle_component.setActivePost(post_to_set, scrollAnyway)

        if(replaceSearchParams){
            searchParams.post_uid = post.uid
            searchParams.replaceParams()
        }
        this.updateWindowTitle()
    }

    saveActivePost(){
        if(this.is_in_edit_mode){
            Object.assign(this.active_post, this.edit_mode_post)
            this.api.savePosts(this.posts)
        }
    }
    
    createPost(position){
        var post = new PostStruct()
        post.position = position
        post.uid = this.next_post_uid
        this.next_post_uid+=1
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
        this.edit_mode_post.tracks.push(new TrackStruct())
        this.music_menu_component.forceUpdate()
    }
    deleteTrackInFromEditMode(id){
        this.edit_mode_post.tracks.splice(id,1)
        this.music_menu_component.forceUpdate()
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

    showAboutPanel(){
        this.about_panel_component.show()
    }
    hideAboutPanel(){
        this.about_panel_component.hide()
    }
    toggleAboutPanel(){
        if(this.about_panel_component.is_shown){
            this.hideAboutPanel()
        }else{
            this.showAboutPanel()
        }
    }

    scrollToEditModePost(){
        if(this.edit_mode_post!=null){
            this.year_circle_component.view_position_target = this.edit_mode_post.position
        }
    }

    enterEditMode(){
        if(!this.api.authorized){
            var access_token = prompt("please, enter a dropbox access token", "")
            this.api.authorizeDB(access_token)
        }
        this.is_in_edit_mode = true
        this.setActivePost(this.active_post)
        this.music_menu_component.forceUpdate()
        this.about_panel_component.forceUpdate()
        this.main_content_component.forceUpdate()
        this.topbar_component.forceUpdate()
        this.footer_component.forceUpdate()
    }
    exitEditMode(){
        this.is_in_edit_mode = false
        this.year_circle_component.setActivePost(this.active_post, true)
        this.music_menu_component.forceUpdate()
        this.about_panel_component.forceUpdate()
        this.main_content_component.forceUpdate()
        this.topbar_component.forceUpdate()
        this.footer_component.forceUpdate()
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

    logIn(userdata){
        this.topbar_component.setState({username: userdata.getName()})
    }
}