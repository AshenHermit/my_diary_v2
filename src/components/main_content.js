import React from 'react'
import {YearCircle} from './year_circle'
import {client, _post_placeholder} from '../init'
import {PostStruct} from '../api'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput, Slider, IconButton, Radio} from './editable_components'

class Title extends EditableComponent{
    constructor(props){
        super(props)
    }
    edit_render(){
        return (
            <EditorInput 
                field_key="title" 
                data_struct={this.props.data_struct} 
                className="title" 
                defaultValue={this.props.text}/>
        )
    }
    default_render(){
        return (
            <div className="title">
                {this.props.text}
            </div>
        )
    }
}

class Description extends EditableComponent{
    constructor(props){
        super(props)
    }
    edit_render(){
        return (
            <EditorInput 
                field_key="description" 
                data_struct={this.props.data_struct} 
                className="description" 
                defaultValue={this.props.text}/>
        )
    }
    default_render(){
        return (
            <div className="description" 
                dangerouslySetInnerHTML={{__html: utils.renderMarkup(this.props.text)}}>
            </div>
        )
    }
}

export class MainContent extends React.Component{
    constructor(props){
        super(props)
        this.state = {active_post: _post_placeholder}
    }
    componentDidMount(){
        client.main_content_component = this
    }
    setActivePost(post){
        this.setState({active_post: post})
    }
    render(){
        return (
            <div className="main-content">
                <YearCircle/>

                {client.is_in_edit_mode ? 
                <React.Fragment>
                    <Radio 
                        field_key="type" 
                        data_struct={client.edit_mode_post} 
                        icons={["res/filled_circle.png", "res/circle_stroke.png"]}
                        />
                    <div className="buttons-row">
                        <IconButton icon_src="res/trash_can.png" onClick={()=>{client.deleteActivePost()}}/>
                        <IconButton icon_src="res/plus.png" onClick={()=>{client.createPostOnViewPos()}}/>
                        <IconButton icon_src="res/floppy_memory.png" onClick={()=>{client.saveActivePost()}}/>
                    </div>
                    <Slider 
                        field_key="position" 
                        data_struct={client.edit_mode_post} 
                        change_factor={0.01}
                        min={null}
                        max={null}
                        defaultValue={this.state.active_post.position}
                        icon_src="res/memory_translate.png"
                        onChange={client.scrollToEditModePost.bind(client)}/>

                    <Slider 
                        field_key="size" 
                        data_struct={client.edit_mode_post} 
                        change_factor={0.005}
                        min={0.1}
                        max={1}
                        defaultValue={this.state.active_post.size}
                        icon_src="res/memory_resize.png"
                        onChange={client.scrollToEditModePost.bind(client)}/>
                    
                </React.Fragment>
                :''}

                <div className="post-info">
                    <Title text={this.state.active_post.title} 
                        is_in_edit_mode={client.is_in_edit_mode} data_struct={client.edit_mode_post}/>

                    <Description text={this.state.active_post.description} 
                        is_in_edit_mode={client.is_in_edit_mode} data_struct={client.edit_mode_post}/>
                </div>
            </div>
        )
    }
}