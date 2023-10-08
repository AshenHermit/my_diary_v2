import React, { createRef } from 'react'
import {default as utils} from '../utils'
import {client} from '../init'

export class IconButton extends React.Component{
    constructor(props){
        super(props)
        this.onClick = this.onClick.bind(this)
    }
    onClick(){
        this.props.onClick()
    }
    isActive(){
        return false
    }
    render(){
        return (
            <button 
                style={{display: this.props.visible ? '' : 'none'}} 
                className={"icon-button " + (this.isActive() ? 'active' : '')}
                onClick={this.onClick}>
                <img src={this.props.icon_src}></img>
            </button>
        )
    }
}
IconButton.defaultProps = {
    visible: true
}

export class MenuToggleButton extends IconButton{
    isActive(){
        if(this.props.menu){
            if (this.props.menu.current) return this.props.menu.current.is_shown
        }
        return false
    }
    onClick(){
        this.props.menu.current.toggle()
        this.forceUpdate()
    }
}

export class Radio extends React.Component{
    constructor(props){
        super(props)
        /**@type {{icons: Array<String>, field_key: String, data_struct: Object}} */
        this.props = props
        this.onclick = this.onclick.bind(this)
        this.radioRef = createRef()
    }
    unselectAllButtons(){
        Array.from(this.radioRef.current.children).forEach(button=>{
            button.classList.remove("selected")
        })
    }
    selectButton(index){
        var button = this.radioRef.current.children[index]
        button.classList.add("selected")
    }
    updateSelection(){
        this.unselectAllButtons()
        this.selectButton(this.props.data_struct[this.props.field_key])
    }
    onclick(e){
        var src = e.target.children[0].getAttribute("src")
        var id = this.props.icons.indexOf(src)
        this.props.data_struct[this.props.field_key] = id
        this.updateSelection()
    }
    componentDidMount(){
        this.updateSelection()
    }
    componentDidUpdate(){
        this.updateSelection()
    }
    render(){
        return (
            <div className="radio" ref={this.radioRef}>
                {
                    this.props.icons.map(icon_src=>
                        <button 
                            className="icon-button radio-button" 
                            onClick={this.onclick}>
                                <img src={icon_src}></img>
                        </button>
                    )
                }
            </div>
        )
    }
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
        if(this.value != this.props.data_struct[this.props.field_key]){
            this.props.data_struct[this.props.field_key] = this.value
            if(this.props.onChange!=null) this.props.onChange(this.value)
        }
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
        this.props.data_struct[this.props.field_key] = this.value
    }
    resetValueToDefault(){
        this.setValue(this.props.defaultValue)
    }
    setValue(value){
        this.input_ref.current.textContent = value
        this.updateEditModeField()
    }

    onChange(e){
        this.updateEditModeField()
        if(this.props.onChange!=null) this.props.onChange(this.value)
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