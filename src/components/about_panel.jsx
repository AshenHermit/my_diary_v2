import React from 'react'
import {isMobile} from 'react-device-detect'
import { TrackStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput, IconButton} from './editable_components'
import {Label} from './elements'


class AboutText extends EditableComponent{
    constructor(props){
        super(props)
    }
    edit_render(){
        return (
            <EditorInput 
                field_key="about" 
                data_struct={this.props.data_struct} 
                className="about" 
                defaultValue={this.props.text}/>
        )
    }
    default_render(){
        return (
            <div className="about" 
                dangerouslySetInnerHTML={{__html: utils.renderMarkup(this.props.text)}}>
            </div>
        )
    }
}

// awful
export class AboutPanel extends EditableComponent{
    constructor(props){
        super(props)
        this.state = {text: ""}
        client.about_panel_component = this
        this.frame = React.createRef()
        this.is_shown = true
        this.show = this.show.bind(this)
        this.hide = this.hide.bind(this)
        this.containerClick = this.containerClick.bind(this)
    }
    setAboutText(text){
        this.setState({text: text})
    }
    show(){
        this.frame.current.style.display = ''
        setTimeout(() => {
            this.frame.current.style.opacity = '1'
            this.frame.current.style.pointerEvents = ''
        });
        this.is_shown = true
    }
    hide(){
        this.frame.current.style.opacity = '0'
        this.frame.current.style.pointerEvents = 'none'
        this.frame.current.style.display = 'none'
        this.is_shown = false
    }
    containerClick(e){
        if(e.target == this.frame.current){
            this.hide()
        }
    }
    componentDidMount(){
        
    }
    edit_render(){
        return (
            <div className="center-container" ref={this.frame} onClick={this.containerClick}>
                <div className="about-panel">
                    <div className="title">Обо всем этом</div>
                    <EditorInput 
                        field_key="about" 
                        data_struct={client.api.data} 
                        className="about" 
                        defaultValue={client.api.data.about}/>
                </div>
            </div>
        )
    }
    default_render(){
        return (
            <div className="center-container" ref={this.frame} onClick={this.containerClick}>
                <div className="about-panel">
                    <div className="title about-title">Обо всем этом</div>
                    <div className="about" 
                        dangerouslySetInnerHTML={{__html: utils.renderMarkup(client.api.data.about)}}>
                    </div>
                </div>
            </div>
        )
    }
}