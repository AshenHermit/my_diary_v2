import React from 'react'
import {YearCircle} from './year_circle'
import {client, _post_placeholder} from '../init'
import {PostStruct} from '../api'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput} from './editable_components'


class Title extends EditableComponent{
    constructor(props){
        super(props)
    }
    edit_render(){
        return (
            <EditorInput 
                field_key="post_title" 
                edit_mode_fields={this.props.edit_mode_fields} 
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
                field_key="post_title" 
                edit_mode_fields={this.props.edit_mode_fields} 
                className="description" 
                defaultValue={this.props.text.replaceAll("\n", "<br/>")}/>
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
                <div className="post-info">
                    <Title text={this.state.active_post.title} 
                        is_in_edit_mode={client.is_in_edit_mode} edit_mode_fields={client.edit_mode_fields}/>

                    <Description text={this.state.active_post.description} 
                        is_in_edit_mode={client.is_in_edit_mode} edit_mode_fields={client.edit_mode_fields}/>
                </div>
            </div>
        )
    }
}