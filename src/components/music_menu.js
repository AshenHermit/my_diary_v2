import React from 'react'
import {isMobile} from 'react-device-detect'
import { TrackStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput, IconButton} from './editable_components'
import {Label} from './elements'
import { CSSTransition } from 'react-transition-group'
import { TransitionGroup } from 'react-transition-group'

class Track extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div style={this.props.style} className="track">
                <div className="track-embedding" 
                    dangerouslySetInnerHTML={{__html: this.props.track.embedding_code}}>
                </div>
                {this.props.track.comment.trim()!="" ? 
                <div className="comment">{this.props.track.comment}</div>
                : ''}
            </div>
        )
    }
}

class EditModeTrack extends React.Component{
    constructor(props){
        super(props)
        this.embedding_ref = React.createRef()
        this.author_ref = React.createRef()
        this.title_ref = React.createRef()
        this.onEmbeddingCodeChange = this.onEmbeddingCodeChange.bind(this)
    }
    onEmbeddingCodeChange(code){
        setTimeout(() => {
            this.embedding_ref.current.innerHTML = code
            var trachInfo = utils.getAuthorTitleFromEmbed(code)
            if (trachInfo){
                this.author_ref.current.setValue(trachInfo.author)
                this.title_ref.current.setValue(trachInfo.title)
            }
        }, 10);
    }
    render(){
        return (
            <div className="track edit-mode">
                <div className="buttons-row-right">
                    <IconButton icon_src="res/trash_can.png" onClick={()=>{client.deleteTrackInEditMode(this.props.idx)}}/>
                </div>
                <div className="row">
                    <div className="row-element">
                        <Label text="artist:"/>
                        <EditorInput 
                            ref={this.author_ref}
                            field_key={"artist"}
                            data_struct={this.props.data_struct} 
                            className="editable-track-field"
                            defaultValue={this.props.data_struct.artist}/>
                    </div>
                    <div className="row-element">
                        <Label text="title:"/>
                        <EditorInput 
                            ref={this.title_ref}
                            field_key={"title"}
                            data_struct={this.props.data_struct}
                            className="editable-track-field"
                            defaultValue={this.props.data_struct.title}/>
                    </div>        
                </div>

                <Label text="comment:"/>
                <EditorInput 
                    field_key={"comment"}
                    data_struct={this.props.data_struct} 
                    className="editable-track-field"
                    defaultValue={this.props.data_struct.comment}/>

                <Label text="embedding code:"/>
                <EditorInput 
                    field_key={"embedding_code"}
                    data_struct={this.props.data_struct} 
                    className="editable-track-field embedding-code"
                    defaultValue={this.props.data_struct.embedding_code}
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
    componentDidMount(){
        // super.componentDidMount()
        if(!isMobile) utils.windowMenuHeightAdjust(this.frame.current)
        if(this.props.hide) this.hide()
    }
    setActivePost(post){
        this.setState({active_post: post})
    }
    show(){
        this.frame.current.style.display = ''
        this.is_shown = true
    }
    hide(){
        this.frame.current.style.display = 'none'
        this.is_shown = false
    }
    toggle(){
        if(this.is_shown) this.hide()
        else this.show()
    }
    edit_render(){
        var items = [];
        for (var i = 0; i < client.edit_mode_post.tracks.length; i++) {
            items.push(
                <EditModeTrack key={i} 
                    idx={i} 
                    data_struct={client.edit_mode_post.tracks[i]}/>);
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
                    <TransitionGroup className="show-group">
                    {this.state.active_post.tracks.map((track, i)=>{
                        return (<CSSTransition
                            key={i}
                            classNames="show"
                            timeout={500 + i*100}
                            >
                                <Track
                                    style={{ transitionDelay: `${(i+1)*100}ms` }} 
                                    key={"track_"+i} idx={i} track={track}/>
                            </CSSTransition>
                        )
                    })}
                    </TransitionGroup>
                </div>
            </div>
        )
    }
}

