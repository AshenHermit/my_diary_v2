import React from 'react'
import {isMobile} from 'react-device-detect'
import { TrackStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput, IconButton} from './editable_components'
import {Label} from './elements'

export class Popup extends React.Component{
    constructor(props){
        super(props)
        /**@type {{type: Number, text: String, onDissolve: Function}} */
        this.props = props
        this.state = {
            dissolving: false,
            dissolved: false,
        }
        this.element = React.createRef()
        // if(!this.props.type) this.props.type = 0
        // if(!this.props.text) this.props.text = ""
        this.dissolve = this.dissolve.bind(this)
        this.elementRef = this.elementRef.bind(this)
    }
    componentDidMount(){
        setTimeout(this.dissolve.bind(this), 3000)
    }
    dissolve(){
        function destroy(){
            if(this.props.onDissolve){
                this.setState({dissolved: true})
                this.props.onDissolve(this)
            }
        }
        this.setState({dissolving: true})
        setTimeout(destroy.bind(this), 250)
    }
    elementRef = (e) => {
        console.log(e)
    }
    render(){
        var type = this.props.type || 0
        var text = this.props.text || ""
        let classes = ['message', 'warning', 'error']
        let cls = 'popup ' + classes[utils.clamp(type, 0, classes.length-1)]
        if(this.state.dissolving) cls += ' dissolving'
        if(this.state.dissolved) cls += ' dissolved'

        return (
            <div className={cls} ref={this.elementRef} key={this.props.key}>
                {text}
            </div>
        )
    }
}
Popup.Type = { MESSAGE: 0, WARNING: 1, ERROR: 2 };

export class PopupsList extends React.Component{
    constructor(props){
        super(props)
        this.state = {popups: []}
        this.container = React.createRef()
        
        this.popup = this.popup.bind(this)
        this.nextPopupID = 0
    }
    componentDidMount(){
        client.logger.onMessage.subscribe(t => this.popup(t, Popup.Type.MESSAGE))
        client.logger.onWarning.subscribe(t => this.popup(t, Popup.Type.WARNING))
        client.logger.onError.subscribe(t => this.popup(t, Popup.Type.ERROR))
    }
    popup(text, type=0){
        function onDissolve(popup){
            // this.state.popups.splice(this.state.popups.indexOf(popup), 1)
            this.setState(this.state)
        }
        let popupEl = <Popup text={text} type={type} 
            onDissolve={onDissolve.bind(this)} key={this.nextPopupID.toString()}/>
        this.nextPopupID+=1
        let popups = this.state.popups
        popups.push(popupEl)
        this.forceUpdate()
    }
    componentDidUpdate(){
        
    }
    render(){
        return (
            <div className='popups-list' ref={this.container}>
                {this.state.popups}
            </div>
        )
    }
} 