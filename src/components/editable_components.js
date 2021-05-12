import React from 'react'
import {default as utils} from '../utils'
import {client} from '../init'

export class IconButton extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
        <button 
            style={{display: this.props.visible ? '' : 'none'}} 
            className="icon-button" 
            onClick={this.props.onClick}>
            <img src={this.props.icon_src}></img>
        </button>
        )
    }
}
IconButton.defaultProps = {
    visible: true
}

export class Slider extends React.Component{
    constructor(props){
        super(props)
        this.element_ref = React.createRef()

        this.mousedown = this.mousedown.bind(this)
        this.mousemove = this.mousemove.bind(this)
        this.mouseup = this.mouseup.bind(this)

        this.value = this.props.defaultValue
        this.drag_start_value = 0
        this.drag_start_position = 0
        this.is_dragging = false
    }
    updateEditModeField(){
        this.props.edit_mode_fields[this.props.field_key] = this.value
        this.props.edit_mode_fields.onchange()
    }
    resetValueToDefault(){
        this.value = this.props.defaultValue
        this.updateEditModeField()
    }
    
    mousedown(e){
        this.drag_start_value = this.value
        this.drag_start_position = e.pageX
        this.is_dragging = true
    }
    mousemove(e){
        if(this.is_dragging){
            this.value = this.drag_start_value + (e.pageX-this.drag_start_position) * this.props.change_factor
            if(this.props.min != null && this.props.max != null){
                this.value = utils.clamp(this.value, this.props.min, this.props.max)
            }
            this.updateEditModeField()
        }
    }
    mouseup(e){
        this.is_dragging = false
    }
    
    componentDidMount(){
        utils.initializeMouseEvents(this.element_ref.current, this.mousedown, this.mousemove, this.mouseup)
        this.resetValueToDefault()
    }
    componentDidUpdate(){
        this.resetValueToDefault()
    }

    render(){
        return (
            <div ref={this.element_ref} className="slider">
                <img src={this.props.icon_src}></img>
            </div>
        )
    }
}

export class EditorInput extends React.Component{
    constructor(props){
        super(props)
        this.onChange = this.onChange.bind(this)
        this.input_ref = React.createRef()
        this.value = ""
    }

    updateEditModeField(){
        this.value = this.input_ref.current.innerText
        this.props.edit_mode_fields[this.props.field_key] = this.value
        this.props.edit_mode_fields.onchange()
        if(this.props.onChange!=null) this.props.onChange(this.value)
    }
    resetValueToDefault(){
        this.input_ref.current.textContent = this.props.defaultValue
        this.updateEditModeField()
    }

    onChange(e){
        this.updateEditModeField()
    }
    componentDidMount(){
        this.resetValueToDefault()
    }
    componentDidUpdate(){
        this.resetValueToDefault()
    }

    render(){
        return (
            <div ref={this.input_ref} className={"input "+this.props.className} onInput={this.onChange} contentEditable='true' role="textbox"></div>
        )
    }
}

export class EditableComponent extends React.Component{
    constructor(props){
        super(props)
    }
    edit_render(){

    }
    default_render(){
        
    }
    render(){
        if(client.is_in_edit_mode){
            return this.edit_render()
        }
        return this.default_render()
    }
}