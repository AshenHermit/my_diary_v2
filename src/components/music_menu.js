import React from 'react'
import {isMobile} from 'react-device-detect'
import { TrackStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput, IconButton} from './editable_components'
import {Label} from './elements'

class Track extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div className="track">
                <div className="track-embedding" 
                    dangerouslySetInnerHTML={{__html: this.props.track.embedding_code}}>
                </div>
            </div>
        )
    }
}

class EditModeTrack extends React.Component{
    constructor(props){
        super(props)
        this.embedding_ref = React.createRef()
        this.onEmbeddingCodeChange = this.onEmbeddingCodeChange.bind(this)
    }
    onEmbeddingCodeChange(code){
        setTimeout(() => {
            this.embedding_ref.current.innerHTML = code
        }, 10);
    }
    render(){
        return (
            <div className="track edit-mode">
                <div className="button-row-right">
                    <IconButton icon_src="res/trash_can.png" onClick={()=>{client.deleteTrackInFromEditMode(this.props.idx)}}/>
                </div>
                <Label text="title:"/>
                <EditorInput 
                    field_key={"post_track_"+this.props.idx+"_title"}
                    edit_mode_fields={this.props.edit_mode_fields} 
                    className="editable-track-field"
                    defaultValue={this.props.track.title}/>
                <Label text="artist:"/>
                <EditorInput 
                    field_key={"post_track_"+this.props.idx+"_artist"}
                    edit_mode_fields={this.props.edit_mode_fields} 
                    className="editable-track-field"
                    defaultValue={this.props.track.artist}/>
                <Label text="embedding code:"/>
                <EditorInput 
                    field_key={"post_track_"+this.props.idx+"_embedding_code"}
                    edit_mode_fields={this.props.edit_mode_fields} 
                    className="editable-track-field embedding-code"
                    defaultValue={this.props.track.embedding_code}
                    onChange={this.onEmbeddingCodeChange}/>

                <div ref={this.embedding_ref} className="track-embedding">
                </div>
            </div>
        )
    }
}

export class MusicMenu extends EditableComponent{
    constructor(props){
        super(props)
        this.state = {active_post: _post_placeholder}
        client.music_menu_component = this
        this.frame = React.createRef()
        this.is_shown = true
    }
    setActivePost(post){
        this.setState({active_post: post})
    }
    show(){
        this.frame.current.style.top = '0px'
        this.is_shown = true
    }
    hide(){
        this.frame.current.style.top = '-100vh'
        this.is_shown = false
    }
    edit_render(){
        var items = [];
        for (var i = 0; i < client.edit_mode_fields.post_tracks_count; i++) {
            var track
            if(this.state.active_post.tracks.length>0){
                track = this.state.active_post.tracks[utils.clamp(i, 0, this.state.active_post.tracks.length-1)]
            }else{
                track = new TrackStruct()
            }
            items.push(
                <EditModeTrack 
                    key={"track_"+i} 
                    idx={i} 
                    edit_mode_fields={client.edit_mode_fields} 
                    track={track}/>);
        }
        return (
            <div className="music-menu" ref={this.frame}>
                <div className="tracks-list">
                    {items}
                    <div className="buttons-row">
                        <IconButton icon_src="res/plus.png" onClick={()=>{client.addTrackInEditMode()}}/>
                    </div>
                </div>
            </div>
        )
    }
    default_render(){
        return (
            <div className="music-menu" ref={this.frame}>
                <div className="tracks-list">
                    {this.state.active_post.tracks.map((track, i)=>{
                        return (<Track key={"track_"+i} idx={i} track={track}/>)
                    })}
                </div>
            </div>
        )
    }
}