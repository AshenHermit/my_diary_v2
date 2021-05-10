import { Api, PostStruct, TrackStruct } from "./api";
import { default as utils } from "./utils";
import { debug_memories } from "./config";
import {MainContent} from './components/main_content'
import {YearCircle} from './components/year_circle'
import {MusicMenu} from './components/music_menu'
import {isMobile} from 'react-device-detect'

class EditModeFields{

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
        /**@type {PostStruct} */
        this.active_post = {}
        
        /**@type {Array<PostStruct>} */
        this.posts = []

        this.is_in_edit_mode = false
        /**@type {EditModeFields} */
        this.edit_mode_fields = new EditModeFields()
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
        this.year_circle_component.setActivePost(this.posts[0])
        if(isMobile) this.hideMusicMenu()

        this.api.loadPosts(posts=>{
            this.posts = posts
            this.year_circle_component.setPosts(this.posts)
            this.year_circle_component.setActivePost(utils.getLastPost(this.posts))
        })
    }

    /** @param {PostStruct} post*/
    setActivePost(post){
        this.active_post = post
        this.main_content_component.setActivePost(this.active_post)
        this.music_menu_component.setActivePost(this.active_post)
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

    enterEditMode(){
        this.is_in_edit_mode = true
        this.music_menu_component.forceUpdate()
        this.main_content_component.forceUpdate()
    }
    exitEditMode(){
        this.is_in_edit_mode = false
        this.music_menu_component.forceUpdate()
        this.main_content_component.forceUpdate()
    }
    toggleEditMode(){
        this.is_in_edit_mode = !this.is_in_edit_mode
        this.music_menu_component.forceUpdate()
        this.main_content_component.forceUpdate()
    }
}