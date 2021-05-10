import React from 'react'
import {isMobile} from 'react-device-detect'
import {client, _post_placeholder} from '../init'

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

export class MusicMenu extends React.Component{
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
    render(){
        return (
            <div className="music-menu" ref={this.frame}>
                <div className="tracks-list">
                    {this.state.active_post.tracks.map((track, i)=>{
                        return (<Track key={"track_"+i} track={track}/>)
                    })}
                </div>
            </div>
        )
    }
}

