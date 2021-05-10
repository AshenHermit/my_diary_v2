import React from 'react'

export class EditorInput extends React.Component{
    constructor(props){
        super(props)
        this.onChange = this.onChange.bind(this)
        this.input_ref = React.createRef()
    }
    onChange(e){
        console.log(e.target)
        this.props.edit_mode_fields[this.props.field_key] = this.input_ref.current.value
    }
    componentDidMount(){
        this.input_ref.current.innerHTML = this.props.defaultValue
    }
    componentDidUpdate(){
        this.input_ref.current.innerHTML = this.props.defaultValue
    }
    render(){
        return (
            <div ref={this.input_ref} className={"input "+this.props.className} onInput={this.onChange} contentEditable='true'></div>
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
        if(this.props.is_in_edit_mode){
            return this.edit_render()
        }
        return this.default_render()
    }
}